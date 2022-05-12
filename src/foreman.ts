import {addPath} from "@actions/core";
import {exec} from "@actions/exec";
import {GitHub} from "@actions/github";
import semver from "semver";

interface GitHubAsset {
  name: string;
  browser_download_url: string;
}

interface GitHubRelease {
  tag_name: string;
  assets: GitHubAsset[];
}

async function getReleases(octokit: GitHub): Promise<GitHubRelease[]> {
  const response = await octokit.repos.listReleases({
    owner: "Roblox",
    repo: "foreman"
  });

  const releases = response.data as GitHubRelease[];
  releases.sort((a, b) => -semver.compare(a.tag_name, b.tag_name));

  return releases;
}

function chooseRelease(
  versionReq: string,
  releases: GitHubRelease[]
): GitHubRelease | null {
  for (const release of releases) {
    if (semver.satisfies(release.tag_name, versionReq)) {
      return release;
    }
  }

  return null;
}

function chooseAsset(release: GitHubRelease): GitHubAsset | null {
  let platformMatcher: (name: string) => boolean;

  if (process.platform === "win32") {
    platformMatcher = name =>
      name.includes("windows") ||
      name.includes("win64") ||
      name.includes("win32");
  } else if (process.platform === "darwin") {
    platformMatcher = name => name.includes("macos");
  } else if (process.platform === "linux") {
    platformMatcher = name => name.includes("linux");
  } else {
    throw new Error(`Unsupported platform "${process.platform}"`);
  }

  for (const asset of release.assets) {
    if (platformMatcher(asset.name)) {
      return asset;
    }
  }

  return null;
}

async function authenticate(token: string): Promise<void> {
  await exec("foreman", ["github-auth", token]);
}

function addBinDirToPath(): void {
  if (process.platform === "win32") {
    addPath(`${process.env.USERPROFILE}\\.foreman\\bin`);
  } else if (process.platform === "darwin" || process.platform === "linux") {
    addPath(`${process.env.HOME}/.foreman/bin`);
  } else {
    throw new Error(`Unsupported platform "${process.platform}"`);
  }
}

async function installTools(): Promise<void> {
  await exec("foreman install");
}

export default {
  getReleases,
  chooseRelease,
  chooseAsset,
  authenticate,
  addBinDirToPath,
  installTools
};
