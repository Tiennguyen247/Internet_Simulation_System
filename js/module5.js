// MODULE 5 — END-TO-END SIMULATION

const STEPS = ["dns", "tcp", "http", "route", "recv"];

function mod5Reset() {
  logClear("m5-log");
  logAppend("m5-log", '[SYSTEM] Ready. Press "Run Simulation"...', "dim");
  $("m5-summary-card").style.display = "none";

  for (const s of STEPS) {
    const step = $("ps-" + s);
    const stat = $("pss-" + s);
    step.className = "pipeline-step";
    stat.className = "step-status";
    stat.textContent = "⏳ Waiting";
  }

  const svg = $("m5-svg");
  svg.innerHTML = "";
}

async function mod5Run() {
  const domain = $("m5-domain").value;
  const fileSizeKB = parseInt($("m5-filesize").value) || 50;
  const bw = parseInt($("m5-bandwidth").value) || 512; // Kbps
  logClear("m5-log");
  $("m5-summary-card").style.display = "none";

  const results = {};

  // ── Step 1: DNS ─────────────────────────────────────────────
  await mod5Activate("dns", "🔄 Running...");
  mod5SVGDraw("dns", domain);
  await sleep(300);

  logAppend("m5-log", `[DNS] Query: ${domain}`, "info");
  await sleep(400);
  logAppend("m5-log", `[DNS] Local cache: MISS`, "dim");
  await sleep(400);
  logAppend("m5-log", `[DNS] → Root DNS → TLD .com → Auth NS`, "dim");
  await sleep(600);

  const dnsInfo = DNS_DB[domain] || { ip: "93.184.216.34", ttl: 300 };
  const dnsLatency = Math.floor(Math.random() * 50) + 20;
  results.ip = dnsInfo.ip;
  results.dnsMs = dnsLatency;

  logAppend(
    "m5-log",
    `[DNS] ✓ ${domain} → ${dnsInfo.ip} (${dnsLatency}ms)`,
    "success",
  );
  await mod5Done("dns", `✓ ${dnsInfo.ip}`);
  await sleep(400);

  // ── Step 2: TCP Handshake ────────────────────────────────────
  await mod5Activate("tcp", "🔄 Connecting...");
  mod5SVGDraw("tcp", domain);
  await sleep(200);

  logAppend("m5-log", `[TCP] SYN → ${dnsInfo.ip}:443`, "info");
  await sleep(500);
  logAppend("m5-log", `[TCP] ← SYN-ACK received`, "success");
  await sleep(400);
  logAppend("m5-log", `[TCP] ACK → Connection ESTABLISHED`, "success");

  const rtt = Math.floor(Math.random() * 40) + 15;
  results.rtt = rtt;
  logAppend("m5-log", `[TCP] RTT: ${rtt}ms`, "dim");
  await mod5Done("tcp", `✓ ${rtt}ms RTT`);
  await sleep(400);

  // ── Step 3: HTTP Request ─────────────────────────────────────
  await mod5Activate("http", "🔄 Sending...");
  mod5SVGDraw("http", domain);
  await sleep(200);

  logAppend("m5-log", `[HTTP] GET /index.html HTTP/1.1`, "info");
  logAppend("m5-log", `[HTTP] Host: ${domain}`, "dim");
  await sleep(600);
  logAppend("m5-log", `[HTTP] ← 200 OK (${fileSizeKB}KB)`, "success");

  results.httpStatus = 200;
  await mod5Done("http", "✓ 200 OK");
  await sleep(400);

  // ── Step 4: Routing ──────────────────────────────────────────
  await mod5Activate("route", "🔄 Routing...");
  mod5SVGDraw("route", domain);
  await sleep(200);

  // Use module 2's dijkstra on existing graph
  if (m2Nodes.length === 0) mod2Generate();
  const src = 0,
    dst = m2Nodes.length - 1;
  const { dist: d2, prev: p2 } = dijkstra(src);
  const rPath = reconstructPath(p2, src, dst);
  const pathNames = rPath.map((i) => m2Nodes[i].name).join(" → ");

  logAppend("m5-log", `[ROUTE] Dijkstra: ${pathNames}`, "info");
  logAppend(
    "m5-log",
    `[ROUTE] Path cost: ${d2[dst]}, Hops: ${rPath.length - 1}`,
    "dim",
  );

  results.route = pathNames;
  results.hops = rPath.length - 1;
  await mod5Done("route", `✓ ${rPath.length - 1} hops`);
  await sleep(400);

  // ── Step 5: Data Received ─────────────────────────────────────
  await mod5Activate("recv", "🔄 Receiving...");
  mod5SVGDraw("recv", domain);
  await sleep(200);

  const fileBits = fileSizeKB * 1024 * 8;
  const bwBps = bw * 1000;
  const transferMs = Math.round((fileBits / bwBps) * 1000);
  const totalMs = results.dnsMs + results.rtt * 1.5 + transferMs;

  logAppend("m5-log", `[DATA] ${fileSizeKB}KB @ ${bw}Kbps`, "info");
  logAppend("m5-log", `[DATA] Transfer time: ${transferMs}ms`, "info");
  logAppend("m5-log", `[DATA] ✓ All packets received & reassembled`, "success");
  logAppend("m5-log", ``, "dim");
  logAppend(
    "m5-log",
    `[DONE] Total end-to-end: ${Math.round(totalMs)}ms`,
    "success",
  );

  results.transferMs = transferMs;
  results.totalMs = Math.round(totalMs);
  await mod5Done("recv", `✓ Done!`);

  // Show summary
  $("m5-summary-card").style.display = "block";
  $("m5-summary-body").innerHTML = `
    <div class="e2e-stat"><span class="e2e-stat-label">DNS latency</span><span class="e2e-stat-val">${results.dnsMs}ms</span></div>
    <div class="e2e-stat"><span class="e2e-stat-label">TCP RTT</span><span class="e2e-stat-val">${results.rtt}ms</span></div>
    <div class="e2e-stat"><span class="e2e-stat-label">HTTP status</span><span class="e2e-stat-val" style="color:var(--green)">200 OK</span></div>
    <div class="e2e-stat"><span class="e2e-stat-label">Route</span><span class="e2e-stat-val" style="font-size:.7rem">${results.route}</span></div>
    <div class="e2e-stat"><span class="e2e-stat-label">Hops</span><span class="e2e-stat-val">${results.hops}</span></div>
    <div class="e2e-stat"><span class="e2e-stat-label">File size</span><span class="e2e-stat-val">${fileSizeKB}KB</span></div>
    <div class="e2e-stat"><span class="e2e-stat-label">Transfer time</span><span class="e2e-stat-val">${results.transferMs}ms</span></div>
    <hr style="border-color:var(--bd-dim); margin:8px 0">
    <div class="e2e-stat"><span class="e2e-stat-label fw-bold">⚡ Total E2E</span>
      <span class="e2e-stat-val" style="font-size:1.1rem;color:#fbbf24">${results.totalMs}ms</span></div>`;
}

