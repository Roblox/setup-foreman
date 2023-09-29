import {parse} from "toml";
import {readFile} from "fs";
import findUp from "find-up";
interface foremanConfig {
  tools: {
    [tool_name: string]: foremanTool;
  };
}

interface foremanTool {
  source?: string;
  github?: string;
  gitlab?: string;
  version: string;
}

const MANIFEST = "foreman.toml";

function checkSameOrgToolSpecs(
  manifestContent: foremanConfig,
  org: string
): boolean {
  const tools = manifestContent.tools;
  if (tools == null) {
    throw new Error("Tools section in Foreman config not found");
  }

  for (const tool_name in tools) {
    const tool_spec = tools[tool_name];
    let source = tool_spec["source"];
    if (source == null) {
      source = tool_spec["github"];
    }
    if (source == null) {
      continue;
    }

    const source_array = source.split("/");
    const tool_org = source_array[0];

    if (tool_org == null) {
      throw new Error(
        `Org not found in tool spec definition for: ${tool_name}`
      );
    }

    if (tool_org != org) {
      return false;
    }
  }
  return true;
}

async function checkSameOrgInConfig(org: string): Promise<void> {
  const manifestPath = await findUp(MANIFEST);
  if (manifestPath == null) {
    throw new Error("setup-foreman could not find Foreman config file");
  }

  await readFile(manifestPath, "utf8", (err, data) => {
    if (err) {
      throw new Error("setup-foreman Could not read Foreman config file");
    }
    const manifestContent = parse(data);
    const sameGithubOrgSource = checkSameOrgToolSpecs(manifestContent, org);
    if (sameGithubOrgSource == false) {
      throw new Error(
        `All GitHub orgs in Foreman config must match the org setup-foreman runs in: ${org}. To disable this check, set the \"allow-external-github-orgs\" option to true.`
      );
    }
  });
}

export default {
  checkSameOrgInConfig,
  checkSameOrgToolSpecs
};
