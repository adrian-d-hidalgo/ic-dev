import { Command } from "commander";
import { mkdirSync } from "fs";
import path from "path";

import StateContainer from "../../state-container";
import ConfigManager, {
  CreateConfigOptions,
  DfxLanguages,
} from "../../config-manager";
import { createContainer } from "../docker";

interface CreateNewCommandOptions {
  language?: DfxLanguages;
  path?: string;
}

export function createNewCommand(program: Command, state: StateContainer) {
  program
    .command("new")
    .description("creates new wdfx project")
    .argument("<Project-name>", "Specifies the name of the project to create")
    .option(
      "--language <language>",
      "Choose the type of canister in the starter project. Default to be motoko [default: motoko] [possible values: motoko, rust]",
      "motoko"
    )
    .option("--path <path>", "Define folder path for the installation", "")
    .action(async (projectName: string, options: CreateNewCommandOptions) => {
      const projectPath = options.path
        ? path.resolve(options.path, projectName)
        : path.resolve(".", projectName);

      mkdirSync(projectPath);

      const configOptions: CreateConfigOptions = {
        path: projectPath,
        language: options.language,
      };

      const config = new ConfigManager("./" + projectName);
      await config.create(projectName, configOptions);

      const createContainerOptions = {
        projectName,
        image: config.getImage(),
        port: config.getPort(),
        language: options.language,
      };

      createContainer(createContainerOptions, state);
    });
}
