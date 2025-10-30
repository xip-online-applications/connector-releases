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
var InsertValuesMissingError_exports = {};
__export(InsertValuesMissingError_exports, {
  InsertValuesMissingError: () => InsertValuesMissingError
});
module.exports = __toCommonJS(InsertValuesMissingError_exports);
var import_TypeORMError = require("./TypeORMError");
class InsertValuesMissingError extends import_TypeORMError.TypeORMError {
  constructor() {
    super(
      `Cannot perform insert query because values are not defined. Call "qb.values(...)" method to specify inserted values.`
    );
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  InsertValuesMissingError
});
