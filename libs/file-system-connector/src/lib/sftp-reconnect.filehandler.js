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
  #logger;
  constructor(config) {
    if (config.type === "sftp") {
      throw new Error(
        'SftpReconnectFilehandler requires a SftpConnectConfig with type "sftp-reconnect".'
      );
    }
    super(config);
    this.#logger = import_logger.Logger.getInstance();
    this.#logger.info("SFTP Reconnect File handler setup!");
  }
  async init() {
    await super.init();
    this.#logger.debug("SFTP Reconnect initialized! disconnecting client.");
    await this.sftpClient.end();
    this.#logger.debug("SFTP Reconnect initialized! Client disconnected.");
  }
  async list(dir) {
    this.#logger.debug(
      `SFTP Reconnect listing directory: ${dir}. First connecting to SFTP server.`
    );
    await this.sftpClient.connect(this.config);
    this.#logger.debug("SFTP Reconnect connected to SFTP server.");
    try {
      return await super.list(dir);
    } finally {
      this.#logger.debug("SFTP Reconnect disconnecting from SFTP server.");
      await this.sftpClient.end();
      this.#logger.debug("SFTP Reconnect disconnected from SFTP server.");
    }
  }
  async readFile(filepath) {
    this.#logger.debug(
      `SFTP Reconnect reading file: ${filepath}. First connecting to SFTP server.`
    );
    await this.sftpClient.connect(this.config);
    this.#logger.debug("SFTP Reconnect connected to SFTP server.");
    try {
      return super.readFile(filepath);
    } finally {
      this.#logger.debug("SFTP Reconnect disconnecting from SFTP server.");
      await this.sftpClient.end();
      this.#logger.debug("SFTP Reconnect disconnected from SFTP server.");
    }
  }
  async writeFile(data, remotePath, filename) {
    this.#logger.debug(
      `SFTP Reconnect writing file: ${filename} to path: ${remotePath}. First connecting to SFTP server.`
    );
    await this.sftpClient.connect(this.config);
    this.#logger.debug("SFTP Reconnect connected to SFTP server.");
    try {
      return super.writeFile(data, remotePath, filename);
    } finally {
      this.#logger.debug("SFTP Reconnect disconnecting from SFTP server.");
      await this.sftpClient.end();
      this.#logger.debug("SFTP Reconnect disconnected from SFTP server.");
    }
  }
  async deleteFile(filepath) {
    this.#logger.debug(
      `SFTP Reconnect deleting file: ${filepath}. First connecting to SFTP server.`
    );
    await this.sftpClient.connect(this.config);
    this.#logger.debug("SFTP Reconnect connected to SFTP server.");
    try {
      return super.deleteFile(filepath);
    } finally {
      this.#logger.debug("SFTP Reconnect disconnecting from SFTP server.");
      await this.sftpClient.end();
      this.#logger.debug("SFTP Reconnect disconnected from SFTP server.");
    }
  }
  async fileExists(filepath) {
    this.#logger.debug(
      `SFTP Reconnect checking if file exists: ${filepath}. First connecting to SFTP server.`
    );
    await this.sftpClient.connect(this.config);
    this.#logger.debug("SFTP Reconnect connected to SFTP server.");
    try {
      return super.fileExists(filepath);
    } finally {
      this.#logger.debug("SFTP Reconnect disconnecting from SFTP server.");
      await this.sftpClient.end();
      this.#logger.debug("SFTP Reconnect disconnected from SFTP server.");
    }
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  SftpReconnectFilehandler
});
