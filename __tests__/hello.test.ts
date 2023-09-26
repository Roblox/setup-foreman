// who needs tests?
import configFile from "../src/configFile";
import { parse } from "toml";

test("get off my back, Jest", () => {
  expect(5).toEqual(5);
});

test("checkSameOrgToolSpec same org", () => {
  let config = `
    [tools]\n
    rojo = { source = "Roblox/Rojo-rbx-rojo", version = "6.2.0" }\n
    selene = { source = "Roblox/Kampfkarren-selene", version = "0.18" }\n
    stylua = { source = "Roblox/JohnnyMorganz-StyLua", version = "0.13" }\n
    luau-analyze = { source = "Roblox/JohnnyMorganz-luau-analyze-rojo", version = "0.527" }\n
    darklua = { gitlab = "Roblox/seaofvoices-darklua", version = "0.7.0" }\n
  `;
  let manifestContent = parse(config);
  expect(configFile.checkSameOrgToolSpecs(manifestContent)).toEqual(true);
});

test("checkSameOrgToolSpec different org", () => {
  let config = `
    [tools]\n
    rojo = { source = "Rojo-rbx/rojo", version = "6.2.0" }\n
    selene = { source = "Roblox/Kampfkarren-selene", version = "0.18" }\n
    stylua = { source = "Roblox/JohnnyMorganz-StyLua", version = "0.13" }\n
    luau-analyze = { source = "Roblox/JohnnyMorganz-luau-analyze-rojo", version = "0.527" }\n
    darklua = { gitlab = "Roblox/seaofvoices-darklua", version = "0.7.0" }\n
  `;
  let manifestContent = parse(config);
  expect(configFile.checkSameOrgToolSpecs(manifestContent)).toEqual(false);
});
