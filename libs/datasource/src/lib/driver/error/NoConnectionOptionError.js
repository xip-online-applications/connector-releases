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
var NoConnectionOptionError_exports = {};
__export(NoConnectionOptionError_exports, {
  NoConnectionOptionError: () => NoConnectionOptionError
});
module.exports = __toCommonJS(NoConnectionOptionError_exports);
var import_TypeORMError = require("./TypeORMError");
class NoConnectionOptionError extends import_TypeORMError.TypeORMError {
  constructor(optionName) {
    super(
      `Option "${optionName}" is not set in your connection options, please define "${optionName}" option in your connection options or ormconfig.json`
    );
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  NoConnectionOptionError
});
//# sourceMappingURL=NoConnectionOptionError.js.map
