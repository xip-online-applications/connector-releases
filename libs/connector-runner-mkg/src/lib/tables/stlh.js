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
var stlh_exports = {};
__export(stlh_exports, {
  MKG_TABLE_STLH: () => MKG_TABLE_STLH
});
module.exports = __toCommonJS(stlh_exports);
var import_base = require("./_base");
const MKG_TABLE_STLH = new import_base.MkgTable({
  identifier: "stlh",
  interval: 600,
  fields: [
    "arti_code",
    "stlh_teken",
    "stlh_rev_lengte",
    "stlh_bron",
    "stlh_volgnummer",
    "stlh_oms_2",
    "stlh_oms_1",
    "stlh_memo",
    "stlh_revisie",
    "stlh_rev_preview",
    "stlh_actief",
    "stlh_lengte",
    "stlh_num",
    "stlh_oms_3",
    "stlh_files",
    "stlh_prefix"
  ]
});
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  MKG_TABLE_STLH
});
