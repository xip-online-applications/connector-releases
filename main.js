const Module = require("module");
const path = require("path");
const fs = require("fs");
const originalResolveFilename = Module._resolveFilename;
const distPath = __dirname;
const manifest = [{ "module": "@xip-online-data/types/event-server", "exactMatch": "libs/types/src/lib/event-server/index.js", "pattern": "libs/types/src/lib/event-server/index.ts" }, { "module": "@xip-online-data/auth", "exactMatch": "libs/auth/src/index.js", "pattern": "libs/auth/src/index.ts" }, { "module": "@xip-online-data/cube-watch-service", "exactMatch": "libs/cube-watch-service/src/index.js", "pattern": "libs/cube-watch-service/src/index.ts" }, { "module": "@xip-online-data/datasource", "exactMatch": "libs/datasource/src/index.js", "pattern": "libs/datasource/src/index.ts" }, { "module": "@xip-online-data/file-handler", "exactMatch": "libs/file-handler/src/index.js", "pattern": "libs/file-handler/src/index.ts" }, { "module": "@xip-online-data/file-system-connector", "exactMatch": "libs/file-system-connector/src/index.js", "pattern": "libs/file-system-connector/src/index.ts" }, { "module": "@xip-online-data/handle-error", "exactMatch": "libs/handle-error/src/index.js", "pattern": "libs/handle-error/src/index.ts" }, { "module": "@xip-online-data/helper-functions", "exactMatch": "libs/helper-functions/src/index.js", "pattern": "libs/helper-functions/src/index.ts" }, { "module": "@xip-online-data/http-client", "exactMatch": "libs/http-client/src/index.js", "pattern": "libs/http-client/src/index.ts" }, { "module": "@xip-online-data/httpclient", "exactMatch": "libs/httpclient/src/index.js", "pattern": "libs/httpclient/src/index.ts" }, { "module": "@xip-online-data/kafka-base-service", "exactMatch": "libs/kafka-base-service/src/index.js", "pattern": "libs/kafka-base-service/src/index.ts" }, { "module": "@xip-online-data/parse-yaml", "exactMatch": "libs/parse-yaml/src/index.js", "pattern": "libs/parse-yaml/src/index.ts" }, { "module": "@xip-online-data/microsoft-office365-mail-client", "exactMatch": "libs/microsoft-office365-mail-client/src/index.js", "pattern": "libs/microsoft-office365-mail-client/src/index.ts" }, { "module": "@xip-online-data/samba-client", "exactMatch": "libs/samba-client/src/index.js", "pattern": "libs/samba-client/src/index.ts" }, { "module": "@xip-online-data/sftp-client", "exactMatch": "libs/sftp-client/src/index.js", "pattern": "libs/sftp-client/src/index.ts" }, { "module": "@xip-online-data/tracer", "exactMatch": "libs/tracer/src/index.js", "pattern": "libs/tracer/src/index.ts" }, { "module": "@xip-online-data/types", "exactMatch": "libs/types/src/index.js", "pattern": "libs/types/src/index.ts" }, { "module": "@transai/connector-runner-api-sink", "exactMatch": "libs/connector-runner-api-sink/src/index.js", "pattern": "libs/connector-runner-api-sink/src/index.ts" }, { "module": "@transai/connector-runner-api-source", "exactMatch": "libs/connector-runner-api-source/src/index.js", "pattern": "libs/connector-runner-api-source/src/index.ts" }, { "module": "@transai/connector-runner-cube-query", "exactMatch": "libs/connector-runner-cube-query/src/index.js", "pattern": "libs/connector-runner-cube-query/src/index.ts" }, { "module": "@transai/connector-runner-dummy-node", "exactMatch": "libs/connector-runner-dummy-node/src/index.js", "pattern": "libs/connector-runner-dummy-node/src/index.ts" }, { "module": "@transai/connector-runner-factorynebula-source", "exactMatch": "libs/connector-runner-factorynebula-source/src/index.js", "pattern": "libs/connector-runner-factorynebula-source/src/index.ts" }, { "module": "@transai/connector-runner-file-copy", "exactMatch": "libs/connector-runner-file-copy/src/index.js", "pattern": "libs/connector-runner-file-copy/src/index.ts" }, { "module": "@transai/connector-runner-file-sink", "exactMatch": "libs/connector-runner-file-sink/src/index.js", "pattern": "libs/connector-runner-file-sink/src/index.ts" }, { "module": "@transai/connector-runner-file-source", "exactMatch": "libs/connector-runner-file-source/src/index.js", "pattern": "libs/connector-runner-file-source/src/index.ts" }, { "module": "@transai/connector-runner-microsoft-office365-email", "exactMatch": "libs/connector-runner-microsoft-office365-email/src/index.js", "pattern": "libs/connector-runner-microsoft-office365-email/src/index.ts" }, { "module": "@transai/connector-runner-mqtt", "exactMatch": "libs/connector-runner-mqtt/src/index.js", "pattern": "libs/connector-runner-mqtt/src/index.ts" }, { "module": "@transai/connector-runner-samba-sink", "exactMatch": "libs/connector-runner-samba-sink/src/index.js", "pattern": "libs/connector-runner-samba-sink/src/index.ts" }, { "module": "@transai/connector-runner-samba-source", "exactMatch": "libs/connector-runner-samba-source/src/index.js", "pattern": "libs/connector-runner-samba-source/src/index.ts" }, { "module": "@transai/connector-runner-sql-sink", "exactMatch": "libs/connector-runner-sql-sink/src/index.js", "pattern": "libs/connector-runner-sql-sink/src/index.ts" }, { "module": "@transai/connector-runner-sql-source", "exactMatch": "libs/connector-runner-sql-source/src/index.js", "pattern": "libs/connector-runner-sql-source/src/index.ts" }, { "module": "@transai/connector-runner-ai-agent", "exactMatch": "libs/connector-runner-ai-agent/src/index.js", "pattern": "libs/connector-runner-ai-agent/src/index.ts" }, { "module": "@transai/connector-runner-bystronic", "exactMatch": "libs/connector-runner-bystronic/src/index.js", "pattern": "libs/connector-runner-bystronic/src/index.ts" }, { "module": "@transai/connector-runtime", "exactMatch": "libs/connector-runtime/src/index.js", "pattern": "libs/connector-runtime/src/index.ts" }, { "module": "@transai/connector-runtime-sdk", "exactMatch": "libs/connector-runtime-sdk/src/index.js", "pattern": "libs/connector-runtime-sdk/src/index.ts" }, { "module": "@transai/connector-sdk", "exactMatch": "libs/connector-sdk/src/index.js", "pattern": "libs/connector-sdk/src/index.ts" }, { "module": "@transai/logger", "exactMatch": "libs/logger/src/index.js", "pattern": "libs/logger/src/index.ts" }, { "module": "@transai/management-api-client", "exactMatch": "libs/management-api-client/src/index.js", "pattern": "libs/management-api-client/src/index.ts" }, { "module": "@transai/nestjs-database", "exactMatch": "libs/nestjs-database/src/index.js", "pattern": "libs/nestjs-database/src/index.ts" }, { "module": "@transai/nestjs-kafka", "exactMatch": "libs/nestjs-kafka/src/index.js", "pattern": "libs/nestjs-kafka/src/index.ts" }, { "module": "@transai/tools", "exactMatch": "tools/@transai-tools/src/index.js", "pattern": "tools/@transai-tools/src/index.ts" }, { "module": "@transai/opcua-client", "exactMatch": "libs/opcua-client/src/index.js", "pattern": "libs/opcua-client/src/index.ts" }];
Module._resolveFilename = function(request, parent) {
  let found;
  for (const entry of manifest) {
    if (request === entry.module && entry.exactMatch) {
      const entry2 = manifest.find((x) => request === x.module || request.startsWith(x.module + "/"));
      const candidate = path.join(distPath, entry2.exactMatch);
      if (isFile(candidate)) {
        found = candidate;
        break;
      }
    } else {
      const re = new RegExp(entry.module.replace(/\*$/, "(?<rest>.*)"));
      const match = request.match(re);
      if (match?.groups) {
        const candidate = path.join(distPath, entry.pattern.replace("*", ""), match.groups.rest);
        if (isFile(candidate)) {
          found = candidate;
        }
      }
    }
  }
  if (found) {
    const modifiedArguments = [found, ...[].slice.call(arguments, 1)];
    return originalResolveFilename.apply(this, modifiedArguments);
  } else {
    return originalResolveFilename.apply(this, arguments);
  }
};
function isFile(s) {
  try {
    require.resolve(s);
    return true;
  } catch (_e) {
    return false;
  }
}
module.exports = require("./apps/connector-orchestrator/src/main.js");
//# sourceMappingURL=main.js.map
