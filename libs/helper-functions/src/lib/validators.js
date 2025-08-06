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
  expirationValidator: () => expirationValidator
});
module.exports = __toCommonJS(validators_exports);
var import_kafka_base_service = require("@xip-online-data/kafka-base-service");
function expirationValidator(callbackFunction) {
  return async (message) => {
    if (!isExpired(message)) {
      return (0, import_kafka_base_service.BadRequest)("Action Duration has expired")(message);
    }
    return callbackFunction(message);
  };
}
function isExpired(message) {
  const now = /* @__PURE__ */ new Date();
  const actionDuration = new Date(message.ttl);
  return now < actionDuration;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  expirationValidator
});
