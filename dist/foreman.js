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
const exec_1 = require("@actions/exec");
const semver_1 = __importDefault(require("semver"));
const os_1 = __importDefault(require("os"));
function getReleases(octokit) {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield octokit.repos.listReleases({
            owner: "Roblox",
            repo: "foreman"
        });
        const releases = response.data;
        releases.sort((a, b) => -semver_1.default.compare(a.tag_name, b.tag_name));
        return releases;
    });
}
function chooseRelease(versionReq, releases) {
    for (const release of releases) {
        if (semver_1.default.satisfies(release.tag_name, versionReq)) {
            return release;
        }
    }
    return null;
}
function chooseAsset(release) {
    let platformMatcher;
    if (process.platform === "win32") {
        platformMatcher = name => name.includes("windows") ||
            name.includes("win64") ||
            name.includes("win32");
    }
    else if (process.platform === "darwin") {
        const arch = os_1.default.arch();
        if (arch === "x64") {
            if (release.tag_name >= "v1.0.5") {
                platformMatcher = name => name.includes("macos-x86_64");
            }
            else {
                platformMatcher = name => name.includes("macos");
            }
        }
        else {
            platformMatcher = name => name.includes("macos-arm64");
        }
    }
    else if (process.platform === "linux") {
        platformMatcher = name => name.includes("linux");
    }
    else {
        throw new Error(`Unsupported platform "${process.platform}"`);
    }
    for (const asset of release.assets) {
        if (platformMatcher(asset.name)) {
            return asset;
        }
    }
    return null;
}
function authenticate(token) {
    return __awaiter(this, void 0, void 0, function* () {
        yield (0, exec_1.exec)("foreman", ["github-auth", token]);
    });
}
function addBinDirToPath() {
    if (process.platform === "win32") {
        (0, core_1.addPath)(`${process.env.USERPROFILE}\\.foreman\\bin`);
    }
    else if (process.platform === "darwin" || process.platform === "linux") {
        (0, core_1.addPath)(`${process.env.HOME}/.foreman/bin`);
    }
    else {
        throw new Error(`Unsupported platform "${process.platform}"`);
    }
}
function installTools() {
    return __awaiter(this, void 0, void 0, function* () {
        yield (0, exec_1.exec)("foreman install");
    });
}
exports.default = {
    getReleases,
    chooseRelease,
    chooseAsset,
    authenticate,
    addBinDirToPath,
    installTools
};
