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
var workflow_run_generator_exports = {};
__export(workflow_run_generator_exports, {
  createRunFromDefinition: () => createRunFromDefinition,
  migrateToNewMessageMapper: () => migrateToNewMessageMapper
});
module.exports = __toCommonJS(workflow_run_generator_exports);
var import_uuid = require("uuid");
var import_types = require("@xip-online-data/types");
const migrateToNewMessageMapper = (oldWith) => {
  const keys = Object.keys(oldWith);
  const isConditionMapper = keys.includes("selector");
  if (isConditionMapper) {
    return oldWith;
  }
  const isOldFormat = keys.some((key) => typeof oldWith[key] === "string");
  if (!isOldFormat) {
    return oldWith;
  }
  const newMapper = {};
  keys.forEach((key) => {
    if (typeof oldWith[key] === "string") {
      newMapper[key] = {
        type: "string",
        selector: oldWith[key],
        required: true
      };
    } else {
      newMapper[key] = {
        ...oldWith[key]
      };
    }
  });
  return newMapper;
};
const createJobFromSteps = (step, testRun = false) => {
  return {
    id: (0, import_uuid.v4)(),
    identifier: step.identifier,
    step,
    status: import_types.WorkflowJobStatusStatus.PENDING,
    type: step.type,
    operationIdentifier: step.operationIdentifier,
    operationVersion: step.operationVersion,
    with: migrateToNewMessageMapper(step.with),
    testRun,
    requires: [],
    updatedAt: /* @__PURE__ */ new Date(),
    createdAt: /* @__PURE__ */ new Date()
  };
};
const replaceIdentifierWithUniqueId = (withParams, steps) => {
  const options = Object.keys(withParams).filter((v) => v !== "selector");
  const newWith = {
    selector: withParams.selector
  };
  options.forEach((option) => {
    const step = steps.find((s) => s.identifier === withParams[option]);
    if (step) {
      newWith[option] = step.id;
    }
  });
  return newWith;
};
const linkJobs = (steps, jobs) => {
  steps.forEach((step) => {
    const job = jobs.find(
      (j) => j.operationIdentifier === step.operationIdentifier && j.identifier === step.identifier
    );
    if (!job) {
      throw new Error("Job not found");
    }
    if (job.type === import_types.NodeTypes.CONDITIONAL) {
      job.with = replaceIdentifierWithUniqueId(job.with, jobs);
    }
    job.requires = jobs.filter((j) => step.requires.includes(j.step.identifier)).map((j) => j.id);
  });
  return jobs;
};
const createRunFromDefinition = (workflowDefinition, eventDetails, drawing, existingRunId) => {
  const jobs = workflowDefinition.steps.map(
    (s) => createJobFromSteps(s, eventDetails.testRun)
  );
  const run = {
    trigger: eventDetails,
    workflow: workflowDefinition,
    tenantIdentifier: eventDetails.tenantIdentifier,
    semanticIdentifier: "todo",
    status: import_types.WorkflowRunStatusStatus.PENDING,
    ttl: workflowDefinition.ttl,
    testRun: eventDetails.testRun,
    jobs: linkJobs(
      workflowDefinition.steps,
      jobs
    ),
    drawing,
    restartOf: existingRunId || void 0
  };
  run.jobs.forEach((job) => {
    job.run = run;
  });
  return run;
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  createRunFromDefinition,
  migrateToNewMessageMapper
});
