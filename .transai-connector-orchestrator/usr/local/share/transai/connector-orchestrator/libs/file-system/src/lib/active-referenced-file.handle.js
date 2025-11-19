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
var active_referenced_file_handle_exports = {};
__export(active_referenced_file_handle_exports, {
  ActiveReferencedFileHandle: () => ActiveReferencedFileHandle
});
module.exports = __toCommonJS(active_referenced_file_handle_exports);
var fs = __toESM(require("node:fs"));
class ActiveReferencedFileHandle {
  #filePath;
  constructor(filePath) {
    this.#filePath = filePath;
  }
  get() {
    return fs.readFileSync(this.#filePath);
  }
  close() {
    try {
      fs.unlinkSync(this.#filePath);
      return true;
    } catch (err) {
      console.error(`Failed to delete file ${this.#filePath}:`, err);
      return false;
    }
  }
  get filePath() {
    return this.#filePath;
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ActiveReferencedFileHandle
});
