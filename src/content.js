const api = globalThis.browser ?? globalThis.chrome;
const THRESHOLDS = {
  co: [
    [549, "10+"],
    [523, 9],
    [503, 8],
    [458, 7],
    [398, 6],
    [369, 5],
    [331, 4],
  ],
  ce: [
    [549, "10+"],
    [524, 9],
    [499, 8],
    [453, 7],
    [406, 6],
    [375, 5],
    [342, 4],
  ],
  exp: [
    [16, "10+"],
    [14, 9],
    [12, 8],
    [10, 7],
    [7, 6],
    [6, 5],
    [4, 4],
  ],
};

function norm(s) {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

function kindOf(label) {
  const l = norm(label);
  if (l.includes("comprehension")) {
    if (l.includes("orale")) return "co";
    if (l.includes("ecrite")) return "ce";
  }
  if (l.includes("expression") && (l.includes("orale") || l.includes("ecrite")))
    return "exp";
  return null;
}

function toNclc(kind, score) {
  if (!kind || !Number.isFinite(score)) return "—";
  for (const [min, level] of THRESHOLDS[kind])
    if (score >= min) return String(level);
  return "<4";
}

function level(v) {
  if (v === "10+") return 10;
  const n = parseInt(v, 10);
  return /^\d+$/.test(String(v)) && Number.isFinite(n) ? n : null;
}

// All four skills must be numeric and >= target.
function reached(values, target) {
  return (
    values.length === 4 &&
    values.every((v) => {
      const n = level(v);
      return n !== null && n >= target;
    })
  );
}

function injectStyle() {
  const st = document.createElement("style");
  st.textContent =
    ".nclc-ok{font-weight:bold;color:#1a7f37}.nclc-low{color:#b04a4a;opacity:.8}";
  document.head.appendChild(st);
}

function confetti() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const canvas = document.createElement("canvas");
  canvas.style.cssText =
    "position:fixed;inset:0;width:100vw;height:100vh;pointer-events:none;z-index:2147483647";
  canvas.width = innerWidth;
  canvas.height = innerHeight;
  document.body.appendChild(canvas);
  const ctx = canvas.getContext("2d");
  const start = performance.now();
  // Pieces start staggered above the viewport so they fall over ~4 s.
  const pieces = Array.from({ length: 160 }, () => ({
    x: Math.random() * canvas.width,
    y: -Math.random() * canvas.height * 0.8 - 10,
    vx: Math.random() * 2 - 1,
    vy: Math.random() * 2 + 2,
    size: Math.random() * 6 + 5,
    rot: Math.random() * Math.PI,
    vr: Math.random() * 0.2 - 0.1,
    hue: Math.random() * 360,
  }));

  function frame(now) {
    if (now - start > 5000) return canvas.remove();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const p of pieces) {
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vr;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = `hsl(${p.hue},90%,55%)`;
      ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
      ctx.restore();
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

async function getTarget() {
  try {
    const { target } = await api.storage.sync.get({ target: 7 });
    const n = Number(target);
    return Number.isInteger(n) && n >= 4 && n <= 10 ? n : 7;
  } catch {
    return 7;
  }
}

async function run() {
  const title = document.querySelector("#session-titre h3");
  const table = document.querySelector("#session-resultats table.table");
  if (!table || !title || !title.textContent.includes("TCF Canada")) return;

  for (const tr of table.querySelectorAll("thead tr")) {
    if (tr.dataset.nclc) continue;
    const ths = [...tr.querySelectorAll("th")];
    if (ths.some((th) => th.textContent.trim() === "Niveau CECRL")) {
      const th = document.createElement("th");
      th.className = "text-end";
      th.textContent = "NCLC";
      tr.appendChild(th);
      tr.dataset.nclc = "1";
      continue;
    }
    const spacer = tr.querySelector("td[colspan]");
    if (spacer) {
      spacer.colSpan += 1;
      tr.dataset.nclc = "1";
    }
  }

  const cells = [];
  for (const tr of table.querySelectorAll("tbody tr")) {
    if (tr.dataset.nclc) continue;
    const label = tr.querySelector("td.cellule-type");
    const value = tr.querySelector("td.cellule-valeur");
    if (!label || !value) continue;
    const td = document.createElement("td");
    td.className = "cellule-valeur";
    const kind = kindOf(label.textContent);
    td.textContent = toNclc(kind, parseInt(value.textContent, 10));
    tr.appendChild(td);
    tr.dataset.nclc = "1";
    if (kind) cells.push(td);
  }

  if (!cells.length) return;
  const target = await getTarget();
  injectStyle();
  const values = cells.map((td) => td.textContent);
  cells.forEach((td, i) => {
    const n = level(values[i]);
    td.classList.add(n !== null && n >= target ? "nclc-ok" : "nclc-low");
  });
  if (reached(values, target)) confetti();
}

if (typeof module !== "undefined") module.exports = { kindOf, toNclc, reached };
else run();
