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
var connect_sftp_client_exports = {};
__export(connect_sftp_client_exports, {
  ConnectSftpClient: () => ConnectSftpClient
});
module.exports = __toCommonJS(connect_sftp_client_exports);
var import_sftp_client = require("./sftp-client");
class ConnectSftpClient extends import_sftp_client.SftpClient {
  async init() {
    await super.init();
    await this.sftpClient.end();
    console.log("SFTP client initialized");
  }
  async writeFile(destination, content) {
    await this.sftpClient.connect(this.config);
    const res = await super.writeFile(destination, content);
    await this.sftpClient.end();
    return res;
  }
  async readFile(destination) {
    await this.sftpClient.connect(this.config);
    const res = await super.readFile(destination);
    await this.sftpClient.end();
    return res;
  }
  async moveFile(path, file, destination) {
    await this.sftpClient.connect(this.config);
    await super.moveFile(path, file, destination);
    await this.sftpClient.end();
  }
  async deleteFile(path) {
    await this.sftpClient.connect(this.config);
    await super.deleteFile(path);
    await this.sftpClient.end();
  }
  async list(destination) {
    await this.sftpClient.connect(this.config);
    const res = await this.sftpClient.list(destination);
    await this.sftpClient.end();
    return res;
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ConnectSftpClient
});
