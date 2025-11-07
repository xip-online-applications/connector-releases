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
var rela_exports = {};
__export(rela_exports, {
  MKG_TABLE_RELA: () => MKG_TABLE_RELA
});
module.exports = __toCommonJS(rela_exports);
var import_base = require("./_base");
const MKG_TABLE_RELA = new import_base.MkgTable({
  identifier: "rela",
  fields: [
    "rela_vrij_datum_4",
    "rela_naam",
    "rela_vrij_datum_3",
    "rela_vrij_datum_2",
    "rela_postcode",
    "rela_www",
    "rela_vrij_datum_5",
    "rela_vrij_datum_1",
    "rela_vrij_veld_1",
    "rela_email",
    "rela_telefoon",
    "rela_plaats",
    "rela_moeder",
    "rela_vrij_veld_3",
    "rela_vrij_veld_5",
    "rela_vrij_veld_2",
    "rela_vrij_veld_4",
    "rela_vrij_memo_1",
    "rela_num",
    "rela_resr",
    "rela_memo",
    "rela_vrij_memo_5",
    "rela_naam_2",
    "rela_zoeknaam",
    "rela_vrij_memo_2",
    "rela_plaats_2",
    "rela_vrij_memo_3",
    "rela_vrij_memo_4",
    "rela_afbeelding",
    "rela_files",
    "rela_fax",
    "rela_info",
    "rela_actief"
  ]
});
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  MKG_TABLE_RELA
});
