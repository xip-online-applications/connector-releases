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
var parse_yaml_exports = {};
__export(parse_yaml_exports, {
  parseYaml: () => parseYaml
});
module.exports = __toCommonJS(parse_yaml_exports);
var yaml = __toESM(require("js-yaml"));
var ejs = __toESM(require("ejs"));
var import_fs = require("fs");
var import_handle_error = require("@xip-online-data/handle-error");
function parseYaml(argv, validateFunction = () => true, argPosition = 2) {
  if (argv.length !== argPosition + 1) {
    (0, import_handle_error.handleError)("Please provide the path to the config file as the first argument");
  }
  const configPath = argv[argPosition];
  let config = void 0;
  try {
    const configTemplate = (0, import_fs.readFileSync)(configPath, "utf8");
    const configString = ejs.render(configTemplate);
    config = yaml.load(configString);
  } catch (e) {
    (0, import_handle_error.handleError)("Error while reading config file", e);
  }
  if (config === void 0) {
    (0, import_handle_error.handleError)("Config file is not valid");
    return void 0;
  }
  if (!validateFunction(config)) {
    (0, import_handle_error.handleError)("Config file is not valid");
    return void 0;
  }
  console.debug("Config file is valid");
  return config;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  parseYaml
});
//# sourceMappingURL=parse-yaml.js.map
