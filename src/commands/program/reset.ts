import { Command } from "commander";

import StateContainer from "../../state-container";
import { reset } from "../docker";

export function createResetCommand(program: Command, state: StateContainer) {
  program
    .command("reset")
    .description("restart wdfx container")
    .option("--all", "resets all containers and state of all projects", false)
    .option("--name", "resets project by name")
    .action(async (props) => {
      const containers: Array<string> = [];

      if (props.name) {
        containers.push(props.name);
        return;
      }

      if (!props.all) {
        const realWorkingDirectory = process.cwd();
        const projectName = realWorkingDirectory.split("/").at(-1) as string;
        containers.push(projectName);
      } else {
        containers.push(...(await state.getAllContainers()));
      }

      containers.forEach((container) => {
        reset(container);
      });
    });
}
