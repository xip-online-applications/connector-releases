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
var connector_runner_mqtt_exports = {};
__export(connector_runner_mqtt_exports, {
  ConnectorRunnerMqtt: () => ConnectorRunnerMqtt
});
module.exports = __toCommonJS(connector_runner_mqtt_exports);
var import_connector_runtime = require("@transai/connector-runtime");
var import_mqtt = require("./mqtt.client");
class ConnectorRunnerMqtt extends import_connector_runtime.ConnectorRuntime {
  constructor() {
    super(...arguments);
    this.CONNECTOR_INSTANCE = "XOD_CONNECTOR_MQTT_SOURCE_CONFIG";
    this.init = async () => {
      const config = await this.getConfig();
      this.#mqttClient = new import_mqtt.MqttClient(config, config, this.kafkaService);
    };
  }
  #mqttClient;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ConnectorRunnerMqtt
});
