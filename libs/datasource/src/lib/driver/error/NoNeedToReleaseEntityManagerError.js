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
var NoNeedToReleaseEntityManagerError_exports = {};
__export(NoNeedToReleaseEntityManagerError_exports, {
  NoNeedToReleaseEntityManagerError: () => NoNeedToReleaseEntityManagerError
});
module.exports = __toCommonJS(NoNeedToReleaseEntityManagerError_exports);
var import_TypeORMError = require("./TypeORMError");
class NoNeedToReleaseEntityManagerError extends import_TypeORMError.TypeORMError {
  constructor() {
    super(
      `Entity manager is not using single database connection and cannot be released. Only entity managers created by connection#createEntityManagerWithSingleDatabaseConnection methods have a single database connection and they should be released.`
    );
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  NoNeedToReleaseEntityManagerError
});
//# sourceMappingURL=NoNeedToReleaseEntityManagerError.js.map
