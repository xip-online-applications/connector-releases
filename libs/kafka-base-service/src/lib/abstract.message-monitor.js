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
var abstract_message_monitor_exports = {};
__export(abstract_message_monitor_exports, {
  AbstractMessageMonitor: () => AbstractMessageMonitor
});
module.exports = __toCommonJS(abstract_message_monitor_exports);
var import_logger = require("@transai/logger");
var import_factories = require("./factories");
class AbstractMessageMonitor {
  constructor(baseConfig) {
    this.baseConfig = baseConfig;
  }
  processMessage(callbackFunction) {
    return async (message) => {
      if (await this.isProcessed(message)) {
        import_logger.Logger.getInstance().debug(
          `Message ${message.eventId} already processed`
        );
        return (0, import_factories.BadRequest)(`Message ${message.eventId} already processed`)(
          message
        );
      }
      import_logger.Logger.getInstance().debug(`Processing message ${message.eventId}`);
      const result = await callbackFunction(message);
      if (result.success) {
        await this.addProcessedMessage(message);
      } else {
        import_logger.Logger.getInstance().debug(
          `Message ${message.eventId} FAILED to process: ${result.message}. Not storing in processed messages list.`
        );
      }
      return result;
    };
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  AbstractMessageMonitor
});
//# sourceMappingURL=abstract.message-monitor.js.map
