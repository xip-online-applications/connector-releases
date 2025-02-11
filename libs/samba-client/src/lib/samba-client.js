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
var samba_client_exports = {};
__export(samba_client_exports, {
  SambaClient: () => SambaClient
});
module.exports = __toCommonJS(samba_client_exports);
var path = __toESM(require("path"));
var import_execa2 = require("./execa.wrapper");
const singleSlash = /\//g;
const missingFileRegex = /(NT_STATUS_OBJECT_NAME_NOT_FOUND|NT_STATUS_NO_SUCH_FILE)/im;
const getCleanedSmbClientArgs = (args) => {
  if (Array.isArray(args)) {
    return args.map((arg) => `${arg.replace(singleSlash, "\\")}`).join(" ");
  }
  return `${args.replace(singleSlash, "\\")}`;
};
class SambaClient {
  constructor(config, execa = new import_execa2.ExecaWrapper()) {
    this.config = config;
    this.execa = execa;
  }
  async getFile(cmdPath, destination, workingDir = "") {
    return this.execute("get", `${cmdPath} ${destination}`, workingDir);
  }
  async sendFile(cmdPath, destination) {
    const workingDir = path.dirname(cmdPath);
    return this.execute(
      "put",
      [path.basename(cmdPath), destination],
      workingDir
    );
  }
  async deleteFile(fileName) {
    return this.execute("del", [`${fileName}`], "");
  }
  async listFiles(fileNamePrefix, fileNameSuffix) {
    try {
      const cmdArgs = `${fileNamePrefix}*${fileNameSuffix}`;
      const allOutput = await this.execute("dir", cmdArgs, "");
      const fileList = [];
      for (let line of allOutput.split("\n")) {
        line = line.toString().trim();
        if (line.startsWith(fileNamePrefix)) {
          const parsed = line.substring(
            0,
            line.indexOf(fileNameSuffix) + fileNameSuffix.length
          );
          fileList.push(parsed);
        }
      }
      return fileList;
    } catch (e) {
      if (e instanceof Error) {
        if (e.message.match(missingFileRegex)) {
          return [];
        }
      }
      throw e;
    }
  }
  async mkdir(remotePath, cwd) {
    return this.execute("mkdir", [remotePath], cwd);
  }
  async dir(remotePath, cwd) {
    return this.execute(["-D", remotePath, "-c", "dir"], [], cwd);
  }
  async fileExists(remotePath, cwd = "") {
    try {
      await this.dir(remotePath, cwd);
      return true;
    } catch (e) {
      if (e instanceof Error) {
        if (e.message.match(missingFileRegex)) {
          return false;
        }
      }
      throw e;
    }
  }
  async list(remotePath) {
    const remoteDirList = [];
    const remoteDirContents = await this.dir(remotePath);
    const lines = remoteDirContents.matchAll(
      /\s*(.+?)\s{6,}([A-Z0-9]{1,2})\s+([0-9]+)\s{2}(.+)/g
    );
    for (const content of lines) {
      remoteDirList.push({
        name: content[1],
        type: content[2] === "D" ? "D" : "A",
        size: parseInt(content[3], 10),
        modifyTime: /* @__PURE__ */ new Date(`${content[4]}Z`)
      });
    }
    return remoteDirList;
  }
  getSmbClientArgs(smbCommand, smbCommandArgs) {
    const args = [];
    if (this.config.username) {
      args.push("-U", this.config.username);
    }
    if (!this.config.password) {
      args.push("-N");
    }
    args.push(this.config.address);
    if (this.config.password) {
      args.push("--password", this.config.password);
    }
    if (this.config.domain) {
      args.push("-W", this.config.domain);
    }
    if (this.config.directory) {
      args.push("-D", this.config.directory);
    }
    if (this.config.maxProtocol) {
      args.push("--max-protocol", this.config.maxProtocol);
    }
    if (this.config.port) {
      args.push("-p", this.config.port);
    }
    if (this.config.timeout) {
      args.push("-t", this.config.timeout);
    }
    let cleanedSmbArgs = "";
    if (Array.isArray(smbCommandArgs)) {
      cleanedSmbArgs = getCleanedSmbClientArgs(smbCommandArgs);
    } else {
      cleanedSmbArgs = smbCommandArgs;
    }
    if (!Array.isArray(smbCommand)) {
      smbCommand = ["-c", `${smbCommand} ${cleanedSmbArgs}`];
    } else {
      smbCommand.push(cleanedSmbArgs);
    }
    args.push(...smbCommand);
    return args;
  }
  async execute(smbCommand, smbCommandArgs, workingDir) {
    const args = this.getSmbClientArgs(smbCommand, smbCommandArgs);
    const options = {
      all: true,
      cwd: workingDir || ""
    };
    const val = await this.execa.execute("smbclient", args, options);
    return val.all;
  }
  async getAllShares() {
    const { stdout } = await this.execa.execute(
      "smbtree",
      ["-U", "guest", "-N"],
      {
        all: true
      }
    );
    const shares = [];
    for (const line in stdout.split(/\r?\n/)) {
      const words = line.split(/\t/);
      if (words.length > 2 && words[2].match(/^\s*$/) !== null) {
        shares.push(words[2].trim());
      }
    }
    return shares;
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  SambaClient
});
