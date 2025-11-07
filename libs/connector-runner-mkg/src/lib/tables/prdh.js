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
var prdh_exports = {};
__export(prdh_exports, {
  MKG_TABLE_PRDH: () => MKG_TABLE_PRDH
});
module.exports = __toCommonJS(prdh_exports);
var import_base = require("./_base");
const MKG_TABLE_PRDH = new import_base.MkgTable({
  identifier: "prdh",
  interval: 60,
  fields: [
    "prdh_op_dek_mat",
    "prdh_op_dek_uit",
    "prdh_oms_1",
    "prdh_wk_order",
    "prdh_memo_extern",
    "prdh_wk_gepland",
    "prdh_files",
    "prdh_op_vcnc_uit",
    "prdh_oms_2",
    "prdh_memo_intern",
    "prdh_dat_order",
    "prdh_op_vcnc_man",
    "prdh_op_vcnc_mat",
    "prdh_op_vcnc_mach",
    "prdh_op_dek_man",
    "prdh_fase_planning",
    "prdh_wk_planning",
    "prdh_kostprijs_methode_bew",
    "prdh_calc_methode_mat",
    "prdh_image",
    "prdh_dat_gepland",
    "prdh_calc_methode_bew",
    "prdh_historisch",
    "prdh_oms_3",
    "prdh_op_dek_mach",
    "prdh_dat_planning",
    "prdh_forecast",
    "prdh_num"
  ]
});
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  MKG_TABLE_PRDH
});
