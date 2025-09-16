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
var validators_exports = {};
__export(validators_exports, {
  expirationValidatorInLine: () => expirationValidatorInLine
});
module.exports = __toCommonJS(validators_exports);
var import_kafka_base_service = require("@xip-online-data/kafka-base-service");
var import_logger = require("@transai/logger");
const isValid = (message) => {
  const now = /* @__PURE__ */ new Date();
  const upperBound = new Date(message.ttl);
  return now < upperBound;
};
const expirationValidatorInLine = (validateForAction, callbackFunction) => {
  return async (message) => {
    if (!validateForAction && message.type === "ACTION") {
      return callbackFunction(message);
    }
    if (isValid(message)) {
      return callbackFunction(message);
    }
    import_logger.Logger.getInstance().warn(
      `Action/Job Duration has expired ${message.eventId}`
    );
    return (0, import_kafka_base_service.BadRequest)("Job Duration has expired")(message);
  };
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  expirationValidatorInLine
});
