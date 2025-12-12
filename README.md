# DatoCMS Plugin - Belgium Zipcode Picker

A custom DatoCMS field extension plugin that allows users to select multiple Belgian postcodes with an autocomplete search interface. Selected postcodes are displayed as chips in the format "City Name (Postcode)".

## Features

- 🔍 **Autocomplete Search**: Search for Belgian postcodes by postcode or city name
- 🏷️ **Multiple Selection**: Select multiple postcodes
- 💾 **Chip Display**: Selected postcodes are displayed as removable chips with format "City (Postcode)"
- 🌐 **API-Based**: Uses GeoNames API to fetch postcode data (no hardcoded data)

## Installation

1. Build the plugin:
   ```bash
   npm install
   npm run build
   ```

2. Install the plugin in your DatoCMS project:
   - Go to your DatoCMS project settings
   - Navigate to Plugins
   - Click "Add a plugin" → "Install from URL" or upload the built plugin

## Usage

1. Add a new field to your model (type: "JSON" or "Text")
2. In the field settings, select this plugin as the field extension
3. Users can now search and select multiple Belgian postcodes
4. Selected postcodes are stored as JSON array: `[{"postcode": "1000", "city": "Brussels"}, ...]`

## API Configuration

The plugin uses the GeoNames API (free tier) by default. For production use, you may want to:

1. **Use a paid API service**:
   - [ZipBase](https://zipbase.io/) - 1,000 free requests/month
   - [GEO-6](https://geo6.be/) - Belgian address database
   - [Pro6PP](https://www.pro6pp.com/) - Comprehensive postal data

2. **Host your own dataset**: 
   - Host a JSON file with Belgian postcodes on GitHub, S3, or your CDN
   - Update the `searchBelgianPostcodes` function in `src/utils/postcodeApi.ts`

3. **Configure GeoNames username**:
   - Get a free GeoNames username at https://www.geonames.org/login
   - Update the `username` parameter in `src/utils/postcodeApi.ts` (replace `demo`)

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Data Format

Selected postcodes are stored as JSON:
```json
[
  {"postcode": "1000", "city": "Brussels"},
  {"postcode": "2000", "city": "Antwerp"}
]
```

## License

MIT