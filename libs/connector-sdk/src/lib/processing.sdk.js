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
var processing_sdk_exports = {};
__export(processing_sdk_exports, {
  ProcessingSDKService: () => ProcessingSDKService
});
module.exports = __toCommonJS(processing_sdk_exports);
var import_rxjs = require("rxjs");
class ProcessingSDKService {
  #logger;
  #telemetryService;
  #intervals = {};
  constructor(logger, telemetryService) {
    this.#logger = logger;
    this.#telemetryService = telemetryService;
  }
  async registerInterval(intervalSeconds, handler, options) {
    const name = handler?.name ?? `interval-${Object.keys(this.#intervals).length + 1}`;
    if (this.#intervals[name]) {
      throw new Error(`Interval with name ${name} already exists`);
    }
    this.#intervals[name] = {
      handler,
      options,
      interval: intervalSeconds
    };
    return name;
  }
  async stopInterval(name) {
    const interval2 = this.#intervals[name];
    if (!interval2) {
      return;
    }
    interval2.subscription?.unsubscribe();
    delete this.#intervals[name];
  }
  async start() {
    await Promise.all(
      Object.values(this.#intervals).map(async (intervalData) => {
        if (intervalData.subscription) {
          return;
        }
        if (intervalData.handler.onInit) {
          try {
            this.#logger.debug(
              `Running onInit for ${intervalData.handler.name}`
            );
            await intervalData.handler.onInit();
          } catch (error) {
            this.#logger.error(
              `Error during onInit of interval handler ${intervalData.handler.name}: ${error.message}`
            );
          }
        }
        this.#logger.debug(
          `Subscribing interval for ${intervalData.handler.name}`
        );
        intervalData.subscription = (0, import_rxjs.interval)(
          intervalData.interval * 1e3
        ).subscribe(async () => {
          await this.#runHandler(intervalData.handler).catch(
            (error) => {
              this.#logger.error(
                `Interval run failed for ${intervalData.handler.name}:`,
                error?.message ?? error
              );
            }
          );
        });
        this.#logger.debug(
          `Interval for ${intervalData.handler.name} subscribed every ${intervalData.interval} seconds`
        );
        if (intervalData.handler.onStop) {
          intervalData.subscription.add(async () => {
            try {
              this.#logger.debug(
                `Running onStop for ${intervalData.handler.name}`
              );
              await intervalData.handler.onStop();
            } catch (error) {
              this.#logger.error(
                `Interval stop failed for ${intervalData.handler.name}:`,
                error?.message ?? error
              );
            }
          });
        }
        if (intervalData.options?.immediate) {
          this.#logger.debug(
            `Running interval immediately for ${intervalData.handler.name}`
          );
          await this.#runHandler(intervalData.handler).catch(
            (error) => {
              this.#logger.error(
                `Immediate run failed for ${intervalData.handler.name}:`,
                error?.message ?? error
              );
            }
          );
        }
      })
    );
  }
  async #runHandler(handler) {
    this.#logger.info(`Running interval handler ${handler.name}`);
    try {
      await handler.onRun();
      this.#telemetryService.increment("sdk.processing.runs.success");
    } catch (error) {
      this.#logger.error(
        `Error running interval handler ${handler.name}: ${error?.message}`,
        { error }
      );
      this.#telemetryService.increment("sdk.processing.runs.error");
    }
  }
  stopAll() {
    const stopPromises = Object.keys(this.#intervals).map(
      (name) => this.stopInterval(name)
    );
    return Promise.all(stopPromises);
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ProcessingSDKService
});
