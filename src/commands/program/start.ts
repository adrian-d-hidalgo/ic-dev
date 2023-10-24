import { userInfo } from "os";
import { Command } from "commander";
import { spawn } from "child_process";

import ConfigManager from "../../config-manager";
import StateContainer from "../../state-container";
import { containerReady } from "../docker";

export function createStartCommand(program: Command, state: StateContainer) {
  program
    .command("start")
    .option("--background", "Cleans the state of the current project")
    .option("--clean", "Cleans the state of the current project")
    .description(
      "Starts the local replica and a web server for the current project"
    )
    .action(async (source) => {
      const config = new ConfigManager();
      const projectName = config.getName();
      // const ready = await containerReady(projectName, state);
      // if (ready) {
      const port = config.getPort();
      let userI = userInfo();
      let dfxStart = `sh /root/dfx/start.sh --host 127.0.0.1:${port}`;

      if (source.background) {
        dfxStart = dfxStart + " --background";
      }

      if (source.clean) {
        dfxStart = dfxStart + " --clean";
      }

      const args = [
        "exec",
        "-w",
        `/root/dfx/${projectName}`,
        "-e",
        `HOST_UID=${userI.uid}`,
        "-it",
        `${projectName}`,
        "/bin/bash",
        "-c",
        dfxStart,
      ];

      if (source.clean) {
        args.push("--clean");
      }

      const shell = spawn("docker", args, { stdio: "inherit" });
      shell.on("close", (code) => {
        console.log("[shell] terminated :", code);
      });
      await new Promise((resolve) => setTimeout(resolve, 3000));
      // } else {
      //   console.log("INFO: container is stopped run wdfx reset");
      // }
    });
}
