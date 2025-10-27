var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
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
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var samba_filehandler_exports = {};
__export(samba_filehandler_exports, {
  SambaFile: () => SambaFile,
  SambaFilehandler: () => SambaFilehandler
});
module.exports = __toCommonJS(samba_filehandler_exports);
var fs = __toESM(require("node:fs"));
var import_samba_client = require("@xip-online-data/samba-client");
var import_uuid = require("uuid");
var import_types = require("./types");
const mapFileInfo = (fileInfo) => {
  return {
    name: fileInfo.name,
    size: fileInfo.size,
    modifyTime: fileInfo.modifyTime,
    type: fileInfo.type === "D" ? import_types.FileInfoEnum.DIRECTORY : import_types.FileInfoEnum.FILE
  };
};
class SambaFile {
  #file;
  #tempFile;
  constructor(file, tempFile) {
    this.#file = file;
    this.#tempFile = tempFile;
  }
  get() {
    return this.#file;
  }
  close() {
    let success = false;
    fs.unlink(this.#tempFile, (err) => {
      success = err === null;
    });
    return success;
  }
}
class SambaFilehandler {
  constructor(sambaConfig) {
    this.sambaConfig = sambaConfig;
    console.log("Samba File handler setup!");
    fs.mkdirSync(sambaConfig.tmpDirectory, { recursive: true });
    this.sambaClient = new import_samba_client.SambaClient(sambaConfig);
  }
  async init() {
  }
  async list(dir) {
    const list = await this.sambaClient.list(dir);
    const directories = list.filter(
      (r) => !(r.type === "D" && (r.name === "." || r.name === ".."))
    );
    return directories.map(mapFileInfo);
  }
  async readFile(remoteFile) {
    const tempFilename = `${(0, import_uuid.v4)()}.tmp`;
    const localFile = `${this.sambaConfig.tmpDirectory}/${tempFilename}`;
    await this.sambaClient.getFile(remoteFile, localFile);
    const buffer = fs.readFileSync(localFile);
    return new SambaFile(buffer, localFile);
  }
  async writeFile(data, remotePath, filename) {
    console.log(
      `Writing file ${filename} to ${remotePath}, checking if directory exists`
    );
    let directoryExists = false;
    try {
      console.log(`Checking if ${remotePath} exists`);
      const exist = await this.sambaClient.fileExists(remotePath);
      directoryExists = exist;
    } catch (e) {
      console.error(e);
    }
    if (!directoryExists) {
      console.log(`Directory ${remotePath} does not exist, creating it`);
      await this.sambaClient.mkdir(remotePath);
    }
    console.log(`Directory ${remotePath} exists, writing file ${filename}`);
    const buffer = data.get();
    const tempFilename = `${(0, import_uuid.v4)()}.tmp`;
    const localFile = `${this.sambaConfig.tmpDirectory}/${tempFilename}`;
    console.log(`Writing file to ${localFile}`);
    fs.writeFileSync(localFile, new Uint8Array(buffer));
    let success = false;
    try {
      const path = remotePath === "" ? filename : `${remotePath}/${filename}`;
      console.log(`Sending local file ${localFile} to ${path}`);
      const feedback = await this.sambaClient.sendFile(localFile, path);
      console.log("feedback", feedback);
      console.log(
        "feedback includes NT_STATUS_OK",
        feedback.includes("NT_STATUS_OK")
      );
      success = true;
    } catch (e) {
      console.log(e);
    } finally {
      fs.unlinkSync(localFile);
    }
    return success;
  }
  async deleteFile(remoteFile) {
    try {
      const feedback = await this.sambaClient.deleteFile(remoteFile);
    } catch (e) {
      console.log(e);
      return false;
    }
    return true;
  }
  fileExists(location) {
    return this.sambaClient.fileExists(location);
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  SambaFile,
  SambaFilehandler
});
