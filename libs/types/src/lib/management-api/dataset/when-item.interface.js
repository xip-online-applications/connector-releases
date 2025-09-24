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
var when_item_interface_exports = {};
__export(when_item_interface_exports, {
  WhenItemSchema: () => WhenItemSchema
});
module.exports = __toCommonJS(when_item_interface_exports);
var import_zod = require("zod");
var import_filter = require("./filter.interface");
const WhenItemSchema = import_zod.z.intersection(
  import_filter.FilterSchema,
  import_zod.z.object({
    label: import_zod.z.string().min(1),
    description: import_zod.z.string().min(1).optional()
  })
);
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  WhenItemSchema
});
//# sourceMappingURL=when-item.interface.js.map
