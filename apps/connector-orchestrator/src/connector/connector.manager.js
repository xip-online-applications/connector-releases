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
var connector_manager_exports = {};
__export(connector_manager_exports, {
  ConnectorManager: () => ConnectorManager
});
module.exports = __toCommonJS(connector_manager_exports);
var import_connector_runtime_sdk = require("@transai/connector-runtime-sdk");
var import_connector_sdk = require("@transai/connector-sdk");
var import_logger = require("@transai/logger");
var import_management_api_client = require("@transai/management-api-client");
var import_connector_type = require("./connector-type");
class ConnectorManager {
  constructor(node, tenantIdentifier, connectorIdentifier, orchestratorConfig) {
    this.start = async () => {
      this.#logger.info(
        `Worker ${this.#connectorIdentifier} ${this.#node.process.pid} started`
      );
      this.#logger.debug(
        `Worker ${this.#connectorIdentifier} get config from API`
      );
      const connectorConfig = await this.#connectorApiClient.getConnector(
        this.#connectorIdentifier
      );
      const connectorData = this.#buildConnectorConfiguration(connectorConfig);
      this.#logger.debug(
        `Worker ${this.#connectorIdentifier} Received config from API`
      );
      const sdk = new import_connector_sdk.TransAIConnectorSDK(connectorData, this.#logger);
      const connector = (0, import_connector_type.getConnectorType)(connectorData, sdk);
      this.#node.process.on("SIGINT", async () => {
        this.#logger.warn(
          `Worker ${connectorData.connectorType}, ${connectorData.identifier} ${this.#node.process.pid} received SIGINT signal. Start graceful shutdown`
        );
        await connector.stop();
        await sdk.stop();
        this.#logger.warn(
          `Worker ${connectorData.connectorType}, ${connectorData.identifier} ${this.#node.process.pid} received SIGINT signal and finished graceful shutdown`
        );
        this.#node.process.exit(0);
      });
      this.#node.process.on("SIGTERM", async () => {
        this.#logger.warn(
          `Worker ${connectorData.connectorType}, ${connectorData.identifier} ${this.#node.process.pid} received SIGTERM. Start graceful shutdown`
        );
        await connector.stop();
        await sdk.stop();
        this.#logger.warn(
          `Worker ${connectorData.connectorType}, ${connectorData.identifier} ${this.#node.process.pid} received SIGTERM and finished graceful shutdown`
        );
        this.#node.process.exit(0);
      });
      this.#node.process.on("uncaughtException", async (error) => {
        this.#logger.warn(
          `Worker ${connectorData.connectorType}, ${connectorData.identifier} ${this.#node.process.pid} received uncaughtException signal. Start graceful shutdown`
        );
        this.#logger.error(error);
        await connector.stop();
        await sdk.stop();
        this.#logger.warn(
          `Worker ${connectorData.connectorType}, ${connectorData.identifier} ${this.#node.process.pid} received uncaughtException and finished graceful shutdown`
        );
        this.#node.process.exit(1);
      });
      if (connector instanceof import_connector_runtime_sdk.ConnectorRuntimeSDK) {
        await Promise.all([sdk.init(), connector.init()]);
        await sdk.start();
      }
      await connector.start();
    };
    this.#buildConnectorConfiguration = (connector) => {
      const tenantIdentifier = this.#tenantIdentifier ?? connector.tenantIdentifier;
      const awsAccessKeyId = connector.config.kafka?.sasl?.accessKeyId ?? process.env["AWS_ACCESS_KEY_ID"] ?? this.#orchestratorConfig.awsAccessKeyId;
      const awsSecretAccessKey = connector.config.kafka?.sasl?.secretAccessKey ?? process.env["AWS_SECRET_ACCESS_KEY"] ?? this.#orchestratorConfig.awsSecretAccessKey;
      return {
        ...connector,
        tenantIdentifier,
        config: {
          ...connector.config,
          tenantIdentifier,
          processIdentifier: connector.config.processIdentifier ?? `${tenantIdentifier}-${connector.identifier}`,
          kafka: {
            ...connector.config.kafka ?? {},
            brokers: connector.config.kafka?.brokers ?? this.#orchestratorConfig.kafkaBrokers,
            groupId: connector.config.kafka?.groupId ?? `${tenantIdentifier}-${connector.identifier}-group`,
            clientId: connector.config.kafka?.clientId ?? `${tenantIdentifier}-${connector.identifier}-client`,
            useConfluentLibrary: connector.config.kafka?.useConfluentLibrary ?? true,
            ...awsAccessKeyId && awsSecretAccessKey ? {
              sasl: {
                region: connector.config.kafka?.sasl?.region ?? process.env["AWS_REGION"] ?? this.#orchestratorConfig.awsRegion ?? "eu-west-1",
                accessKeyId: awsAccessKeyId,
                secretAccessKey: awsSecretAccessKey,
                mechanism: "aws"
              }
            } : {}
          }
        }
      };
    };
    this.#node = node;
    this.#tenantIdentifier = tenantIdentifier;
    this.#orchestratorConfig = orchestratorConfig;
    this.#connectorIdentifier = connectorIdentifier;
    this.#connectorApiClient = new import_management_api_client.ConnectorApiClient();
    this.#logger = import_logger.Logger.getInstance();
  }
  #node;
  #connectorApiClient;
  #orchestratorConfig;
  #tenantIdentifier;
  #connectorIdentifier;
  #logger;
  #buildConnectorConfiguration;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ConnectorManager
});
