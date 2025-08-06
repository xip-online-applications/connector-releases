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
var meta_interface_exports = {};
__export(meta_interface_exports, {
  LocaleSchema: () => LocaleSchema,
  MetaSchema: () => MetaSchema
});
module.exports = __toCommonJS(meta_interface_exports);
var import_zod = require("zod");
const LocaleSchema = import_zod.z.record(
  import_zod.z.string().regex(/^[a-z]{2}$/),
  // Ensures valid locale codes (e.g., en, nl, de)
  import_zod.z.record(import_zod.z.string(), import_zod.z.string())
  // Ensures all fields inside each locale are strings
);
const MetaSchema = import_zod.z.record(
  import_zod.z.union([LocaleSchema, import_zod.z.string().min(1), import_zod.z.number(), import_zod.z.boolean()])
);
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  LocaleSchema,
  MetaSchema
});
//# sourceMappingURL=meta.interface.js.map
