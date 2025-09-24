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
var AlreadyHasActiveConnectionError_exports = {};
__export(AlreadyHasActiveConnectionError_exports, {
  AlreadyHasActiveConnectionError: () => AlreadyHasActiveConnectionError
});
module.exports = __toCommonJS(AlreadyHasActiveConnectionError_exports);
var import_TypeORMError = require("./TypeORMError");
class AlreadyHasActiveConnectionError extends import_TypeORMError.TypeORMError {
  constructor(connectionName) {
    super(
      `Cannot create a new connection named "${connectionName}", because connection with such name already exist and it now has an active connection session.`
    );
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  AlreadyHasActiveConnectionError
});
