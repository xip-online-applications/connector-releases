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
var in_memory_message_monitor_exports = {};
__export(in_memory_message_monitor_exports, {
  InMemoryMessageMonitor: () => InMemoryMessageMonitor
});
module.exports = __toCommonJS(in_memory_message_monitor_exports);
var import_abstract = require("./abstract.message-monitor");
class InMemoryMessageMonitor extends import_abstract.AbstractMessageMonitor {
  constructor(config, baseConfig) {
    super(baseConfig);
    this.config = config;
    this.processedMessages = [];
  }
  async isProcessed(message) {
    return this.processedMessages.includes(message.eventId);
  }
  async addProcessedMessage(message) {
    this.processedMessages.push(message.eventId);
    if (this.processedMessages.length > this.config.messagesToKeep) {
      this.processedMessages.shift();
    }
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  InMemoryMessageMonitor
});
