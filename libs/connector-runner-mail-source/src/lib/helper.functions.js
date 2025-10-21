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
  generateKafkaTopic: () => generateKafkaTopic,
  generateOffsetIdentifier: () => generateOffsetIdentifier
});
module.exports = __toCommonJS(helper_functions_exports);
function generateCollectionName(connectorConfig) {
  return `${connectorConfig.datasourceIdentifier}`;
}
function generateKafkaTopic(connectorConfig, sourceConfig) {
  return `${connectorConfig.tenantIdentifier}_SOURCE_${connectorConfig.datasourceIdentifier}_${sourceConfig.mailboxIdentifier.replace("@", "_at_")}`;
}
function generateOffsetIdentifier(sourceConfig) {
  return `${sourceConfig.offsetFilePrefix ?? "offset"}_${sourceConfig.mailboxIdentifier}`;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  generateCollectionName,
  generateKafkaTopic,
  generateOffsetIdentifier
});
