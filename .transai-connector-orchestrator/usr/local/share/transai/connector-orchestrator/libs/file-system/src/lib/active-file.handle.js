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
var active_file_handle_exports = {};
__export(active_file_handle_exports, {
  ActiveFileHandle: () => ActiveFileHandle
});
module.exports = __toCommonJS(active_file_handle_exports);
class ActiveFileHandle {
  #file;
  constructor(file) {
    this.#file = Buffer.isBuffer(file) ? file : Buffer.from(file);
  }
  get() {
    return this.#file;
  }
  close() {
    return true;
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ActiveFileHandle
});
