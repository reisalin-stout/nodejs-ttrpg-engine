import readline from "node:readline";
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import crypto from "node:crypto";
import { resolve } from "node:path";

function loadFiles(location) {
  let list = readdirSync(location);
  let data = list.map((filename) => {
    let currentFile = JSON.parse(readFileSync(`${location}/${filename}`));
    return currentFile;
  });
  return data;
}

function createHash(data, len) {
  return crypto
    .createHash("shake256", { outputLength: len })
    .update(data)
    .digest("hex");
}

const BLACK = "30m";
const RED = "31m";
const GREEN = "32m";
const YELLOW = "33m";
const BLUE = "34m";
const MAGENTA = "35m";
const CYAN = "36m";
const WHITE = "37m";

export class Terminal {
  constructor() {
    this.i = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
  }

  clear() {
    console.clear();
  }
  await() {
    return new Promise((resolve, reject) => {
      this.i.question("", (response) => {
        resolve(true);
      });
    });
  }
  question(callback) {
    this.i.question("", (response) => {
      callback(response);
    });
  }
  quit() {
    this.i.close();
  }

  //Text functions
  out(text, color = WHITE) {
    console.log(`\x1b[${color} ${text}\x1b[${WHITE}`);
  }
  text(text) {
    this.out(text, WHITE);
  }
  title(text) {
    this.out(text, BLUE);
  }
  message(text) {
    this.out(text, YELLOW);
  }
  warning(text) {
    this.out(text, RED);
  }

  //Ask functions
  askBinary(
    callback = () => {},
    { message = "", warning = "", question = "" } = {}
  ) {
    let parameters = {
      message: message,
      warning: warning.replace("Invalid Selection.", ""),
      question: question,
    };
    this.clear();
    if (message.length > 0) {
      this.message(message);
    }
    this.out("(yes/no)");
    if (warning.length > 0) {
      this.warning(warning);
    }

    this.i.question(question, (response) => {
      let formattedResponse = response.toLowerCase();
      switch (true) {
        case formattedResponse == "yes" || formattedResponse == "y":
          callback(true);
          break;
        case formattedResponse == "no" || formattedResponse == "n":
          callback(false);
          break;
        default:
          parameters.warning =
            parameters.warning.length > 0
              ? warningMessage + "\nInvalid Selection."
              : "Invalid Selection.";
          this.askBinary(callback, parameters);
          break;
      }
    });
  }
  askNumber(
    callback = () => {},
    { min = 0, max = 100, message = "", warning = "", question = "" } = {}
  ) {
    let parameters = {
      min: min,
      max: max,
      message: message,
      warning: warning.replace("Invalid Selection.", ""),
      question: question,
    };
    this.clear();
    if (message.length > 0) {
      this.message(message);
    }
    if (warning.length > 0) {
      this.warning(warning);
    }

    this.i.question(question, (response) => {
      let choice = parseInt(response);
      switch (true) {
        case choice >= min && choice <= max:
          callback(choice);
          break;
        default:
          parameters.warning =
            parameters.warning.length > 0
              ? warningMessage + "\nInvalid Selection."
              : "Invalid Selection.";
          this.askNumber(callback, parameters);
          break;
      }
    });
  }

  askMultiple(
    options,
    callback = () => {},
    { offset = 0, message = "", warning = "", question = "" } = {}
  ) {
    let parameters = {
      offset: offset,
      message: message,
      warning: warning.replace("Invalid Selection.", ""),
      question: question,
    };
    this.clear();
    if (message.length > 0) {
      this.message(message);
    }

    for (
      let c = 1;
      c <= global.SETTINGS.optionslength && c + offset <= options.length;
      c++
    ) {
      this.out(`${c}. ${options[c + offset - 1]}`);
    }
    if (offset > 0) {
      this.out(`0. PREV`);
    }
    if (offset + global.SETTINGS.optionslength - 1 < options.length) {
      this.out(`9. NEXT`);
    }

    if (warning.length > 0) {
      this.warning(warning);
    }

    this.i.question(question, (response) => {
      let choice = parseInt(response);
      switch (true) {
        case choice > 0 && choice <= global.SETTINGS.optionslength: //Need to add veirfication for less than max length options
          callback(choice - 1 + offset);
          break;
        case offset > 0 && choice == 0:
          parameters.offset -= global.SETTINGS.optionslength;
          this.askMultiple(options, callback, parameters);
          break;
        case offset + global.SETTINGS.optionslength - 1 < options.length &&
          choice == 9:
          parameters.offset += global.SETTINGS.optionslength;
          this.askMultiple(options, callback, parameters);
          break;
        default:
          parameters.warning =
            parameters.warning.length > 0
              ? warningMessage + "\nInvalid Selection."
              : "Invalid Selection.";
          this.askMultiple(options, callback, parameters);
          break;
      }
    });
  }
}

export class Adventure {
  constructor() {
    this.adventure = {};
  }

  init() {
    return new Promise((resolve, reject) => {
      const ADVENTURES = loadFiles(global.SETTINGS.adventures);
      let adventureNames = ADVENTURES.map((adventure) => {
        return adventure.softname;
      });
      global.CHAT.askMultiple(
        adventureNames,
        (choice) => {
          this.adventure = ADVENTURES[choice];
          resolve();
        },
        {
          message: "Please select the adventure to play:",
        }
      );
    });
  }
  show() {
    global.CHAT.text("- " + this.adventure.softname + " -");
  }

  play() {}
}

export class Party {
  constructor() {
    this.characters = [];
  }

  init() {
    let charactersPaths = readdirSync(global.SETTINGS.characters);
    this.characters = charactersPaths.map((path) => {
      let currentCharacter = new Character();
      currentCharacter.load(global.SETTINGS.characters + "/" + path);
      return currentCharacter;
    });
  }

  show() {
    global.CHAT.text(
      this.characters.reduce((chain, character) => {
        return chain + `- ${character.name} `;
      }, "") + "-"
    );
  }
}

export class Character {
  constructor() {
    this.filename = "";
    this.name = "";
    this.story = "";
    this.grade = "";
    this.hp = 10;
    this.stamina = 3;
    this.traits = [];
    this.skills = [];
    this.items = [];
    this.states = [];
  }

  load(file) {
    let data = JSON.parse(readFileSync(file));

    this.filename = file;
    this.name = data.name;
    this.story = data.story;
    this.grade = data.grade;
    this.hp = data.hp;
    this.stamina = data.stamina;
    this.traits = data.traits;
    this.skills = data.skills;
    this.items = data.items;
    this.states = data.states;
  }

  save(overwrite = true) {
    if (!overwrite) {
      this.filename = "";
      this.filename = `${createHash(JSON.stringify(this), 16)}.json`;
    }
    writeFileSync(
      `${global.SETTINGS.characters}/${this.filename}`,
      JSON.stringify(this, null, 2)
    );
  }
}
