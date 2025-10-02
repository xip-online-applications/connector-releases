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
var workflow_exports = {};
module.exports = __toCommonJS(workflow_exports);
__reExport(workflow_exports, require("./action.interface"), module.exports);
__reExport(workflow_exports, require("./offset.interface"), module.exports);
__reExport(workflow_exports, require("./connector.interface"), module.exports);
__reExport(workflow_exports, require("./workflow-definition.interface"), module.exports);
__reExport(workflow_exports, require("./workflow-run"), module.exports);
__reExport(workflow_exports, require("./workflow.drawing"), module.exports);
__reExport(workflow_exports, require("./trigger-types.interface"), module.exports);
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ...require("./action.interface"),
  ...require("./offset.interface"),
  ...require("./connector.interface"),
  ...require("./workflow-definition.interface"),
  ...require("./workflow-run"),
  ...require("./workflow.drawing"),
  ...require("./trigger-types.interface")
});
