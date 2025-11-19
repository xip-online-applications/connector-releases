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
var object_utils_exports = {};
__export(object_utils_exports, {
  ObjectUtils: () => ObjectUtils
});
module.exports = __toCommonJS(object_utils_exports);
class ObjectUtils {
  /**
   * Checks if given value is an object.
   * We cannot use instanceof because it has problems when running on different contexts.
   * And we don't simply use typeof because typeof null === "object".
   */
  static isObject(val) {
    return val !== null && typeof val === "object";
  }
  /**
   * Checks if given value is an object.
   * We cannot use instanceof because it has problems when running on different contexts.
   * And we don't simply use typeof because typeof null === "object".
   */
  static isObjectWithName(val) {
    return val !== null && typeof val === "object" && val["name"] !== void 0;
  }
  /**
   * Copy the values of all of the enumerable own properties from one or more source objects to a
   * target object.
   * @param target The target object to copy to.
   * @param sources One or more source objects from which to copy properties
   */
  static assign(target, ...sources) {
    for (const source of sources) {
      for (const prop of Object.getOwnPropertyNames(source)) {
        ;
        target[prop] = source[prop];
      }
    }
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ObjectUtils
});
