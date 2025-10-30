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
var file_system_connector_exports = {};
__export(file_system_connector_exports, {
  FileSystemConnector: () => FileSystemConnector
});
module.exports = __toCommonJS(file_system_connector_exports);
var import_disk = require("./handler/disk.filehandler");
var import_dummy = require("./handler/dummy.filehandler");
var import_samba = require("./handler/samba.filehandler");
var import_sftp_reconnect = require("./handler/sftp-reconnect.filehandler");
var import_sftp = require("./handler/sftp.filehandler");
class FileSystemConnector {
  #handlers = {
    dummy: import_dummy.DummyFilehandler,
    disk: import_disk.DiskFileHandler,
    samba: import_samba.SambaFilehandler,
    sftp: import_sftp.SftpFilehandler,
    "sftp-reconnect": import_sftp_reconnect.SftpReconnectFilehandler
  };
  fromDsn(dsn) {
    for (const handler of Object.values(this.#handlers)) {
      const parsedHandler = handler["fromDsn"](dsn);
      if (parsedHandler) {
        return parsedHandler;
      }
    }
    throw new Error("No matching file system handler found for given DSN.");
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  FileSystemConnector
});
//# sourceMappingURL=file-system-connector.js.map
