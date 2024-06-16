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
  "\u007f": "Backspace",
};

export class PlayerController {
  constructor(isInputEnabled = false) {
    this.eventHandler = new EventEmitter();
    this.events = [];

    process.stdin.setRawMode(true);
    process.stdin.setEncoding("utf8");
    process.stdout.write("\x1b[?25l");
    process.stdin.on("data", (chunk) => {
      //process.stdout.clearLine();
      //process.stdout.cursorTo(0);
      const key = chunk.toString();
      if (typeof KEYS[key] === "undefined") {
        getTerminal().inputReceiver(key);
      } else {
        this.eventHandler.emit(KEYS[key]);
      }
    });

    global.getPlayerController = () => {
      return this;
    };
  }

  keyEvents() {
    return {
      Escape: () => {
        process.stdout.write("\x1b[?25h");
        process.exit();
      },
    };
  }

  defaultEvents() {
    return {
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

  freeEvents() {
    this.captureEvents();
  }

  captureEvents(bindings = {}) {
    this.eventHandler.removeAllListeners();
    let newBindings = { ...this.keyEvents(), ...bindings };
    for (const [event, callback] of Object.entries(newBindings)) {
      this.eventHandler.on(event, callback);
    }
  }
}
