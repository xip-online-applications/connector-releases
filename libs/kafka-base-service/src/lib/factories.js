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
var factories_exports = {};
__export(factories_exports, {
  BadRequest: () => BadRequest,
  Created: () => Created,
  InternalServerError: () => InternalServerError,
  NotFound: () => NotFound,
  Ok: () => Ok,
  UnprocessableEntity: () => UnprocessableEntity
});
module.exports = __toCommonJS(factories_exports);
var import_http_status_codes = require("http-status-codes");
function Ok(additionalMessage) {
  return async (message) => {
    return {
      success: true,
      statusCode: import_http_status_codes.StatusCodes.OK,
      message: `Ok${additionalMessage ? `: ${additionalMessage}` : ""}`,
      payload: message.payload,
      meta: {
        testRun: message.testRun,
        ...message.meta ?? {}
      }
    };
  };
}
function Created(additionalMessage) {
  return async (message) => {
    return {
      success: true,
      statusCode: import_http_status_codes.StatusCodes.CREATED,
      message: `Created${additionalMessage ? `: ${additionalMessage}` : ""}`,
      meta: {
        testRun: message.testRun,
        ...message.meta ?? {}
      }
    };
  };
}
function UnprocessableEntity(additionalMessage) {
  return async (message) => {
    return {
      success: false,
      statusCode: import_http_status_codes.StatusCodes.UNPROCESSABLE_ENTITY,
      message: `Unprocessable Entity${additionalMessage ? `: ${additionalMessage}` : ""}`,
      meta: {
        testRun: message.testRun,
        ...message.meta ?? {}
      }
    };
  };
}
function BadRequest(additionalMessage) {
  return async (message) => {
    return {
      success: false,
      statusCode: import_http_status_codes.StatusCodes.BAD_REQUEST,
      message: `Bad request${additionalMessage ? `: ${additionalMessage}` : ""}`,
      meta: {
        testRun: message.testRun,
        ...message.meta ?? {}
      }
    };
  };
}
function NotFound(additionalMessage) {
  return async (message) => {
    return {
      success: false,
      statusCode: import_http_status_codes.StatusCodes.NOT_FOUND,
      message: `Not Found${additionalMessage ? `: ${additionalMessage}` : ""}`,
      meta: {
        testRun: message.testRun,
        ...message.meta ?? {}
      }
    };
  };
}
function InternalServerError(additionalMessage) {
  return async (message) => {
    return {
      success: false,
      statusCode: import_http_status_codes.StatusCodes.INTERNAL_SERVER_ERROR,
      message: `Internal server error${additionalMessage ? `: ${additionalMessage}` : ""}`,
      meta: {
        testRun: message.testRun,
        ...message.meta ?? {}
      }
    };
  };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  BadRequest,
  Created,
  InternalServerError,
  NotFound,
  Ok,
  UnprocessableEntity
});
