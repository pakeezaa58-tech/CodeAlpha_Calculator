// CodeAlpha Frontend Development Internship | Task 2: Calculator

// STATE: what the calculator remembers
let current = "0";     // number being typed (kept as text so "3." and "0.50" work)
let prev = null;       // first number, waiting for the second
let op = null;         // pending operator: + - * /
let fresh = false;     // true = the next digit starts a new number
let tape = "";         // small line above the result

const symbols = { "+": "+", "-": "\u2212", "*": "\u00D7", "/": "\u00F7" };
const resultEl = document.getElementById("result");
const exprEl = document.getElementById("expr");

// DISPLAY: add thousands commas and shrink long numbers
function format(s) {
  if (isNaN(s)) return s;                       // "Error"
  const [whole, dec] = s.split(".");
  const out = Number(whole).toLocaleString("en-US");
  return dec !== undefined ? out + "." + dec : (whole === "-0" ? "-0" : out);
}
function render() {
  const text = format(current);
  resultEl.textContent = text;
  resultEl.className = "result" + (current === "Error" ? " error" : "")
    + (text.length > 14 ? " tiny" : text.length > 9 ? " small" : "");
  exprEl.textContent = tape || (prev !== null ? `${format(prev)} ${symbols[op]}` : "");
  document.querySelectorAll(".op").forEach(b =>
    b.classList.toggle("active", fresh && prev !== null && b.dataset.k === op));
}

// ACTIONS
function digit(d) {
  if (current === "Error" || fresh) { current = d; fresh = false; tape = ""; }
  else if (current.replace(/[-.]/g, "").length < 15) current = current === "0" ? d : current + d;
}
function dot() {
  if (current === "Error" || fresh) { current = "0."; fresh = false; tape = ""; return; }
  if (!current.includes(".")) current += ".";
}
function calculate() {
  const a = parseFloat(prev), b = parseFloat(current);
  if (op === "/" && b === 0) { clearAll(); current = "Error"; return false; }
  const r = { "+": a + b, "-": a - b, "*": a * b, "/": a / b }[op];
  current = String(Number(r.toPrecision(12)));   // trims 0.1 + 0.2 = 0.30000000000000004
  return true;
}
function operator(o) {
  if (current === "Error") return;
  if (prev !== null && !fresh && !calculate()) return;   // chain: 2 + 3 + ... works
  prev = current; op = o; fresh = true; tape = "";
}
function equals() {
  if (prev === null || op === null) return;
  const line = `${format(prev)} ${symbols[op]} ${format(current)} =`;
  if (!calculate()) return;
  tape = line; prev = null; op = null; fresh = true;
}
function clearAll() { current = "0"; prev = null; op = null; fresh = false; tape = ""; }
function backspace() {
  if (fresh || current === "Error") return;
  current = current.length > 1 && !(current.length === 2 && current[0] === "-") ? current.slice(0, -1) : "0";
}
function percent() { if (current !== "Error") { current = String(Number((parseFloat(current) / 100).toPrecision(12))); fresh = true; } }
function negate()  { if (current !== "Error" && current !== "0") current = current[0] === "-" ? current.slice(1) : "-" + current; }

// ONE ENTRY POINT: buttons and keyboard both call press()
function press(k) {
  if (/^\d$/.test(k)) digit(k);
  else if (k === ".") dot();
  else if ("+-*/".includes(k)) operator(k);
  else if (k === "=") equals();
  else if (k === "c") clearAll();
  else if (k === "b") backspace();
  else if (k === "%") percent();
  else if (k === "n") negate();
  render();
}

document.querySelector(".keys").addEventListener("click", e => {
  const btn = e.target.closest("button");
  if (btn) press(btn.dataset.k);
});

const keyMap = { Enter: "=", "=": "=", Backspace: "b", Escape: "c", Delete: "c", ",": "." , x: "*", X: "*" };
document.addEventListener("keydown", e => {
  const k = keyMap[e.key] || e.key;
  const btn = document.querySelector(`[data-k="${CSS.escape(k)}"]`);
  if (!btn) return;
  e.preventDefault();                       // stops Enter from re-clicking a focused button
  press(k);
  btn.classList.add("pressed");
  setTimeout(() => btn.classList.remove("pressed"), 120);
});

render();