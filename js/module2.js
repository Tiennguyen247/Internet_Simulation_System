// MODULE 2 — ROUTING (Dijkstra / Bellman-Ford)

let m2Nodes = [],
  m2Edges = [],
  m2Path = [],
  m2PathEdges = [];

function mod2Generate() {
  const n = parseInt($("m2-numNodes").value) || 6;
  const NAMES = "ABCDEFGH".split("").slice(0, n);
  const CX = 360,
    CY = 240,
    R = 170;

  m2Nodes = NAMES.map((name, i) => {
    const angle = (2 * Math.PI * i) / n - Math.PI / 2;
    return {
      id: i,
      name,
      x: Math.round(CX + R * Math.cos(angle)),
      y: Math.round(CY + R * Math.sin(angle)),
    };
  });

  m2Edges = [];
  // Ensure connected ring first
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    m2Edges.push({ from: i, to: j, w: Math.floor(Math.random() * 14) + 2 });
  }
  // Extra random cross edges
  const extras = Math.floor(n * 0.8);
  for (let k = 0; k < extras; k++) {
    const a = Math.floor(Math.random() * n);
    const b = Math.floor(Math.random() * n);
    if (
      a !== b &&
      !m2Edges.find(
        (e) => (e.from === a && e.to === b) || (e.from === b && e.to === a),
      )
    ) {
      m2Edges.push({ from: a, to: b, w: Math.floor(Math.random() * 14) + 2 });
    }
  }

  // Update selectors
  const opts = NAMES.map((n, i) => `<option value="${i}">${n}</option>`).join(
    "",
  );
  $("m2-src").innerHTML = opts;
  $("m2-dst").innerHTML = opts;
  $("m2-dst").value = n - 1;

  m2Path = [];
  m2PathEdges = [];
  mod2DrawGraph();
  $("m2-result-card").style.display = "none";
  $("m2-table-card").style.display = "none";
}

// Dijkstra — returns { dist[], prev[] }
function dijkstra(src) {
  const n = m2Nodes.length;
  const dist = Array(n).fill(Infinity);
  const prev = Array(n).fill(-1);
  const vis = Array(n).fill(false);
  dist[src] = 0;
  for (let iter = 0; iter < n; iter++) {
    let u = -1;
    for (let i = 0; i < n; i++)
      if (!vis[i] && (u === -1 || dist[i] < dist[u])) u = i;
    if (u === -1 || dist[u] === Infinity) break;
    vis[u] = true;
    for (const e of m2Edges) {
      const nb = e.from === u ? e.to : e.to === u ? e.from : -1;
      if (nb === -1) continue;
      if (dist[u] + e.w < dist[nb]) {
        dist[nb] = dist[u] + e.w;
        prev[nb] = u;
      }
    }
  }
  return { dist, prev };
}

// Bellman-Ford — returns { dist[], prev[] }
function bellmanFord(src) {
  const n = m2Nodes.length;
  const dist = Array(n).fill(Infinity);
  const prev = Array(n).fill(-1);
  dist[src] = 0;
  for (let iter = 0; iter < n - 1; iter++) {
    for (const e of m2Edges) {
      if (dist[e.from] + e.w < dist[e.to]) {
        dist[e.to] = dist[e.from] + e.w;
        prev[e.to] = e.from;
      }
      if (dist[e.to] + e.w < dist[e.from]) {
        dist[e.from] = dist[e.to] + e.w;
        prev[e.from] = e.to;
      }
    }
  }
  return { dist, prev };
}

function reconstructPath(prev, src, dst) {
  const path = [];
  let cur = dst;
  while (cur !== -1) {
    path.unshift(cur);
    cur = prev[cur];
  }
  return path[0] === src ? path : [];
}

function mod2Run() {
  if (m2Nodes.length === 0) mod2Generate();
  const src = parseInt($("m2-src").value);
  const dst = parseInt($("m2-dst").value);
  const algo = $("m2-algo").value;
  if (src === dst) {
    alert("Source ≠ Destination!");
    return;
  }

  const { dist, prev } = algo === "dijkstra" ? dijkstra(src) : bellmanFord(src);
  m2Path = reconstructPath(prev, src, dst);

  m2PathEdges = [];
  for (let i = 0; i < m2Path.length - 1; i++) {
    const a = m2Path[i],
      b = m2Path[i + 1];
    const e = m2Edges.find(
      (e) => (e.from === a && e.to === b) || (e.from === b && e.to === a),
    );
    if (e) m2PathEdges.push(e);
  }

  mod2DrawGraph();
  mod2ShowResults(src, dst, dist, prev, algo);
  mod2AnimatePacket();
}

