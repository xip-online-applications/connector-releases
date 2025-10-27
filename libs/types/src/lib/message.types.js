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
var message_types_exports = {};
__export(message_types_exports, {
  isXodActionType: () => isXodActionType,
  isXodBaseMessageType: () => isXodBaseMessageType,
  isXodEventType: () => isXodEventType
});
module.exports = __toCommonJS(message_types_exports);
function isXodBaseMessageType(obj) {
  return obj !== void 0 && obj !== null && obj.eventId !== void 0 && typeof obj.eventId === "string" && obj.eventType !== void 0 && typeof obj.eventType === "string" && obj.type !== void 0 && typeof obj.type === "string" && (obj.type === "ACTION" || obj.type === "EVENT" || obj.type === "SOURCE" || obj.type === "JOB") && obj.payload !== void 0 && obj.created !== void 0 && typeof obj.created === "number" && obj.ttl !== void 0 && typeof obj.ttl === "number";
}
function isXodEventType(obj) {
  return isXodBaseMessageType(obj) && obj.payload.data !== void 0 && typeof obj.payload.data === "object";
}
function isXodActionType(obj) {
  return isXodBaseMessageType(obj) && obj.payload.content !== void 0 && typeof obj.payload.content === "string";
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  isXodActionType,
  isXodBaseMessageType,
  isXodEventType
});
//# sourceMappingURL=message.types.js.map
