const $ = (id) => document.getElementById(id);

let board = Array(9).fill(null),
  busy = false,
  over = false,
  score = 0,
  match = 1,
  generation = 0,
  turn = 0,
  violations = 0,
  offset = Math.random() < 0.5 ? 0 : 1;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function report(message) {
  if (!violations) $("incident-log").replaceChildren();
  violations++;
  const li = document.createElement("li");
  li.textContent = String(violations).padStart(2, "0") + " / " + message;
  $("incident-log").prepend(li);
  $("incident-count").textContent =
    violations + " violation" + (violations === 1 ? "" : "s");
}

function status(phase, title, copy) {
  const phaseLabel = $("phase");
  if (phaseLabel) phaseLabel.textContent = phase;
  $("title").textContent = title;
  $("copy").textContent = copy;
}

function render(step = {}) {
  const line = over ? HouseRules.winner(board, "O") || [] : [];
  $("board").replaceChildren();
  board.forEach((v, i) => {
    const b = document.createElement("button");
    b.className =
      "cell" +
      (v === "O" ? " o" : "") +
      (line.includes(i) ? " win" : "") +
      (step.i === i
        ? step.old === "X" && v === null
          ? " erasing"
          : " placed"
        : "");
    b.textContent = v === "X" ? "×" : v === "O" ? "○" : "";
    b.disabled = busy || over || v !== null;
    b.setAttribute(
      "aria-label",
      `Row ${Math.floor(i / 3) + 1}, column ${(i % 3) + 1}: ${v || "empty"}`,
    );
    b.onclick = () => play(i);
    $("board").appendChild(b);
  });
}

function apply(step) {
  board = step.board.slice();
  render(step);
  if (step.message) {
    report(step.message);
    status("HOUSE AMENDMENT", "A minor technicality.", step.message);
  }
}

async function play(i) {
  if (busy || over || board[i] !== null) return;
  busy = true;
  const run = generation;
  board[i] = "X";
  turn++;
  const plan = HouseRules.planTurn(
    board,
    turn,
    (turn + offset) % 2 === 0 ? "erase" : "double",
  );
  status(
    "HOUSE IS THINKING",
    "Let us think…",
    "Everything looks perfectly ordinary so far.",
  );
  if (plan.steps[0]?.immediate) {
    while (plan.steps[0]?.immediate) apply(plan.steps.shift());
  } else render({ i });
  await sleep(650);
  if (run !== generation) return;
  for (const step of plan.steps) {
    if (step.cue)
      status("YOUR TURN…", "Over to you.", "Take your time. Choose wisely.");
    else apply(step);
    await sleep(step.delay);
    if (run !== generation) return;
  }
  busy = false;
  over = !!HouseRules.winner(board, "O");
  render();
  if (over) {
    $("house-score").textContent = ++score;
    status(
      "THE HOUSE WINS",
      "Talent. Timing. Tiny edits.",
      violations
        ? "Another victory certified by our independent referee. Us."
        : "A regular win. We’re as surprised as you are.",
    );
    $("replay").innerHTML =
      'Try your luck again <span aria-hidden="true">↗</span>';
    $("replay").focus({ preventScroll: true });
  } else {
    status(
      "YOUR TURN",
      "Your move, optimist.",
      "The board has been updated. Please admire our improvements.",
    );
    $("board")
      .querySelector("button:not(:disabled)")
      ?.focus({ preventScroll: true });
  }
}

function startNewMatch() {
  generation++;
  match++;
  turn = 0;
  violations = 0;
  board = Array(9).fill(null);
  busy = false;
  over = false;
  offset = Math.random() < 0.5 ? 0 : 1;
  const matchLabel = $("match");
  if (matchLabel)
    matchLabel.textContent = "MATCH " + String(match).padStart(3, "0");
  $("incident-count").textContent = "0 violations";
  $("incident-log").innerHTML =
    "<li>Nothing to report. Suspiciously quiet.</li>";
  status(
    "YOUR TURN",
    "A fresh start. Same house.",
    "Pick a square. We’ll pretend to play nicely.",
  );
  $("replay").innerHTML = 'Start fresh <span aria-hidden="true">↗</span>';
  render();
  $("board").firstChild.focus({ preventScroll: true });
}

function fileAppeal() {
  report(
    "Appeal rejected. One point awarded to the house for administrative inconvenience.",
  );
  $("house-score").textContent = ++score;
  status(
    busy ? "HOUSE TURN" : over ? "THE HOUSE WINS" : "YOUR TURN",
    "Your appeal was considered.",
    "Denied. The house has collected a one-point processing fee.",
  );
}

$("replay").onclick = startNewMatch;
$("appeal").onclick = fileAppeal;
render();
