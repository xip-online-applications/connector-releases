var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __reExport = (target, mod, secondTarget) => (__copyProps(target, mod, "default"), secondTarget && __copyProps(secondTarget, mod, "default"));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var src_exports = {};
module.exports = __toCommonJS(src_exports);
__reExport(src_exports, require("./lib/file-system-connector"), module.exports);
__reExport(src_exports, require("./lib/file-handler.interface"), module.exports);
__reExport(src_exports, require("./lib/generic-active-file.active-file-handler"), module.exports);
__reExport(src_exports, require("./lib/types"), module.exports);
__reExport(src_exports, require("./lib/handler/dummy.filehandler"), module.exports);
__reExport(src_exports, require("./lib/handler/samba.filehandler"), module.exports);
__reExport(src_exports, require("./lib/handler/sftp.filehandler"), module.exports);
__reExport(src_exports, require("./lib/handler/sftp-reconnect.filehandler"), module.exports);
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ...require("./lib/file-system-connector"),
  ...require("./lib/file-handler.interface"),
  ...require("./lib/generic-active-file.active-file-handler"),
  ...require("./lib/types"),
  ...require("./lib/handler/dummy.filehandler"),
  ...require("./lib/handler/samba.filehandler"),
  ...require("./lib/handler/sftp.filehandler"),
  ...require("./lib/handler/sftp-reconnect.filehandler")
});
