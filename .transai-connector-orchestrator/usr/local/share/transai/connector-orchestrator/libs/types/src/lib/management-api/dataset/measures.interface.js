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
var measures_interface_exports = {};
__export(measures_interface_exports, {
  MeasuresSchema: () => MeasuresSchema
});
module.exports = __toCommonJS(measures_interface_exports);
var import_zod = require("zod");
var import_measure = require("./measure.interface");
const MeasuresSchema = import_zod.z.record(
  import_zod.z.union([import_measure.MeasureSchema, import_zod.z.literal(false)])
);
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  MeasuresSchema
});
