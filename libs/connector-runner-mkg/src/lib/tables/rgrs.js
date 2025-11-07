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
var rgrs_exports = {};
__export(rgrs_exports, {
  MKG_TABLE_RGRS: () => MKG_TABLE_RGRS
});
module.exports = __toCommonJS(rgrs_exports);
var import_base = require("./_base");
const MKG_TABLE_RGRS = new import_base.MkgTable({
  identifier: "rgrs",
  interval: 60,
  fields: [
    "abnk_bizcuit_id",
    "aant_vraag_oms",
    "abnk_oms",
    "adon_code",
    "adon_oms",
    "adop_code",
    "arti_code",
    "bwrg_oms",
    "bwrk_oms",
    "cert_code",
    "gebr_code",
    "kbdp_oms",
    "kltn_code",
    "kstg_oms",
    "land_code",
    "magw_code",
    "medw_betaling_per_bank_2_naam",
    "medw_betaling_per_bank_naam",
    "medw_naam",
    "medw_premiesparen_naam",
    "medw_spaarloon_naam",
    "rela_naam",
    "reld_oms",
    "rsrc_oms",
    "rsrg_oms",
    "spco_code",
    "strd_oms",
    "t_bwrk_num_oms",
    "t_bwrk_oms",
    "t_oms",
    "t_omschrijving",
    "aanr_datum",
    "aanr_num",
    "aans_num",
    "aant_num",
    "abnk_num",
    "adma_num",
    "admi_num",
    "afdl_num",
    "agtn_num",
    "apia_num",
    "bank_num",
    "bwrf_num",
    "bwrg_num",
    "bwrk_num",
    "clcb_num",
    "clch_num",
    "clch_vofh_num",
    "clch_vofh_verk_num",
    "clcm_num",
    "clcr_num",
    "clct_num",
    "cred_num",
    "debi_num",
    "dgbk_num",
    "fcth_num",
    "geac_num",
    "ifch_num",
    "inkg_num",
    "iofh_num"
  ]
});
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  MKG_TABLE_RGRS
});
