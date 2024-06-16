import { Settings } from "./settings.js";
import { Terminal } from "./terminal.js";
import { PlayerController } from "./controller.js";
import { Scene } from "./scenes.js";

import { readFileSync } from "node:fs";
const adventure = JSON.parse(
  readFileSync("./adventures/fallen-in-the-mine.json")
);

class GameInstance {
  constructor() {
    global.getGameInstance = () => {
      return this;
    };
  }
}

const SETTINGS = new Settings();
const GAMEINSTANCE = new GameInstance();
const TERMINAL = new Terminal();
const PLAYERCONTROLLER = new PlayerController();
const SCENE = new Scene(adventure.nodes[0]);
