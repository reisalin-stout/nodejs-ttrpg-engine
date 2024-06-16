import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { Terminal, Party, Adventure, Character } from "./classes.js";
global.SETTINGS = JSON.parse(readFileSync("./settings.json"));
global.CHAT = new Terminal();

class Game {
  constructor() {
    this.party = new Party();
    this.adventure = new Adventure();
  }
  async start() {
    global.CHAT.clear();
    global.CHAT.title("Welcome to Adventure Carryout!");
    global.CHAT.text("Press ENTER to begin.");
    await global.CHAT.await();

    this.party.init();
    global.CHAT.clear();
    global.CHAT.title("Character Selection");
    global.CHAT.text("Loaded the following characters:");
    this.party.show();
    global.CHAT.text("Press ENTER to select adventure.");
    await global.CHAT.await();

    await this.adventure.init();
    global.CHAT.clear();
    global.CHAT.title("Game Settings");
    global.CHAT.text("Starting:");
    this.adventure.show();
    global.CHAT.text("With the following characters:");
    this.party.show();

    global.CHAT.text("Press ENTER to confirm.");
    await global.CHAT.await();

    this.adventure.play();
  }
  /*
  async characterSelection() {
    
    global.CHAT.askNumber(
      (response) => {
        this.selectCharacters(response);
      },
      { min: 1, max: 4, message: "How many characters will be playing? (1-4)" }
    );
    
  }

  //Character loading and creation
  /*
  selectCharacters(partySize) {
    global.CHAT.askBinary(
      (onTrue) => {
        if (onTrue) {
          this.loadCharacter();
        } else {
          global.CHAT.warning("Character creation is not yet supported");
        }
      },
      { message: "Use existing character?" }
    );
  }
  loadCharacters() {}
  */
}

const GAME = new Game();
GAME.start();
