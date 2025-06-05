import configFile from "../src/configFile";
import foreman from "../src/foreman";
import type { GitHubRelease } from "../src/foreman";
import { parse } from "toml";
test("get off my back, Jest", () => {
  expect(5).toEqual(5);
});

test("checkSameOrgToolSpec same org", () => {
  let config = `
    [tools]\n
    tool1 = { source = "org1/tool1", version = "1.0.0" }\n
    tool2 = { source = "org1/tool2", version = "1.0.0" }\n
    tool3 = { source = "org1/tool3", version = "1.0.0" }\n
  `;
  let manifestContent = parse(config);
  expect(configFile.checkSameOrgToolSpecs(manifestContent, "org1", [])).toEqual(
    true
  );
});

test("checkSameOrgToolSpec different org", () => {
  let config = `
    [tools]\n
    tool1 = { source = "org1/tool1", version = "1.0.0" }\n
    tool2 = { source = "org2/tool2", version = "1.0.0" }\n
    tool3 = { source = "org1/tool3", version = "1.0.0" }\n
  `;
  let manifestContent = parse(config);
  expect(configFile.checkSameOrgToolSpecs(manifestContent, "org1", [])).toEqual(
    false
  );
});

test("checkSameOrgToolSpec external org allowed with allowList", () => {
  let config = `
    [tools]\n
    tool1 = { source = "org1/tool1", version = "1.0.0" }\n
    tool2 = { source = "org2/tool2", version = "1.0.0" }\n
    tool3 = { source = "org1/tool3", version = "1.0.0" }\n
  `;
  let manifestContent = parse(config);
  expect(
    configFile.checkSameOrgToolSpecs(manifestContent, "org1", ["org2"])
  ).toEqual(true);
});

test("checkSameOrgToolSpec external org allowed case-insensitive", () => {
  let config = `
    [tools]\n
    tool1 = { source = "org1/tool1", version = "1.0.0" }\n
    tool2 = { source = "ORG2/tool2", version = "1.0.0" }\n
  `;
  let manifestContent = parse(config);
  expect(
    configFile.checkSameOrgToolSpecs(manifestContent, "org1", ["org2"])
  ).toEqual(true);
});

test("filter valid releases", () => {
  const releases: GitHubRelease[] = [
    {
      tag_name: "v1.0.0",
      assets: []
    },
    {
      tag_name: "v2.1.0",
      assets: []
    },
    {
      tag_name: "v3.0.0-rc.1",
      assets: []
    },
    {
      tag_name: "notvalidsemver",
      assets: []
    },
    {
      tag_name: "4.3.0",
      assets: []
    },
    {
      tag_name: "verybadtag",
      assets: []
    }
  ];

  const expectedFilteredReleases: GitHubRelease[] = [
    {
      tag_name: "v1.0.0",
      assets: []
    },
    {
      tag_name: "v2.1.0",
      assets: []
    },
    {
      tag_name: "v3.0.0-rc.1",
      assets: []
    }
  ];
  const filteredReleases = foreman.filterValidReleases(releases);
  expect(filteredReleases).toEqual(expectedFilteredReleases);
});
