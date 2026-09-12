const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const { test } = require("node:test");

test("start, play, appeal, and restart work with the current HTML", async () => {
  class Element {
    children = [];
    textContent = "";
    appendChild(child) {
      this.children.push(child);
    }
    prepend(child) {
      this.children.unshift(child);
    }
    replaceChildren() {
      this.children = [];
    }
    setAttribute() {}
    focus() {}
    get firstChild() {
      return this.children[0];
    }
    querySelector() {
      return this.children.find((child) => !child.disabled);
    }
  }

  const html = fs.readFileSync("index.html", "utf8");
  const elements = new Map(
    [...html.matchAll(/\bid="([^"]+)"/g)].map(([, id]) => [id, new Element()]),
  );
  const pending = [];
  const context = vm.createContext({
    document: {
      getElementById: (id) => elements.get(id) || null,
      createElement: () => new Element(),
    },
    setTimeout: (resolve) => pending.push(resolve),
  });
  vm.runInContext(fs.readFileSync("engine.js", "utf8"), context);
  vm.runInContext(fs.readFileSync("game.js", "utf8"), context);
  const board = elements.get("board");
  const drainTimers = async () => {
    while (pending.length) {
      pending.shift()();
      await Promise.resolve();
    }
  };

  assert.equal(board.children.length, 9);
  elements.get("replay").onclick();
  assert.ok(board.children.every((cell) => !cell.disabled));
  const turn = board.children[0].onclick();
  await drainTimers();
  await turn;
  assert.equal(board.children[0].textContent, "×");
  assert.equal(
    board.children.filter((cell) => cell.textContent === "○").length,
    1,
  );
  assert.ok(board.children.some((cell) => !cell.disabled));

  elements.get("appeal").onclick();
  assert.equal(Number(elements.get("house-score").textContent), 1);
  const interruptedTurn = board.children
    .find((cell) => !cell.disabled)
    .onclick();
  elements.get("replay").onclick();
  await drainTimers();
  await interruptedTurn;
  assert.ok(
    board.children.every((cell) => !cell.disabled && cell.textContent === ""),
  );
});
