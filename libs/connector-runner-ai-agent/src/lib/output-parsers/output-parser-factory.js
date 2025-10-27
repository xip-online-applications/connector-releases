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
var output_parser_factory_exports = {};
__export(output_parser_factory_exports, {
  generateOutputParser: () => generateOutputParser
});
module.exports = __toCommonJS(output_parser_factory_exports);
var import_output_parsers = require("@langchain/core/output_parsers");
const generateOutputParser = (outputParameters) => {
  if (!outputParameters || typeof outputParameters !== "object") {
    class StrOutputParser extends import_output_parsers.BaseOutputParser {
      constructor() {
        super(...arguments);
        this.lc_namespace = [
          "langchain",
          "output_parsers",
          "str"
        ];
      }
      parse(text, callbacks) {
        return Promise.resolve(text);
      }
      getFormatInstructions(options) {
        return "Return the output as a plain string.";
      }
    }
    return new StrOutputParser();
  }
  return import_output_parsers.StructuredOutputParser.fromNamesAndDescriptions(
    outputParameters
  );
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  generateOutputParser
});
