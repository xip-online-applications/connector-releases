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
var DriverOptionNotSetError_exports = {};
__export(DriverOptionNotSetError_exports, {
  DriverOptionNotSetError: () => DriverOptionNotSetError
});
module.exports = __toCommonJS(DriverOptionNotSetError_exports);
var import_TypeORMError = require("./TypeORMError");
class DriverOptionNotSetError extends import_TypeORMError.TypeORMError {
  constructor(optionName) {
    super(
      `Driver option (${optionName}) is not set. Please set it to perform connection to the database.`
    );
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  DriverOptionNotSetError
});
