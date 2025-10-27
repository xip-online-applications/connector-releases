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
var file_action_types_exports = {};
__export(file_action_types_exports, {
  FileActionType: () => FileActionType
});
module.exports = __toCommonJS(file_action_types_exports);
var FileActionType = /* @__PURE__ */ ((FileActionType2) => {
  FileActionType2["ACTION_MOVE"] = "move";
  FileActionType2["ACTION_DELETE"] = "delete";
  FileActionType2["ACTION_NOTHING"] = "nothing";
  return FileActionType2;
})(FileActionType || {});
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  FileActionType
});
//# sourceMappingURL=file-action.types.js.map
