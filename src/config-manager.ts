import { existsSync, readFileSync, mkdirSync, writeFileSync } from "fs";
import path from "path";
import { check } from "tcp-port-used";
import { findPort } from "find-open-port";

export interface Config {
  name: string;
  image: string; // TODO: Remove, this is for avoid erros whit current code
  docker: {
    image: string;
  };
  dfx: {
    privateKey: string;
    hostPort: number;
  };
}

export interface CreateConfigOptions {
  port?: number;
  path: string;
  language?: DfxLanguages;
}

export type DfxLanguages = "motoko" | "rust" | "typescript";

export default class ConfigManager {
  private config: Config = undefined;

  private configFile = "";
  private defaultConfig = {
    image: "cryptoisgood/wdfx:latest",
    dfx: {
      privateKey: "",
      hostPort: 8000,
    },
  };

  constructor(path?: string) {
    this.configFile = path ? `${path}/wdfx.json` : "wdfx.json";
    this.config = this.getConfig();
  }

  private getConfig() {
    try {
      const fileContains = readFileSync("wdfx.json", { encoding: "utf-8" });
      const config = JSON.parse(fileContains);
      return config;
    } catch (error) {
      console.log("wdfx.json file not found");
      return;
    }
  }

  private async setDfxHostPort(port?: number) {
    if (!port) return this.findAvailablePort();

    const inUse = await check(port);

    if (!inUse) return port;

    throw new Error(`Port ${port} is not available`);
  }

  private async findAvailablePort(): Promise<number> {
    const webPort = 8000;
    let openPort = 0;

    for (let i = webPort; i < 9000; i++) {
      const isOpenPort = await findPort.isAvailable(i);
      if (isOpenPort) {
        openPort = i;
        break;
      }
    }

    if (openPort === 0) throw new Error("No ports available");

    return openPort;
  }

  private getDockerImage(languaje: DfxLanguages): string {
    switch (languaje) {
      case "motoko":
        return "idealizer/dfx-motoko";
      case "rust":
        return "idealizer/dfx-rust";
      case "typescript":
        return "idealizer/dfx-typescript";
      default:
        return "idealizer/dfx-motoko";
    }
  }

  public async create(name: string, options: CreateConfigOptions) {
    const hostPort = await this.setDfxHostPort(options.port);
    const dockerImage = this.getDockerImage(options.language);

    const config = {
      name,
      image: dockerImage,
      docker: {
        image: dockerImage,
      },
      dfx: {
        privateKey: "",
        hostPort,
      },
    };

    const filePath = path.resolve(options.path, "wdfx.json");

    writeFileSync(filePath, JSON.stringify(config));

    this.config = config;

    return config;
  }

  async init() {
    if (!existsSync(this.configFile)) {
      let openPort = await this.findAvailablePort();

      const usingConfig = this.defaultConfig;
      usingConfig.dfx.hostPort = openPort;
      writeFileSync(this.configFile, JSON.stringify(usingConfig));
    }
  }

  getName() {
    return this.config.name;
  }

  getPort() {
    return this.config.dfx.hostPort;
  }

  getImage() {
    return this.config.docker.image;
  }
}

// const config = new ConfigManager();
// config.create("test", { path: "" });
// const port = config.getPort();
// const image = config.getImage();
// console.log({ port, image });
