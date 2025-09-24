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
var api_result_handler_exports = {};
__export(api_result_handler_exports, {
  ApiResultHandler: () => ApiResultHandler
});
module.exports = __toCommonJS(api_result_handler_exports);
var import_html_entities = require("html-entities");
var import_logger = require("@transai/logger");
class ApiResultHandler {
  #config;
  #kafkaService;
  #offsetStore;
  constructor(config, kafkaService, offsetStore) {
    this.#config = config;
    this.#kafkaService = kafkaService;
    this.#offsetStore = offsetStore;
  }
  async handleResult(result, apiConfig) {
    const parsedContent = JSON.parse((0, import_html_entities.decode)(result.data));
    const keys = Object.keys(parsedContent);
    if (keys.length === 0) {
      return;
    }
    await this.handlePayload(result, keys[0], apiConfig);
  }
  async handlePayload(result, key, apiConfig) {
    const parsedContent = JSON.parse((0, import_html_entities.decode)(result.data))[key];
    if (parsedContent.origin === "Tooldata") {
      await this.handleTooldata(parsedContent, apiConfig);
    } else {
      await this.handleOthers(parsedContent, apiConfig);
    }
  }
  async handleTooldata(parsedContent, apiConfig) {
    const values = parsedContent.data?.values;
    if (!values) {
      import_logger.Logger.getInstance().debug("No values found in Tooldata message.");
      return;
    }
    const toolData = Object.entries(values).map(
      ([key, value]) => {
        if (value["T Number"] !== 0) {
          const metadata = {
            machine: apiConfig.name,
            location: parsedContent.location,
            origin: parsedContent.origin,
            potKey: key
          };
          return {
            value,
            metadata
          };
        }
        return void 0;
      }
    );
    const success = await this.#kafkaService.sendTooldataToKafka(
      toolData.filter((t) => t !== void 0),
      this.#config,
      apiConfig
    );
    if (!success) {
      import_logger.Logger.getInstance().debug(
        "Error while sending tool record to Kafka: ",
        values
      );
    }
  }
  async handleOthers(parsedContent, apiConfig) {
    const metadata = {
      machine: apiConfig.name,
      location: parsedContent.location,
      origin: parsedContent.origin
    };
    const success = await this.#kafkaService.sendMetric(
      [parsedContent.data],
      this.#config,
      apiConfig,
      metadata
    );
    if (!success) {
      import_logger.Logger.getInstance().debug(
        "Error while sending other record to Kafka: ",
        parsedContent.data
      );
    }
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ApiResultHandler
});
//# sourceMappingURL=api-result.handler.js.map
