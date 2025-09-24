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
  ConfiguredConnectorTypes: () => ConfiguredConnectorTypes,
  isActionConfigType: () => isActionConfigType,
  isAwsKafkaSalsConfig: () => isAwsKafkaSalsConfig,
  isBaseConnectorConfigType: () => isBaseConnectorConfigType,
  isCubeConfigType: () => isCubeConfigType,
  isDatabaseConfigType: () => isDatabaseConfigType,
  isKafkaBrokerConfigType: () => isKafkaBrokerConfigType,
  isTopicRegex: () => isTopicRegex
});
module.exports = __toCommonJS(types_exports);
var ConfiguredConnectorTypes = /* @__PURE__ */ ((ConfiguredConnectorTypes2) => {
  ConfiguredConnectorTypes2["API_SINK"] = "api-sink";
  ConfiguredConnectorTypes2["API_SOURCE"] = "api-source";
  ConfiguredConnectorTypes2["DUMMY_SINK"] = "dummy-sink";
  ConfiguredConnectorTypes2["DUMMY_SOURCE"] = "dummy-source";
  ConfiguredConnectorTypes2["DUMMY_NODE"] = "dummy-node";
  ConfiguredConnectorTypes2["FILE_COPY"] = "file-copy";
  ConfiguredConnectorTypes2["FILE_SINK"] = "file-sink";
  ConfiguredConnectorTypes2["FILE_SOURCE"] = "file-source";
  ConfiguredConnectorTypes2["SAMBA_SINK"] = "samba-sink";
  ConfiguredConnectorTypes2["SAMBA_SOURCE"] = "samba-source";
  ConfiguredConnectorTypes2["SQL_SINK"] = "sql-sink";
  ConfiguredConnectorTypes2["SQL_SOURCE"] = "sql-source";
  ConfiguredConnectorTypes2["MQTT"] = "mqtt";
  ConfiguredConnectorTypes2["CUBE_QUERY_RUNNER"] = "cube-query-runner";
  ConfiguredConnectorTypes2["FACTORY_NEBULA_SOURCE"] = "factory-nebula-source";
  ConfiguredConnectorTypes2["IMAP_SOURCE"] = "imap-source";
  ConfiguredConnectorTypes2["IMAP_SINK"] = "imap-sink";
  return ConfiguredConnectorTypes2;
})(ConfiguredConnectorTypes || {});
function isTopicRegex(obj) {
  if (typeof obj === "string") {
    return false;
  }
  return obj !== void 0 && obj !== null && obj.pattern !== void 0 && typeof obj.pattern === "string" && obj.flags !== void 0 && typeof obj.flags === "string";
}
function isCubeConfigType(obj) {
  return obj !== void 0 && obj !== null && obj.authorization !== void 0 && typeof obj.authorization === "string" && obj.apiUrl !== void 0 && typeof obj.apiUrl === "string";
}
function isAwsKafkaSalsConfig(obj) {
  return obj !== void 0 && obj !== null && (obj.region === void 0 || typeof obj.region === "string") && (obj.accessKeyId === void 0 || typeof obj.accessKeyId === "string") && (obj.secretAccessKey === void 0 || typeof obj.secretAccessKey === "string") && obj.mechanism === "aws";
}
function isKafkaBrokerConfigType(obj) {
  return obj !== void 0 && obj !== null && obj.groupId !== void 0 && typeof obj.groupId === "string" && obj.clientId !== void 0 && typeof obj.clientId === "string" && obj.brokers !== void 0 && Array.isArray(obj.brokers) && (obj.sasl === void 0 ? true : isAwsKafkaSalsConfig(obj.sasl));
}
function isActionConfigType(obj) {
  return obj?.timeSensitive !== void 0 && typeof obj.timeSensitive === "boolean";
}
function isDatabaseConfigType(obj) {
  return obj !== void 0 && obj !== null && obj.uri !== void 0 && typeof obj.uri === "string";
}
function isBaseConnectorConfigType(obj) {
  return obj.processIdentifier !== void 0 && typeof obj.processIdentifier === "string" && isKafkaBrokerConfigType(obj.kafka) && obj.tenantIdentifier !== void 0 && typeof obj.tenantIdentifier === "string" && obj.datasourceIdentifier !== void 0 && typeof obj.datasourceIdentifier === "string";
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ConfiguredConnectorTypes,
  isActionConfigType,
  isAwsKafkaSalsConfig,
  isBaseConnectorConfigType,
  isCubeConfigType,
  isDatabaseConfigType,
  isKafkaBrokerConfigType,
  isTopicRegex
});
