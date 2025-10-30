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
  isSambaSourceConfig: () => isSambaSourceConfig,
  isSambaSourceConnectorConfigType: () => isSambaSourceConnectorConfigType
});
module.exports = __toCommonJS(types_exports);
var import_types = require("@xip-online-data/types");
var import_samba_client = require("@xip-online-data/samba-client");
function isSambaSourceConfig(obj) {
  return typeof obj.directory === "string" && (obj.action === import_types.FileActionType.ACTION_DELETE || obj.action === import_types.FileActionType.ACTION_MOVE || obj.action === import_types.FileActionType.ACTION_NOTHING) && typeof obj.sambaIdentifier === "string" && typeof obj.interval === "number" && (obj.optionalHeaders === void 0 || Array.isArray(obj.optionalHeaders)) && (obj.indexes === void 0 || Array.isArray(obj.indexes)) && (obj.processedDirectory === void 0 || typeof obj.processedDirectory === "string");
}
function isSambaSourceConnectorConfigType(obj) {
  return obj !== void 0 && obj !== null && (0, import_types.isActionConfigType)(obj.action) && (0, import_samba_client.isSambaConfig)(obj.samba) && Array.isArray(obj.directories) && obj.directories.every(isSambaSourceConfig);
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  isSambaSourceConfig,
  isSambaSourceConnectorConfigType
});
//# sourceMappingURL=types.js.map
