function sleep(ms) {
  const start = Date.now();
  while (Date.now() - start < ms) {}
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
    this.debugRows = false;
    this.displayedRows = 0;
    this.cursorPosition = 0;
    this.clear();

    global.getTerminal = () => {
      return this;
    };
  }

  /*
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
*/
  //Text functions
  write(string) {
    process.stdout.write(string);
  }
  paragraph(text) {
    const resultArray = text.split(/[\r\n]+/).filter(Boolean);
    for (let i = 0; i < resultArray.length; i++) {
      this.line(resultArray[i], { color: WHITE, delayed: true, tabs: 1 });
    }
    this.write(`\n`);
    this.displayedRows++;
    this.cursorPosition++;
  }
  line(
    text,
    { color = WHITE, reverse = false, delayed = false, tabs = 0 } = {}
  ) {
    function tabber(n) {
      let space = "";
      for (let t = 0; t < tabs; t++) {
        space += global.settings.tabDisplay;
      }
      return space;
    }

    let header = `${reverse ? "\x1b[7m" : ""}\x1b[${color}${
      this.debugRows
        ? this.cursorPosition + "-" + this.displayedRows + ". "
        : ""
    }${tabber(tabs)}`;
    let formattedText = text.replace(/[\r\n]+/g, " ");
    let footer = `\x1b[${WHITE}${reverse ? "\x1b[0m" : ""}\n`;

    this.write(header);
    if (!delayed) {
      this.write(formattedText);
    } else {
      for (let i = 0; i < formattedText.length; i++) {
        this.write(formattedText[i]);
        sleep(global.settings.textSpeed);
      }
    }
    this.write(footer);

    this.displayedRows++;
    this.cursorPosition++;
  }

  //Text Options
  selected(text) {
    this.line(text, { color: WHITE, reverse: true, tabs: 2 });
  }
  unselected(text) {
    this.line(text, { color: WHITE, reverse: false, tabs: 2 });
  }
  text(text) {
    this.line(text, { color: WHITE, tabs: 1 });
  }
  title(text) {
    this.line(text, { color: BLUE });
  }
  message(text) {
    this.line(text, { color: YELLOW });
  }
  warning(text) {
    this.line(text, { color: RED });
  }

  //Terminal Line Management
  moveToLine(line) {
    this.cursorPosition = line;
    this.write(`\x1b[${line + 1};0H`);
  }

  clearLine(line) {
    this.moveToLine(line);
    this.write("\x1b[K");
    this.displayedRows--;
    this.moveToLine(this.displayedRows);
  }

  clearTerminalFromLine(line) {
    this.moveToLine(line);
    this.write("\x1b[J");
    this.displayedRows = line;
  }

  clearLastNLines(n) {
    let targetline = this.displayedRows - n;
    this.clearTerminalFromLine(targetline);
  }

  clear() {
    this.clearTerminalFromLine(0);
  }

  //Number Input
  numberedInput() {
    getPlayerController().enableInput();
  }
}
