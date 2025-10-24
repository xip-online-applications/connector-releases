var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __reExport = (target, mod, secondTarget) => (__copyProps(target, mod, "default"), secondTarget && __copyProps(secondTarget, mod, "default"));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var cache_exports = {};
module.exports = __toCommonJS(cache_exports);
__reExport(cache_exports, require("./cache-service.interface"), module.exports);
__reExport(cache_exports, require("./filesystem-cache.service"), module.exports);
__reExport(cache_exports, require("./array-cache.service"), module.exports);
__reExport(cache_exports, require("./redis-cache.service"), module.exports);
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ...require("./cache-service.interface"),
  ...require("./filesystem-cache.service"),
  ...require("./array-cache.service"),
  ...require("./redis-cache.service")
});
//# sourceMappingURL=index.js.map
