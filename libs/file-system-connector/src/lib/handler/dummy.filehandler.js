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
var dummy_filehandler_exports = {};
__export(dummy_filehandler_exports, {
  DummyFilehandler: () => DummyFilehandler
});
module.exports = __toCommonJS(dummy_filehandler_exports);
var import_logger = require("@transai/logger");
var import_generic_active_file = require("../generic-active-file.active-file-handler");
var import_types = require("../types");
class DummyFilehandler {
  #dummyConfig;
  constructor(dummyConfig) {
    this.#dummyConfig = dummyConfig;
  }
  static fromDsn(dsn) {
    if (!dsn.startsWith("dummy:")) {
      return null;
    }
    const dummyFiles = dsn.substring(0, dsn.indexOf("dummy:"));
    return new DummyFilehandler({
      type: "dummy",
      dummyFiles: dummyFiles.split(","),
      processedAction: "move"
    });
  }
  async list() {
    return (this.#dummyConfig.dummyFiles ?? []).map((file) => {
      return {
        name: file,
        size: 0,
        modifyTime: /* @__PURE__ */ new Date(),
        type: import_types.FileInfoEnum.FILE
      };
    });
  }
  async readFile() {
    const randomData = Math.random().toString(36).substring(7);
    const buffer = Buffer.from(randomData);
    return new import_generic_active_file.GenericActiveFileActiveFileHandler(buffer);
  }
  async writeFile(data, remotePath, filename) {
    import_logger.Logger.getInstance().debug(
      `Dummy write file to ${remotePath} / ${filename}`
    );
    return true;
  }
  async deleteFile(filepath) {
    import_logger.Logger.getInstance().debug(`Dummy delete file from ${filepath}`);
    return true;
  }
  async fileExists() {
    return true;
  }
  pathAsDsn(filepath) {
    return `dummy:${filepath}`;
  }
  async init() {
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  DummyFilehandler
});
