import { createYamlProfile } from "./common.js";

export const yaml = createYamlProfile(
    "yaml",
    "YAML",
    [".yaml", ".yml"],
    ["application/x-yaml", "text/yaml"],
);
