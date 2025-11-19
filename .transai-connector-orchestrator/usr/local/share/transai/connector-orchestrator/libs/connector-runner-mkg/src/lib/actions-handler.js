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
var import_all = require("./tables/_all");
class ActionsHandler {
  #connectorSDK;
  #httpClient;
  constructor(connectorSDK, httpClient) {
    this.#connectorSDK = connectorSDK;
    this.#httpClient = httpClient;
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
      try {
        this.#connectorSDK.logger.debug(
          `[MKG] Apply templates on payload: ${JSON.stringify(message.payload)}, action: ${JSON.stringify(action)}`
        );
        const handleBars = action.config["parsedTemplates"];
        const parsedAction = handleBars.action({
          inputs: message.payload
        }).trim();
        const parsedParams = handleBars.params({
          inputs: message.payload
        }).trim();
        const parsedParamsJson = JSON.parse(parsedParams);
        this.#connectorSDK.logger.debug(
          `[MKG] Parsed action: ${parsedAction}, params json: ${JSON.stringify(parsedParamsJson)}`
        );
        const [tableIdentifier, ...rest] = parsedAction.split(".");
        const actionIdentifier = rest.join(".");
        const mkgTable = import_all.MKG_TABLES[tableIdentifier];
        if (!mkgTable) {
          this.#connectorSDK.logger.warn(
            `[MKG] Unknown table identifier "${tableIdentifier}" in message ${message.eventId}`
          );
          return this.#connectorSDK.receiver.responses.badRequest(
            `[MKG] Unknown table identifier "${tableIdentifier}"`
          )(message);
        }
        const mkgAction = mkgTable.action(actionIdentifier);
        if (!mkgAction) {
          const logMessage = `[MKG] Unknown action identifier "${actionIdentifier}" within table "${tableIdentifier}" in message ${message.eventId}`;
          this.#connectorSDK.logger.warn(logMessage);
          return this.#connectorSDK.receiver.responses.badRequest(logMessage)(
            message
          );
        }
        if (message.testRun) {
          this.#connectorSDK.logger.info(
            `[MKG] Test run for ${message.eventId} with payload ${parsedParams} to action ${parsedAction}`
          );
          return callbackFunction(message);
        }
        try {
          const response = await this.#httpClient.request(
            mkgAction.method,
            `/web/v3/MKG/Documents/${mkgAction.path(parsedParamsJson)}`,
            {
              ...["POST", "PUT"].includes(mkgAction.method) ? {
                data: {
                  request: {
                    InputData: {
                      [tableIdentifier]: [
                        mkgAction.fieldSet(parsedParamsJson)
                      ]
                    }
                  }
                }
              } : {}
            }
          );
          this.#connectorSDK.logger.debug(
            `[MKG] Got action "${actionIdentifier}" of table "${tableIdentifier}" response from MKG: ${JSON.stringify(response)}`
          );
        } catch (error) {
          const logMessage = `[MKG] Failed to perform action "${actionIdentifier}" of table "${tableIdentifier}": (${error?.status}) ${error?.error ?? error?.message}`;
          this.#connectorSDK.logger.error(logMessage);
          return this.#connectorSDK.receiver.responses.unprocessableEntity(
            logMessage
          )(message);
        }
        return callbackFunction(message);
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
