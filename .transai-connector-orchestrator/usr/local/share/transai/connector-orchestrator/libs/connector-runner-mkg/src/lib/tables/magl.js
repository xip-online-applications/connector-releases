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
var magl_exports = {};
__export(magl_exports, {
  MKG_TABLE_MAGL: () => MKG_TABLE_MAGL
});
module.exports = __toCommonJS(magl_exports);
var import_table = require("./base/table");
const MKG_TABLE_MAGL = new import_table.MkgTable({
  identifier: "magl",
  fields: [
    "magl_memo",
    "magl_oms_3",
    "magl_shopfloor",
    "magl_niet_autores",
    "magl_oms_2",
    "magl_code",
    "magl_blok",
    "magl_oms_1"
  ]
});
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  MKG_TABLE_MAGL
});
