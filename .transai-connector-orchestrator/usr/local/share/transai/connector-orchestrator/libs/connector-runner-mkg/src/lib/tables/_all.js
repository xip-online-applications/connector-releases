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
var all_exports = {};
__export(all_exports, {
  MKG_TABLES: () => MKG_TABLES
});
module.exports = __toCommonJS(all_exports);
var import_artg = require("./artg");
var import_arti = require("./arti");
var import_bwrg = require("./bwrg");
var import_bwrk = require("./bwrk");
var import_clch = require("./clch");
var import_debi = require("./debi");
var import_magl = require("./magl");
var import_magz = require("./magz");
var import_medw = require("./medw");
var import_parl = require("./parl");
var import_plnb = require("./plnb");
var import_prbv = require("./prbv");
var import_prdh = require("./prdh");
var import_prdr = require("./prdr");
var import_prmv = require("./prmv");
var import_rela = require("./rela");
var import_rgrs = require("./rgrs");
var import_rsrc = require("./rsrc");
var import_rsrd = require("./rsrd");
var import_rsrg = require("./rsrg");
var import_stlh = require("./stlh");
var import_stlm = require("./stlm");
var import_stlr = require("./stlr");
var import_vrdg = require("./vrdg");
const tables = [
  import_rela.MKG_TABLE_RELA,
  import_debi.MKG_TABLE_DEBI,
  import_medw.MKG_TABLE_MEDW,
  import_arti.MKG_TABLE_ARTI,
  import_rsrc.MKG_TABLE_RSRC,
  import_rsrd.MKG_TABLE_RSRD,
  import_rsrg.MKG_TABLE_RSRG,
  import_magz.MKG_TABLE_MAGZ,
  import_magl.MKG_TABLE_MAGL,
  import_stlh.MKG_TABLE_STLH,
  import_stlr.MKG_TABLE_STLR,
  import_stlm.MKG_TABLE_STLM,
  import_prdh.MKG_TABLE_PRDH,
  import_bwrk.MKG_TABLE_BWRK,
  import_bwrg.MKG_TABLE_BWRG,
  import_clch.MKG_TABLE_CLCH,
  import_vrdg.MKG_TABLE_VRDG,
  import_rgrs.MKG_TABLE_RGRS,
  import_plnb.MKG_TABLE_PLNB,
  import_artg.MKG_TABLE_ARTG,
  import_prdr.MKG_TABLE_PRDR,
  import_prmv.MKG_TABLE_PRMV,
  import_prbv.MKG_TABLE_PRBV,
  import_parl.MKG_TABLE_PARL
];
const MKG_TABLES = tables.reduce(
  (acc, table) => {
    acc[table.identifier] = table;
    return acc;
  },
  {}
);
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  MKG_TABLES
});
