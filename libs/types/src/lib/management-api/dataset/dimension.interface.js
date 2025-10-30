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
var dimension_interface_exports = {};
__export(dimension_interface_exports, {
  DimensionSchema: () => DimensionSchema
});
module.exports = __toCommonJS(dimension_interface_exports);
var import_zod = require("zod");
var import_type_enums = require("../type-enums");
var import_switch = require("./switch.interface");
var import_meta = require("./meta.interface");
const DimensionSchema = import_zod.z.object({
  name: import_zod.z.string().min(1),
  description: import_zod.z.string().min(1),
  type: import_zod.z.nativeEnum(import_type_enums.DimensionTypesEnum),
  format: import_zod.z.nativeEnum(import_type_enums.DimensionFormatsEnum).optional(),
  explode: import_zod.z.boolean().optional(),
  index: import_zod.z.union([import_zod.z.boolean(), import_zod.z.string()]).optional(),
  switch: import_switch.SwitchSchema.optional(),
  field: import_type_enums.FieldValueType.optional(),
  sql: import_zod.z.string().min(1).optional(),
  public: import_zod.z.boolean().optional(),
  primaryKey: import_zod.z.boolean().optional(),
  subQuery: import_zod.z.boolean().optional(),
  meta: import_meta.MetaSchema.optional()
}).superRefine((val, ctx) => {
  if (val.switch !== void 0 && (val.field !== void 0 || val.sql !== void 0)) {
    ctx.addIssue({
      code: import_zod.z.ZodIssueCode.custom,
      message: "If switch is chosen, do not provide field or sql."
    });
  } else if (val.switch !== void 0) {
    return;
  }
  if (val.field !== void 0 && val.sql !== void 0) {
    ctx.addIssue({
      code: import_zod.z.ZodIssueCode.custom,
      message: "If field is chosen, do not provide sql."
    });
  } else if (val.field !== void 0) {
    return;
  }
  if (val.sql === void 0) {
    ctx.addIssue({
      code: import_zod.z.ZodIssueCode.custom,
      message: "Please provide switch, field or sql."
    });
  }
});
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  DimensionSchema
});
