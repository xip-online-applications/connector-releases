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
var template_interface_exports = {};
__export(template_interface_exports, {
  TemplateSchema: () => TemplateSchema
});
module.exports = __toCommonJS(template_interface_exports);
var import_zod = require("zod");
var import_datasets = require("./dataset/datasets.interface");
var import_semantic_triggers = require("./semantic-trigger/semantic-triggers.interface");
const TemplateSchema = import_zod.z.object({
  identifier: import_zod.z.string().min(1),
  version: import_zod.z.string().min(1),
  name: import_zod.z.string().min(1),
  prefix: import_zod.z.string().min(1),
  description: import_zod.z.string().min(1),
  datasets: import_datasets.DatasetsSchema,
  semanticTriggers: import_semantic_triggers.SemanticTriggersSchema
});
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  TemplateSchema
});
//# sourceMappingURL=template.interface.js.map
