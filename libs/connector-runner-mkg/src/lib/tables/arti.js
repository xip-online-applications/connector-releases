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
var arti_exports = {};
__export(arti_exports, {
  MKG_TABLE_ARTI: () => MKG_TABLE_ARTI
});
module.exports = __toCommonJS(arti_exports);
var import_base = require("./_base");
const MKG_TABLE_ARTI = new import_base.MkgTable({
  identifier: "arti",
  interval: 300,
  fields: [
    "arti_parameter_2",
    "arti_prijs_vast_man",
    "arti_seriegrootte",
    "arti_vrij_memo_1",
    "arti_bestellen",
    "arti_btw_aanpasbaar",
    "arti_vrij_datum_1",
    "arti_eenh_uitgifte",
    "arti_eenh_prijs_inkoop",
    "arti_partij_per_1",
    "arti_partij",
    "arti_voorraad_waarde_mach",
    "arti_parameter_4",
    "arti_eenh_ontvangst",
    "arti_prijs_vast_mat",
    "arti_verh_tijd_aantal_grp",
    "arti_voorraad_aantal",
    "arti_bestel_freq_eenh",
    "arti_vrij_datum_4",
    "arti_eenh_vrk",
    "arti_trans_eenh",
    "arti_kosten_artikel",
    "arti_verh_tijd_aantal_vrd",
    "arti_verh_volume_aantal_grp",
    "arti_memo_verkoop_intern",
    "arti_verh_volume_aantal_vrd",
    "arti_vrij_memo_2",
    "arti_zoeknaam",
    "arti_blok_verkoop",
    "arti_verh_aantal_aantal_vrd",
    "arti_actief",
    "arti_bestelcode",
    "arti_locatie",
    "arti_prijs_netto_mat",
    "arti_prijs_vast",
    "arti_vrij_veld_1",
    "arti_parameter_1",
    "arti_vrij_datum_2",
    "arti_gewicht_per_m",
    "arti_memo_inkoop_extern",
    "arti_inkoopofferte",
    "arti_prijs_gemiddeld_mat",
    "arti_dienst_verkoop",
    "arti_oms_2",
    "arti_levertijd_inkoop",
    "arti_verh_tijd_eenh_grp",
    "arti_prijs_netto_uitb",
    "arti_oppervlakte",
    "arti_voorraadsysteem",
    "arti_kostprijssysteem",
    "arti_niet_autores",
    "arti_wvp_obv_gvp",
    "arti_vrij_memo_5",
    "arti_prijs_inkoop",
    "arti_levertijd_productie",
    "arti_verh_gewicht_aantal_grp",
    "arti_verh_gewicht_eenh_grp",
    "arti_vrij_veld_2",
    "arti_prijs_gemiddeld_mach",
    "arti_lijst_3",
    "arti_verh_gewicht_aantal_vrd",
    "arti_parameter_3",
    "arti_lijst_1",
    "arti_prijs_vast_mach",
    "arti_vrij_veld_5",
    "arti_ict_fact_verkoop",
    "arti_verh_lengte_aantal_vrd",
    "arti_backflush",
    "arti_vrij_datum_3",
    "arti_vrd_aanvullen_tot",
    "arti_inkoop_artikel",
    "arti_verh_rest_aantal_grp",
    "arti_eenh_vrd",
    "arti_prijs_vast_uitb",
    "arti_trans_gewicht",
    "arti_memo_inkoop_intern",
    "arti_vrij_memo_3",
    "arti_prijs_netto",
    "arti_mat_lengte",
    "arti_bestelhoeveelheid",
    "arti_eenh_bestelling",
    "arti_verh_oppv_eenh_grp",
    "arti_voorraad_artikel",
    "arti_backflush_uitval",
    "arti_lijst_9",
    "arti_vrij_datum_5",
    "arti_verh_oppv_aantal_grp",
    "arti_prijs_gemiddeld_uitb",
    "arti_prijs_verkoop_eenm",
    "arti_oms_3",
    "arti_oms_1"
  ]
});
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  MKG_TABLE_ARTI
});
