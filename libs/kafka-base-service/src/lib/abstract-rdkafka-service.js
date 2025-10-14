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
var import_node = require("@sentry/node");
var import_logger = require("@transai/logger");
var import_aws_msk_iam_sasl_signer_js = require("aws-msk-iam-sasl-signer-js");
var import_in_memory = require("./in-memory.message-monitor");
var import_redis = require("./redis.message-monitor");
const getAwsCredentials = (awsSasl) => () => {
  return Promise.resolve({
    accessKeyId: awsSasl.accessKeyId,
    secretAccessKey: awsSasl.secretAccessKey
  });
};
const oauthBearerTokenProvider = (awsSasl) => async () => {
  const principal = process.env["AWS_ROLE_SESSION_NAME"] ?? "";
  if (awsSasl?.accessKeyId && awsSasl?.secretAccessKey) {
    import_logger.Logger.getInstance().info(
      `Generating OAuth Bearer token using ENV variables and principal: ${principal}`
    );
    const authTokenResponse2 = await (0, import_aws_msk_iam_sasl_signer_js.generateAuthTokenFromCredentialsProvider)({
      region: awsSasl.region ?? "eu-west-1",
      awsCredentialsProvider: getAwsCredentials({
        accessKeyId: awsSasl.accessKeyId,
        secretAccessKey: awsSasl.secretAccessKey
      })
    });
    import_logger.Logger.getInstance().info(
      `Token using Default Credentials Provider ${authTokenResponse2.expiryTime} - ${authTokenResponse2.expiryTime - Date.now()}ms`
    );
    return {
      principal,
      value: authTokenResponse2.token,
      lifetime: authTokenResponse2.expiryTime
    };
  }
  import_logger.Logger.getInstance().info(
    `Generating OAuth Bearer token using Default Credentials Provider and principal: ${principal}`
  );
  const authTokenResponse = await (0, import_aws_msk_iam_sasl_signer_js.generateAuthToken)({
    region: awsSasl?.region ?? "eu-west-1",
    awsRoleSessionName: principal,
    logger: import_logger.Logger.getInstance(),
    awsDebugCreds: true
  });
  import_logger.Logger.getInstance().info(
    `Token using Default Credentials Provider ${authTokenResponse.expiryTime} - ${authTokenResponse.expiryTime - Date.now()}ms`
  );
  return {
    principal,
    value: authTokenResponse.token,
    lifetime: authTokenResponse.expiryTime
  };
};
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
      this.logger.warn(
        `Got ${type}. Graceful shutdown Kafka start ${(/* @__PURE__ */ new Date()).toISOString()}`
      );
      this.logger.info("Disconnecting consumer and producer");
      try {
        await this.consumer?.disconnect();
        this.logger.info("Consumer disconnected");
      } catch (error) {
        this.logger.error("Error while disconnecting consumer");
        console.error(error);
      }
      try {
        await this.producer?.disconnect();
        this.logger.info("Producer disconnected");
      } catch (error) {
        this.logger.error("Error while disconnecting producer");
        console.error(error);
      }
      this.logger.info(
        `Graceful shutdown Kafka complete ${(/* @__PURE__ */ new Date()).toISOString()}`
      );
      process.exit(0);
    };
    this.checkForNewTopics = async () => {
      const applicableTopics = await this.getRegexTopics();
      const numberOfApplicableTopics = applicableTopics.length;
      return numberOfApplicableTopics !== this.numberOfSubscribedRegexTopics;
    };
    this.getRegularTopics = () => {
      return (this.baseYamlConfig.kafka.consumerTopics ?? []).filter(
        (t) => !(0, import_types.isTopicRegex)(t)
      );
    };
    this.getRegexTopics = async () => {
      const regexTopics = (this.baseYamlConfig.kafka.consumerTopics ?? []).filter(
        (t) => (0, import_types.isTopicRegex)(t)
      );
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
          this.logger.info("New topics found, restarting consumer");
          await this.consumer.disconnect();
          await this.init();
        } catch (error) {
          (0, import_node.captureException)(error);
          process.exit(1);
        }
      }
    };
    this.logger = import_logger.Logger.getInstance();
    this.logger.info("RUNNING RDKAFKA SERVICE");
    const { kafka: kafkaConfig } = baseYamlConfig;
    const kafkaJS = {
      brokers: kafkaConfig.brokers,
      ssl: false,
      clientId: `${kafkaConfig.clientId}-${(0, import_uuid.v4)()}`,
      logLevel: 2
    };
    if (kafkaConfig.sasl) {
      const { sasl } = kafkaConfig;
      kafkaJS.sasl = {
        mechanism: "oauthbearer",
        oauthBearerProvider: oauthBearerTokenProvider(sasl)
      };
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
      this.logger.info("Using new consumer protocol");
      consumerConfig["group.protocol"] = "consumer";
      consumerConfig["group.protocol.type"] = "consumer";
      consumerConfig["group.remote.assignor"] = "uniform";
    }
    this.consumer = this.kafkaBase.consumer(consumerConfig);
    this.producer = this.kafkaBase.producer();
    if (!connectorTopic && (this.baseYamlConfig.kafka.consumerTopics === void 0 || this.baseYamlConfig.kafka.consumerTopics.length === 0)) {
      this.logger.warn(
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
      this.logger.info("Setting up gracefull shutdown for kafka...");
      this.errorTypes.forEach((type) => {
        process.on(type, async (e) => {
          try {
            this.logger.error(`process.on ${type}`);
            this.logger.error(e);
            await this.exitProcess(type);
          } catch (_) {
            process.exit(1);
          }
        });
      });
      this.signalTraps.forEach((type) => {
        process.on(type, async () => {
          this.logger.error(`process.once ${type}`);
          try {
            await this.exitProcess(type);
          } finally {
            process.exit(0);
          }
        });
      });
    } else {
      this.logger.warn("No process found. Gracefull shutdown not possible");
    }
  }
  static {
    this.DEFAULT_CALLBACK_EVENT_TYPE = "*";
  }
  getCorrespondingMonitor() {
    if (this.baseYamlConfig.kafka.messageMonitor?.type === "in-memory") {
      if (this.baseYamlConfig.debug)
        this.logger.debug("Using in-memory message monitor");
      return new import_in_memory.InMemoryMessageMonitor(
        this.baseYamlConfig.kafka.messageMonitor,
        this.baseYamlConfig
      );
    }
    if (this.baseYamlConfig.kafka.messageMonitor?.type === "redis") {
      if (this.baseYamlConfig.debug)
        this.logger.debug("Using Redis message monitor");
      return new import_redis.RedisMessageMonitor(
        this.baseYamlConfig.kafka.messageMonitor,
        this.baseYamlConfig
      );
    }
    if (this.baseYamlConfig.kafka.messageMonitor?.type === "disabled") {
      if (this.baseYamlConfig.debug)
        this.logger.debug("Message monitor disabled");
      return void 0;
    }
    if (this.baseYamlConfig.debug)
      this.logger.debug("No setting, Message monitor disabled");
    return void 0;
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  AbstractRdKafkaService
});
