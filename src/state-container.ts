import { homedir } from "os";
import {
  PathOrFileDescriptor,
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from "fs";

export default class StateContainer {
  private base = homedir() + "/.wdfx";
  private containerDb = `${this.base}/container.json`;

  constructor() {
    this.createConfigDir(homedir());

    if (!existsSync(this.containerDb)) {
      writeFileSync(this.containerDb, "[]");
    }
  }

  createConfigDir(hDir: string) {
    if (!existsSync(`${hDir}/.wdfx`)) {
      mkdirSync(`${hDir}/.wdfx`);
    }
  }

  getDbObj(file: PathOrFileDescriptor): any[] {
    const containersRaw = readFileSync(file, { encoding: "utf-8" });
    console.log(containersRaw);
    return JSON.parse(containersRaw);
  }

  saveToFile(
    file: PathOrFileDescriptor,
    data: string | NodeJS.ArrayBufferView
  ): void {
    const dataToSave = JSON.stringify(data);
    writeFileSync(file, dataToSave);
  }

  async saveContainer(containerName): Promise<string> {
    const container = this.getDbObj(this.containerDb);
    container.push(containerName);
    this.saveToFile(this.containerDb, containerName);
    return containerName;
  }

  async removeContainer(containerName: string): Promise<string> {
    const container = this.getDbObj(this.containerDb);
    console.log(container);

    const fileData = container.filter((x) => x != containerName);

    this.saveToFile(this.containerDb, fileData as any);
    return containerName;
  }

  async getAllContainers(): Promise<string[]> {
    return this.getDbObj(this.containerDb);
  }

  async containerExists(containerName: string): Promise<boolean> {
    return (await this.getAllContainers()).includes(containerName);
  }
}