function mod2DrawGraph() {
  const svg = $("m2-svg");
  svg.innerHTML = "";

  // Edges
  for (const e of m2Edges) {
    const n1 = m2Nodes[e.from],
      n2 = m2Nodes[e.to];
    const hi = m2PathEdges.includes(e);
    svg.appendChild(
      svgEl("line", {
        x1: n1.x,
        y1: n1.y,
        x2: n2.x,
        y2: n2.y,
        stroke: hi ? "#00f5a0" : "#1f2937",
        "stroke-width": hi ? 3 : 1.5,
      }),
    );
    const mx = (n1.x + n2.x) / 2,
      my = (n1.y + n2.y) / 2;
    svgText(svg, mx, my - 5, e.w, {
      fill: hi ? "#00f5a0" : "#374151",
      "font-size": 11,
    });
  }

  // Nodes
  for (const node of m2Nodes) {
    const inPath = m2Path.includes(node.id);
    svg.appendChild(
      svgEl("circle", {
        cx: node.x,
        cy: node.y,
        r: 22,
        fill: inPath ? "#003319" : "#0d1117",
        stroke: inPath ? "#00f5a0" : "#374151",
        "stroke-width": inPath ? 2.5 : 1.5,
      }),
    );
    svgText(svg, node.x, node.y + 5, node.name, {
      fill: inPath ? "#00f5a0" : "#9ca3af",
      "font-size": 14,
      "font-weight": "bold",
    });
  }
}

function mod2AnimatePacket() {
  if (m2Path.length < 2) return;
  const svg = $("m2-svg");
  const old = svg.querySelector("#m2-pkt");
  if (old) old.remove();

  const pkt = svgEl("circle", {
    id: "m2-pkt",
    r: 9,
    fill: "#f97316",
    stroke: "#fff",
    "stroke-width": 2,
  });
  const startNode = m2Nodes[m2Path[0]];
  pkt.setAttribute("cx", startNode.x);
  pkt.setAttribute("cy", startNode.y);
  svg.appendChild(pkt);

  let step = 0;
  function move() {
    if (step >= m2Path.length - 1) return;
    step++;
    const target = m2Nodes[m2Path[step]];
    const tx = target.x,
      ty = target.y;
    const dur = 600,
      t0 = performance.now();
    const x0 = parseFloat(pkt.getAttribute("cx"));
    const y0 = parseFloat(pkt.getAttribute("cy"));

    (function frame(now) {
      const p = Math.min((now - t0) / dur, 1);
      const ease = p < 0.5 ? 2 * p * p : -1 + (4 - 2 * p) * p;
      pkt.setAttribute("cx", x0 + (tx - x0) * ease);
      pkt.setAttribute("cy", y0 + (ty - y0) * ease);
      if (p < 1) requestAnimationFrame(frame);
      else setTimeout(move, 250);
    })(performance.now());
  }
  setTimeout(move, 200);
}

function mod2ShowResults(src, dst, dist, prev, algo) {
  const pathNames = m2Path.map((i) => m2Nodes[i].name).join(" → ");

  $("m2-result-card").style.display = "block";
  $("m2-result-body").innerHTML = `
    <div class="mb-2"><span class="text-muted" style="font-family:var(--mono);font-size:.75rem">Thuật toán</span><br>
      <strong>${algo === "dijkstra" ? "Dijkstra (SPF)" : "Bellman-Ford (DV)"}</strong></div>
    <div class="mb-2"><span class="text-muted" style="font-family:var(--mono);font-size:.75rem">Đường đi tối ưu</span><br>
      <code style="color:#fbbf24">${pathNames || "Không có đường!"}</code></div>
    <div class="mb-2"><span class="text-muted" style="font-family:var(--mono);font-size:.75rem">Total Cost</span>
      <span class="text-orange fw-bold ms-2" style="font-family:var(--mono)">${dist[dst] === Infinity ? "∞" : dist[dst]}</span></div>
    <div><span class="text-muted" style="font-family:var(--mono);font-size:.75rem">Hops</span>
      <span class="text-green fw-bold ms-2">${m2Path.length > 0 ? m2Path.length - 1 : "?"}</span></div>`;

  // Routing table
  $("m2-table-card").style.display = "block";
  $("m2-rtable").innerHTML = m2Nodes
    .map((node) => {
      const viaNode = prev[node.id] !== -1 ? m2Nodes[prev[node.id]].name : "—";
      return `<tr>
      <td style="color:${m2Path.includes(node.id) ? "#00f5a0" : "#9ca3af"}">${node.name}</td>
      <td>${dist[node.id] === Infinity ? "∞" : dist[node.id]}</td>
      <td>${viaNode}</td>
    </tr>`;
    })
    .join("");
}

// Auto-generate topology on page load for module 2
window.addEventListener("load", () => mod2Generate());
