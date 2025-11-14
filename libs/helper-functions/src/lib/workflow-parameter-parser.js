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
var workflow_parameter_parser_exports = {};
__export(workflow_parameter_parser_exports, {
  parseMessageToInput: () => parseMessageToInput
});
module.exports = __toCommonJS(workflow_parameter_parser_exports);
var import_jsonata = __toESM(require("jsonata"));
async function getValueFromMessage(message, selector) {
  if (!selector || selector.trim() === "") {
    return void 0;
  }
  try {
    const expression = (0, import_jsonata.default)(selector);
    return expression.evaluate(message);
  } catch (error) {
    throw new Error(
      `Error evaluating JSONata expression "${selector}" on "${JSON.stringify(message)?.slice(0, 200)}, ${error?.message}`
    );
  }
}
async function parseMessageToInput(message, mapper) {
  const inputsToParse = Object.keys(mapper);
  const parsedInputs = {};
  let allRequiredAreSet = true;
  await Promise.all(
    inputsToParse.map(async (key) => {
      const valueToSend = await getValueFromMessage(
        message,
        mapper[key].selector
      );
      parsedInputs[key] = valueToSend;
      if (allRequiredAreSet && valueToSend === void 0 && mapper[key].required === true) {
        allRequiredAreSet = false;
      }
    })
  );
  return { jobPayload: parsedInputs, allRequiredAreSet };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  parseMessageToInput
});
