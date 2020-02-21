import * as core from "@actions/core";
import * as tc from "@actions/tool-cache";
import foreman from "./foreman";

async function run(): Promise<void> {
  try {
    const versionReq: string = core.getInput("version");

    const releases = await foreman.getReleases();

    const release = foreman.chooseRelease(versionReq, releases);
    if (release == null) {
      throw new Error(`Could not find Foreman release for version ${ versionReq }`);
    }

    const asset = foreman.chooseAsset(release);
    if (asset == null) {
      throw new Error(`Could not find asset for version ${ release.tag_name } on platform ${ process.platform }`);
    }

    const zipPath = await tc.downloadTool(asset.url);
    const extractedPath = await tc.extractZip(zipPath, ".foreman-install");
    core.addPath(".foreman-install");
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
