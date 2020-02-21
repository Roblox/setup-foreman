import core from "@actions/core";
import github, { GitHub } from "@actions/github";
import semver from "semver";

const RELEASE_URL = "https://api.github.com/repos/rojo-rbx/foreman/releases";

interface GitHubAsset {
  name: string;
  url: string;
}

interface GitHubRelease {
  tag_name: string;
  assets: GitHubAsset[];
}

async function getReleases(octokit: GitHub): Promise<GitHubRelease[]> {
  const response = await octokit.repos.listReleases({
    owner: "rojo-rbx",
    repo: "foreman",
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
  let platformName;
  if (process.platform === "win32") {
    platformName = "windows";
  } else if (process.platform === "darwin") {
    platformName = "macos";
  } else if (process.platform === "linux") {
    platformName = "linux";
  } else {
    throw new Error(`Unsupported platform "${process.platform}"`);
  }

  for (const asset of release.assets) {
    if (asset.name.includes(platformName)) {
      return asset;
    }
  }

  return null;
}

function addToPath(): void {
  core.addPath("~/.foreman/bin");
}

export default {
  getReleases,
  chooseRelease,
  chooseAsset,
  addToPath
};
