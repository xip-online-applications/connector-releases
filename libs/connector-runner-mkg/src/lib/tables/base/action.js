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
var action_exports = {};
__export(action_exports, {
  MkgAction: () => MkgAction
});
module.exports = __toCommonJS(action_exports);
class MkgAction {
  #table;
  constructor(params) {
    this.identifier = params.identifier;
    this.method = params.method;
    this.fields = params.fields;
    this.optionalFields = params.optionalFields ?? [];
    this.path = params.path ?? (() => this.#table.identifier);
  }
  withParentTable(table) {
    const action = new MkgAction(this);
    action.#table = table;
    return action;
  }
  fieldSet(inputData) {
    const fieldData = /* @__PURE__ */ new Map();
    this.fields.forEach((field) => {
      const inputDataValue = inputData[field];
      if (!inputDataValue) {
        throw new Error(
          `Missing required field '${field}' for action '${this.identifier}'`
        );
      }
      fieldData.set(field, inputDataValue);
    });
    this.optionalFields.forEach((field) => {
      const inputDataValue = inputData[field];
      if (inputDataValue) {
        fieldData.set(field, inputDataValue);
      }
    });
    return Object.fromEntries(fieldData.entries());
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  MkgAction
});
