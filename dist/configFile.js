"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const toml_1 = require("toml");
const fs_1 = require("fs");
const find_up_1 = __importDefault(require("find-up"));
const MANIFEST = "foreman.toml";
function checkSameOrgToolSpecs(manifestContent, org) {
    const tools = manifestContent.tools;
    if (tools == null) {
        throw new Error("Tools section in Foreman config not found");
    }
    for (const tool_name in tools) {
        const tool_spec = tools[tool_name];
        let source = tool_spec["source"];
        if (source == undefined) {
            source = tool_spec["github"];
        }
        if (source == undefined) {
            continue;
        }
        const source_array = source.split("/");
        const tool_org = source_array[0];
        if (tool_org == null) {
            throw new Error(`Org not found in tool spec definition for: ${tool_name}. Foreman config is likely defined incorrectly.`);
        }
        if (tool_org.toLowerCase() != org) {
            return false;
        }
    }
    return true;
}
function checkSameOrgInConfig(org) {
    return __awaiter(this, void 0, void 0, function* () {
        const manifestPath = yield (0, find_up_1.default)(MANIFEST);
        if (manifestPath == undefined) {
            throw new Error("setup-foreman could not find Foreman config file");
        }
        yield (0, fs_1.readFile)(manifestPath, "utf8", (err, data) => {
            if (err) {
                throw new Error(`setup-foreman Could not read Foreman config file. err: ${err}`);
            }
            const manifestContent = (0, toml_1.parse)(data);
            const sameGithubOrgSource = checkSameOrgToolSpecs(manifestContent, org);
            if (!sameGithubOrgSource) {
                throw new Error(`All GitHub orgs in Foreman config must match the org setup-foreman runs in: ${org}. To disable this check, set the \"allow-external-github-orgs\" option to true.`);
            }
        });
    });
}
exports.default = {
    checkSameOrgInConfig,
    checkSameOrgToolSpecs
};
