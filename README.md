# DatoCMS Plugin - Postcode Picker

A custom DatoCMS field extension plugin that allows users to select multiple postcodes with an autocomplete search interface. Uses GeoNames API to search for postcodes by postcode or city name.

## Features

- 🔍 **Autocomplete Search**: Type to search for postcodes or city names
- 🏷️ **Multiple Selection**: Select multiple postcodes with an accessible multi-select interface
- 🌍 **Configurable Country**: Set the country code in plugin settings (defaults to Belgium)
- 🔑 **GeoNames Username**: Optional GeoNames username for higher rate limits
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

1. **Configure the plugin**:

   - Go to Settings → Plugins → Postcode Picker
   - Enter your GeoNames username for higher rate limits (optional)
   - Set the country code (ISO 3166-1 alpha-2, e.g., BE, NL, FR)
   - Click "Save"
   - Get a free GeoNames account at https://www.geonames.org/login

2. **Add the field extension to a field**:

   - Add a new **JSON** field to your model
   - In the field settings, scroll to "Field extensions"
   - Click "Add field extension" and select "Postcode Picker"
   - Save the field

3. **Use the picker**:

   - When editing records, you'll see the postcode picker interface
   - Type to search for postcodes or city names
   - Select multiple postcodes from the dropdown
   - Selected postcodes are displayed as chips with format "City (Postcode)"
   - Remove selections by clicking the × on each chip

4. **Data format**:
   - Selected postcodes are stored as a JSON string: `"[{\"postcode\":\"1000\",\"city\":\"Brussels\"},...]"`
   - The field stores a stringified JSON array of objects with `postcode` and `city` properties

## API Configuration

The plugin uses the GeoNames API (free tier). You can configure your GeoNames username in the plugin settings.

**To get a GeoNames username**:

1. Visit https://www.geonames.org/login
2. Create a free account
3. Enter your username in the plugin settings for higher rate limits

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
  { "postcode": "1000", "city": "Brussels" },
  { "postcode": "2000", "city": "Antwerp" }
]
```

## License

MIT
