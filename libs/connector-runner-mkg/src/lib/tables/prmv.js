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
var prmv_exports = {};
__export(prmv_exports, {
  MKG_TABLE_PRMV: () => MKG_TABLE_PRMV
});
module.exports = __toCommonJS(prmv_exports);
var import_action = require("./base/action");
var import_table = require("./base/table");
const ACTION_CREATE = new import_action.MkgAction({
  identifier: "create.prdh_prdr",
  method: "POST",
  fields: ["prmv_oms_1", "cred_num"],
  path: (inputData) => {
    const prdhNum = inputData["prdh_num"];
    if (!prdhNum) {
      throw new Error(`Missing required field 'prdh_num' for action 'create'`);
    }
    const prdrNum = inputData["prdr_num"];
    if (!prdrNum) {
      throw new Error(`Missing required field 'prdr_num' for action 'create'`);
    }
    return `prdr/1+${prdhNum}+${prdrNum}/prdr_prmv`;
  }
});
const MKG_TABLE_PRMV = new import_table.MkgTable(
  {
    identifier: "prmv",
    fields: []
  },
  [ACTION_CREATE]
);
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  MKG_TABLE_PRMV
});
