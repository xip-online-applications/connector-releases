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
var plnb_exports = {};
__export(plnb_exports, {
  MKG_TABLE_PLNB: () => MKG_TABLE_PLNB
});
module.exports = __toCommonJS(plnb_exports);
var import_action = require("./base/action");
var import_table = require("./base/table");
const ACTION_CREATE = new import_action.MkgAction({
  identifier: "create",
  method: "POST",
  fields: [
    "prdh_num",
    "prdr_num",
    "bwrk_num",
    "plnb_dat_start",
    "plnb_tijd_start"
  ]
});
const MKG_TABLE_PLNB = new import_table.MkgTable(
  {
    identifier: "plnb",
    interval: 60,
    fields: [
      "plnb_num",
      "prdh_num",
      "bwrk_num",
      "rsrc_num",
      "medw_num",
      "plnb_dat_start",
      "plnb_tijd_start",
      "plnb_wk_start",
      "plnb_dat_eind",
      "plnb_tijd_eind",
      "plnb_wk_eind",
      "plnb_dat_gestart",
      "plnb_tijd_gestart",
      "plnb_wk_gestart",
      "plnb_gestart",
      "plnb_gereed",
      "plnb_aantal",
      "plnb_aantal_grd",
      "plnb_aantal_per_uur",
      "plnb_bijloop_aantal",
      "plnb_uitb_aantal",
      "plnb_volgorde"
    ]
  },
  [ACTION_CREATE]
);
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  MKG_TABLE_PLNB
});
