import { useState, useEffect } from "react";
import type { RenderConfigScreenCtx } from "datocms-plugin-sdk";
import { Canvas, TextField, FieldGroup, Button } from "datocms-react-ui";

type Props = {
  ctx: RenderConfigScreenCtx;
};

type PluginParameters = {
  geonamesUsername?: string;
  country?: string;
};

export default function ConfigScreen({ ctx }: Props) {
  const [geonamesUsername, setGeonamesUsername] = useState<string>("");
  const [country, setCountry] = useState<string>("BE");
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Load current plugin parameters
  useEffect(() => {
    const parameters = ctx.plugin.attributes.parameters as
      | PluginParameters
      | undefined;
    setGeonamesUsername(parameters?.geonamesUsername || "");
    setCountry(parameters?.country || "BE");
    setHasChanges(false);
  }, [ctx.plugin]);

  // Handle input change (don't save yet)
  const handleUsernameChange = (value: string) => {
    setGeonamesUsername(value);
    const parameters = ctx.plugin.attributes.parameters as
      | PluginParameters
      | undefined;
    const currentUsername = parameters?.geonamesUsername || "";
    const currentCountry = parameters?.country || "BE";
    setHasChanges(value !== currentUsername || country !== currentCountry);
  };

  const handleCountryChange = (value: string) => {
    const newCountry = value.toUpperCase().slice(0, 2); // Limit to 2 characters and uppercase
    setCountry(newCountry);
    const parameters = ctx.plugin.attributes.parameters as
      | PluginParameters
      | undefined;
    const currentUsername = parameters?.geonamesUsername || "";
    const currentCountry = parameters?.country || "BE";
    setHasChanges(
      geonamesUsername !== currentUsername || newCountry !== currentCountry
    );
  };

  // Save parameters to plugin
  const handleSave = async () => {
    setIsSaving(true);
    try {
      await ctx.updatePluginParameters({
        geonamesUsername: geonamesUsername || undefined,
        country: country || "BE",
      });
      setHasChanges(false);
      ctx.notice("Settings saved successfully!");
    } catch (error) {
      console.error("Error saving plugin parameters:", error);
      ctx.notice("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Canvas ctx={ctx}>
      <FieldGroup>
        <TextField
          id="geonames-username"
          name="geonames-username"
          label="GeoNames Username"
          value={geonamesUsername}
          onChange={handleUsernameChange}
          placeholder="demo"
          hint="Enter your GeoNames username. Get a free account at https://www.geonames.org/login"
        />
        <TextField
          id="country"
          name="country"
          label="Country Code"
          value={country}
          onChange={handleCountryChange}
          placeholder="BE"
          hint="ISO 3166-1 alpha-2 country code (e.g., BE for Belgium, NL for Netherlands, FR for France). Defaults to BE if not set."
        />
        <Button
          buttonType="primary"
          onClick={handleSave}
          disabled={isSaving || !hasChanges}
          fullWidth
        >
          {isSaving ? "Saving..." : "Save"}
        </Button>
      </FieldGroup>
    </Canvas>
  );
}
