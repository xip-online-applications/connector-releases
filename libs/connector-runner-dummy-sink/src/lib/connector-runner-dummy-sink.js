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
var connector_runner_dummy_sink_exports = {};
__export(connector_runner_dummy_sink_exports, {
  ConnectorRunnerDummySink: () => ConnectorRunnerDummySink
});
module.exports = __toCommonJS(connector_runner_dummy_sink_exports);
var import_connector_runtime = require("@transai/connector-runtime");
var import_kafka_base_service = require("@xip-online-data/kafka-base-service");
var import_logger = require("@transai/logger");
class ConnectorRunnerDummySink extends import_connector_runtime.ConnectorRuntime {
  constructor() {
    super(...arguments);
    this.CONNECTOR_INSTANCE = "XOD_CONNECTOR_DUMMY_SINK_CONFIG";
    this.getConfig = async () => ({
      processIdentifier: this.CONNECTOR_IDENTIFIER,
      tenantIdentifier: "dummy-tenant",
      datasourceIdentifier: "dummy-source",
      kafka: {
        brokers: ["localhost:9092"],
        groupId: "dummy-sink",
        clientId: "dummy-sink",
        consumerTopics: [
          {
            pattern: "_source_",
            flags: "i"
          }
        ]
      },
      debug: false
    });
    this.init = async () => {
      const config = this.config;
      const failProbability = config.failProbability || 0;
      if (failProbability > 0) {
        import_logger.Logger.getInstance().debug("Fail probability set to", failProbability);
      }
      const dummyProcessFailed = () => {
        return Math.random() < failProbability;
      };
      const mainCallbackFunction = (callbackFunction) => {
        return async (message) => {
          import_logger.Logger.getInstance().info(
            "Received message: ",
            message.testRun ? "(test run)" : "",
            message.eventId,
            message.payload
          );
          if (dummyProcessFailed()) {
            import_logger.Logger.getInstance().error("Dummy process failed");
            return (0, import_kafka_base_service.InternalServerError)("Dummy process failed")(message);
          }
          return callbackFunction(message);
        };
      };
      this.callbackFunction = mainCallbackFunction(this.emitEventType((0, import_kafka_base_service.Ok)()));
    };
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ConnectorRunnerDummySink
});
