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
var medw_exports = {};
__export(medw_exports, {
  MKG_TABLE_MEDW: () => MKG_TABLE_MEDW
});
module.exports = __toCommonJS(medw_exports);
var import_table = require("./base/table");
const MKG_TABLE_MEDW = new import_table.MkgTable({
  identifier: "medw",
  fields: [
    "medw_pensioenpremie_werkn",
    "medw_spaarloon_rek",
    "medw_betaling_per_bank",
    "medw_premiesparen_naam",
    "medw_ziekengeld_aanm",
    "medw_betaling_per_rek_2",
    "medw_auto_vd_zaak",
    "medw_vrij_datum_5",
    "medw_or",
    "medw_premiesparen",
    "medw_telefoon",
    "medw_aanwezigheids_reg",
    "medw_betaling_per_bank_naam",
    "medw_postcode",
    "medw_premiesparen_batch",
    "medw_verschuiven",
    "medw_onkosten",
    "medw_pensioenpremie_werkg",
    "medw_arbodienst_aanm",
    "medw_lid_persver",
    "medw_laatste_bwrk",
    "medw_memo_contract",
    "medw_premiesparen_iban",
    "medw_vrij_datum_3",
    "medw_nummer_2",
    "medw_voornaam",
    "medw_ziekengeld_afm",
    "medw_mdrc",
    "medw_spaarloon_bic",
    "medw_spaarloon",
    "medw_betaling_per_bank_oms_3",
    "medw_spaarloon_iban",
    "medw_prod_gereed_melden",
    "medw_spaarloon_batch",
    "medw_betaling_per_iban_2",
    "medw_roepnaam",
    "medw_vutpremie_werkg",
    "medw_betaling_per_rek",
    "medw_uren_per_dag",
    "medw_plaats",
    "medw_telefoon_2",
    "medw_or_functie",
    "medw_pensioenfonds",
    "medw_schoenmaat",
    "medw_naam_2",
    "medw_spaarloon_oms1",
    "medw_vutpremie",
    "medw_ehbo",
    "medw_vrij_datum_4",
    "medw_email",
    "medw_vrij_memo_1",
    "medw_soort_contract",
    "medw_vakantie_uren",
    "medw_reiskosten",
    "medw_vrij_veld_4",
    "medw_waohiaat_werkg",
    "medw_vrij_datum_2",
    "medw_premiesparen_oms1",
    "medw_salaris",
    "medw_vrij_veld_3",
    "medw_spaarloon_oms3",
    "medw_planning",
    "medw_raadplegen_uren",
    "medw_spaarloon_naam",
    "medw_vrij_veld_5",
    "medw_ziekenfonds_aanm",
    "medw_betaling_per_bank_2_naam",
    "medw_partime_salaris",
    "medw_premiesparen_oms2",
    "medw_bedrijfsvereniging_afm",
    "medw_betaling_per_bank_2_oms1",
    "medw_betaling_per_bank_2",
    "medw_betaling_per_bank_plaats",
    "medw_tussenvoegsel",
    "medw_instellen",
    "medw_pensioenfonds_afm",
    "medw_functietitel",
    "medw_straat_2",
    "medw_premiesparen_plaats",
    "medw_betaling_per_bic_2",
    "medw_betaling_per_kas_2",
    "medw_betaling_per_bank_2_oms3",
    "medw_premiesparen_oms3",
    "medw_straat",
    "medw_premiesparen_oms4",
    "medw_dagen_per_week",
    "medw_telefax",
    "medw_afbeelding",
    "medw_op_uren_pc",
    "medw_direct_gereed"
  ]
});
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  MKG_TABLE_MEDW
});
