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
var response_types_exports = {};
__export(response_types_exports, {
  isXodResponseType: () => isXodResponseType
});
module.exports = __toCommonJS(response_types_exports);
function isXodResponseType(obj) {
  return obj !== void 0 && obj !== null && obj.type !== void 0 && typeof obj.type === "string" && (obj.type === "ACTION" || obj.type === "EVENT" || obj.type === "JOB") && obj.message !== void 0 && obj.result !== void 0 && typeof obj.result === "object";
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  isXodResponseType
});
//# sourceMappingURL=response.types.js.map
