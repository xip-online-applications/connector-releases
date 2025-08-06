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
var PersistedEntityNotFoundError_exports = {};
__export(PersistedEntityNotFoundError_exports, {
  PersistedEntityNotFoundError: () => PersistedEntityNotFoundError
});
module.exports = __toCommonJS(PersistedEntityNotFoundError_exports);
var import_TypeORMError = require("./TypeORMError");
class PersistedEntityNotFoundError extends import_TypeORMError.TypeORMError {
  constructor() {
    super(
      `Internal error. Persisted entity was not found in the list of prepared operated entities.`
    );
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  PersistedEntityNotFoundError
});
//# sourceMappingURL=PersistedEntityNotFoundError.js.map
