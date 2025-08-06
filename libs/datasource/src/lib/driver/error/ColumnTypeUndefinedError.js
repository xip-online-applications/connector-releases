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
var ColumnTypeUndefinedError_exports = {};
__export(ColumnTypeUndefinedError_exports, {
  ColumnTypeUndefinedError: () => ColumnTypeUndefinedError
});
module.exports = __toCommonJS(ColumnTypeUndefinedError_exports);
var import_TypeORMError = require("./TypeORMError");
class ColumnTypeUndefinedError extends import_TypeORMError.TypeORMError {
  constructor(object, propertyName) {
    super(
      `Column type for ${object.constructor.name}#${propertyName} is not defined and cannot be guessed. Make sure you have turned on an "emitDecoratorMetadata": true option in tsconfig.json. Also make sure you have imported "reflect-metadata" on top of the main entry file in your application (before any entity imported).If you are using JavaScript instead of TypeScript you must explicitly provide a column type.`
    );
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ColumnTypeUndefinedError
});
