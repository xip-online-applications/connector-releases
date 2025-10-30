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
var workflow_run_exports = {};
__export(workflow_run_exports, {
  WorkflowJobStatusStatus: () => WorkflowJobStatusStatus,
  WorkflowRunStatusStatus: () => WorkflowRunStatusStatus
});
module.exports = __toCommonJS(workflow_run_exports);
var WorkflowRunStatusStatus = /* @__PURE__ */ ((WorkflowRunStatusStatus2) => {
  WorkflowRunStatusStatus2["PENDING"] = "PENDING";
  WorkflowRunStatusStatus2["RUNNING"] = "RUNNING";
  WorkflowRunStatusStatus2["SUCCESS"] = "SUCCESS";
  WorkflowRunStatusStatus2["FAILED"] = "FAILED";
  return WorkflowRunStatusStatus2;
})(WorkflowRunStatusStatus || {});
var WorkflowJobStatusStatus = /* @__PURE__ */ ((WorkflowJobStatusStatus2) => {
  WorkflowJobStatusStatus2["PENDING"] = "PENDING";
  WorkflowJobStatusStatus2["RUNNING"] = "RUNNING";
  WorkflowJobStatusStatus2["SUCCESS"] = "SUCCESS";
  WorkflowJobStatusStatus2["SKIPPED"] = "SKIPPED";
  WorkflowJobStatusStatus2["BAD_REQUEST"] = "BAD_REQUEST";
  WorkflowJobStatusStatus2["INTERNAL_SERVER_ERROR"] = "INTERNAL_SERVER_ERROR";
  return WorkflowJobStatusStatus2;
})(WorkflowJobStatusStatus || {});
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  WorkflowJobStatusStatus,
  WorkflowRunStatusStatus
});
//# sourceMappingURL=workflow-run.js.map
