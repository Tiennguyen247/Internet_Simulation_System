// MODULE 1 — PACKET CORE
// Wire up the packet loss toggle
document
  .getElementById("m1-enableLoss")
  .addEventListener("change", function () {
    $("m1-lossGroup").style.display = this.checked ? "block" : "none";
  });

function mod1Run() {
  const msgSize = parseInt($("m1-msgSize").value) || 8000;
  const pktSize = parseInt($("m1-pktSize").value) || 1000;
  const numRouters = parseInt($("m1-numRouters").value) || 3;
  const linkRate = parseInt($("m1-linkRate").value) || 1000;
  const propDelay = parseInt($("m1-propDelay").value) || 10;
  const lossOn = $("m1-enableLoss").checked;
  const lossRate = parseInt($("m1-lossRate").value) / 100 || 0;

  const numPackets = Math.ceil(msgSize / pktSize);
  const numLinks = numRouters + 1;
  const tranDelay = pktSize / linkRate; // seconds
  const totalProp = numLinks * (propDelay / 1000);
  const e2eDelay = (numPackets + numLinks - 1) * tranDelay + totalProp;
  const throughput = msgSize / e2eDelay;

  // Per-packet arrival times
  const packets = [];
  for (let i = 1; i <= numPackets; i++) {
    const arrival = i * tranDelay + (numLinks - 1) * tranDelay + totalProp;
    const lost = lossOn && Math.random() < lossRate;
    packets.push({ id: i, arrival, lost });
  }

  mod1DrawNetwork(numRouters);
  mod1Animate(numLinks);
  mod1ShowFormulas({
    pktSize,
    linkRate,
    tranDelay,
    numPackets,
    numLinks,
    propDelay,
    e2eDelay,
    totalProp,
  });
  mod1ShowTable(packets, pktSize);
  mod1ShowSummary({
    e2eDelay,
    numPackets,
    throughput,
    lost: packets.filter((p) => p.lost).length,
  });
  $("m1-results").classList.remove("d-none");
}

function mod1DrawNetwork(numRouters) {
  const canvas = $("m1-canvas");
  canvas.innerHTML = "";
  const total = numRouters + 2;
  const W = canvas.offsetWidth || 800;
  const step = W / (total + 1);

  for (let i = 0; i < total; i++) {
    const x = step * (i + 1);
    if (i < total - 1) {
      const line = document.createElement("div");
      line.className = "network-line";
      line.style.left = x + 23 + "px";
      line.style.width = step - 23 + "px";
      canvas.appendChild(line);
    }
    const node = document.createElement("div");
    node.className = "network-node";
    node.style.left = x - 23 + "px";
    const isSrc = i === 0;
    const isDst = i === total - 1;
    const cls = isSrc ? "node-sender" : isDst ? "node-receiver" : "node-router";
    const emoji = isSrc ? "💻" : isDst ? "🖥️" : "📡";
    const label = isSrc ? "Src" : isDst ? "Dst" : "R" + i;
    node.innerHTML = `<div class="node-icon ${cls}">${emoji}</div><div class="node-label">${label}</div>`;
    canvas.appendChild(node);
  }

  const dot = document.createElement("div");
  dot.className = "packet-dot";
  dot.id = "m1-dot";
  dot.style.left = step - 7 + "px";
  canvas.appendChild(dot);
}

function mod1Animate(numLinks) {
  const canvas = $("m1-canvas");
  const dot = $("m1-dot");
  const W = canvas.offsetWidth || 800;
  const total = numLinks + 1;
  const step = W / (total + 1);

  dot.style.display = "block";
  dot.style.transition = "none";
  dot.style.left = step - 7 + "px";

  let cur = 0;
  function next() {
    if (cur >= numLinks) {
      setTimeout(() => {
        dot.style.display = "none";
      }, 700);
      return;
    }
    cur++;
    dot.style.transition = "left 0.55s linear";
    dot.style.left = step * (cur + 1) - 7 + "px";
    setTimeout(next, 650);
  }
  setTimeout(next, 300);
}

function mod1ShowFormulas(d) {
  $("m1-formulas").innerHTML = `
    <div class="formula-item">
      <strong class="text-cyan">Transmission delay (L/R):</strong><br>
      <code>${d.pktSize} bits ÷ ${d.linkRate} bps = ${(d.tranDelay * 1000).toFixed(2)} ms per link</code>
    </div>
    <div class="formula-item">
      <strong class="text-cyan">End-to-end delay (store-and-forward):</strong><br>
      <code>(N_pkt + N_links − 1) × d_trans + N_links × d_prop</code><br>
      <code>= (${d.numPackets} + ${d.numLinks} − 1) × ${(d.tranDelay * 1000).toFixed(2)} ms + ${d.numLinks} × ${d.propDelay} ms
      = <span style="color:#fbbf24">${(d.e2eDelay * 1000).toFixed(1)} ms</span></code>
    </div>
    <div class="formula-item">
      <strong class="text-cyan">Store-and-Forward:</strong>
      Mỗi router nhận <em>toàn bộ</em> packet trước rồi mới forward →
      delay cộng dồn qua <code>${d.numLinks}</code> links.
    </div>`;
}

function mod1ShowTable(packets, pktSize) {
  $("m1-table").innerHTML = packets
    .map(
      (p) => `
    <tr class="${p.lost ? "table-danger" : p.id === packets.length ? "table-warning" : ""}">
      <td>Packet ${p.id}${p.id === packets.length ? ' <span class="badge bg-warning text-dark">last</span>' : ""}</td>
      <td>${pktSize} bits</td>
      <td>${p.lost ? "—" : "<strong>" + (p.arrival * 1000).toFixed(1) + "</strong>"} ms</td>
      <td>${p.lost ? '<span class="text-danger">❌ Lost</span>' : '<span class="text-success">✓ OK</span>'}</td>
    </tr>`,
    )
    .join("");
}

function mod1ShowSummary(d) {
  $("m1-summary").innerHTML = `
    <div class="text-center mb-3">
      <span class="stat-value">${(d.e2eDelay * 1000).toFixed(1)}</span>
      <span class="stat-label">End-to-end delay (ms)</span>
    </div>
    <hr style="border-color:var(--bd-dim)">
    <div class="text-center mb-3">
      <span class="stat-value text-warning">${d.numPackets}</span>
      <span class="stat-label">Total packets</span>
    </div>
    <hr style="border-color:var(--bd-dim)">
    <div class="text-center mb-3">
      <span class="stat-value text-green">${Math.round(d.throughput)}</span>
      <span class="stat-label">Throughput (bps)</span>
    </div>
    ${d.lost > 0 ? `<hr style="border-color:var(--bd-dim)"><div class="text-center"><span class="stat-value text-danger">${d.lost}</span><span class="stat-label">Packets lost</span></div>` : ""}`;
}
