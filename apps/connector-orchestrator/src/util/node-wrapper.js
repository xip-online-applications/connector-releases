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
var node_wrapper_exports = {};
__export(node_wrapper_exports, {
  NodeWrapper: () => NodeWrapper
});
module.exports = __toCommonJS(node_wrapper_exports);
var import_cluster = __toESM(require("cluster"));
var import_node_process = __toESM(require("node:process"));
class NodeWrapper {
  constructor() {
    this.process = {
      pid: import_node_process.default.pid,
      env: import_node_process.default.env,
      on: import_node_process.default.on,
      exit: import_node_process.default.exit
    };
    this.cluster = {
      isPrimary: import_cluster.default.isPrimary,
      workers: import_cluster.default.workers,
      fork: import_cluster.default.fork
    };
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  NodeWrapper
});
//# sourceMappingURL=node-wrapper.js.map
