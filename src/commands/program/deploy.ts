import { userInfo } from "os";
import { Command } from "commander";

import StateContainer from "../../state-container";
import { containerReady } from "../docker";
import { spawn } from "child_process";
import ConfigManager from "../../config-manager";

export function createDeployCommand(program: Command, state: StateContainer) {
  program
    .command("deploy")
    .description(
      "Deploys all or a specific canister from the code in your project. By default, all canisters are deployed"
    )
    .argument(
      "<canisterName>",
      `Specifies the name of the canister you want to deploy. If you don’t specify a canister name, all canisters defined in the dfx.json file are deployed`
    )
    .option("--reinstall", "Force to reinstall")
    .option(
      "--noWallet",
      "Performs the create call with the user Identity as the Sender of messages. Bypasses the Wallet canister"
    )
    .action(async (canisterName, props) => {
      const config = new ConfigManager();
      const projectName = config.getName();

      console.log({ projectName });

      // let isContainerReady = false;
      // while (!isContainerReady) {
      //   isContainerReady = await containerReady(projectName, state);
      // }
      // if (isContainerReady) {
      let userI = userInfo();
      let shellCommand = "sh /root/dfx/deploy.sh";

      if (canisterName) {
        shellCommand += " " + canisterName;
      }

      if (props.reinstall) {
        shellCommand += " --reinstall";
      }

      if (props.noWallet) {
        shellCommand += " --no-wallet";
      }

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
          "-c",
          shellCommand,
        ],
        {
          cwd: process.cwd(),
          detached: true,
          stdio: "inherit",
        }
      );
      // }
    });
}
