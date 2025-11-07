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
var vrdg_exports = {};
__export(vrdg_exports, {
  MKG_TABLE_VRDG: () => MKG_TABLE_VRDG
});
module.exports = __toCommonJS(vrdg_exports);
var import_base = require("./_base");
const MKG_TABLE_VRDG = new import_base.MkgTable({
  identifier: "vrdg",
  fields: [
    "vrdg_grbk_pv_grd_uitb",
    "vrdg_grbk_hw_grd_uitb",
    "vrdg_grbk_grd_mat",
    "vrdg_grbk_hw_grd_mat",
    "vrdg_grbk_hw_grd_man",
    "vrdg_grbk_vrd_mat",
    "vrdg_grbk_hw_grd_mach",
    "vrdg_grbk_grd_mach",
    "vrdg_num",
    "vrdg_grbk_pv_grd_mat",
    "vrdg_grbk_kst_mach",
    "vrdg_grbk_kst_mat",
    "vrdg_grbk_pv_grd_mach",
    "vrdg_grbk_kst_man",
    "vrdg_grbk_kst_uitb",
    "vrdg_oms",
    "vrdg_grbk_grd_uitb",
    "vrdg_grbk_pv_grd_man",
    "vrdg_grbk_pv_vrd_mat",
    "vrdg_grbk_grd_man"
  ]
});
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  MKG_TABLE_VRDG
});
