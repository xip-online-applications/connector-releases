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
var array_cache_service_exports = {};
__export(array_cache_service_exports, {
  ArrayCacheService: () => ArrayCacheService
});
module.exports = __toCommonJS(array_cache_service_exports);
class ArrayCacheService {
  #cache = {};
  get(key) {
    return Promise.resolve(this.#cache[key] ?? void 0);
  }
  set(key, value) {
    this.#cache[key] = value;
    return Promise.resolve();
  }
  clear() {
    this.#cache = [];
    return Promise.resolve();
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ArrayCacheService
});
//# sourceMappingURL=array-cache.service.js.map
