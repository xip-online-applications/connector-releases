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
var build_connector_topic_exports = {};
__export(build_connector_topic_exports, {
  buildConnectorTopic: () => buildConnectorTopic
});
module.exports = __toCommonJS(build_connector_topic_exports);
function buildConnectorTopic(connectorConfig) {
  return `${connectorConfig.tenantIdentifier}_CONNECTOR_${connectorConfig.identifier}_${connectorConfig.location}`;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  buildConnectorTopic
});
//# sourceMappingURL=build-connector-topic.js.map
