import { Command } from "commander";

import StateContainer from "../../state-container";
import { destroy } from "../docker";

export function createDestroyCommand(program: Command, state: StateContainer) {
  program
    .command("destroy")
    .description("destroys container and state of project")
    .option("--all", "destroys all containers and state of all projects", false)
    .argument("<name>", "destroys project by name")
    .action(async (arg, props) => {
      const containersToDestroy: Array<string> = [];

      if (arg) {
        destroy(arg, state);
        return;
      }

      if (!props.all) {
        const realWorkingDirectory = process.cwd();
        const projectName = realWorkingDirectory.split("/").at(-1) as string;
        containersToDestroy.push(projectName);
      }

      containersToDestroy.forEach((container) => {
        destroy(container, state);
      });
    });
}
