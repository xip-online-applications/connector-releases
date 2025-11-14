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
var table_exports = {};
__export(table_exports, {
  MkgTable: () => MkgTable
});
module.exports = __toCommonJS(table_exports);
var import_types = require("../../types");
class MkgTable {
  constructor(params, actions = []) {
    this.identifier = params.identifier;
    this.fields = params.fields;
    this.immediate = params.immediate !== false;
    this.interval = params.interval ?? (this.fields.length > 0 ? import_types.DEFAULT_INTERVAL : 0);
    this.identifierField = params.identifierField ?? import_types.DEFAULT_ROW_KEY_FIELD;
    this.dateField = params.dateField ?? import_types.DEFAULT_DATE_FIELD;
    this.rows = params.rows ?? import_types.DEFAULT_NUM_ROWS;
    this.actions = actions.map((action) => action.withParentTable(this));
  }
  cloneFromTableConfig(tableConfig) {
    if (tableConfig === true || tableConfig.fields === void 0) {
      return this;
    }
    return new MkgTable({
      ...this,
      fields: this.fields.filter(
        (field) => tableConfig.fields?.includes(field)
      )
    });
  }
  action(identifier) {
    return this.actions.find((a) => a.identifier === identifier);
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  MkgTable
});
