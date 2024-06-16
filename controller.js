import { EventEmitter } from "events";

const KEYS = {
  "\u001b": "Escape",
  "\u001b[A": "keyUp",
  "\u001b[B": "keyDown",
  "\u001b[C": "keyRight",
  "\u001b[D": "keyLeft",
  "\r": "Enter",
  "\n": "Enter",
  "\u0003": "ctrl+C",
  "\u007f": "backspace",
};

export class PlayerController {
  constructor(isInputEnabled = false) {
    this.eventHandler = new EventEmitter();
    this.stdin = process.stdin;
    this.stdout = process.stdout;
    this.stdin.setRawMode(true);
    this.stdin.setEncoding("utf8");
    this.stdout.write("\x1b[?25l");
    this.inputBuffer = "";

    this.events = [];

    this.isInputEnabled = isInputEnabled;

    this.stdin.on("data", (chunk) => {
      this.stdout.clearLine();
      this.stdout.cursorTo(0);
      const key = chunk.toString();
      if (typeof KEYS[key] === "undefined") {
        if (this.isInputEnabled) {
          this.inputBuffer += key;
          this.stdout.write(this.inputBuffer);
        }
      } else {
        this.eventHandler.emit(KEYS[key]);
      }
    });

    this.eventHandler.on("Escape", () => {
      this.stdout.write("\x1b[?25h");

      process.exit();
    });

    this.eventHandler.on("line", (line) => {
      console.log(`You entered: ${line}`);
    });

    global.getPlayerController = () => {
      return this;
    };
  }

  async awaitEnter() {
    return new Promise((resolve, reject) => {
      this.eventHandler.on("keyRight", () => {
        resolve();
      });
    });
  }

  enableInput() {
    this.isInputEnabled = true;
  }
  disableInput() {
    this.isInputEnabled = false;
    this.inputBuffer = "";
  }

  freeEvents() {
    this.eventHandler.removeAllListeners();
  }

  captureEvents(bindings = {}) {
    this.eventHandler.removeAllListeners();
    let newBindings = bindings;

    if (Object.entries(bindings).length <= 0) {
      newBindings = {
        keyUp: () => {
          getTerminal().clear();
          console.log("Up arrow pressed");
        },
        keyDown: () => {
          getTerminal().clear();
          console.log("Down arrow pressed");
        },
        keyLeft: () => {
          getTerminal().clear();
          console.log("Left arrow pressed");
        },
        keyRight: () => {
          getTerminal().clear();
          console.log("Right arrow pressed");
        },
      };
    }

    for (const [event, callback] of Object.entries(newBindings)) {
      this.eventHandler.on(event, callback);
    }
  }
}
