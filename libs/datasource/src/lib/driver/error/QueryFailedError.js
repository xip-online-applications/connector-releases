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
var QueryFailedError_exports = {};
__export(QueryFailedError_exports, {
  QueryFailedError: () => QueryFailedError
});
module.exports = __toCommonJS(QueryFailedError_exports);
var import_object_utils = require("../../util/object-utils");
var import_TypeORMError = require("./TypeORMError");
class QueryFailedError extends import_TypeORMError.TypeORMError {
  constructor(query, parameters, driverError) {
    super(
      driverError.toString().replace(/^error: /, "").replace(/^Error: /, "").replace(/^Request/, "")
    );
    this.query = query;
    this.parameters = parameters;
    this.driverError = driverError;
    if (driverError) {
      const {
        name: _,
        // eslint-disable-line
        ...otherProperties
      } = driverError;
      import_object_utils.ObjectUtils.assign(this, {
        ...otherProperties
      });
    }
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  QueryFailedError
});
