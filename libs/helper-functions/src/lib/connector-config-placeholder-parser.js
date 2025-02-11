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
var connector_config_placeholder_parser_exports = {};
__export(connector_config_placeholder_parser_exports, {
  replacePlaceholdersInConfig: () => replacePlaceholdersInConfig
});
module.exports = __toCommonJS(connector_config_placeholder_parser_exports);
function replacePlaceholdersInConfig(config, inputs) {
  const placeholderRegex = /{{inputs\.(\w+)}}/;
  const replacePlaceholders = (value) => {
    if (typeof value === "string") {
      const match = value.match(placeholderRegex);
      if (match) {
        const messageKey = match[1];
        return inputs[messageKey] !== void 0 ? inputs[messageKey] : value;
      }
      return value;
    }
    if (Array.isArray(value)) {
      return value.map(replacePlaceholders);
    }
    if (typeof value === "object" && value !== null) {
      return Object.fromEntries(
        Object.entries(value).map(([key, val]) => [
          key,
          replacePlaceholders(val)
        ])
      );
    }
    return value;
  };
  return replacePlaceholders(config);
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  replacePlaceholdersInConfig
});
