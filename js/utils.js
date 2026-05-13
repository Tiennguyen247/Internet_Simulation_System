const $ = (id) => document.getElementById(id);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function logAppend(containerId, msg, type = "info") {
  const el = $(containerId);
  const span = document.createElement("span");
  span.className = `log-entry log-${type}`;
  span.textContent = msg;
  el.appendChild(span);
  el.appendChild(document.createElement("br"));
  el.scrollTop = el.scrollHeight;
}

function logClear(id) {
  $(id).innerHTML = "";
}

// ─── SVG helpers ─────────────────────────────────────────────
function svgEl(tag, attrs) {
  const el = document.createElementNS("http://www.w3.org/2000/svg", tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  return el;
}

function svgText(parent, x, y, txt, attrs = {}) {
  const t = svgEl("text", {
    x,
    y,
    "text-anchor": "middle",
    "font-family": "'Share Tech Mono',monospace",
    ...attrs,
  });
  t.textContent = txt;
  parent.appendChild(t);
  return t;
}
