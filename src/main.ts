import { getInput, debug, addPath, setFailed } from "@actions/core";
import { downloadTool, extractZip } from "@actions/tool-cache";
import { GitHub, context } from "@actions/github";
import { resolve } from "path";
import { exec } from "@actions/exec";
import configFile from "./configFile";
import foreman from "./foreman";

async function run(): Promise<void> {
  try {
    const versionReq: string = getInput("version");
    const githubToken: string = getInput("token");
    const workingDir: string = getInput("working-directory");
    const allowExternalGithubOrgs: string = getInput(
      "allow-external-github-orgs"
    ).toLowerCase();

    if (allowExternalGithubOrgs != "true") {
      const repo = context.payload.repository;
      if (repo == null) {
        throw new Error(`Could not find repository`);
      }
      const org = repo.owner.name;
      if (org == null) {
        throw new Error(`Could not find owner of the repository. repo: ${JSON.stringify(repo)}`);
      }
      configFile.checkSameOrgInConfig(org);
    }

    const octokit = new GitHub(githubToken);
    const releases = await foreman.getReleases(octokit);
    debug("Choosing release from GitHub API");

    const release = foreman.chooseRelease(versionReq, releases);
    if (release == null) {
      throw new Error(
        `Could not find Foreman release for version ${versionReq}`
      );
    }

    debug(`Chose release ${release.tag_name}`);

    const asset = foreman.chooseAsset(release);
    if (asset == null) {
      throw new Error(
        `Could not find asset for version ${release.tag_name} on platform ${process.platform}`
      );
    }

    debug(`Chose release asset ${asset.browser_download_url}`);

    const zipPath = await downloadTool(asset.browser_download_url);
    const extractedPath = await extractZip(zipPath, ".foreman-install");
    addPath(resolve(extractedPath));

    if (process.platform === "darwin" || process.platform === "linux") {
      await exec("chmod +x .foreman-install/foreman");
    }

    await foreman.authenticate(githubToken);
    foreman.addBinDirToPath();

    if (workingDir !== undefined && workingDir !== null && workingDir !== "") {
      process.chdir(workingDir);
    }
    await foreman.installTools();
  } catch (error) {
    if (error instanceof Error) {
      setFailed(error.message);
    }
  }
}

run();
