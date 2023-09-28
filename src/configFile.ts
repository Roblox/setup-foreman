import { parse } from "toml";
import { readFile } from "fs";
let findUp = require("find-up");
interface foremanConfig {
  tools: foremanTool[];
}

interface foremanTool {
  source?: string;
  github?: string;
  gitlab?: string;
  version: string;
}

const MANIFEST = "foreman.toml";

function checkSameOrgToolSpecs(manifestContent: foremanConfig): boolean {
  const tools = manifestContent.tools;
  if (tools == null) {
    throw new Error("Tools section in Foreman config not found");
  }

  const orgs: string[] = [];
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
    const org = source_array[0];

    if (org == null) {
      throw new Error(
        `Org not found in tool spec definition for: ${tool_name}`
      );
    }
    orgs.push(org.toLowerCase());
  }
  if (orgs.length == 0) {
    return true;
  }
  return orgs.every(val => val === orgs[0]);
}

async function checkSameOrgInConfig(): Promise<void> {
  const manifestPath = await findUp(MANIFEST);
  if (manifestPath == null) {
    throw new Error("Foreman config file could not be found");
  }

  await readFile(manifestPath, "utf8", (err, data) => {
    if (err) {
      throw new Error("Could not read Foreman config file");
    }
    const manifestContent = parse(data);
    const sameGithubOrgSource = checkSameOrgToolSpecs(manifestContent);
    if (sameGithubOrgSource == false) {
      throw new Error("Not all GitHub orgs are the same");
    }
  });
}

export default {
  checkSameOrgInConfig,
  checkSameOrgToolSpecs
};
