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
var types_exports = {};
__export(types_exports, {
  isSambaConfig: () => isSambaConfig
});
module.exports = __toCommonJS(types_exports);
function isSambaConfig(obj) {
  return typeof obj.address === "string" && typeof obj.username === "string" && typeof obj.tmpDirectory === "string" && (typeof obj.password === "string" || obj.password === void 0) && (typeof obj.domain === "string" || obj.domain === void 0) && (typeof obj.directory === "string" || obj.directory === void 0) && (typeof obj.maxProtocol === "string" || obj.maxProtocol === void 0) && (typeof obj.port === "string" || obj.port === void 0) && (typeof obj.timeout === "string" || obj.timeout === void 0) && (typeof obj.maskCmd === "boolean" || obj.maskCmd === void 0);
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  isSambaConfig
});
//# sourceMappingURL=types.js.map
