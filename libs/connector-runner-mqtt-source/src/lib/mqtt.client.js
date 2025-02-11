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
var mqtt_client_exports = {};
__export(mqtt_client_exports, {
  MqttClient: () => MqttClient
});
module.exports = __toCommonJS(mqtt_client_exports);
var import_mqtt = require("mqtt");
class MqttClient {
  constructor(mqttConfig) {
    this.mqttConfig = mqttConfig;
    this.client = (0, import_mqtt.connect)(
      mqttConfig.brokerUrl,
      {
        clientId: mqttConfig.clientId,
        username: mqttConfig.username,
        password: mqttConfig.password,
        rejectUnauthorized: false
      }
    );
    this.client.on("connect", () => {
      console.log("Connected to MQTT broker");
      this.client?.subscribe(mqttConfig.topic);
    });
    this.client.on("error", (err) => {
      console.error("MQTT connection error:", err);
    });
    this.client.on("message", (topic, message) => {
      console.log(`Received message on topic ${topic}: ${message}`);
    });
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  MqttClient
});
