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
var switch_interface_exports = {};
__export(switch_interface_exports, {
  SwitchSchema: () => SwitchSchema
});
module.exports = __toCommonJS(switch_interface_exports);
var import_zod = require("zod");
var import_when_items = require("./when-items.interface");
const SwitchSchema = import_zod.z.object({
  when: import_when_items.WhenItemsSchema,
  else: import_zod.z.string().min(1).optional(),
  segment: import_zod.z.boolean().optional()
});
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  SwitchSchema
});
