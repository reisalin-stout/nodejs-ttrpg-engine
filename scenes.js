const HUDROWS = 1;

export class Scene {
  constructor(scene) {
    getTerminal().clear();
    getTerminal().title(`Location: ${scene.id} | Type: ${scene.type}`);
    global.currentScene = () => {
      switch (scene.type) {
        case "narrative":
          return new Narrative(scene);
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
          this.sceneData.story[this.scenePoint].targets,
          (choice) => {
            console.log("You picked ", choice);
          }
        );
    }
  }

  next() {
    new Scene();
  }
}

class MultiChoice {
  constructor(options, targets, callback) {
    this.cursorIndex = -1;
    getTerminal().text("Choice:");
    this.cursorOrigin = getTerminal().displayedRows;

    getPlayerController().captureEvents({
      keyUp: () => {
        this.moveCursor(1);
      },
      keyDown: () => {
        this.moveCursor(1);
      },
      Enter: () => {
        getPlayerController().freeEvents();
        callback(this.cursorIndex);
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
      ? getTerminal().selected("Pick A")
      : getTerminal().unselected("Pick A");

    this.cursorIndex == 1
      ? getTerminal().selected("Pick B")
      : getTerminal().unselected("Pick B");

    getTerminal().numberedInput();
  }
}

class GroupThrow {
  constructor(options, targets) {
    this.cursorIndex = -1;
    getTerminal().text("Choice:");
    this.cursorOrigin = getTerminal().getRowIndex();

    getPlayerController().captureEvents({
      keyUp: () => {
        this.moveCursor(1);
      },
      keyDown: () => {
        this.moveCursor(1);
      },
      Enter: () => {
        console.log("you picked ", this.cursorIndex);
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
      ? getTerminal().selected("Pick A")
      : getTerminal().text("Pick A");

    this.cursorIndex == 1
      ? getTerminal().selected("Pick B")
      : getTerminal().text("Pick B");
  }
}
