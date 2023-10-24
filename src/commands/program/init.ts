import { Command } from "commander";
import { homedir } from "os";
import { existsSync, mkdirSync } from "fs";
import { execSync } from "child_process";

import StateContainer from "../../state-container";
import ConfigManager from "../../config-manager";
import { destroy } from "../docker";

export function createInitCommand(program: Command, state: StateContainer) {
  program
    .command("init")
    .description("configured wdfx for your project")
    .action(async () => {
      const config = new ConfigManager();

      await config.init();
      const hDir = homedir();
      const dfxExists = existsSync("./dfx.json");
      if (!dfxExists) {
        console.error(
          "Error: must be in an existing icp project, maybe run wdfx new"
        );
        return;
      }
      if (!existsSync(`${hDir}/.wdfx`)) {
        mkdirSync(`${hDir}/.wdfx`);
        if (!existsSync(`${hDir}/.wdfx/containers`)) {
          mkdirSync(`${hDir}/.wdfx/containers`);
        }
        if (!existsSync(`${hDir}/.wdfx/state`)) {
          mkdirSync(`${hDir}/.wdfx/state`);
        }
      }

      const realWorkingDirectory = process.cwd();
      const projectName = realWorkingDirectory.split("/").at(-1);
      const volumes = `${realWorkingDirectory}:/root/dfx/${projectName}`;
      const image = config.getImage();
      const port = config.getPort();
      console.log(
        `creating dfx docker container for ${projectName} with image ${image}...`
      );
      try {
        execSync(
          `docker run -d --volume "${volumes}" -p ${port}:${port} --name ${projectName} ${image}`
        );
        await state.saveContainer(projectName);
      } catch (e) {
        if (e.message.includes("already in use")) {
          const containerExists = state.containerExists(projectName);
          if (!containerExists) {
            console.warn("project in bad state, cleaning up");
            destroy(projectName, state);
          } else {
            console.warn("INFO: project already initiated");
          }
        }
      }
    });
}
