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
var log_level_exports = {};
__export(log_level_exports, {
  getLogLevel: () => getLogLevel
});
module.exports = __toCommonJS(log_level_exports);
var import_logger = require("@transai/logger");
const getLogLevel = (node) => {
  let logLevel = node.process.env.LOG_LEVEL || import_logger.LogLevels.info;
  const validLogLevels = Object.values(import_logger.LogLevels);
  const faultyLogLevel = !validLogLevels.includes(logLevel);
  if (faultyLogLevel) {
    logLevel = import_logger.LogLevels.info;
  }
  if (faultyLogLevel) {
    console.error(
      `Invalid log level: ${logLevel}; only allowed values are 'error', 'warn', 'info', 'debug', 'trace'. Using 'info' as the default.`
    );
  }
  return logLevel;
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  getLogLevel
});
