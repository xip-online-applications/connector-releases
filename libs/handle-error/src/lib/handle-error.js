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
var handle_error_exports = {};
__export(handle_error_exports, {
  handleError: () => handleError
});
module.exports = __toCommonJS(handle_error_exports);
var import_logger = require("@transai/logger");
function handleError(errorMessage, error = void 0) {
  import_logger.Logger.getInstance().error(errorMessage);
  if (error instanceof Error) {
    import_logger.Logger.getInstance().error(error);
  }
  process.exit(1);
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  handleError
});
//# sourceMappingURL=handle-error.js.map
