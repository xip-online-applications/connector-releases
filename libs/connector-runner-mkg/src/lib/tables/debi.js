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
var debi_exports = {};
__export(debi_exports, {
  MKG_TABLE_DEBI: () => MKG_TABLE_DEBI
});
module.exports = __toCommonJS(debi_exports);
var import_base = require("./_base");
const MKG_TABLE_DEBI = new import_base.MkgTable({
  identifier: "debi",
  fields: [
    "debi_actief",
    "debi_email",
    "debi_vrij_datum_4",
    "debi_pkbh_verz_type",
    "debi_vrij_memo_3",
    "debi_vrij_memo_4",
    "debi_zoeknaam",
    "debi_bic",
    "debi_kredietlimiet2",
    "debi_deellev",
    "debi_fcth_verz_type",
    "debi_plaats_bank",
    "debi_dat_btw_verificatie",
    "debi_vrij_datum_1",
    "debi_naam",
    "debi_btw",
    "debi_peppol_id",
    "debi_kvk_num",
    "debi_vrij_memo_2",
    "debi_fact_naam_2",
    "debi_docs",
    "debi_bet_wijze",
    "debi_blok",
    "debi_vrij_datum_5",
    "debi_bankcode",
    "debi_memo_extern",
    "debi_naam_2",
    "debi_rekening",
    "debi_aantal_fact",
    "debi_num",
    "debi_vrij_veld_2",
    "debi_status_btw_verificatie",
    "debi_deelfact",
    "debi_comm_opslag",
    "debi_naam_btw_verificatie",
    "debi_vrij_veld_3",
    "debi_vrij_veld_4",
    "debi_incasso",
    "debi_vrij_memo_1",
    "debi_vrij_memo_5",
    "debi_max_regels_pakb",
    "debi_vrij_datum_3",
    "debi_iban",
    "debi_max_regels_fact",
    "debi_toon_opslagen",
    "debi_memo_kredietbewaking",
    "debi_kredietlimiet",
    "debi_debi_fact",
    "debi_vrij_veld_5",
    "debi_vrij_datum_2",
    "debi_btw_num",
    "debi_fact_naam",
    "debi_vrij_veld_1",
    "debi_memo_intern",
    "debi_adres_btw_verificatie"
  ]
});
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  MKG_TABLE_DEBI
});
