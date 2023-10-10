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
const core_1 = require("@actions/core");
const tool_cache_1 = require("@actions/tool-cache");
const github_1 = require("@actions/github");
const path_1 = require("path");
const exec_1 = require("@actions/exec");
const configFile_1 = __importDefault(require("./configFile"));
const foreman_1 = __importDefault(require("./foreman"));
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const versionReq = (0, core_1.getInput)("version");
            const githubToken = (0, core_1.getInput)("token");
            const workingDir = (0, core_1.getInput)("working-directory");
            const allowExternalGithubOrgs = (0, core_1.getInput)("allow-external-github-orgs").toLowerCase();
            const octokit = new github_1.GitHub(githubToken);
            const releases = yield foreman_1.default.getReleases(octokit);
            (0, core_1.debug)("Choosing release from GitHub API");
            const release = foreman_1.default.chooseRelease(versionReq, releases);
            if (release == null) {
                throw new Error(`Could not find Foreman release for version ${versionReq}`);
            }
            (0, core_1.debug)(`Chose release ${release.tag_name}`);
            const asset = foreman_1.default.chooseAsset(release);
            if (asset == null) {
                throw new Error(`Could not find asset for version ${release.tag_name} on platform ${process.platform}`);
            }
            (0, core_1.debug)(`Chose release asset ${asset.browser_download_url}`);
            const zipPath = yield (0, tool_cache_1.downloadTool)(asset.browser_download_url);
            const extractedPath = yield (0, tool_cache_1.extractZip)(zipPath, ".foreman-install");
            (0, core_1.addPath)((0, path_1.resolve)(extractedPath));
            if (process.platform === "darwin" || process.platform === "linux") {
                yield (0, exec_1.exec)("chmod +x .foreman-install/foreman");
            }
            yield foreman_1.default.authenticate(githubToken);
            foreman_1.default.addBinDirToPath();
            if (workingDir !== undefined && workingDir !== null && workingDir !== "") {
                process.chdir(workingDir);
            }
            if (allowExternalGithubOrgs != "true") {
                (0, core_1.debug)("Checking tools in Foreman Config come from source org");
                const owner = process.env.GITHUB_REPOSITORY_OWNER;
                if (owner == undefined) {
                    throw new Error(`Could not find repository owner setup-foreman is running in`);
                }
                configFile_1.default.checkSameOrgInConfig(owner.toLowerCase());
            }
            yield foreman_1.default.installTools();
        }
        catch (error) {
            if (error instanceof Error) {
                (0, core_1.setFailed)(error.message);
            }
        }
    });
}
run();
