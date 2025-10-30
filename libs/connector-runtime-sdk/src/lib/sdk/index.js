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
var sdk_exports = {};
module.exports = __toCommonJS(sdk_exports);
__reExport(sdk_exports, require("./sdk.interface"), module.exports);
__reExport(sdk_exports, require("./logger.sdk.interface"), module.exports);
__reExport(sdk_exports, require("./offset-store.sdk.interface"), module.exports);
__reExport(sdk_exports, require("./processing.sdk.interface"), module.exports);
__reExport(sdk_exports, require("./receiver.sdk.interface"), module.exports);
__reExport(sdk_exports, require("./sender.sdk.interface"), module.exports);
__reExport(sdk_exports, require("./templating.sdk.interface"), module.exports);
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ...require("./sdk.interface"),
  ...require("./logger.sdk.interface"),
  ...require("./offset-store.sdk.interface"),
  ...require("./processing.sdk.interface"),
  ...require("./receiver.sdk.interface"),
  ...require("./sender.sdk.interface"),
  ...require("./templating.sdk.interface")
});
//# sourceMappingURL=index.js.map
