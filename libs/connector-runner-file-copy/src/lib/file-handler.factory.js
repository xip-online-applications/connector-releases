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
var file_handler_factory_exports = {};
__export(file_handler_factory_exports, {
  fileHandlerFactory: () => fileHandlerFactory
});
module.exports = __toCommonJS(file_handler_factory_exports);
var import_file_system_connector = require("@xip-online-data/file-system-connector");
const fileHandlerFactory = (config) => {
  switch (config.type) {
    case "samba":
      return new import_file_system_connector.SambaFilehandler(config);
    case "sftp":
      return new import_file_system_connector.SftpFilehandler(config);
    case "dummy":
      return new import_file_system_connector.DummyFilehandler(config);
    default:
      throw new Error("Invalid file handler type");
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  fileHandlerFactory
});
