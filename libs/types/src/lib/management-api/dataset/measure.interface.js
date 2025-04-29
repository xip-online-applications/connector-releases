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
var measure_interface_exports = {};
__export(measure_interface_exports, {
  MeasureSchema: () => MeasureSchema
});
module.exports = __toCommonJS(measure_interface_exports);
var import_zod = require("zod");
var import_type_enums = require("../type-enums");
var import_meta = require("./meta.interface");
const MeasureSchema = import_zod.z.object({
  name: import_zod.z.string().min(1),
  description: import_zod.z.string().min(1).optional(),
  type: import_zod.z.nativeEnum(import_type_enums.MeasureTypesEnum),
  format: import_zod.z.nativeEnum(import_type_enums.MeasureFormatsEnum).optional(),
  index: import_zod.z.string().optional(),
  sql: import_zod.z.string().min(1).optional(),
  dimension: import_zod.z.string().min(1).optional(),
  public: import_zod.z.boolean().optional(),
  meta: import_meta.MetaSchema.optional()
}).refine(
  (data) => !(data.sql === void 0 && data.dimension === void 0 || data.sql !== void 0 && data.dimension !== void 0),
  {
    message: "One of sql or dimension must be defined.",
    path: ["sql", "dimension"]
  }
);
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  MeasureSchema
});
