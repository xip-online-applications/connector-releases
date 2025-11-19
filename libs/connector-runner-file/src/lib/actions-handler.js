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
var actions_handler_exports = {};
__export(actions_handler_exports, {
  ActionsHandler: () => ActionsHandler
});
module.exports = __toCommonJS(actions_handler_exports);
class ActionsHandler {
  #connectorSDK;
  #fileHandler;
  constructor(connectorSDK, fileHandler) {
    this.#connectorSDK = connectorSDK;
    this.#fileHandler = fileHandler;
  }
  get callbackFunctionChain() {
    return this.#jobCallbackFunction(
      this.#connectorSDK.receiver.emitEventType(
        this.#connectorSDK.receiver.responses.created()
      )
    );
  }
  #jobCallbackFunction(callbackFunction) {
    return async (message, action) => {
      this.#connectorSDK.logger.debug(
        `Apply templates on payload: ${JSON.stringify(message.payload)}, action: ${JSON.stringify(action)}`
      );
      const handleBars = action.config["parsedTemplates"];
      try {
        const parsedFilename = handleBars.filename({
          inputs: message.payload
        }).trim();
        const parsedContent = handleBars.contents({
          inputs: message.payload
        }).trim();
        if (message.testRun) {
          this.#connectorSDK.logger.debug(
            `Test run for ${message.eventId} with parsedContent ${parsedContent}, parsedFilename ${parsedFilename}`
          );
          return callbackFunction(message);
        }
        await this.#fileHandler.write(parsedFilename, parsedContent);
      } catch (error) {
        return this.#connectorSDK.receiver.responses.internalServerError(
          error instanceof Error ? error.message : "Unknown error occurred"
        )(message);
      }
      return callbackFunction(message);
    };
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ActionsHandler
});
