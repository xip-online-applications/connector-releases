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
var bwrg_exports = {};
__export(bwrg_exports, {
  MKG_TABLE_BWRG: () => MKG_TABLE_BWRG
});
module.exports = __toCommonJS(bwrg_exports);
var import_table = require("./base/table");
const MKG_TABLE_BWRG = new import_table.MkgTable({
  identifier: "bwrg",
  fields: [
    "bwrg_inkoopofferte",
    "bwrg_memo",
    "bwrg_oms",
    "bwrg_num",
    "bwrg_cred",
    "bwrg_rela"
  ]
});
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  MKG_TABLE_BWRG
});
