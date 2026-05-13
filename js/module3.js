// MODULE 3 — TCP vs UDP (Time-Space Ladder Diagram)

let m3Proto = "TCP";

function mod3SelectProto(p) {
  m3Proto = p;
  $("btn-tcp").className =
    "proto-btn flex-fill" + (p === "TCP" ? " active-tcp" : "");
  $("btn-udp").className =
    "proto-btn flex-fill" + (p === "UDP" ? " active-udp" : "");
}

function mod3Run() {
  const numPkt = parseInt($("m3-numPkt").value) || 5;
  const lossPct = parseInt($("m3-loss").value) / 100 || 0;
  logClear("m3-log");

  const events =
    m3Proto === "TCP"
      ? mod3SimulateTCP(numPkt, lossPct)
      : mod3SimulateUDP(numPkt, lossPct);

  mod3DrawLadder(events, m3Proto);
  mod3RenderLog(events);
  mod3ShowStats(events, numPkt);
}

// Time constants (in "ticks" where 1 tick = 1 transmission time)
const TX = 1,
  PROP = 1.5,
  TIMEOUT = 5;
const PX = 40; // pixels per tick

function mod3SimulateTCP(numPkt, lossPct) {
  const events = [];
  let t = 0; // current sender time
  let sent = 0,
    lost = 0,
    retrans = 0;

  for (let i = 1; i <= numPkt; i++) {
    const isLost = Math.random() < lossPct;
    events.push({ type: "SEND", t, pkt: i });
    if (isLost) {
      events.push({ type: "LOST", t: t + PROP * 0.5, pkt: i });
      t += TIMEOUT;
      events.push({ type: "TIMEOUT", t, pkt: i });
      events.push({ type: "RESEND", t, pkt: i });
      // Second attempt — assume no loss
      const tRecv = t + TX + PROP;
      events.push({ type: "RECV", t: tRecv, pkt: i });
      events.push({ type: "ACK", t: tRecv + 0.5, pkt: i });
      events.push({ type: "ACK_RECV", t: tRecv + 0.5 + PROP, pkt: i });
      t = tRecv + 0.5 + PROP;
      lost++;
      retrans++;
    } else {
      const tRecv = t + TX + PROP;
      events.push({ type: "RECV", t: tRecv, pkt: i });
      events.push({ type: "ACK", t: tRecv + 0.3, pkt: i });
      events.push({ type: "ACK_RECV", t: tRecv + 0.3 + PROP, pkt: i });
      t = tRecv + 0.3 + PROP + 0.2;
    }
    sent++;
  }
  events._stats = { sent, lost, retrans, proto: "TCP", totalTime: t };
  return events;
}

function mod3SimulateUDP(numPkt, lossPct) {
  const events = [];
  let sent = 0,
    lost = 0;
  let t = 0;

  for (let i = 1; i <= numPkt; i++) {
    const isLost = Math.random() < lossPct;
    events.push({ type: "SEND", t, pkt: i });
    const tRecv = t + TX + PROP;
    if (isLost) {
      events.push({ type: "LOST", t: t + TX + PROP * 0.5, pkt: i });
      lost++;
    } else {
      events.push({ type: "RECV", t: tRecv, pkt: i });
    }
    t += TX + 0.3; // pipelining — no wait for ACK
    sent++;
  }
  events._stats = { sent, lost, retrans: 0, proto: "UDP", totalTime: t + PROP };
  return events;
}

