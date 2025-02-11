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
var dummy_data_generator_service_exports = {};
__export(dummy_data_generator_service_exports, {
  DummyDataGeneratorService: () => DummyDataGeneratorService
});
module.exports = __toCommonJS(dummy_data_generator_service_exports);
var import_rxjs = require("rxjs");
var import_kafka_message = require("./kafka-message.factory");
var import_logger = require("@transai/logger");
class DummyDataGeneratorService {
  constructor(kafkaSourceService, config) {
    this.kafkaSourceService = kafkaSourceService;
    this.config = config;
    this.processing = false;
    import_logger.Logger.getInstance().debug(`DummyDataGeneratorService initialized`);
    (0, import_rxjs.interval)((this.config.interval ?? 10) * 1e3).subscribe(() => this.generate());
  }
  static {
    this.EVENT = "event.source-sink.kafka";
  }
  static {
    this.METRIC = "event.metric.dummy-data-generator";
  }
  async generate() {
    if (this.processing) {
      import_logger.Logger.getInstance().debug("Api source service is already processing");
      return;
    }
    if (this.config.debug) {
      import_logger.Logger.getInstance().debug("Generating dummy data");
    }
    this.processing = true;
    try {
      const [messages, topic] = (0, import_kafka_message.buildKafkaMessage)(
        {
          message: "Hello World",
          identifier: "some-constant-identifier",
          timestamp: (/* @__PURE__ */ new Date()).toISOString()
        },
        {
          source: "dummy-data-generator",
          collection: "pdc_fm_prodmeld",
          keyField: "identifier"
        },
        this.config,
        DummyDataGeneratorService.EVENT,
        10
      );
      if (this.config.debug) {
        import_logger.Logger.getInstance().debug("Sending messages", messages.length, topic);
      }
      await this.kafkaSourceService.send(messages, topic);
    } catch (error) {
      import_logger.Logger.getInstance().debug(error);
    } finally {
      this.processing = false;
    }
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  DummyDataGeneratorService
});
