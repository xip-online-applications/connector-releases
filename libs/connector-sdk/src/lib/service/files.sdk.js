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
var files_sdk_exports = {};
__export(files_sdk_exports, {
  FilesSDKService: () => FilesSDKService
});
module.exports = __toCommonJS(files_sdk_exports);
var import_file_system = require("@xip-online-data/file-system");
class FilesSDKService {
  #fileSystemHandler;
  constructor(fileSystemHandler) {
    this.#fileSystemHandler = fileSystemHandler;
  }
  delete(path) {
    return this.#fileSystemHandler.deleteFile(path);
  }
  exists(path) {
    return this.#fileSystemHandler.fileExists(path);
  }
  list(path) {
    return this.#fileSystemHandler.list(path);
  }
  read(filePath) {
    return this.#fileSystemHandler.readFile(filePath);
  }
  write(filePath, data) {
    let fileHandle = data;
    if (typeof data === "string" || Buffer.isBuffer(data)) {
      fileHandle = new import_file_system.ActiveFileHandle(data);
    }
    return this.#fileSystemHandler.writeFile(
      filePath,
      fileHandle
    );
  }
  pathAsDsn(path) {
    return this.#fileSystemHandler.pathAsDsn(path);
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  FilesSDKService
});
