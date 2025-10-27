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
var NamingStrategyNotFoundError_exports = {};
__export(NamingStrategyNotFoundError_exports, {
  NamingStrategyNotFoundError: () => NamingStrategyNotFoundError
});
module.exports = __toCommonJS(NamingStrategyNotFoundError_exports);
var import_TypeORMError = require("./TypeORMError");
class NamingStrategyNotFoundError extends import_TypeORMError.TypeORMError {
  constructor(strategyName, connectionName) {
    super();
    const name = typeof strategyName === "function" ? strategyName.name : strategyName;
    this.message = `Naming strategy "${name}" was not found. Looks like this naming strategy does not exist or it was not registered in current "${connectionName}" connection?`;
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  NamingStrategyNotFoundError
});
//# sourceMappingURL=NamingStrategyNotFoundError.js.map
