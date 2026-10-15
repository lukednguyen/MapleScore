const seg = document.getElementById("seg");
const current = document.getElementById("current");
const MIN = 4;
const MAX = 10;
let value = 7;

const buttons = [];
for (let i = MIN; i <= MAX; i++) {
  const b = document.createElement("button");
  b.type = "button";
  b.setAttribute("role", "radio");
  b.textContent = String(i);
  b.dataset.v = String(i);
  if (i === 5 || i === 7) b.classList.add("key");
  b.addEventListener("click", () => choose(i, true));
  seg.appendChild(b);
  buttons.push(b);
}

function render() {
  current.textContent = String(value);
  seg.style.setProperty("--i", String(value - MIN));
  for (const b of buttons) {
    const on = Number(b.dataset.v) === value;
    b.setAttribute("aria-checked", String(on));
    // roving tabindex: only the checked radio is in the tab order
    b.tabIndex = on ? 0 : -1;
  }
}

async function choose(n, focus) {
  if (n < MIN || n > MAX) return;
  value = n;
  render();
  if (focus) buttons[n - MIN].focus();
  await browser.storage.sync.set({ target: n });
}

seg.addEventListener("keydown", (e) => {
  const step = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1 }[
    e.key
  ];
  if (!step) return;
  e.preventDefault();
  choose(value + step, true);
});

render();
browser.storage.sync.get({ target: 7 }).then(({ target }) => {
  const n = Number(target);
  value = Number.isInteger(n) && n >= MIN && n <= MAX ? n : 7;
  render();
});

const ORIGIN = "https://tcfcandidat.france-education-international.fr/*";
const access = document.getElementById("access");
// the Allow card is shown only while permission is missing
function showAccess(ok) {
  access.hidden = ok;
}
browser.permissions.contains({ origins: [ORIGIN] }).then(showAccess);
// request() must run synchronously inside the click handler (user gesture)
document.getElementById("allow").addEventListener("click", () => {
  browser.permissions.request({ origins: [ORIGIN] }).then(showAccess);
});
