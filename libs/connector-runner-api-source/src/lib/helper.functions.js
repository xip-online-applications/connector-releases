var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
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
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var helper_functions_exports = {};
__export(helper_functions_exports, {
  generateCollectionName: () => generateCollectionName,
  generateKafkaTopic: () => generateKafkaTopic,
  generateOffsetIdentifier: () => generateOffsetIdentifier,
  makeNodeRequest: () => makeNodeRequest
});
module.exports = __toCommonJS(helper_functions_exports);
var http2 = __toESM(require("node:http2"));
var https = __toESM(require("node:https"));
var http = __toESM(require("node:http"));
function generateCollectionName(connectorConfig, sinkConfig) {
  return `${connectorConfig.datasourceIdentifier}_${sinkConfig.name}`;
}
function generateKafkaTopic(connectorConfig) {
  return `${connectorConfig.tenantIdentifier}_SOURCE_${connectorConfig.datasourceIdentifier}`;
}
function generateOffsetIdentifier(apiConfig) {
  return `${apiConfig.offsetFilePrefix ?? "offset"}_${apiConfig.name}`;
}
function makeNodeRequest(urlStr, method, headers, body, forceTls12, forceHttp2 = false) {
  return new Promise((resolve, reject) => {
    try {
      const urlObj = new URL(urlStr);
      const isHttps = urlObj.protocol === "https:";
      const isHttp2 = forceHttp2;
      const options = {
        method,
        headers
      };
      if (isHttps) {
        options["rejectUnauthorized"] = true;
        if (forceTls12) {
          options["secureProtocol"] = "TLSv1_2_method";
        }
      }
      if (isHttp2) {
        const client = http2.connect(urlObj.origin);
        const req = client.request({
          ":path": urlObj.pathname + urlObj.search,
          ":method": method,
          ...headers
        });
        let data = "";
        req.setEncoding("utf8");
        req.on("data", (chunk) => {
          data += chunk;
        });
        req.on("end", () => {
          client.close();
          resolve(data);
        });
        req.on("error", (err) => {
          client.close();
          reject(err);
        });
        if (method === "POST" && body) {
          req.write(body);
        }
        req.end();
      } else {
        const lib = isHttps ? https : http;
        const req = lib.request(urlObj, options, (res) => {
          let data = "";
          res.setEncoding("utf8");
          res.on("data", (chunk) => {
            data += chunk;
          });
          res.on("end", () => {
            resolve(data);
          });
        });
        req.on("error", (err) => {
          reject(err);
        });
        if (method === "POST" && body) {
          req.write(body);
        }
        req.end();
      }
    } catch (err) {
      reject(err);
    }
  });
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  generateCollectionName,
  generateKafkaTopic,
  generateOffsetIdentifier,
  makeNodeRequest
});
//# sourceMappingURL=helper.functions.js.map
