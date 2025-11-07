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
var rsrd_exports = {};
__export(rsrd_exports, {
  MKG_TABLE_RSRD: () => MKG_TABLE_RSRD
});
module.exports = __toCommonJS(rsrd_exports);
var import_base = require("./_base");
const MKG_TABLE_RSRD = new import_base.MkgTable({
  identifier: "rsrd",
  interval: 300,
  fields: [
    "rsrd_zo_p2_van",
    "rsrd_za_p2_tot",
    "rsrd_do_p1_tot",
    "rsrd_di_p5_tot",
    "rsrd_zo_p5_tot",
    "rsrd_do_p3_tot",
    "rsrd_ma_p4_tot",
    "rsrd_wo_p3_van",
    "rsrd_zo_p1_van",
    "rsrd_fd_p1_van",
    "rsrd_do_p5_van",
    "rsrd_wo_p2_tot",
    "rsrd_za_van",
    "rsrd_vr_p3_van",
    "rsrd_za_p4_van",
    "rsrd_ma_p5_tot",
    "rsrd_fd_p3_van",
    "rsrd_wo_tot",
    "rsrd_vr_tot",
    "rsrd_ma_p1_tot",
    "rsrd_wo_p1_tot",
    "rsrd_zo_p4_tot",
    "rsrd_di_p4_tot",
    "rsrd_ma_p3_van",
    "rsrd_ma_p5_van",
    "rsrd_di_tot",
    "rsrd_fd_p4_van",
    "rsrd_vr_van",
    "rsrd_za_p3_tot",
    "rsrd_za_p1_van",
    "rsrd_zo_p5_van",
    "rsrd_fd_p2_tot",
    "rsrd_vr_p5_van",
    "rsrd_di_p4_van",
    "rsrd_za_p5_tot",
    "rsrd_di_p3_van",
    "rsrd_ma_p2_tot",
    "rsrd_di_van",
    "rsrd_do_p1_van",
    "rsrd_zo_p3_tot",
    "rsrd_vr_p5_tot",
    "rsrd_zo_p1_tot",
    "rsrd_ma_van",
    "rsrd_do_tot",
    "rsrd_wo_p2_van",
    "rsrd_vr_p3_tot",
    "rsrd_di_p1_van",
    "rsrd_za_p5_van",
    "rsrd_fd_p5_van",
    "rsrd_vr_p4_tot",
    "rsrd_wo_p3_tot",
    "rsrd_fd_p1_tot",
    "rsrd_fd_p3_tot",
    "rsrd_ma_p4_van",
    "rsrd_di_p3_tot",
    "rsrd_zo_p4_van",
    "rsrd_do_p4_tot",
    "rsrd_do_van",
    "rsrd_do_p3_van",
    "rsrd_wo_p1_van",
    "rsrd_za_p4_tot",
    "rsrd_zo_van",
    "rsrd_do_p2_tot",
    "rsrd_vr_p2_van",
    "rsrd_vr_p2_tot",
    "rsrd_vr_p1_tot",
    "rsrd_do_p5_tot",
    "rsrd_wo_van",
    "rsrd_zo_tot",
    "rsrd_za_p2_van",
    "rsrd_oms",
    "rsrd_zo_p3_van",
    "rsrd_fd_p2_van",
    "rsrd_do_p4_van",
    "rsrd_di_p2_tot",
    "rsrd_za_p3_van",
    "rsrd_wo_p4_van",
    "rsrd_vr_p4_van",
    "rsrd_wo_p4_tot",
    "rsrd_num",
    "rsrd_ma_tot",
    "rsrd_ma_p1_van",
    "rsrd_di_p5_van",
    "rsrd_fd_p5_tot",
    "rsrd_vr_p1_van",
    "rsrd_di_p2_van",
    "rsrd_do_p2_van",
    "rsrd_wo_p5_van",
    "rsrd_za_tot",
    "rsrd_ma_p3_tot"
  ]
});
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  MKG_TABLE_RSRD
});
