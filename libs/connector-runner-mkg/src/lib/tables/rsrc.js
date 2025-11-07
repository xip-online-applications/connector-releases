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
var rsrc_exports = {};
__export(rsrc_exports, {
  MKG_TABLE_RSRC: () => MKG_TABLE_RSRC
});
module.exports = __toCommonJS(rsrc_exports);
var import_base = require("./_base");
const MKG_TABLE_RSRC = new import_base.MkgTable({
  identifier: "rsrc",
  interval: 300,
  fields: [
    "rsrc_fcst_eindige_cap",
    "rsrc_oms",
    "rsrc_memo",
    "rsrc_volgorde",
    "rsrc_magl_in",
    "rsrc_onbemand",
    "rsrc_num",
    "rsrc_calc_eindige_cap",
    "rsrc_magl_uit",
    "rsrc_aantal",
    "rsrc_calc_bucket",
    "rsrc_eindige_cap",
    "rsrc_fcst_bucket",
    "rsrc_bucket",
    "rsrc_afbeelding"
  ]
});
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  MKG_TABLE_RSRC
});
