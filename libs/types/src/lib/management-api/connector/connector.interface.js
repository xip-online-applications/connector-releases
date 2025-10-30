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
var connector_interface_exports = {};
__export(connector_interface_exports, {
  ConnectorSchema: () => ConnectorSchema
});
module.exports = __toCommonJS(connector_interface_exports);
var import_zod = require("zod");
var import_types = require("../../types");
var import_workflow = require("../workflow");
const ConnectorSchema = import_zod.z.object({
  identifier: import_zod.z.string(),
  connectorType: import_zod.z.nativeEnum(import_types.ConfiguredConnectorTypes),
  name: import_zod.z.string(),
  location: import_zod.z.string(),
  config: import_zod.z.record(import_zod.z.any()),
  enabled: import_zod.z.boolean(),
  actions: import_zod.z.array(import_workflow.ActionSchema).optional(),
  createdAt: import_zod.z.date().optional(),
  updatedAt: import_zod.z.date().optional()
});
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ConnectorSchema
});
//# sourceMappingURL=connector.interface.js.map
