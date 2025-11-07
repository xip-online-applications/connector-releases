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
var extractor_service_exports = {};
__export(extractor_service_exports, {
  ExtractorService: () => ExtractorService
});
module.exports = __toCommonJS(extractor_service_exports);
var import_types = require("./types");
class ExtractorService {
  #sdk;
  #httpClient;
  #tableIdentifier;
  #table;
  #fieldsList;
  constructor(sdk, httpClient, tableIdentifier, table) {
    this.#sdk = sdk;
    this.#httpClient = httpClient;
    this.#tableIdentifier = tableIdentifier;
    this.#table = table;
    this.#fieldsList = table.fields.join(",");
  }
  async onRun() {
    try {
      const now = /* @__PURE__ */ new Date();
      const latestOffset = await this.#sdk.offsetStore.getOffset(
        `offset_${this.#tableIdentifier}`
      );
      const data = await this.#fetchData(latestOffset);
      if (data.length > 0) {
        await this.#sdk.sender.documents(data, {
          keyField: this.#table.identifierField,
          collection: `${this.#sdk.config.datasourceIdentifier ?? import_types.DEFAULT_DATASOURCE}_${this.#tableIdentifier}`
        });
      }
      this.#sdk.logger.debug(
        `Processed ${data.length} records from ${this.#tableIdentifier}`
      );
      this.#sdk.offsetStore.setOffset(
        {
          id: String(
            data[data.length - 1]?.[this.#table.identifierField] ?? latestOffset.id
          ),
          timestamp: now.getTime(),
          rawTimestamp: now.toISOString()
        },
        `offset_${this.#tableIdentifier}`
      );
    } catch (error) {
      this.#sdk.logger.error(
        `Failed to retrieve and process data from OPC UA source service`,
        { error }
      );
    }
  }
  #fetchData = async (latestOffset) => {
    const parameters = new URLSearchParams();
    parameters.set("NumRows", String(this.#table.rows));
    parameters.set(
      "Filter",
      `${this.#table.dateField}>=${latestOffset.rawTimestamp}`
    );
    parameters.set("FieldList", `${this.#table.dateField},${this.#fieldsList}`);
    const response = await this.#httpClient.get(
      `/web/v3/MKG/Documents/${this.#tableIdentifier}?${parameters.toString()}`
    );
    if (!response.success) {
      this.#sdk.logger.error(
        `Failed to fetch data from table ${this.#tableIdentifier}: (${response.status}) ${response.error}`
      );
      return [];
    }
    return response.data?.response?.ResultData?.[0]?.[this.#tableIdentifier] ?? [];
  };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ExtractorService
});
