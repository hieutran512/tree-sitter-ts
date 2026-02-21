import { createYamlProfile } from "./common.js";

export const toml = createYamlProfile(
    "toml",
    "TOML",
    [".toml"],
    ["application/toml", "text/toml"],
);
