import { execSync, spawn } from "child_process";
import { userInfo } from "os";
import { Docker } from "node-docker-api";

import StateContainer from "../../state-container";
import { DfxLanguages } from "../../config-manager";

const docker = new Docker({ socketPath: "/var/run/docker.sock" });
docker.version().then();

export interface CreateContainerOptions {
  projectName: string;
  image: string;
  port: number;
  language: DfxLanguages;
}

export async function createContainer(
  options: CreateContainerOptions,
  state: StateContainer
) {
  const { projectName, image, port, language } = options;
  const realWorkingDirectory = process.cwd();

  console.log({ realWorkingDirectory });

  console.log({ options });

  const volumes = `${realWorkingDirectory}/${projectName}:/root/dfx/${projectName}`;
  console.log(
    `creating dfx docker container for ${projectName} with image ${image}...`
  );

  try {
    // docker.container.create({
    //   Image: image,
    //   Names: [projectName],
    //   HostConfig: {
    //     Binds: [volumes],
    //     PortBindings: {
    //       [`${port}/tcp`]: [
    //         {
    //           HostPort: `${port}`,
    //         },
    //       ],
    //     },
    //   },
    // });

    console.log(
      `docker run -d --volume "${volumes}" -p ${port}:${port} --name ${projectName} ${image}`
    );

    execSync(
      `docker run -d --volume "${volumes}" -p ${port}:${port} --name ${projectName} ${image}`
    );
    // await state.saveContainer(projectName);
  } catch (error) {
    throw error;
  }

  // let isContainerReady = false;
  // while (!isContainerReady) {
  //   isContainerReady = await containerReady(projectName, state);
  // }

  const userI = userInfo();

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
    `sh /root/dfx/new.sh ${projectName}`,
  ];

  if (language) {
    args.push("--type");
    args.push(language);
  }

  spawn("docker", args, {
    cwd: process.cwd(),
    detached: true,
    stdio: "inherit",
  });
}

export async function containerReady(
  projectName: string,
  state: StateContainer
): Promise<boolean> {
  const exists = await state.containerExists(projectName);
  if (!exists) {
    return false;
  }

  try {
    const dockerContainer = await docker.container.get(projectName);
    const containerWithStatus = await dockerContainer.status();
    const data: any = containerWithStatus.data;
    if (data.State.OOMKilled || data.State.Dead || data.State.Paused) {
      console.error("ERROR: container is " + data.State.Status);
      console.error("ERROR: maybe run wdfx reset?");
      process.abort();
    }

    return data.State.Running;
  } catch (e) {
    return false;
  }
}

export function destroy(container, state) {
  console.log("stopping dfx docker container...");
  const stdout = execSync(`docker stop ${container}`);
  console.log(stdout.toString("utf8"));
  console.log("deleting dfx docker container...");
  const stdout2 = execSync(`docker rm ${container}`);
  console.log(stdout2.toString("utf8"));
  state.removeContainer(container).then();
}

export function reset(container: string) {
  console.log("restart dfx docker container...");
  const stdout = execSync(`docker restart ${container}`);
  console.log(stdout.toString("utf8"));
}
