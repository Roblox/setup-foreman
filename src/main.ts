import * as core from "@actions/core";
import * as tc from "@actions/tool-cache";
import * as github from "@actions/github";
import {exec} from "@actions/exec";
import foreman from "./foreman";

async function run(): Promise<void> {
  try {
    const versionReq: string = core.getInput("version");
    const githubToken: string = core.getInput("token");

    const octokit = new github.GitHub(githubToken);
    const releases = await foreman.getReleases(octokit);

    const release = foreman.chooseRelease(versionReq, releases);
    if (release == null) {
      throw new Error(
        `Could not find Foreman release for version ${versionReq}`
      );
    }

    core.debug(`Chose release ${release.tag_name}`);

    const asset = foreman.chooseAsset(release);
    if (asset == null) {
      throw new Error(
        `Could not find asset for version ${release.tag_name} on platform ${process.platform}`
      );
    }

    core.debug(`Chose release asset ${asset.browser_download_url}`);

    const zipPath = await tc.downloadTool(asset.browser_download_url);
    const extractedPath = await tc.extractZip(zipPath, ".foreman-install");
    core.addPath(extractedPath);

    if (process.platform === "darwin" || process.platform === "linux") {
      await exec("chmod +x .foreman-install/foreman");
    }

    await foreman.authenticate(githubToken);
    foreman.addBinDirToPath();
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
