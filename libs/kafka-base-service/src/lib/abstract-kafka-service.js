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
var abstract_kafka_service_exports = {};
__export(abstract_kafka_service_exports, {
  AbstractKafkaService: () => AbstractKafkaService
});
module.exports = __toCommonJS(abstract_kafka_service_exports);
var import_types = require("@xip-online-data/types");
var import_uuid = require("uuid");
var import_kafkajs = require("kafkajs");
var import_rxjs = require("rxjs");
var import_kafkajs_msk_iam_authentication_mechanism = require("@jm18457/kafkajs-msk-iam-authentication-mechanism");
var import_node = require("@sentry/node");
var import_tracer = require("@xip-online-data/tracer");
var import_logger = require("@transai/logger");
var import_in_memory = require("./in-memory.message-monitor");
var import_redis = require("./redis.message-monitor");
var import_kafkajs_logger = require("./kafkajs-logger");
class AbstractKafkaService {
  constructor(baseYamlConfig, connectorTopic) {
    this.baseYamlConfig = baseYamlConfig;
    this.connectorTopic = connectorTopic;
    this.errorTypes = ["unhandledRejection", "uncaughtException"];
    this.signalTraps = ["SIGTERM", "SIGINT", "SIGUSR2"];
    this.processedTopic = "_LOGS_xod";
    this.DEFAULT_INTERVAL_CHECK_FOR_NEW_TOPICS = 300;
    this.DEFAULT_HEARTBEAT_TIMEOUT = 3e5;
    // 5 minutes
    this.DEFAULT_HEARTBEAT_CHECK = 1e4;
    this.numberOfSubscribedRegexTopics = 0;
    this.lastHeartbeat = /* @__PURE__ */ new Date();
    this.messageMonitor = void 0;
    this.checkHeartbeat = () => {
      if (this.baseYamlConfig.kafka.consumerTopics === void 0 || this.baseYamlConfig.kafka.consumerTopics.length === 0) {
        import_logger.Logger.getInstance().debug(
          "No consumer topics set. skip setting of consumer events callback"
        );
        return;
      }
      const now = /* @__PURE__ */ new Date();
      const diff = now.getTime() - this.lastHeartbeat.getTime();
      if (diff > this.DEFAULT_HEARTBEAT_TIMEOUT) {
        import_logger.Logger.getInstance().error(
          `No heartbeat received for ${diff}ms. Exit process`
        );
        this.exitProcess("heartbeat-timeout");
      }
    };
    this.exitProcess = async (type) => {
      console.info(
        `Got ${type}. Graceful shutdown Kafka start`,
        (/* @__PURE__ */ new Date()).toISOString()
      );
      import_logger.Logger.getInstance().debug("Disconnecting consumer and producer");
      try {
        await this.consumer?.disconnect();
        import_logger.Logger.getInstance().debug("Consumer disconnected");
      } catch (error) {
        import_logger.Logger.getInstance().error("Error while disconnecting consumer", error);
      }
      try {
        await this.producer?.disconnect();
        import_logger.Logger.getInstance().debug("Producer disconnected");
      } catch (error) {
        import_logger.Logger.getInstance().error("Error while disconnecting producer", error);
      }
      console.info("Graceful shutdown Kafka complete", (/* @__PURE__ */ new Date()).toISOString());
      process.exit(0);
    };
    this.checkForNewTopics = async () => {
      const regexTopicsOnServer = await this.getNumberOfRegexTopics();
      import_tracer.Tracer.init().get().gauge("kafka.topics", regexTopicsOnServer);
      return regexTopicsOnServer !== this.numberOfSubscribedRegexTopics;
    };
    this.getNumberOfRegexTopics = async () => {
      const regexTopics = [];
      for (const topic of this.baseYamlConfig.kafka.consumerTopics ?? []) {
        if ((0, import_types.isTopicRegex)(topic)) {
          regexTopics.push(topic);
        }
      }
      if (regexTopics.length === 0) {
        return 0;
      }
      const regexList = regexTopics.map(
        (topic) => new RegExp(topic.pattern, topic.flags)
      );
      const admin = this.kafkaBase.admin();
      await admin.connect();
      const existingTopics = await admin.listTopics();
      await admin.disconnect();
      return existingTopics.filter(
        (topic) => regexList.some((regex) => regex.test(topic))
      ).length;
    };
    this.restartIfNewTopics = async (newTopics) => {
      if (newTopics) {
        try {
          import_logger.Logger.getInstance().debug("New topics found, restarting consumer");
          await this.consumer.disconnect();
          await this.init();
        } catch (error) {
          (0, import_node.captureException)(error);
          process.exit(1);
        }
      }
    };
    const config = {
      clientId: `${baseYamlConfig.kafka.clientId}-${(0, import_uuid.v4)()}`,
      brokers: baseYamlConfig.kafka.brokers,
      ...this.getAuthProviderOptions(baseYamlConfig.kafka.sasl),
      logLevel: import_kafkajs.logLevel.ERROR,
      logCreator: import_kafkajs_logger.TransAILogCreator
    };
    this.messageMonitor = this.getCorrespondingMonitor();
    this.disableLogs = baseYamlConfig.kafka.disableLogs ?? false;
    this.kafkaBase = new import_kafkajs.Kafka(config);
    this.consumer = this.kafkaBase.consumer({
      groupId: baseYamlConfig.kafka.groupId
    });
    this.producer = this.kafkaBase.producer();
    if (this.baseYamlConfig.kafka.consumerTopics === void 0 || this.baseYamlConfig.kafka.consumerTopics.length === 0) {
      import_logger.Logger.getInstance().debug(
        "No consumer topics set. skip setting of consumer events callback"
      );
      return;
    }
    this.consumer.on("consumer.heartbeat", () => {
      this.lastHeartbeat = /* @__PURE__ */ new Date();
    });
    this.consumer.on("consumer.crash", async ({ payload }) => {
      import_logger.Logger.getInstance().error(
        `KafkaJS Consumer crashed. Error:`,
        payload.error
      );
      this.exitProcess("consumer.crash");
    });
    (0, import_rxjs.interval)(this.DEFAULT_HEARTBEAT_CHECK).subscribe(() => {
      this.checkHeartbeat();
    });
    this.getNumberOfRegexTopics().then((topics) => {
      this.numberOfSubscribedRegexTopics = topics;
    });
    const intervalCheckForNewTopics = this.baseYamlConfig.kafka.intervalCheckForNewTopics ?? this.DEFAULT_INTERVAL_CHECK_FOR_NEW_TOPICS;
    if (intervalCheckForNewTopics > 0) {
      (0, import_rxjs.interval)(intervalCheckForNewTopics * 1e3).subscribe(() => {
        this.checkForNewTopics().then(this.restartIfNewTopics.bind(this));
      });
    }
    if (process) {
      import_logger.Logger.getInstance().debug("Setting up gracefull shutdown for kafka...");
      this.errorTypes.forEach((type) => {
        process.on(type, async (e) => {
          try {
            import_logger.Logger.getInstance().error(`process.on ${type}`);
            import_logger.Logger.getInstance().error(e);
            await this.exitProcess(type);
          } catch (_) {
            process.exit(1);
          }
        });
      });
      this.signalTraps.forEach((type) => {
        process.on(type, async () => {
          import_logger.Logger.getInstance().error(`process.once ${type}`);
          try {
            await this.exitProcess(type);
          } finally {
            process.exit(0);
          }
        });
      });
    } else {
      import_logger.Logger.getInstance().debug(
        "No process found. Gracefull shutdown not possible"
      );
    }
  }
  static {
    this.DEFAULT_CALLBACK_EVENT_TYPE = "*";
  }
  getAuthProviderOptions(config) {
    if (!config) {
      return {};
    }
    const options = {
      region: config.region ?? process.env["AWS_REGION"] ?? "eu-west-1",
      credentials: void 0
    };
    if (config.accessKeyId && config.secretAccessKey) {
      options.credentials = {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey
      };
    }
    return {
      ssl: true,
      sasl: {
        mechanism: import_kafkajs_msk_iam_authentication_mechanism.Type,
        authenticationProvider: (0, import_kafkajs_msk_iam_authentication_mechanism.awsIamAuthenticator)(options)
      }
    };
  }
  getCorrespondingMonitor() {
    if (this.baseYamlConfig.kafka.messageMonitor?.type === "in-memory") {
      if (this.baseYamlConfig.debug)
        import_logger.Logger.getInstance().debug("Using in-memory message monitor");
      return new import_in_memory.InMemoryMessageMonitor(
        this.baseYamlConfig.kafka.messageMonitor,
        this.baseYamlConfig
      );
    }
    if (this.baseYamlConfig.kafka.messageMonitor?.type === "redis") {
      if (this.baseYamlConfig.debug)
        import_logger.Logger.getInstance().debug("Using Redis message monitor");
      return new import_redis.RedisMessageMonitor(
        this.baseYamlConfig.kafka.messageMonitor,
        this.baseYamlConfig
      );
    }
    if (this.baseYamlConfig.kafka.messageMonitor?.type === "disabled") {
      if (this.baseYamlConfig.debug)
        import_logger.Logger.getInstance().debug("Message monitor disabled");
      return void 0;
    }
    if (this.baseYamlConfig.debug)
      import_logger.Logger.getInstance().debug("No setting, Message monitor disabled");
    return void 0;
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  AbstractKafkaService
});
