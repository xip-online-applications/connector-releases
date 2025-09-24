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
var kafkajs_logger_exports = {};
__export(kafkajs_logger_exports, {
  TransAILogCreator: () => TransAILogCreator
});
module.exports = __toCommonJS(kafkajs_logger_exports);
var import_kafkajs = require("kafkajs");
var import_logger = require("@transai/logger");
const TransAILogCreator = () => {
  return ({ level, log }) => {
    const logger = import_logger.Logger.getInstance();
    const { message, error } = log;
    const parsedMessage = error ? `${message} - ${error}` : message;
    switch (level) {
      case import_kafkajs.logLevel.ERROR:
      case import_kafkajs.logLevel.NOTHING:
        logger.error(parsedMessage);
        break;
      case import_kafkajs.logLevel.WARN:
        logger.warn(parsedMessage);
        break;
      case import_kafkajs.logLevel.INFO:
        logger.info(parsedMessage);
        break;
      case import_kafkajs.logLevel.DEBUG:
        logger.debug(parsedMessage);
        break;
      default:
        logger.info(parsedMessage);
        break;
    }
  };
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  TransAILogCreator
});
//# sourceMappingURL=kafkajs-logger.js.map
