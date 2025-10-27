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
var relation_interface_exports = {};
__export(relation_interface_exports, {
  RelationSchema: () => RelationSchema
});
module.exports = __toCommonJS(relation_interface_exports);
var import_zod = require("zod");
var import_type_enums = require("../type-enums");
const RelationSchema = import_zod.z.object({
  type: import_zod.z.nativeEnum(import_type_enums.RelationTypesEnum),
  dimension: import_zod.z.string().min(1).optional(),
  targetDataset: import_zod.z.string().min(1),
  targetDimension: import_zod.z.string().min(1).optional(),
  sql: import_zod.z.string().min(1).optional()
}).superRefine((val, ctx) => {
  if (val.sql !== void 0 && (val.dimension !== void 0 || val.targetDimension !== void 0)) {
    ctx.addIssue({
      code: import_zod.z.ZodIssueCode.custom,
      message: "Use sql field or dimension/targetDimension."
    });
  }
});
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  RelationSchema
});
