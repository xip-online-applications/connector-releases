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
var semantic_trigger_exports = {};
module.exports = __toCommonJS(semantic_trigger_exports);
__reExport(semantic_trigger_exports, require("./semantic-trigger-filter.interface"), module.exports);
__reExport(semantic_trigger_exports, require("./semantic-trigger-filters.interface"), module.exports);
__reExport(semantic_trigger_exports, require("./semantic-trigger-record.interface"), module.exports);
__reExport(semantic_trigger_exports, require("./semantic-trigger.interface"), module.exports);
__reExport(semantic_trigger_exports, require("./semantic-triggers.interface"), module.exports);
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ...require("./semantic-trigger-filter.interface"),
  ...require("./semantic-trigger-filters.interface"),
  ...require("./semantic-trigger-record.interface"),
  ...require("./semantic-trigger.interface"),
  ...require("./semantic-triggers.interface")
});
//# sourceMappingURL=index.js.map
