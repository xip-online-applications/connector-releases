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
var filter_interface_exports = {};
__export(filter_interface_exports, {
  FilterSchema: () => FilterSchema
});
module.exports = __toCommonJS(filter_interface_exports);
var import_zod = require("zod");
var import_type_enums = require("../type-enums");
const FilterSchema = import_zod.z.object({
  sql: import_zod.z.string().min(1).optional(),
  dimension: import_zod.z.string().min(1).optional(),
  operator: import_zod.z.nativeEnum(import_type_enums.FilterOperatorsEnum).optional(),
  value: import_type_enums.FilterValueType.optional()
}).superRefine((val, ctx) => {
  if (val.sql === void 0 && val.dimension === void 0) {
    ctx.addIssue({
      code: import_zod.z.ZodIssueCode.custom,
      message: "One of sql or dimension must be defined."
    });
    return;
  }
  if (val.sql !== void 0 && val.dimension !== void 0) {
    ctx.addIssue({
      code: import_zod.z.ZodIssueCode.custom,
      message: "One of sql or dimension must be defined."
    });
    return;
  }
  if (val.dimension !== void 0 && (val.operator === void 0 || val.value === void 0)) {
    ctx.addIssue({
      code: import_zod.z.ZodIssueCode.custom,
      message: "When dimension is defined, operator and values must be defined."
    });
  }
});
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  FilterSchema
});
