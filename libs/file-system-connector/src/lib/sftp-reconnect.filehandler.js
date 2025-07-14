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
var sftp_reconnect_filehandler_exports = {};
__export(sftp_reconnect_filehandler_exports, {
  SftpReconnectFilehandler: () => SftpReconnectFilehandler
});
module.exports = __toCommonJS(sftp_reconnect_filehandler_exports);
var import_logger = require("@transai/logger");
var import_sftp = require("./sftp.filehandler");
class SftpReconnectFilehandler extends import_sftp.SftpFilehandler {
  constructor(config) {
    if (config.type === "sftp") {
      throw new Error(
        'SftpReconnectFilehandler requires a SftpConnectConfig with type "sftp-reconnect".'
      );
    }
    super(config);
    import_logger.Logger.getInstance().info("SFTP Reconnect File handler setup!");
  }
  async init() {
    await super.init();
    await this.sftpClient.end();
  }
  async list(dir) {
    await this.sftpClient.connect(this.config);
    try {
      return await super.list(dir);
    } finally {
      await this.sftpClient.end();
    }
  }
  async readFile(filepath) {
    await this.sftpClient.connect(this.config);
    try {
      return super.readFile(filepath);
    } finally {
      await this.sftpClient.end();
    }
  }
  async writeFile(data, remotePath, filename) {
    await this.sftpClient.connect(this.config);
    try {
      return super.writeFile(data, remotePath, filename);
    } finally {
      await this.sftpClient.end();
    }
  }
  async deleteFile(filepath) {
    await this.sftpClient.connect(this.config);
    try {
      return super.deleteFile(filepath);
    } finally {
      await this.sftpClient.end();
    }
  }
  async fileExists(filepath) {
    await this.sftpClient.connect(this.config);
    try {
      return super.fileExists(filepath);
    } finally {
      await this.sftpClient.end();
    }
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  SftpReconnectFilehandler
});
