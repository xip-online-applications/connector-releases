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
var connector_runner_dummy_node_exports = {};
__export(connector_runner_dummy_node_exports, {
  ConnectorRunnerDummyNode: () => ConnectorRunnerDummyNode
});
module.exports = __toCommonJS(connector_runner_dummy_node_exports);
var import_connector_runtime_sdk = require("@transai/connector-runtime-sdk");
class ConnectorRunnerDummyNode extends import_connector_runtime_sdk.ConnectorRuntimeSDK {
  constructor() {
    super(...arguments);
    this.CONNECTOR_INSTANCE = "XOD_CONNECTOR_DUMMY_NODE_CONFIG";
    this.init = async () => {
      const { config } = this.connectorSDK;
      const failProbability = config.failProbability || 0;
      if (failProbability > 0) {
        this.connectorSDK.logger.debug(
          "Fail probability set to",
          failProbability
        );
      }
      const dummyProcessFailed = () => {
        return Math.random() < failProbability;
      };
      this.callbackFunction = async (message, action) => {
        this.connectorSDK.logger.info(
          "Received message: ",
          message.testRun ? "(test run)" : "",
          message.eventId,
          message.payload
        );
        if (dummyProcessFailed()) {
          this.connectorSDK.logger.error("Dummy process failed");
          return this.connectorSDK.receiver.responses.internalServerError(
            "Dummy process failed"
          )(message);
        }
        return this.connectorSDK.receiver.responses.ok()(message);
      };
    };
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ConnectorRunnerDummyNode
});
