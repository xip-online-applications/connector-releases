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
  MqttClient: () => MqttClient,
  generateKafkaTopic: () => generateKafkaTopic
});
module.exports = __toCommonJS(mqtt_client_exports);
var import_mqtt = require("mqtt");
var import_uuid = require("uuid");
var import_logger = require("@transai/logger");
function generateKafkaTopic(connectorConfig) {
  return `${connectorConfig.tenantIdentifier}_SOURCE_${connectorConfig.datasourceIdentifier}`;
}
class MqttClient {
  constructor(baseConnectorConfig, mqttConfig, kafkaService) {
    this.mqttConfig = mqttConfig;
    this.#logger = import_logger.Logger.getInstance();
    this.#baseConnectorConfig = baseConnectorConfig;
    this.#kafkaService = kafkaService;
    this.#client = (0, import_mqtt.connect)(mqttConfig.brokerUrl, {
      clientId: mqttConfig.clientId,
      username: mqttConfig.username,
      password: mqttConfig.password,
      rejectUnauthorized: false
    });
    this.#client.on("connect", () => {
      this.#logger.info("Connected to MQTT broker");
      this.#client?.subscribe(mqttConfig.topic);
    });
    this.#client.on("error", (err) => {
      this.#logger.error("MQTT connection error:", err);
    });
    this.#client.on("message", async (topic, message) => {
      const msg = message.toString();
      this.#logger.debug(
        `Received message from MQTT broker with topic ${topic}: ${msg}`
      );
      let body;
      try {
        body = JSON.parse(msg);
      } catch (error) {
        this.#logger.error(`Error parsing message ${msg}:`, error);
        body = {
          body: msg
        };
      }
      const kafkaPayload = this.#buildKafkaPayload(topic, body);
      const kafkaTopic = generateKafkaTopic(this.#baseConnectorConfig);
      this.#logger.debug(
        `Sending message to Kafka with topic ${kafkaTopic}:`,
        kafkaPayload
      );
      await this.#kafkaService.send([kafkaPayload], kafkaTopic);
    });
  }
  #baseConnectorConfig;
  #client;
  #kafkaService;
  #logger;
  async stop() {
    this.#client?.removeAllListeners();
    await this.#client?.unsubscribeAsync(this.mqttConfig.topic);
    await this.#client?.endAsync();
  }
  #buildKafkaPayload = (topic, message) => {
    return {
      type: "SOURCE",
      eventId: (0, import_uuid.v4)(),
      eventType: "event.metric",
      created: Date.now(),
      ttl: 36e5,
      // 1 month
      tenantIdentifier: this.#baseConnectorConfig.tenantIdentifier,
      payload: this.#buildPayload(topic, message)
    };
  };
  #buildPayload = (topic, message) => {
    return {
      collection: topic,
      body: message
    };
  };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  MqttClient,
  generateKafkaTopic
});
//# sourceMappingURL=mqtt.client.js.map
