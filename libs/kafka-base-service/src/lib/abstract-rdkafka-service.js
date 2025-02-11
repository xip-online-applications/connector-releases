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
var abstract_rdkafka_service_exports = {};
__export(abstract_rdkafka_service_exports, {
  AbstractRdKafkaService: () => AbstractRdKafkaService
});
module.exports = __toCommonJS(abstract_rdkafka_service_exports);
var import_types = require("@xip-online-data/types");
var import_uuid = require("uuid");
var import_kafka_javascript = require("@confluentinc/kafka-javascript");
var import_rxjs = require("rxjs");
var import_kafkajs_msk_iam_authentication_mechanism = require("@jm18457/kafkajs-msk-iam-authentication-mechanism");
var import_node = require("@sentry/node");
var import_logger = require("@transai/logger");
var import_in_memory = require("./in-memory.message-monitor");
var import_redis = require("./redis.message-monitor");
class AbstractRdKafkaService {
  constructor(baseYamlConfig, connectorTopic) {
    this.baseYamlConfig = baseYamlConfig;
    this.connectorTopic = connectorTopic;
    this.errorTypes = ["unhandledRejection", "uncaughtException"];
    this.signalTraps = ["SIGTERM", "SIGINT", "SIGUSR2"];
    this.processedTopic = "_LOGS_xod";
    this.DEFAULT_INTERVAL_CHECK_FOR_NEW_TOPICS = 300;
    this.numberOfSubscribedRegexTopics = 0;
    this.messageMonitor = void 0;
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
      const applicableTopics = await this.getRegexTopics();
      const numberOfApplicableTopics = applicableTopics.length;
      return numberOfApplicableTopics !== this.numberOfSubscribedRegexTopics;
    };
    this.getRegularTopics = () => {
      const topics = [];
      for (const topic of this.baseYamlConfig.kafka.consumerTopics ?? []) {
        if (!(0, import_types.isTopicRegex)(topic)) {
          topics.push(topic);
        }
      }
      return topics;
    };
    this.getRegexTopics = async () => {
      const regexTopics = [];
      for (const topic of this.baseYamlConfig.kafka.consumerTopics ?? []) {
        if ((0, import_types.isTopicRegex)(topic)) {
          regexTopics.push(topic);
        }
      }
      if (regexTopics.length === 0) {
        return [];
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
      );
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
      logLevel: 2,
      clientId: `${baseYamlConfig.kafka.clientId}-${(0, import_uuid.v4)()}`,
      brokers: baseYamlConfig.kafka.brokers,
      ...this.getAuthProviderOptions(baseYamlConfig.kafka.sasl)
    };
    const kafkaJS = {
      brokers: config.brokers,
      ssl: false
    };
    if (config.sasl) {
      kafkaJS.sasl = config.sasl;
      kafkaJS.ssl = true;
    }
    this.messageMonitor = this.getCorrespondingMonitor();
    this.disableLogs = baseYamlConfig.kafka.disableLogs ?? false;
    this.kafkaBase = new import_kafka_javascript.KafkaJS.Kafka({ kafkaJS });
    const consumerConfig = {
      kafkaJS: {
        groupId: baseYamlConfig.kafka.groupId,
        autoCommitInterval: baseYamlConfig.kafka.autoCommitInterval ?? 5e3,
        fromBeginning: true
      }
    };
    if (baseYamlConfig.kafka.newConsumerProtocol) {
      import_logger.Logger.getInstance().debug("Using new consumer protocol");
      consumerConfig["group.protocol"] = "consumer";
      consumerConfig["group.protocol.type"] = "consumer";
      consumerConfig["group.remote.assignor"] = "uniform";
    }
    this.consumer = this.kafkaBase.consumer(consumerConfig);
    this.producer = this.kafkaBase.producer();
    if (this.baseYamlConfig.kafka.consumerTopics === void 0 || this.baseYamlConfig.kafka.consumerTopics.length === 0) {
      import_logger.Logger.getInstance().debug(
        "No consumer topics set. skip setting of consumer events callback"
      );
      return;
    }
    this.getRegexTopics().then((topics) => {
      this.numberOfSubscribedRegexTopics = topics.length;
    });
    const intervalCheckForNewTopics = this.baseYamlConfig.kafka.intervalCheckForNewTopics ?? this.DEFAULT_INTERVAL_CHECK_FOR_NEW_TOPICS;
    if (intervalCheckForNewTopics > 0) {
      (0, import_rxjs.interval)(intervalCheckForNewTopics * 1e3).subscribe(() => {
        this.checkForNewTopics().then(this.restartIfNewTopics.bind(this));
      });
    }
    if (process) {
      import_logger.Logger.getInstance().debug("Setting up gracefull shutdown for kafka...");
      this.errorTypes.map((type) => {
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
      this.signalTraps.map((type) => {
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
  AbstractRdKafkaService
});
