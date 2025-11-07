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
var clch_exports = {};
__export(clch_exports, {
  MKG_TABLE_CLCH: () => MKG_TABLE_CLCH
});
module.exports = __toCommonJS(clch_exports);
var import_base = require("./_base");
const MKG_TABLE_CLCH = new import_base.MkgTable({
  identifier: "clch",
  interval: 60,
  fields: [
    "clch_volgnummer",
    "clch_op_dek_uit",
    "clch_op_calc_mat",
    "clch_vofh_verk_num",
    "clch_op_calc_mach",
    "clch_vofh_dat_antwoord",
    "clch_kostprijs_methode_bew",
    "clch_op_calc_man",
    "clch_vofr_oms_1",
    "clch_vofh_dat_levering",
    "clch_lengte",
    "clch_vofh_ref_onze",
    "clch_calc_methode_mat",
    "clch_op_calc_uit",
    "clch_memo",
    "clch_vofh_proj",
    "clch_vofr_order_aantal",
    "clch_calc_methode_bew",
    "clch_op_dek_man",
    "clch_op_dek_mach",
    "clch_oms_1",
    "clch_files",
    "clch_num",
    "clch_op_dek_mat",
    "clch_vofh_rela",
    "clch_vofh_num",
    "clch_oms_3",
    "clch_vofh_dat_aanvraag",
    "clch_vofh_ref_uw",
    "clch_vofr_arti",
    "clch_oms_2",
    "clch_boekjaar_afh",
    "clch_vofr_eenh_order",
    "clch_fase_planning"
  ]
});
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  MKG_TABLE_CLCH
});
