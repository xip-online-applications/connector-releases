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
var offset_store_service_exports = {};
__export(offset_store_service_exports, {
  OffsetStoreService: () => OffsetStoreService
});
module.exports = __toCommonJS(offset_store_service_exports);
var import_fs = __toESM(require("fs"));
var import_types = require("./types");
class OffsetStoreService {
  // eslint-disable-next-line no-useless-constructor
  constructor(offsetDirectory) {
    this.offsetDirectory = offsetDirectory;
  }
  async init() {
    if (!import_fs.default.existsSync(this.offsetDirectory)) {
      import_fs.default.mkdirSync(this.offsetDirectory);
    }
  }
  getOffset(identifier) {
    try {
      const offsetFile = import_fs.default.readFileSync(
        this.getOffsetFilePath(identifier),
        "utf8"
      );
      const offsetStore = JSON.parse(offsetFile);
      return (0, import_types.isOffsetStoreType)(offsetStore) ? offsetStore : { id: 0, timestamp: 0 };
    } catch (error) {
      return { id: 0, timestamp: 0 };
    }
  }
  setOffset(offset, identifier) {
    import_fs.default.writeFileSync(
      this.getOffsetFilePath(identifier),
      JSON.stringify(offset)
    );
  }
  writeFile(fileName, data) {
    import_fs.default.writeFileSync(this.getOffsetFilePath(fileName), JSON.stringify(data));
  }
  getOffsetFilePath(identifier) {
    return `${this.offsetDirectory}/${identifier}.json`;
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  OffsetStoreService
});
