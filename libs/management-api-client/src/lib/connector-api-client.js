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
var connector_api_client_exports = {};
__export(connector_api_client_exports, {
  ConnectorApiClient: () => ConnectorApiClient
});
module.exports = __toCommonJS(connector_api_client_exports);
var import_management_api_client = require("./management-api-client");
class ConnectorApiClient extends import_management_api_client.AbstractManagementApiClient {
  getActiveConnectors() {
    return this.get("/v1/connectors/with-config", {
      enabled: true
    });
  }
  getLastUpdatedTimestamp() {
    return this.get("/v1/connectors/last-updated-timestamp", {
      enabled: true
    });
  }
  writeOffsets(connectorIdentifier, offsetIdentifier, offsetData) {
    return this.put(
      `/v1/connectors/${connectorIdentifier}/offsets/${offsetIdentifier}`,
      offsetData
    );
  }
  writeAllOffsets(connectorIdentifier, offsetData) {
    return this.post(
      `/v1/connectors/${connectorIdentifier}/offsets`,
      offsetData
    );
  }
  getCurrentOffset(connectorIdentifier, offsetIdentifier) {
    return this.get(
      `/v1/connectors/${connectorIdentifier}/offsets/${offsetIdentifier}`
    );
  }
  getAllOffset(connectorIdentifier) {
    return this.get(
      `/v1/connectors/${connectorIdentifier}/offsets`
    );
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ConnectorApiClient
});
