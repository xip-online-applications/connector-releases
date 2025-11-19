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
var parl_exports = {};
__export(parl_exports, {
  MKG_TABLE_PARL: () => MKG_TABLE_PARL
});
module.exports = __toCommonJS(parl_exports);
var import_action = require("./base/action");
var import_table = require("./base/table");
const ACTION_MOVE = new import_action.MkgAction({
  identifier: "move",
  method: "PUT",
  fields: [
    "admi_num",
    "part_num",
    "magl_code",
    "t_doel_magl",
    "t_doel_aantal",
    "RowKey"
  ],
  path: () => "parl/0/Service/s_partij_verplaatsen"
});
const MKG_TABLE_PARL = new import_table.MkgTable(
  {
    identifier: "parl",
    fields: []
  },
  [ACTION_MOVE]
);
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  MKG_TABLE_PARL
});
