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
var PrimaryColumnCannotBeNullableError_exports = {};
__export(PrimaryColumnCannotBeNullableError_exports, {
  PrimaryColumnCannotBeNullableError: () => PrimaryColumnCannotBeNullableError
});
module.exports = __toCommonJS(PrimaryColumnCannotBeNullableError_exports);
var import_TypeORMError = require("./TypeORMError");
class PrimaryColumnCannotBeNullableError extends import_TypeORMError.TypeORMError {
  constructor(object, propertyName) {
    super(
      `Primary column ${object.constructor.name}#${propertyName} cannot be nullable. Its not allowed for primary keys. Try to remove nullable option.`
    );
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  PrimaryColumnCannotBeNullableError
});
