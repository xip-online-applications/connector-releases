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
var stlm_exports = {};
__export(stlm_exports, {
  MKG_TABLE_STLM: () => MKG_TABLE_STLM
});
module.exports = __toCommonJS(stlm_exports);
var import_table = require("./base/table");
const MKG_TABLE_STLM = new import_table.MkgTable({
  identifier: "stlm",
  interval: 600,
  fields: [
    "arti_code",
    "stlm_rest_min",
    "stlm_eenh",
    "stlm_netto_prijs_uitb",
    "stlm_lijst_9",
    "stlm_oms_1",
    "stlm_gewicht_netto",
    "stlm_lijst_2",
    "stlm_volume",
    "stlm_tot_nettoprijs",
    "stlm_oms_3",
    "stlm_toegeleverd",
    "stlm_netto_prijs_mat",
    "stlm_plaat_magw",
    "stlm_rest_hl",
    "stlm_lijst_5",
    "stlm_oppervlakte",
    "stlm_num",
    "stlm_parameter_2",
    "stlm_parameter_1",
    "stlm_gewicht_bruto",
    "stlm_zaaglengte",
    "stlm_revisie",
    "stlm_lijst_4",
    "stlm_eenh_nettoprijs",
    "stlm_plaat_b",
    "stlm_tekening",
    "stlm_opspanlengte_hl",
    "stlm_eenmalig",
    "stlm_opspanlengte_pl",
    "stlm_lijst_7",
    "stlm_memo_extern",
    "stlm_factor",
    "stlm_parameter_3",
    "stlm_aantal",
    "stlm_gewicht_per_m",
    "stlm_plaat_a",
    "stlm_plaat_dx",
    "stlm_behoefte_obv",
    "stlm_netto_prijs_fictief",
    "stlm_opspanlengte_hlzl",
    "stlm_memo",
    "stlm_io_aanvragen",
    "stlm_opspanlengte",
    "stlm_aantal_lengtes",
    "stlm_volgorde",
    "stlm_zaagsnede_lengte",
    "stlm_lijst_8",
    "stlm_netto_prijs_mach",
    "stlm_pos",
    "stlm_oms_2",
    "stlm_eenh_bestel",
    "stlm_netto_prijs_man",
    "stlm_handelslengte",
    "stlm_eigen_spec",
    "stlm_cad",
    "stlm_zaagsnede",
    "stlm_netto_prijs",
    "stlm_bestel_gezaagd",
    "stlm_prijs_methode",
    "stlm_rest_zl",
    "stlm_parameter_5",
    "stlm_plaat_dy",
    "stlm_lijst_6",
    "stlm_bestel_handelslengte",
    "stlm_lengte",
    "stlm_lijst_3",
    "stlm_spec_prijs",
    "stlm_lijst_1",
    "stlm_files",
    "stlm_parameter_4",
    "stlm_plaat_k"
  ]
});
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  MKG_TABLE_STLM
});
