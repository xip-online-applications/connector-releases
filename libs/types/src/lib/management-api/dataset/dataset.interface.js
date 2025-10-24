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
var dataset_interface_exports = {};
__export(dataset_interface_exports, {
  DatasetSchema: () => DatasetSchema
});
module.exports = __toCommonJS(dataset_interface_exports);
var import_zod = require("zod");
var import_type_enums = require("../type-enums");
var import_collection = require("./collection.interface");
var import_dimensions = require("./dimensions.interface");
var import_segments = require("./segments.interface");
var import_relations = require("./relations.interface");
var import_measures = require("./measures.interface");
var import_meta = require("./meta.interface");
var import_pre_aggregations = require("./pre-aggregations.interface");
const DatasetSchema = import_zod.z.object({
  name: import_zod.z.string().min(1),
  description: import_zod.z.string().min(1),
  type: import_zod.z.nativeEnum(import_type_enums.DatasetTypeEnum),
  prefix: import_zod.z.string().min(1),
  parent: import_zod.z.string().min(1).optional(),
  sql: import_zod.z.string().min(1).optional(),
  meta: import_meta.MetaSchema.optional(),
  collection: import_collection.CollectionSchema.optional(),
  dimensions: import_dimensions.DimensionsSchema.optional(),
  segments: import_segments.SegmentsSchema.optional(),
  relations: import_relations.RelationsSchema.optional(),
  measures: import_measures.MeasuresSchema.optional(),
  preAggregations: import_pre_aggregations.PreAggregationsSchema.optional()
}).superRefine((val, ctx) => {
  if (!val.parent && val.sql === void 0 && val.collection === void 0) {
    ctx.addIssue({
      code: import_zod.z.ZodIssueCode.custom,
      message: "You need to define either sql or collection."
    });
    return;
  }
  if (val.sql !== void 0 && val.collection !== void 0) {
    ctx.addIssue({
      code: import_zod.z.ZodIssueCode.custom,
      message: "You need to define either sql or collection."
    });
  }
});
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  DatasetSchema
});
//# sourceMappingURL=dataset.interface.js.map
