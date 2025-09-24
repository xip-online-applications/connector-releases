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
var OffsetWithoutLimitNotSupportedError_exports = {};
__export(OffsetWithoutLimitNotSupportedError_exports, {
  OffsetWithoutLimitNotSupportedError: () => OffsetWithoutLimitNotSupportedError
});
module.exports = __toCommonJS(OffsetWithoutLimitNotSupportedError_exports);
var import_TypeORMError = require("./TypeORMError");
class OffsetWithoutLimitNotSupportedError extends import_TypeORMError.TypeORMError {
  constructor() {
    super(
      `RDBMS does not support OFFSET without LIMIT in SELECT statements. You must use limit in conjunction with offset function (or take in conjunction with skip function if you are using pagination).`
    );
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  OffsetWithoutLimitNotSupportedError
});
