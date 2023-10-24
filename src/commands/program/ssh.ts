import { Command } from "commander";
import { userInfo } from "os";
import { spawn } from "child_process";

import StateContainer from "../../state-container";
import { containerReady } from "../docker";

export function createSshCommand(program: Command, state: StateContainer) {
  program
    .command("ssh")
    .description(
      "allows you to enter wdfx environment and execute dfx commands directly. for advanced users only"
    )
    .action(async (props) => {
      const realWorkingDirectory = process.cwd();
      const projectName = realWorkingDirectory.split("/").at(-1) as string;
      let isContainerReady = false;
      while (!isContainerReady) {
        isContainerReady = await containerReady(projectName, state);
      }
      if (isContainerReady) {
        let userI = userInfo();
        spawn(
          "docker",
          [
            "exec",
            "-w",
            `/root/dfx/${projectName}`,
            "-e",
            `HOST_UID=${userI.uid}`,
            "-it",
            `${projectName}`,
            "/bin/bash",
          ],
          {
            cwd: process.cwd(),
            detached: true,
            stdio: "inherit",
          }
        );
      }
    });
}
