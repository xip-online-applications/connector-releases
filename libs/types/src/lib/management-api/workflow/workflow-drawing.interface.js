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
var workflow_drawing_interface_exports = {};
__export(workflow_drawing_interface_exports, {
  ConditionalTypes: () => ConditionalTypes,
  NodeTypes: () => NodeTypes
});
module.exports = __toCommonJS(workflow_drawing_interface_exports);
var NodeTypes = /* @__PURE__ */ ((NodeTypes2) => {
  NodeTypes2["TRIGGER"] = "TRIGGER";
  NodeTypes2["ACTION"] = "ACTION";
  NodeTypes2["CONDITIONAL"] = "CONDITIONAL";
  NodeTypes2["ANNOTATION"] = "ANNOTATION";
  NodeTypes2["PLACEHOLDER"] = "PLACEHOLDER";
  NodeTypes2["END"] = "END";
  return NodeTypes2;
})(NodeTypes || {});
var ConditionalTypes = /* @__PURE__ */ ((ConditionalTypes2) => {
  ConditionalTypes2["TRUE_FALSE"] = "TRUE_FALSE";
  ConditionalTypes2["CASE"] = "CASE";
  return ConditionalTypes2;
})(ConditionalTypes || {});
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ConditionalTypes,
  NodeTypes
});
