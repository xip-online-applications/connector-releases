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
var CannotReflectMethodParameterTypeError_exports = {};
__export(CannotReflectMethodParameterTypeError_exports, {
  CannotReflectMethodParameterTypeError: () => CannotReflectMethodParameterTypeError
});
module.exports = __toCommonJS(CannotReflectMethodParameterTypeError_exports);
var import_TypeORMError = require("./TypeORMError");
class CannotReflectMethodParameterTypeError extends import_TypeORMError.TypeORMError {
  constructor(target, methodName) {
    super(
      `Cannot get reflected type for a "${methodName}" method's parameter of "${target.name}" class. Make sure you have turned on an "emitDecoratorMetadata": true option in tsconfig.json. Also make sure you have imported "reflect-metadata" on top of the main entry file in your application.`
    );
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  CannotReflectMethodParameterTypeError
});
//# sourceMappingURL=CannotReflectMethodParameterTypeError.js.map
