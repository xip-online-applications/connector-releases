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
var types_exports = {};
__export(types_exports, {
  isSourceConfigType: () => isSourceConfigType,
  isSqlSourceRunnerConfigType: () => isSqlSourceRunnerConfigType
});
module.exports = __toCommonJS(types_exports);
var import_datasource = require("@xip-online-data/datasource");
function isSourceConfigType(obj) {
  return obj !== void 0 && obj !== null && obj.query !== void 0 && typeof obj.query === "string" && obj.queryIdentifier !== void 0 && typeof obj.queryIdentifier === "string" && obj.queryName !== void 0 && typeof obj.queryName === "string" && obj.keyField !== void 0 && typeof obj.keyField === "string" && obj.incrementalField !== void 0 && typeof obj.incrementalField === "string" && obj.batchSize !== void 0 && typeof obj.batchSize === "number" && !isNaN(obj.batchSize) && obj.interval !== void 0 && typeof obj.interval === "number" && !isNaN(obj.interval);
}
function isSqlSourceRunnerConfigType(obj) {
  return obj !== void 0 && obj !== null && (0, import_datasource.isDatasourceOptions)(obj.database) && Array.isArray(obj.queries) && obj.queries.every((q) => isSourceConfigType(q)) && Array.from(new Set(obj.queries.map((q) => q.queryIdentifier))).length === obj.queries.length;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  isSourceConfigType,
  isSqlSourceRunnerConfigType
});
//# sourceMappingURL=types.js.map
