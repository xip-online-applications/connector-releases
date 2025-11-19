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
var types_exports = {};
__export(types_exports, {
  DEFAULT_DATASOURCE: () => DEFAULT_DATASOURCE,
  DEFAULT_DATE_FIELD: () => DEFAULT_DATE_FIELD,
  DEFAULT_INTERVAL: () => DEFAULT_INTERVAL,
  DEFAULT_NUM_ROWS: () => DEFAULT_NUM_ROWS,
  DEFAULT_ROW_KEY_FIELD: () => DEFAULT_ROW_KEY_FIELD,
  SESSION_COOKIE_NAME: () => SESSION_COOKIE_NAME,
  SESSION_EXPIRATION_SECONDS: () => SESSION_EXPIRATION_SECONDS
});
module.exports = __toCommonJS(types_exports);
const DEFAULT_DATASOURCE = "mkg";
const DEFAULT_INTERVAL = 3600;
const DEFAULT_ROW_KEY_FIELD = "RowKey";
const DEFAULT_DATE_FIELD = "sys_dat_wijzig";
const DEFAULT_NUM_ROWS = 250;
const SESSION_COOKIE_NAME = "JSESSIONID";
const SESSION_EXPIRATION_SECONDS = 30 * 60 * 1e3;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  DEFAULT_DATASOURCE,
  DEFAULT_DATE_FIELD,
  DEFAULT_INTERVAL,
  DEFAULT_NUM_ROWS,
  DEFAULT_ROW_KEY_FIELD,
  SESSION_COOKIE_NAME,
  SESSION_EXPIRATION_SECONDS
});
