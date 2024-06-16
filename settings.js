import { readFileSync } from "node:fs";
export class Settings {
  constructor() {
    const settingsJson = JSON.parse(readFileSync("./settings.json"));
    global.settings = settingsJson;
  }
}
