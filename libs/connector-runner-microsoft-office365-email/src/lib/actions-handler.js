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
  #mailClient;
  constructor(connectorSDK, mailClient) {
    this.#connectorSDK = connectorSDK;
    this.#mailClient = mailClient;
  }
  get callbackFunctionChain() {
    return this.#jobCallbackFunction(
      this.#actionCallbackFunction(
        this.#connectorSDK.receiver.emitEventType(
          this.#connectorSDK.receiver.responses.created()
        )
      )
    );
  }
  #jobCallbackFunction(callbackFunction) {
    return async (m) => {
      if (m.type !== "JOB") {
        return callbackFunction(m);
      }
      const message = m;
      const action = this.#connectorSDK.receiver.getActionConfig(message);
      if (!action) {
        return this.#connectorSDK.receiver.responses.badRequest(
          "Action configuration not found"
        )(message);
      }
      try {
        this.#connectorSDK.logger.debug(
          `Apply templates on payload: ${JSON.stringify(message.payload)}, action: ${JSON.stringify(action)}`
        );
        const handleBars = action.config["parsedTemplates"];
        const parsedAction = handleBars.action({
          inputs: message.payload
        }).trim();
        const parsedParams = handleBars.params({
          inputs: message.payload
        }).trim();
        if (message.testRun) {
          this.#connectorSDK.logger.info(
            `Test run for ${message.eventId} with payload ${parsedParams} to action ${parsedAction}`
          );
          return callbackFunction(message);
        }
        this.#connectorSDK.logger.debug(
          `Parsed action: ${parsedAction}, parameters: ${parsedParams}`
        );
        const parsedParamsJson = JSON.parse(parsedParams);
        this.#connectorSDK.logger.debug(
          `Parsed params json: ${JSON.stringify(parsedParamsJson)}`
        );
        switch (parsedAction) {
          case "REPLY":
            await this.#mailClient.reply(
              parsedParamsJson.messageId,
              parsedParamsJson.from,
              parsedParamsJson.mailBody,
              true
            );
            break;
          case "FORWARD":
            break;
          case "SEND":
            break;
          case "CATEGORY_ADD":
            await this.#mailClient.addCategory(
              parsedParamsJson.messageId,
              parsedParamsJson.category
            );
            break;
          case "CATEGORY_REMOVE":
            await this.#mailClient.removeCategory(
              parsedParamsJson.messageId,
              parsedParamsJson.category
            );
            break;
          default:
            this.#connectorSDK.logger.error(
              `Unknown action type: ${parsedAction} in message ${message.eventId}`
            );
        }
        return callbackFunction(message);
      } catch (error) {
        return this.#connectorSDK.receiver.responses.internalServerError(
          error instanceof Error ? error.message : "Unknown error occurred"
        )(message);
      }
    };
  }
  #actionCallbackFunction(callbackFunction) {
    return async (m) => {
      if (m.type !== "ACTION") {
        return callbackFunction(m);
      }
      const message = m;
      try {
        if (!message.payload.destination || !message.payload.content) {
          return this.#connectorSDK.receiver.responses.badRequest(
            "Destination or content not found"
          )(message);
        }
        const result = { success: true, data: "Not implemented yet" };
        if (result.success) {
          return callbackFunction(message);
        }
        return this.#connectorSDK.receiver.responses.internalServerError(
          result.data
        )(message);
      } catch (error) {
        return this.#connectorSDK.receiver.responses.internalServerError(
          error instanceof Error ? error.message : "Unknown error occurred"
        )(message);
      }
    };
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ActionsHandler
});
