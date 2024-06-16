const HUDROWS = 1;
let adv;
export class Scene {
  constructor(adventure) {
    this.adventure = adventure;
    adv = adventure;
    this.scene = this.adventure.nodes[0];
    getTerminal().clear();
    getTerminal().title(
      `Location: ${this.scene.id} | Type: ${this.scene.type}`
    );
    global.currentScene = () => {
      switch (this.scene.type) {
        case "narrative":
          return new Narrative(this.scene);
      }
    };
    currentScene();
  }
}

class Narrative {
  constructor(scene) {
    this.sceneData = scene;
    this.scenePoint = 0;

    getPlayerController().captureEvents({
      Enter: () => {
        this.play();
      },
    });
    this.startScene();
  }

  findScene(id) {
    let targetScene = adv.nodes.find((obj) => obj.id === id);
    return targetScene;
  }

  startScene() {
    this.scenePoint = 0;
    this.play();
  }

  play() {
    if (this.scenePoint >= this.sceneData.story.length) {
      console.log("End");
      return;
    }
    switch (this.sceneData.story[this.scenePoint].command) {
      case "present":
        getTerminal().paragraph(this.sceneData.story[this.scenePoint].value);
        this.scenePoint += 1;
        break;
      case "clearScreen":
        getTerminal().clearTerminalFromLine(HUDROWS);
        this.scenePoint += 1;
        this.play();
        break;
      case "multiChoice":
        new MultiChoice(
          this.sceneData.story[this.scenePoint].options,
          this.sceneData.story[this.scenePoint].response,
          this.sceneData.story[this.scenePoint].targets,
          (choice) => {
            console.log(this.findScene(choice));
          }
        );
        break;
      case "groupThrow":
        new GroupThrow();
    }
  }

  next() {
    new Scene();
  }
}

class MultiChoice {
  constructor(options, response, targets, callback) {
    this.options = options;
    this.response = response;
    this.targets = targets;

    this.completed = false;
    this.cursorIndex = -1;
    getTerminal().text("Choice:");
    this.cursorOrigin = getTerminal().displayedRows;

    getPlayerController().captureEvents({
      keyUp: () => {
        if (!this.completed) {
          this.moveCursor(1);
        }
      },
      keyDown: () => {
        if (!this.completed) {
          this.moveCursor(1);
        }
      },
      Enter: () => {
        if (this.completed) {
          getPlayerController().freeEvents();
          callback(this.targets[this.cursorIndex]);
        } else if (this.cursorIndex >= 0) {
          getTerminal().newLine();
          getTerminal().slowText(this.response[this.cursorIndex]);
          this.completed = true;
        }
      },
    });
    this.draw();
  }

  moveCursor(distance) {
    getTerminal().clearLastNLines(2);
    this.cursorIndex = Math.abs(this.cursorIndex + distance) % 2;
    this.draw();
  }

  draw() {
    this.cursorIndex == 0
      ? getTerminal().selected(this.options[0])
      : getTerminal().unselected(this.options[0]);

    this.cursorIndex == 1
      ? getTerminal().selected(this.options[1])
      : getTerminal().unselected(this.options[1]);
  }

  respond() {}
}

class GroupThrow {
  constructor() {
    getTerminal().text("Insert Result:");

    getTerminal().enableInput((result) => {
      console.log("you typed", result);
    });
  }
}
