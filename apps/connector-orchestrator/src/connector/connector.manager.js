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
var import_connector_type = require("./connector-type");
class ConnectorManager {
  constructor(node, connectorData) {
    this.start = async () => {
      this.#logger.info(
        `Worker ${this.#connectorData.connectorType}, ${this.#connectorData.identifier} ${this.#node.process.pid} started`
      );
      const connector = (0, import_connector_type.getConnectorType)(this.#connectorData, this.#connectorSDK);
      this.#node.process.on("SIGINT", async () => {
        this.#logger.warn(
          `Worker ${this.#connectorData.connectorType}, ${this.#connectorData.identifier} ${this.#node.process.pid} received SIGINT signal. Start graceful shutdown`
        );
        await connector.stop();
        await this.#connectorSDK.stop();
        this.#logger.warn(
          `Worker ${this.#connectorData.connectorType}, ${this.#connectorData.identifier} ${this.#node.process.pid} received SIGINT signal and finished graceful shutdown`
        );
        this.#node.process.exit(0);
      });
      this.#node.process.on("SIGTERM", async () => {
        this.#logger.warn(
          `Worker ${this.#connectorData.connectorType}, ${this.#connectorData.identifier} ${this.#node.process.pid} received SIGTERM. Start graceful shutdown`
        );
        await connector.stop();
        await this.#connectorSDK.stop();
        this.#logger.warn(
          `Worker ${this.#connectorData.connectorType}, ${this.#connectorData.identifier} ${this.#node.process.pid} received SIGTERM and finished graceful shutdown`
        );
        this.#node.process.exit(0);
      });
      this.#node.process.on("uncaughtException", async (error) => {
        this.#logger.warn(
          `Worker ${this.#connectorData.connectorType}, ${this.#connectorData.identifier} ${this.#node.process.pid} received uncaughtException signal. Start graceful shutdown`
        );
        this.#logger.error(error);
        await connector.stop();
        await this.#connectorSDK.stop();
        this.#logger.warn(
          `Worker ${this.#connectorData.connectorType}, ${this.#connectorData.identifier} ${this.#node.process.pid} received uncaughtException and finished graceful shutdown`
        );
        this.#node.process.exit(1);
      });
      if (connector instanceof import_connector_runtime_sdk.ConnectorRuntimeSDK) {
        await connector.init();
      }
      await connector.start();
    };
    this.#node = node;
    this.#connectorData = connectorData;
    this.#logger = import_logger.Logger.getInstance();
    this.#connectorSDK = new import_connector_sdk.TransAIConnectorSDK(
      this.#connectorData,
      this.#logger
    );
  }
  #node;
  #connectorData;
  #connectorSDK;
  #logger;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ConnectorManager
});
//# sourceMappingURL=connector.manager.js.map
