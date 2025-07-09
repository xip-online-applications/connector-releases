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
var semantic_trigger_interface_exports = {};
__export(semantic_trigger_interface_exports, {
  SemanticTriggerSchema: () => SemanticTriggerSchema
});
module.exports = __toCommonJS(semantic_trigger_interface_exports);
var import_zod = require("zod");
var import_semantic_trigger_filters = require("./semantic-trigger-filters.interface");
const SemanticTriggerSchema = import_zod.z.object({
  name: import_zod.z.string().min(1).optional(),
  description: import_zod.z.string().min(1).optional(),
  eventType: import_zod.z.string().min(1),
  dataset: import_zod.z.string().min(1),
  dimensions: import_zod.z.array(import_zod.z.string().min(1)).min(1),
  limit: import_zod.z.number().min(1).optional(),
  filters: import_semantic_trigger_filters.SemanticTriggerFiltersSchema.optional(),
  cron: import_zod.z.string().nullable().optional(),
  tz: import_zod.z.string().nullable().optional(),
<<<<<<< HEAD
  incrementalField: import_zod.z.string().optional(),
  ungrouped: import_zod.z.boolean().optional()
=======
  incrementalField: import_zod.z.string().optional()
>>>>>>> a100488ce446f8996dca337bce0e01d011c39f6c
});
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  SemanticTriggerSchema
});
