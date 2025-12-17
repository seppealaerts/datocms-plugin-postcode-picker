export type PostcodeData = {
  postcode: string;
  city: string;
};

// Cache for search results
const searchCache = new Map<string, PostcodeData[]>();

/**
 * Search postcodes using a public API
 *
 * This function uses the GeoNames API (free tier) to search for postcodes.
 * For production use, you may want to:
 * 1. Use a paid API service (ZipBase, GEO-6, Pro6PP)
 * 2. Host your own dataset
 * 3. Configure a custom API endpoint
 *
 * GeoNames free tier: https://www.geonames.org/export/web-services.html
 * Note: Free tier has rate limits, consider using a username for higher limits
 */
export async function searchPostcodes(
  query: string,
  username: string = "demo",
  country: string = "BE"
): Promise<PostcodeData[]> {
  if (query.length < 2) {
    return [];
  }

  // Check cache first
  const cacheKey = query.toLowerCase();
  if (searchCache.has(cacheKey)) {
    return searchCache.get(cacheKey)!;
  }

  try {
    const results: PostcodeData[] = [];
    const isNumericQuery = /^\d+$/.test(query);

    // Search by postal code (works for numeric queries or partial postcodes)
    const postalCodeResponse = await fetch(
      `https://secure.geonames.org/postalCodeSearchJSON?postalcode_startsWith=${encodeURIComponent(
        query
      )}&country=${encodeURIComponent(
        country
      )}&maxRows=20&username=${encodeURIComponent(username)}`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      }
    );

    if (postalCodeResponse.ok) {
      const postalData = await postalCodeResponse.json();
      if (postalData.postalCodes && Array.isArray(postalData.postalCodes)) {
        postalData.postalCodes.forEach((item: any) => {
          results.push({
            postcode: String(item.postalCode || ""),
            city: String(item.placeName || item.name || ""),
          });
        });
      }
    }

    // Always search by city name (works for both city names and can find cities by postcode)
    // Use postalCodeSearchJSON with placeName_startsWith for better city name matching
    const cityNameResponse = await fetch(
      `https://secure.geonames.org/postalCodeSearchJSON?placeName_startsWith=${encodeURIComponent(
        query
      )}&country=${encodeURIComponent(
        country
      )}&maxRows=20&username=${encodeURIComponent(username)}`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      }
    );

    if (cityNameResponse.ok) {
      const cityData = await cityNameResponse.json();
      if (cityData.postalCodes && Array.isArray(cityData.postalCodes)) {
        cityData.postalCodes.forEach((item: any) => {
          const existing = results.find(
            (r) =>
              r.postcode === String(item.postalCode || "") &&
              r.city === String(item.placeName || item.name || "")
          );
          if (!existing) {
            results.push({
              postcode: String(item.postalCode || ""),
              city: String(item.placeName || item.name || ""),
            });
          }
        });
      }
    }

    // Also try a general search for city names (useful for partial matches)
    if (!isNumericQuery) {
      const generalSearchResponse = await fetch(
        `https://secure.geonames.org/searchJSON?q=${encodeURIComponent(
          query
        )}&country=${encodeURIComponent(
          country
        )}&featureClass=P&maxRows=20&username=${encodeURIComponent(username)}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
        }
      );

      if (generalSearchResponse.ok) {
        const generalData = await generalSearchResponse.json();
        if (generalData.geonames && Array.isArray(generalData.geonames)) {
          generalData.geonames.forEach((item: any) => {
            // GeoNames search returns places, try to get postal code from the result
            const postalCode = item.postalCode || item.postcode;
            if (postalCode) {
              const existing = results.find(
                (r) =>
                  r.postcode === String(postalCode) &&
                  r.city === String(item.name || "")
              );
              if (!existing) {
                results.push({
                  postcode: String(postalCode),
                  city: String(item.name || ""),
                });
              }
            }
          });
        }
      }
    }

    // Filter out invalid entries, remove duplicates, and limit results
    const validResults = results.filter(
      (item: PostcodeData) => item.postcode && item.city
    );

    const uniqueResults = Array.from(
      new Map(
        validResults.map((item) => [`${item.postcode}-${item.city}`, item])
      ).values()
    ).slice(0, 20);

    // Cache results
    searchCache.set(cacheKey, uniqueResults);
    return uniqueResults;
  } catch (error) {
    console.error("Error fetching postcodes from GeoNames:", error);
  }

  // Fallback: return empty array
  // In production, configure a reliable API endpoint
  return [];
}

// Alternative: Use a local dataset loaded at build time
// This requires hosting the data file
export async function searchPostcodesLocal(
  query: string,
  dataset: PostcodeData[]
): Promise<PostcodeData[]> {
  if (query.length < 2) {
    return [];
  }

  const queryLower = query.toLowerCase();
  return dataset
    .filter(
      (item) =>
        item.postcode.toLowerCase().includes(queryLower) ||
        item.city.toLowerCase().includes(queryLower)
    )
    .slice(0, 20); // Limit to 20 results
}
