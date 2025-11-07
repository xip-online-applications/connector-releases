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
var telemetry_exports = {};
__export(telemetry_exports, {
  TelemetryService: () => TelemetryService
});
module.exports = __toCommonJS(telemetry_exports);
var import_rxjs = require("rxjs");
class TelemetryService {
  static {
    this.SEND_INTERVAL_SEC = 60;
  }
  #connector;
  #logger;
  #sendTelemetrySubscription;
  #gaugeQueue = [];
  #incrementQueue = {};
  constructor(connector, logger) {
    this.#connector = connector;
    this.#logger = logger;
    this.#sendTelemetrySubscription = (0, import_rxjs.interval)(
      TelemetryService.SEND_INTERVAL_SEC * 1e3
    ).pipe(
      (0, import_rxjs.catchError)((error) => {
        this.#logger.error(
          `Error while trying to send telemetry ${error?.message}`,
          error
        );
        return (0, import_rxjs.of)(null);
      })
    ).subscribe(() => this.#emitTelemetry());
    this.#sendTelemetrySubscription.add(() => this.#emitTelemetry());
  }
  stop() {
    this.#sendTelemetrySubscription.unsubscribe();
  }
  increment(key, value = 1) {
    this.#incrementQueue[key] = // eslint-disable-next-line security/detect-object-injection
    (this.#incrementQueue[key] ?? 0) + value;
  }
  #emitTelemetry() {
    const allGaugesToFlush = this.#gaugeQueue.slice();
    const allIncrementsToFlush = { ...this.#incrementQueue };
    this.#incrementQueue = {};
    this.#logger.info("sdk.telemetry", {
      tenantIdentifier: this.#connector.tenantIdentifier,
      connectorIdentifier: this.#connector.identifier,
      connectorName: this.#connector.name,
      telemetry: {
        gauge: allGaugesToFlush,
        increment: allIncrementsToFlush
      }
    });
    this.#gaugeQueue.splice(0, allGaugesToFlush.length);
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  TelemetryService
});
