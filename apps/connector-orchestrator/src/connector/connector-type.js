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
var connector_type_exports = {};
__export(connector_type_exports, {
  getConnectorType: () => getConnectorType
});
module.exports = __toCommonJS(connector_type_exports);
var import_connector_runner_ai_agent = require("@transai/connector-runner-ai-agent");
var import_connector_runner_api_sink = require("@transai/connector-runner-api-sink");
var import_connector_runner_api_source = require("@transai/connector-runner-api-source");
var import_connector_runner_bystronic = require("@transai/connector-runner-bystronic");
var import_connector_runner_cube_query = require("@transai/connector-runner-cube-query");
var import_connector_runner_dummy_node = require("@transai/connector-runner-dummy-node");
var import_connector_runner_factorynebula_source = require("@transai/connector-runner-factorynebula-source");
var import_connector_runner_file_copy = require("@transai/connector-runner-file-copy");
var import_connector_runner_file_sink = require("@transai/connector-runner-file-sink");
var import_connector_runner_file_source = require("@transai/connector-runner-file-source");
var import_connector_runner_microsoft_office365_email = require("@transai/connector-runner-microsoft-office365-email");
var import_connector_runner_mqtt = require("@transai/connector-runner-mqtt");
var import_connector_runner_samba_sink = require("@transai/connector-runner-samba-sink");
var import_connector_runner_samba_source = require("@transai/connector-runner-samba-source");
var import_connector_runner_sql_sink = require("@transai/connector-runner-sql-sink");
var import_connector_runner_sql_source = require("@transai/connector-runner-sql-source");
var import_types = require("@xip-online-data/types");
const getConnectorType = (connectorConfig, connectorSDK) => {
  switch (connectorConfig.connectorType) {
    case import_types.ConfiguredConnectorTypes.API_SINK:
      return new import_connector_runner_api_sink.ConnectorRunnerApiSink(
        connectorConfig,
        connectorConfig.config,
        connectorConfig.actions
      );
    case import_types.ConfiguredConnectorTypes.API_SOURCE:
      return new import_connector_runner_api_source.ConnectorRunnerApiSource(
        connectorConfig,
        connectorConfig.config,
        connectorConfig.actions
      );
    case import_types.ConfiguredConnectorTypes.FILE_COPY:
      return new import_connector_runner_file_copy.ConnectorRunnerFileCopy(
        connectorConfig,
        connectorConfig.config,
        connectorConfig.actions
      );
    case import_types.ConfiguredConnectorTypes.FILE_SINK:
      return new import_connector_runner_file_sink.ConnectorRunnerFileSink(
        connectorConfig,
        connectorConfig.config,
        connectorConfig.actions
      );
    case import_types.ConfiguredConnectorTypes.FILE_SOURCE:
      return new import_connector_runner_file_source.ConnectorRunnerFileSource(
        connectorConfig,
        connectorConfig.config,
        connectorConfig.actions
      );
    case import_types.ConfiguredConnectorTypes.SAMBA_SINK:
      return new import_connector_runner_samba_sink.ConnectorRunnerSambaSink(
        connectorConfig,
        connectorConfig.config,
        connectorConfig.actions
      );
    case import_types.ConfiguredConnectorTypes.SAMBA_SOURCE:
      return new import_connector_runner_samba_source.ConnectorRunnerSambaSource(
        connectorConfig,
        connectorConfig.config,
        connectorConfig.actions
      );
    case import_types.ConfiguredConnectorTypes.SQL_SINK:
      return new import_connector_runner_sql_sink.ConnectorRunnerSqlSink(
        connectorConfig,
        connectorConfig.config,
        connectorConfig.actions
      );
    case import_types.ConfiguredConnectorTypes.SQL_SOURCE:
      return new import_connector_runner_sql_source.ConnectorRunnerSqlSource(
        connectorConfig,
        connectorConfig.config,
        connectorConfig.actions
      );
    case import_types.ConfiguredConnectorTypes.MQTT:
      return new import_connector_runner_mqtt.ConnectorRunnerMqtt(
        connectorConfig,
        connectorConfig.config,
        connectorConfig.actions
      );
    case import_types.ConfiguredConnectorTypes.FACTORY_NEBULA_SOURCE:
      return new import_connector_runner_factorynebula_source.ConnectorRunnerFactorynebulaSource(
        connectorConfig,
        connectorConfig.config,
        connectorConfig.actions
      );
    case import_types.ConfiguredConnectorTypes.CUBE_QUERY_RUNNER:
      return new import_connector_runner_cube_query.ConnectorRunnerCubeQuery(
        connectorConfig,
        connectorSDK
      );
    case import_types.ConfiguredConnectorTypes.DUMMY_NODE:
      return new import_connector_runner_dummy_node.ConnectorRunnerDummyNode(
        connectorConfig,
        connectorSDK
      );
    case import_types.ConfiguredConnectorTypes.AI_AGENT:
      return new import_connector_runner_ai_agent.ConnectorRunnerAiAgent(connectorConfig, connectorSDK);
    case import_types.ConfiguredConnectorTypes.BYSTRONIC:
      return new import_connector_runner_bystronic.ConnectorRunnerBystronic(connectorConfig, connectorSDK);
    case import_types.ConfiguredConnectorTypes.MICROSOFT_OFFICE365_EMAIL:
      return new import_connector_runner_microsoft_office365_email.ConnectorRunnerMicrosoftOffice365Email(
        connectorConfig,
        connectorSDK
      );
    default:
      throw new Error(
        `Unknown connector type ${connectorConfig.connectorType}`
      );
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  getConnectorType
});
//# sourceMappingURL=connector-type.js.map
