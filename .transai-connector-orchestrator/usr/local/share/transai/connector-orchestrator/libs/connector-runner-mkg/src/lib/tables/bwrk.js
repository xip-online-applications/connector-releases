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
var bwrk_exports = {};
__export(bwrk_exports, {
  MKG_TABLE_BWRK: () => MKG_TABLE_BWRK
});
module.exports = __toCommonJS(bwrk_exports);
var import_table = require("./base/table");
const MKG_TABLE_BWRK = new import_table.MkgTable({
  identifier: "bwrk",
  interval: 60,
  fields: [
    "bwrk_bwrf_instellen",
    "bwrk_oms",
    "bwrk_rela",
    "bwrk_inkoopofferte",
    "bwrk_reden_vroeg_laat",
    "bwrk_tarief_netto_instel",
    "bwrk_actief",
    "bwrk_num",
    "bwrk_grbk_direct_verantw",
    "bwrk_actief_pauze",
    "bwrk_memo",
    "bwrk_aanloop_type",
    "bwrk_medw_ovz",
    "bwrk_grbk_indirect_kosten_mach",
    "bwrk_niet_op_uren_pc",
    "bwrk_memo_instel",
    "bwrk_afloop_tijd",
    "bwrk_magl_uit",
    "bwrk_wachttijd_voor",
    "bwrk_magl_in",
    "bwrk_wegingsfactor_nc",
    "bwrk_rsrc_instellen",
    "bwrk_vspt_bew",
    "bwrk_afloop_perc",
    "bwrk_rsrc_bew",
    "bwrk_afloop_type",
    "bwrk_tarief_netto_mach",
    "bwrk_memo_extern",
    "bwrk_specificeren",
    "bwrk_afbeelding",
    "bwrk_wachttijd_na",
    "bwrk_uitb_prijs",
    "bwrk_man_per_machine",
    "bwrk_aanloop_perc",
    "bwrk_insteltijd",
    "bwrk_tarief_calc_mach",
    "bwrk_uitb_dagen",
    "bwrk_grbk_direct_verantw_mach",
    "bwrk_start_type",
    "bwrk_volgorde",
    "bwrk_grbk_indirect_kosten",
    "bwrk_uitbesteding",
    "bwrk_uitb_prijs_eenh",
    "bwrk_eenmalig",
    "bwrk_vspt_instel",
    "bwrk_vspt_uitb",
    "bwrk_sf_start_gereed",
    "bwrk_tarief_calc_instel",
    "bwrk_onbemand",
    "bwrk_grbk_indirect_verantw",
    "bwrk_grbk_indirect_verantw_mach",
    "bwrk_aanloop_tijd"
  ]
});
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  MKG_TABLE_BWRK
});