async function mod5Activate(step, statusText) {
  const el = $("ps-" + step);
  const st = $("pss-" + step);
  el.className = "pipeline-step ps-active";
  st.className = "step-status st-active";
  st.textContent = statusText;
}

async function mod5Done(step, statusText) {
  const el = $("ps-" + step);
  const st = $("pss-" + step);
  el.className = "pipeline-step ps-done";
  st.className = "step-status st-done";
  st.textContent = statusText;
  await sleep(300);
}

// Mini SVG animation for Module 5 (one frame per step)
function mod5SVGDraw(step, domain) {
  const svg = $("m5-svg");
  svg.innerHTML = "";

  const scenarios = {
    dns: () => {
      svgText(svg, 200, 20, "DNS Resolution", {
        fill: "#22d3ee",
        "font-size": 12,
      });
      const nodes = [
        { x: 40, y: 100, label: "💻", sub: "Client" },
        { x: 160, y: 100, label: "📡", sub: "Local\nDNS" },
        { x: 280, y: 60, label: "🌍", sub: "Root" },
        { x: 280, y: 140, label: "📂", sub: "TLD" },
        { x: 370, y: 100, label: "🏢", sub: "Auth NS" },
      ];
      nodes.forEach((n) => {
        svgText(svg, n.x, n.y - 5, n.label, { "font-size": 18 });
        svgText(svg, n.x, n.y + 15, n.sub, { fill: "#6b7280", "font-size": 8 });
      });
      const arrows = [
        [0, 1],
        [1, 2],
        [1, 3],
        [2, 4],
        [3, 4],
        [4, 0],
      ];
      arrows.forEach(([a, b]) => {
        const na = nodes[a],
          nb = nodes[b];
        svg.appendChild(
          svgEl("line", {
            x1: na.x,
            y1: na.y - 8,
            x2: nb.x,
            y2: nb.y - 8,
            stroke: "#22d3ee",
            "stroke-width": 1,
            "stroke-dasharray": "4,3",
          }),
        );
      });
    },
    tcp: () => {
      svgText(svg, 200, 20, "TCP 3-Way Handshake", {
        fill: "#00f5a0",
        "font-size": 12,
      });
      const sx = 60,
        rx = 340,
        y1 = 60,
        y2 = 100,
        y3 = 140;
      svg.appendChild(
        svgEl("line", {
          x1: sx,
          y1: 30,
          x2: sx,
          y2: 170,
          stroke: "#22d3ee",
          "stroke-width": 2,
        }),
      );
      svg.appendChild(
        svgEl("line", {
          x1: rx,
          y1: 30,
          x2: rx,
          y2: 170,
          stroke: "#f97316",
          "stroke-width": 2,
        }),
      );
      svgText(svg, sx, 26, "Client", { fill: "#22d3ee", "font-size": 10 });
      svgText(svg, rx, 26, "Server", { fill: "#f97316", "font-size": 10 });

      [
        [sx, rx, y1, "SYN", "#fbbf24"],
        [rx, sx, y2, "SYN-ACK", "#00f5a0"],
        [sx, rx, y3, "ACK", "#fbbf24"],
      ].forEach(([x1, x2, y, lbl, col]) => {
        svg.appendChild(
          svgEl("line", {
            x1,
            y1: y,
            x2,
            y2: y,
            stroke: col,
            "stroke-width": 1.5,
          }),
        );
        svgText(svg, (x1 + x2) / 2, y - 4, lbl, { fill: col, "font-size": 10 });
      });
    },
    http: () => {
      svgText(svg, 200, 20, "HTTP GET Request", {
        fill: "#a78bfa",
        "font-size": 12,
      });
      const sx = 60,
        rx = 340;
      svg.appendChild(
        svgEl("line", {
          x1: sx,
          y1: 30,
          x2: sx,
          y2: 170,
          stroke: "#22d3ee",
          "stroke-width": 2,
        }),
      );
      svg.appendChild(
        svgEl("line", {
          x1: rx,
          y1: 30,
          x2: rx,
          y2: 170,
          stroke: "#f97316",
          "stroke-width": 2,
        }),
      );
      svgText(svg, sx, 26, "Client", { fill: "#22d3ee", "font-size": 10 });
      svgText(svg, rx, 26, `Server\n${domain}`, {
        fill: "#f97316",
        "font-size": 9,
      });

      svg.appendChild(
        svgEl("line", {
          x1: sx,
          y1: 70,
          x2: rx,
          y2: 70,
          stroke: "#a78bfa",
          "stroke-width": 1.5,
        }),
      );
      svgText(svg, (sx + rx) / 2, 64, "GET /index.html", {
        fill: "#a78bfa",
        "font-size": 9,
      });
      svg.appendChild(
        svgEl("line", {
          x1: rx,
          y1: 110,
          x2: sx,
          y2: 110,
          stroke: "#00f5a0",
          "stroke-width": 1.5,
        }),
      );
      svgText(svg, (sx + rx) / 2, 104, "200 OK + Data", {
        fill: "#00f5a0",
        "font-size": 9,
      });
    },
    route: () => {
      svgText(svg, 200, 20, "Packet Routing (Dijkstra)", {
        fill: "#fbbf24",
        "font-size": 12,
      });
      if (m2Nodes.length > 0) {
        const scale = 280 / 600;
        const offX = 60,
          offY = 20;
        for (const e of m2Edges) {
          const n1 = m2Nodes[e.from],
            n2 = m2Nodes[e.to];
          const hi = m2PathEdges.includes(e);
          svg.appendChild(
            svgEl("line", {
              x1: n1.x * scale + offX,
              y1: n1.y * scale * 0.75 + offY,
              x2: n2.x * scale + offX,
              y2: n2.y * scale * 0.75 + offY,
              stroke: hi ? "#00f5a0" : "#1f2937",
              "stroke-width": hi ? 2 : 1,
            }),
          );
        }
        for (const nd of m2Nodes) {
          const inP = m2Path.includes(nd.id);
          svg.appendChild(
            svgEl("circle", {
              cx: nd.x * scale + offX,
              cy: nd.y * scale * 0.75 + offY,
              r: 10,
              fill: inP ? "#003319" : "#0d1117",
              stroke: inP ? "#00f5a0" : "#374151",
              "stroke-width": inP ? 2 : 1,
            }),
          );
          svgText(
            svg,
            nd.x * scale + offX,
            nd.y * scale * 0.75 + offY + 4,
            nd.name,
            { fill: inP ? "#00f5a0" : "#6b7280", "font-size": 9 },
          );
        }
      }
    },
    recv: () => {
      svgText(svg, 200, 20, "Data Received ✓", {
        fill: "#00f5a0",
        "font-size": 12,
      });
      const fileSizeKB = parseInt($("m5-filesize").value) || 50;
      const numPkts = Math.ceil(fileSizeKB / 1);
      const cols = 20,
        rows = Math.ceil(Math.min(numPkts, 80) / cols);
      for (let i = 0; i < Math.min(numPkts, 80); i++) {
        const col = i % cols,
          row = Math.floor(i / cols);
        svg.appendChild(
          svgEl("rect", {
            x: 20 + col * 18,
            y: 40 + row * 18,
            width: 15,
            height: 12,
            fill: "#00f5a0",
            rx: 2,
            opacity: 0.8,
          }),
        );
      }
      svgText(
        svg,
        200,
        160,
        `${fileSizeKB}KB reassembled from ${Math.min(numPkts, 80)}+ packets`,
        { fill: "#6b7280", "font-size": 9 },
      );
    },
  };

  if (scenarios[step]) scenarios[step]();
}
