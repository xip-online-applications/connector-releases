var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
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
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var connector_runtime_exports = {};
__export(connector_runtime_exports, {
  ConnectorRuntime: () => ConnectorRuntime
});
module.exports = __toCommonJS(connector_runtime_exports);
var process = __toESM(require("node:process"));
var import_logger = require("@transai/logger");
var import_handle_error = require("@xip-online-data/handle-error");
var import_helper_functions = require("@xip-online-data/helper-functions");
var import_kafka_base_service = require("@xip-online-data/kafka-base-service");
var import_parse_yaml = require("@xip-online-data/parse-yaml");
var import_handlebars = __toESM(require("handlebars"));
var import_handlebars_helpers = __toESM(require("handlebars-helpers"));
var import_moment_timezone = __toESM(require("moment-timezone"));
var import_rxjs = require("rxjs");
var import_cloud_offset_store = require("./offset-store/cloud-offset-store.service");
class ConnectorRuntime {
  constructor(connector, apiConfig, actionConfigs) {
    this.connector = connector;
    this.apiConfig = apiConfig;
    this.actionConfigs = actionConfigs;
    this.IPC_CHANNEL = "connector-runtime";
    this.offsetStoreInstance = void 0;
    this.callbackFunction = void 0;
    this.isValidConfig = () => true;
    this.init = () => Promise.resolve();
    this.exit = () => Promise.resolve();
    this.connectorConfig = void 0;
    this.messageSubject = new import_rxjs.Subject();
    this.CONNECTOR_IDENTIFIER = connector.identifier;
    this.log = import_logger.Logger.getInstance(
      connector.identifier,
      apiConfig.debug ? import_logger.LogLevels.debug : import_logger.LogLevels.info
    );
    const tmpdir = process.env["TRANSAI_TMP_DIR"];
    if (tmpdir) {
      this.log.debug(
        `Connector ID: ${connector.identifier} - ${tmpdir}, using offset store API`
      );
      const offsetStore = new import_cloud_offset_store.CloudOffsetStoreService(
        tmpdir,
        apiConfig,
        this.CONNECTOR_IDENTIFIER
      );
      offsetStore.init().then(() => {
        this.log.debug("Offset store initialized. write start time");
        offsetStore.writeFile(this.CONNECTOR_IDENTIFIER, {
          start: (/* @__PURE__ */ new Date()).toISOString()
        }).then(() => {
          this.log.debug("Start time written");
        }).catch((err) => {
          this.log.error("Error writing start time");
          throw err;
        });
      }).catch((err) => {
        this.log.error("Error init offset store");
        throw err;
      });
      this.offsetStoreInstance = offsetStore;
    }
    if (process.on) {
      process.on("message", (message) => {
        if (message.cmd === this.IPC_CHANNEL) {
          this.messageSubject.next(message.message);
        }
      });
    } else {
      this.log.warn("IPC channel is not available. process.on is undefined.");
    }
    if (!process.send) {
      this.log.warn("IPC channel is not available. process.send is undefined.");
    }
    this.messageSubject.subscribe((message) => {
      this.log.verbose(
        `${process.pid} Received message from parent process:`,
        message
      );
    });
    (0, import_handlebars_helpers.default)();
    import_handlebars.default.registerHelper("getFirst", function(inputString, delimiter) {
      if (typeof inputString !== "string" || typeof delimiter !== "string") {
        return inputString;
      }
      if (inputString.includes(delimiter)) {
        return inputString.split(delimiter)[0];
      }
      return inputString;
    });
    import_handlebars.default.registerHelper(
      "formatDateInTimezone",
      (datetimeString, timezone, format) => {
        if (typeof format === "object") {
          format = void 0;
        }
        if (datetimeString === "now") {
          return (0, import_moment_timezone.default)().tz(timezone).format(format);
        }
        return (0, import_moment_timezone.default)(datetimeString).tz(timezone).format(format);
      }
    );
    import_handlebars.default.registerHelper(
      "datetimeToDecimalHours",
      function(datetimeString) {
        const datetime = import_moment_timezone.default.parseZone(datetimeString);
        const hours = datetime.hours();
        const minutes = datetime.minutes();
        const seconds = datetime.seconds();
        const decimalHours = hours + minutes / 60 + seconds / 3600;
        return decimalHours.toFixed(2);
      }
    );
    import_handlebars.default.registerHelper("isFalse", function(value) {
      return value === false || value === "false";
    });
    import_handlebars.default.registerHelper("isTrue", function(value) {
      return value === true || value === "true";
    });
    import_handlebars.default.registerHelper(
      "jsonEscape",
      (v) => JSON.stringify(v).slice(1, -1)
    );
    for (const action of this.actionConfigs) {
      if (action.config["templates"] !== void 0) {
        const templates = action.config["templates"];
        const containers = {};
        const templateKeys = Object.keys(templates);
        templateKeys.forEach((key) => {
          try {
            const template = templates[key];
            const handlebars = import_handlebars.default.compile(template);
            containers[key] = handlebars;
          } catch (error) {
            this.log.error(
              `Error compiling template ${key} for action ${action.identifier}`
            );
            if (error instanceof import_handlebars.Exception) {
              this.log.error(error.message);
            }
          }
        });
        action.config["parsedTemplates"] = containers;
      }
    }
  }
  get offsetStore() {
    if (this.offsetStoreInstance === void 0) {
      throw new Error("Offset service not initialized");
    }
    return this.offsetStoreInstance;
  }
  get kafkaService() {
    if (this.kafkaServiceInstance === void 0) {
      throw new Error("Kafka service not initialized");
    }
    return this.kafkaServiceInstance;
  }
  getCallbackFunction() {
    if (this.callbackFunction === void 0) {
      throw new Error(`Callback function not defined`);
    }
    return this.callbackFunction;
  }
  get config() {
    if (this.connectorConfig === void 0) {
      throw new Error("No connector config provided");
    }
    return this.connectorConfig;
  }
  get messageObservable() {
    return this.messageSubject.asObservable().pipe(
      // Group all messages in a timespan of 100
      (0, import_rxjs.bufferTime)(100),
      // Filterout the empty arrays
      (0, import_rxjs.filter)((values) => values.length > 0),
      // Only send the unique values in the array
      (0, import_rxjs.map)((values) => Array.from(new Set(values)))
    );
  }
  getActionConfig(message) {
    if (message.actionVersion === void 0) {
      throw new Error("Action version is not defined");
    }
    if (message.actionVersion === "latest") {
      return this.getLatestActionConfig(message);
    }
    return this.getSpecificActionConfig(message);
  }
  getLatestActionConfig(message) {
    const actions = this.actionConfigs.filter(
      (action) => action.identifier === message.actionIdentifier
    );
    if (actions.length === 0) {
      this.log.debug(
        `No action found for ${message.actionIdentifier}`,
        actions
      );
      throw new Error(
        `Action ${message.eventType} has ${actions.length} configurations. Expected 1`
      );
    }
    return actions.sort((a, b) => {
      return a.createdAt > b.createdAt ? -1 : 1;
    })[0];
  }
  getSpecificActionConfig(message) {
    const actions = this.actionConfigs.filter((action) => {
      return action.identifier === message.actionIdentifier && action.version === message.actionVersion;
    });
    if (actions.length !== 1) {
      this.log.debug(
        `No action found for ${message.actionIdentifier}`,
        actions
      );
      throw new Error(
        `Action ${message.eventType} has ${actions.length} configurations. Expected 1`
      );
    }
    return actions[0];
  }
  async start() {
    this.connectorConfig = await this.getConfig();
    this.kafkaServiceInstance = this.connectorConfig.kafka.useConfluentLibrary ? new import_kafka_base_service.RdKafkaSourceService(
      this.config,
      (0, import_helper_functions.buildConnectorTopic)(this.connector)
    ) : new import_kafka_base_service.KafkaSourceService(
      this.config,
      (0, import_helper_functions.buildConnectorTopic)(this.connector)
    );
    await this.init();
    if (this.callbackFunction !== void 0) {
      this.kafkaServiceInstance.setCallbackFunction(
        (0, import_helper_functions.expirationValidatorInLine)(
          this.config.action?.timeSensitive === true,
          this.callbackFunction
        )
      );
    }
    await this.kafkaServiceInstance.init();
  }
  async stop() {
    await this.offsetStoreInstance?.deInit();
    const processesToExit = [this.exit()];
    if (this.kafkaServiceInstance !== void 0) {
      processesToExit.push(this.kafkaServiceInstance.exitProcess("stop"));
    }
    await Promise.all(processesToExit);
  }
  async getConfig() {
    let config;
    const configSource = process.env["TRANSAI_CONFIG_SOURCE"] || process.env["XOD_CONFIG_SOURCE"];
    if (configSource === "json") {
      config = JSON.parse(process.env[this.CONNECTOR_INSTANCE]);
      if (!this.checkConfig(config)) {
        await (0, import_handle_error.waitTillRestart)("Config file is not valid");
      }
      return config;
    }
    if (configSource === "api") {
      config = this.apiConfig;
    } else {
      config = (0, import_parse_yaml.parseYaml)(process.argv);
    }
    if (!this.checkConfig(config)) {
      (0, import_handle_error.handleError)("Config file is not valid, Not starting. Have to restart");
    }
    return config;
  }
  checkConfig(config) {
    return true;
  }
  emitEventType(callbackFunction) {
    return (message) => {
      this.emit(message.eventType);
      return callbackFunction(message);
    };
  }
  emit(message) {
    const processMessage = {
      cmd: this.IPC_CHANNEL,
      message
    };
    if (process.send) {
      process.send(processMessage);
    }
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ConnectorRuntime
});
