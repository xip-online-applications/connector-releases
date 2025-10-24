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
var action_interface_exports = {};
__export(action_interface_exports, {
  ActionSchema: () => ActionSchema
});
module.exports = __toCommonJS(action_interface_exports);
var import_types = require("@xip-online-data/types");
var import_zod = require("zod");
const ActionSchema = import_zod.z.object({
  identifier: import_zod.z.string(),
  version: import_zod.z.string(),
  name: import_zod.z.string(),
  description: import_zod.z.string().optional(),
  config: import_zod.z.record(import_zod.z.any()),
  inputParameters: import_zod.z.array(
    import_zod.z.object({
      name: import_zod.z.string(),
      type: import_zod.z.enum(["string", "number", "boolean", "array"]),
      required: import_zod.z.boolean().optional(),
      items: import_zod.z.array(import_zod.z.any()).optional()
    })
  ),
  outputParameters: import_zod.z.any(),
  mode: import_zod.z.nativeEnum(import_types.ConnectorOrigin).optional(),
  createdAt: import_zod.z.date().optional(),
  updatedAt: import_zod.z.date().optional()
});
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ActionSchema
});
//# sourceMappingURL=action.interface.js.map
