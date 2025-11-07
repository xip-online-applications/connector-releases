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
var stlr_exports = {};
__export(stlr_exports, {
  MKG_TABLE_STLR: () => MKG_TABLE_STLR
});
module.exports = __toCommonJS(stlr_exports);
var import_base = require("./_base");
const MKG_TABLE_STLR = new import_base.MkgTable({
  identifier: "stlr",
  interval: 600,
  fields: [
    "stlr_cad",
    "stlr_parent_aantal",
    "stlr_aantal",
    "stlr_verh_oppv_aantal_grp",
    "stlr_verh_gewicht_eenh_grp",
    "stlr_verh_tijd_aantal_grp",
    "stlr_verh_volume_aantal_grp",
    "stlr_memo",
    "stlr_stlr_herkomst",
    "stlr_verh_aantal_eenh_grp",
    "stlr_verh_gewicht_aantal_vrd",
    "stlr_verh_aantal_aantal_vrd",
    "stlr_seriegrootte",
    "stlr_inherit_tekening",
    "stlr_uitval",
    "stlr_volgorde",
    "stlr_eenmalig",
    "stlr_oms_3",
    "stlr_verh_volume_aantal_vrd",
    "stlr_verh_tijd_aantal_vrd",
    "stlr_files",
    "stlr_oms_1",
    "stlr_pos",
    "stlr_verh_gewicht_aantal_grp",
    "stlr_eindproduct_num",
    "stlr_stlm_certificaat",
    "stlr_verh_rest_aantal_vrd",
    "stlr_niveau",
    "stlr_tekening",
    "stlr_verh_lengte_eenh_grp",
    "stlr_prod_fase",
    "stlr_revisie",
    "stlr_verh_lengte_aantal_vrd",
    "stlr_verh_volume_eenh_grp",
    "stlr_verh_rest_aantal_grp",
    "stlr_verh_oppv_eenh_grp",
    "stlr_num",
    "stlr_verh_tijd_eenh_grp",
    "stlr_verwijzing",
    "stlr_afronden_aant",
    "stlr_verh_aantal_aantal_grp",
    "stlr_oms_2",
    "stlr_parent",
    "stlr_verh_lengte_aantal_grp",
    "stlr_verh_rest_eenh_grp",
    "stlr_verw_stlh",
    "stlr_stlh_herkomst",
    "stlr_cad_revisie",
    "stlr_verh_oppv_aantal_vrd",
    "stlr_handlingstijd",
    "stlr_tot_aantal",
    "stlr_prod_aantal"
  ]
});
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  MKG_TABLE_STLR
});
