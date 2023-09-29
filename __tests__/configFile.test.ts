import configFile from "../src/configFile";
import {parse} from "toml";

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
  expect(configFile.checkSameOrgToolSpecs(manifestContent, "org1")).toEqual(
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
  expect(configFile.checkSameOrgToolSpecs(manifestContent, "org1")).toEqual(
    false
  );
});
