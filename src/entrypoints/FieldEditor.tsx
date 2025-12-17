import { useMemo } from "react";
import type { RenderFieldExtensionCtx } from "datocms-plugin-sdk";
import { Canvas, AsyncSelectInput } from "datocms-react-ui";
import type { MultiValue, ActionMeta } from "react-select";
import { searchPostcodes, type PostcodeData } from "../utils/postcodeApi";
import s from "./styles.module.css";

type Props = {
  ctx: RenderFieldExtensionCtx;
};

type SelectOption = {
  label: string;
  value: PostcodeData;
};

export default function FieldEditor({ ctx }: Props) {
  const pluginParameters = ctx.plugin.attributes.parameters as
    | {
        geonamesUsername?: string;
        country?: string;
        groupCitiesByPostcode?: boolean;
      }
    | undefined;

  const username = pluginParameters?.geonamesUsername || "demo";
  const country = pluginParameters?.country || "BE";
  const groupCitiesByPostcode =
    pluginParameters?.groupCitiesByPostcode ?? false;

  // Load current selected values from field
  const selectedValues = useMemo(() => {
    const fieldValue = ctx.formValues[ctx.fieldPath];
    if (!fieldValue) return [];

    try {
      let postcodes: PostcodeData[] = [];
      if (Array.isArray(fieldValue)) {
        postcodes = fieldValue;
      } else if (typeof fieldValue === "string") {
        postcodes = JSON.parse(fieldValue);
      } else if (
        typeof fieldValue === "object" &&
        fieldValue !== null &&
        "items" in fieldValue &&
        Array.isArray((fieldValue as any).items)
      ) {
        postcodes = (fieldValue as any).items;
      }

      return postcodes.map((item) => {
        // If grouping is enabled and city contains comma-separated cities, format with " / "
        if (groupCitiesByPostcode && item.city.includes(", ")) {
          const cities = item.city.split(", ").filter(Boolean);
          const cityLabel = cities.join(" / ");
          return {
            label: `${cityLabel} (${item.postcode})`,
            value: item,
          };
        }
        // Otherwise, use the original format
        return {
          label: `${item.city} (${item.postcode})`,
          value: item,
        };
      });
    } catch (e) {
      return [];
    }
  }, [ctx.formValues[ctx.fieldPath], groupCitiesByPostcode]);

  // Load options from API based on input
  const loadOptions = async (inputValue: string): Promise<SelectOption[]> => {
    if (inputValue.length < 2) {
      return [];
    }

    try {
      const postcodes = await searchPostcodes(inputValue, username, country);

      // If grouping is enabled, group by postcode and combine cities
      if (groupCitiesByPostcode) {
        const groupedByPostcode = new Map<string, string[]>();

        postcodes.forEach((item) => {
          const cities = groupedByPostcode.get(item.postcode) || [];
          if (!cities.includes(item.city)) {
            cities.push(item.city);
          }
          groupedByPostcode.set(item.postcode, cities);
        });

        // Create options with combined city labels
        return Array.from(groupedByPostcode.entries()).map(
          ([postcode, cities]) => {
            const cityLabel = cities.join(" / ");
            return {
              label: `${cityLabel} (${postcode})`,
              value: {
                postcode,
                city: cities.join(", "), // Store all cities comma-separated in the value
              },
            };
          }
        );
      }

      // If grouping is disabled, return one option per city-postcode combination
      return postcodes.map((item) => ({
        label: `${item.city} (${item.postcode})`,
        value: item,
      }));
    } catch (error) {
      console.error("Error fetching postcodes:", error);
      return [];
    }
  };

  // Handle selection change
  const handleChange = (
    newValue: MultiValue<SelectOption>,
    _actionMeta: ActionMeta<SelectOption>
  ) => {
    const postcodes = newValue.map((option) => option.value);

    // Convert to string to avoid validation errors
    const value = JSON.stringify(postcodes);

    ctx.setFieldValue(ctx.fieldPath, value).catch((error) => {
      console.error("Error saving field value:", error);
    });
  };

  return (
    <Canvas ctx={ctx}>
      <div className={s.fieldEditor}>
        <AsyncSelectInput
          isMulti={true}
          value={selectedValues}
          onChange={handleChange}
          loadOptions={loadOptions}
          placeholder={`Type to search postcodes or cities in ${country}...`}
          defaultOptions={false}
          cacheOptions={true}
          noOptionsMessage={({ inputValue }) =>
            inputValue.length < 2
              ? "Type at least 2 characters to search"
              : "No results found"
          }
        />
      </div>
    </Canvas>
  );
}
