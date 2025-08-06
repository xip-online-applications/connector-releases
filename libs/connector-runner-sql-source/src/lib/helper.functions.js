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
var helper_functions_exports = {};
__export(helper_functions_exports, {
  generateCollectionName: () => generateCollectionName,
  generateKafkaTopic: () => generateKafkaTopic
});
module.exports = __toCommonJS(helper_functions_exports);
function generateCollectionName(connectorConfig, sinkConfig) {
  return `${connectorConfig.datasourceIdentifier}_${sinkConfig.queryName}`;
}
function generateKafkaTopic(connectorConfig, sinkConfig) {
  return `${connectorConfig.tenantIdentifier}_SOURCE_${connectorConfig.datasourceIdentifier}_${sinkConfig.queryIdentifier}`;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  generateCollectionName,
  generateKafkaTopic
});
//# sourceMappingURL=helper.functions.js.map
