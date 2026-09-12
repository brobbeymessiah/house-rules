(function (root) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  const winner = (b, m) => lines.find((l) => l.every((i) => b[i] === m));

  function planTurn(input, turn, kind = "erase", random = Math.random) {
    const b = input.slice(),
      steps = [];
    const slots = (m) =>
      b.map((v, i) => (v === m ? i : -1)).filter((i) => i >= 0);
    const pick = (a) =>
      a[Math.min(a.length - 1, Math.floor(random() * a.length))];

    function set(i, v, message = "", immediate = false) {
      const old = b[i];
      b[i] = v;
      steps.push({
        board: b.slice(),
        i,
        old,
        message,
        immediate,
        delay: message ? 1000 : 450,
      });
    }

    function erase(message, immediate = false) {
      const i = pick(winner(b, "X") || slots("X"));
      if (i !== undefined) set(i, null, message, immediate);
    }

    function place(message = "") {
      if (!slots(null).length)
        erase("We need a little more space. Yours will do.");
      const empty = slots(null),
        wins = empty.filter((i) => {
          const c = b.slice();
          c[i] = "O";
          return winner(c, "O");
        });
      set(pick(wins.length ? wins : empty), "O", message);
    }

    if (turn === 1) {
      place();
      return { steps, board: b };
    }

    while (winner(b, "X"))
      erase("Winning line declined. That X has been disqualified.", true);
    if (kind === "erase" && !steps.length)
      erase("Your X was on a trial subscription. It just expired.");

    place();
    if (kind === "double" && !winner(b, "O")) {
      steps.push({ board: b.slice(), cue: true, delay: 900 });
      place("Actually, one more move. House privilege.");
    }

    if (!winner(b, "O") && !slots(null).length)
      erase("A draw? We have made room for a better result.");
    return { steps, board: b };
  }

  const api = { lines, winner, planTurn };
  if (typeof module !== "undefined") module.exports = api;
  else root.HouseRules = api;
})(typeof window !== "undefined" ? window : globalThis);