function mod3DrawLadder(events, proto) {
  const svg = $("m3-svg");
  const SX = 90,
    RX = 530; // Sender/Receiver x positions
  const TOP = 30;
  const maxT = Math.max(...events.filter((e) => e.t).map((e) => e.t), 12);
  const H = Math.max(400, maxT * PX + 60);

  svg.setAttribute("viewBox", `0 0 620 ${H}`);
  svg.innerHTML = "";

  // Sender / Receiver vertical lines
  const lineColor = "#1f2937";
  svg.appendChild(
    svgEl("line", {
      x1: SX,
      y1: TOP,
      x2: SX,
      y2: H - 10,
      stroke: lineColor,
      "stroke-width": 2,
    }),
  );
  svg.appendChild(
    svgEl("line", {
      x1: RX,
      y1: TOP,
      x2: RX,
      y2: H - 10,
      stroke: lineColor,
      "stroke-width": 2,
    }),
  );

  // Labels
  svgText(svg, SX, 18, "Sender", { fill: "#22d3ee", "font-size": 12 });
  svgText(svg, RX, 18, "Receiver", { fill: "#22d3ee", "font-size": 12 });
  svgText(svg, 18, H / 2, "Time", {
    fill: "#4b5563",
    "font-size": 10,
    transform: `rotate(-90, 18, ${H / 2})`,
  });

  // Protocol badge
  svgText(svg, 310, 18, proto, {
    fill: proto === "TCP" ? "#00f5a0" : "#f97316",
    "font-size": 13,
    "font-weight": "bold",
  });

  // Draw each event as an arrow
  const colors = {
    SEND: "#22d3ee",
    RECV: "#00f5a0",
    ACK: "#86efac",
    ACK_RECV: "#6ee7b7",
    LOST: "#ef4444",
    TIMEOUT: "#f97316",
    RESEND: "#fbbf24",
  };

  const drawn = [];

  for (const ev of events) {
    if (!ev.type) continue;
    const y = TOP + ev.t * PX;
    const color = colors[ev.type] || "#9ca3af";
    const pktLabel = `P${ev.pkt}`;

    if (ev.type === "SEND" || ev.type === "RESEND") {
      // Find corresponding RECV/LOST
      const dest = events.find(
        (e) =>
          (e.type === "RECV" || e.type === "LOST") &&
          e.pkt === ev.pkt &&
          e.t > ev.t &&
          !drawn.includes(e),
      );
      if (dest) {
        drawn.push(dest);
        const y2 = TOP + dest.t * PX;
        const isDrop = dest.type === "LOST";
        const mx = (SX + RX) / 2;
        const my = (y + y2) / 2;

        // Arrow line
        const arrowColor = isDrop
          ? "#ef4444"
          : ev.type === "RESEND"
            ? "#fbbf24"
            : "#22d3ee";
        svg.appendChild(
          svgEl("line", {
            x1: SX,
            y1: y,
            x2: isDrop ? mx : RX,
            y2: isDrop ? my : y2,
            stroke: arrowColor,
            "stroke-width": 1.8,
            "stroke-dasharray": ev.type === "RESEND" ? "4,3" : "none",
          }),
        );
        // Arrow tip
        if (!isDrop) {
          svg.appendChild(
            svgEl("polygon", {
              points: `${RX},${y2} ${RX - 10},${y2 - 5} ${RX - 10},${y2 + 5}`,
              fill: arrowColor,
            }),
          );
        } else {
          svgText(svg, mx, my - 3, "❌", { "font-size": 12 });
        }
        // Label
        svgText(
          svg,
          (SX + (isDrop ? mx : RX)) / 2 - 5,
          (y + (isDrop ? my : y2)) / 2 - 4,
          pktLabel,
          { fill: arrowColor, "font-size": 10 },
        );
      }
    } else if (ev.type === "ACK") {
      const y2 = TOP + (ev.t + PROP) * PX;
      svg.appendChild(
        svgEl("line", {
          x1: RX,
          y1: y,
          x2: SX,
          y2: y2,
          stroke: "#6ee7b7",
          "stroke-width": 1.5,
          "stroke-dasharray": "5,3",
        }),
      );
      svg.appendChild(
        svgEl("polygon", {
          points: `${SX},${y2} ${SX + 10},${y2 - 4} ${SX + 10},${y2 + 4}`,
          fill: "#6ee7b7",
        }),
      );
      svgText(svg, (SX + RX) / 2 + 5, (y + y2) / 2 - 4, `ACK${ev.pkt}`, {
        fill: "#6ee7b7",
        "font-size": 9,
      });
    } else if (ev.type === "TIMEOUT") {
      // Timeout marker on sender line
      svg.appendChild(
        svgEl("line", {
          x1: SX - 12,
          y1: y,
          x2: SX + 12,
          y2: y,
          stroke: "#f97316",
          "stroke-width": 2,
        }),
      );
      svgText(svg, SX - 35, y + 4, "T/O", { fill: "#f97316", "font-size": 9 });
    }
  }
}

function mod3RenderLog(events) {
  const logMap = {
    SEND: {
      type: "info",
      fmt: (e) => `[t=${e.t.toFixed(1)}] → Gửi Packet ${e.pkt}`,
    },
    RESEND: {
      type: "warn",
      fmt: (e) =>
        `[t=${e.t.toFixed(1)}] ↻ Retransmit Packet ${e.pkt} (timeout!)`,
    },
    RECV: {
      type: "success",
      fmt: (e) => `[t=${e.t.toFixed(1)}]   ✓ Receiver nhận Packet ${e.pkt}`,
    },
    ACK: {
      type: "success",
      fmt: (e) => `[t=${e.t.toFixed(1)}]   ← ACK ${e.pkt} gửi về`,
    },
    ACK_RECV: {
      type: "dim",
      fmt: (e) =>
        `[t=${e.t.toFixed(1)}]   ✓ Sender nhận ACK ${e.pkt} — gửi packet tiếp`,
    },
    LOST: {
      type: "error",
      fmt: (e) =>
        `[t=${e.t.toFixed(1)}]   ❌ Packet ${e.pkt} bị mất trên đường truyền!`,
    },
    TIMEOUT: {
      type: "warn",
      fmt: (e) => `[t=${e.t.toFixed(1)}] ⏰ Timeout! Không nhận ACK ${e.pkt}`,
    },
  };

  // Sort by time for log
  const sorted = [...events].filter((e) => e.type).sort((a, b) => a.t - b.t);
  let delay = 0;
  for (const ev of sorted) {
    const cfg = logMap[ev.type];
    if (!cfg) continue;
    setTimeout(() => logAppend("m3-log", cfg.fmt(ev), cfg.type), delay);
    delay += 250;
  }
}

function mod3ShowStats(events, numPkt) {
  const stats = events._stats || {};
  $("m3-stats-card").style.display = "block";
  $("m3-stats").innerHTML = `
    <div class="e2e-stat"><span class="e2e-stat-label">Protocol</span><span class="e2e-stat-val" style="color:${stats.proto === "TCP" ? "#00f5a0" : "#f97316"}">${stats.proto}</span></div>
    <div class="e2e-stat"><span class="e2e-stat-label">Packets sent</span><span class="e2e-stat-val">${stats.sent}</span></div>
    <div class="e2e-stat"><span class="e2e-stat-label">Packets lost</span><span class="e2e-stat-val" style="color:var(--red)">${stats.lost}</span></div>
    <div class="e2e-stat"><span class="e2e-stat-label">Retransmissions</span><span class="e2e-stat-val" style="color:#fbbf24">${stats.retrans}</span></div>
    <div class="e2e-stat"><span class="e2e-stat-label">Total time</span><span class="e2e-stat-val">${stats.totalTime.toFixed(1)} units</span></div>
    <div class="e2e-stat"><span class="e2e-stat-label">Reliability</span>
      <span class="e2e-stat-val">${stats.proto === "TCP" ? "100% ✓" : Math.round((1 - stats.lost / numPkt) * 100) + "%"}</span></div>`;
}
