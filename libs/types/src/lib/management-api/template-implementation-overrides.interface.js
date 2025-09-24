var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var template_implementation_overrides_interface_exports = {};
__export(template_implementation_overrides_interface_exports, {
  TemplateImplementationOverridesSchema: () => TemplateImplementationOverridesSchema
});
module.exports = __toCommonJS(template_implementation_overrides_interface_exports);
var import_zod = require("zod");
var import_semantic_triggers = require("./semantic-trigger/semantic-triggers.interface");
var import_datasets = require("./dataset/datasets.interface");
const TemplateImplementationOverridesSchema = import_zod.z.object({
  datasets: import_datasets.DatasetsSchema.optional(),
  semanticTriggers: import_semantic_triggers.SemanticTriggersSchema.optional()
});
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  TemplateImplementationOverridesSchema
});
//# sourceMappingURL=template-implementation-overrides.interface.js.map
