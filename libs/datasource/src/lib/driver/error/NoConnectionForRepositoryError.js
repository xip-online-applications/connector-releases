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
var NoConnectionForRepositoryError_exports = {};
__export(NoConnectionForRepositoryError_exports, {
  NoConnectionForRepositoryError: () => NoConnectionForRepositoryError
});
module.exports = __toCommonJS(NoConnectionForRepositoryError_exports);
var import_TypeORMError = require("./TypeORMError");
class NoConnectionForRepositoryError extends import_TypeORMError.TypeORMError {
  constructor(connectionName) {
    super(
      `Cannot get a Repository for "${connectionName} connection, because connection with the database is not established yet. Call connection#connect method to establish connection.`
    );
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  NoConnectionForRepositoryError
});
