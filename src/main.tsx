import { connect } from "datocms-plugin-sdk";
import "datocms-react-ui/styles.css";
import ConfigScreen from "./entrypoints/ConfigScreen";
import FieldEditor from "./entrypoints/FieldEditor";
import { render } from "./utils/render";

connect({
  renderConfigScreen(ctx) {
    return render(<ConfigScreen ctx={ctx} />);
  },
  manualFieldExtensions() {
    return [
      {
        id: "postcodePicker",
        name: "Postcode Picker",
        type: "editor",
        fieldTypes: ["json"],
      },
    ];
  },
  renderFieldExtension(fieldExtensionId, ctx) {
    if (fieldExtensionId === "postcodePicker") {
      return render(<FieldEditor ctx={ctx} />);
    }
  },
});
