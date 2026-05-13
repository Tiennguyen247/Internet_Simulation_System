// MODULE 4 — APPLICATION LAYER (DNS + HTTP)

const DNS_DB = {
  "google.com": { ip: "142.250.185.78", ttl: 300 },
  "facebook.com": { ip: "157.240.241.35", ttl: 3600 },
  "github.com": { ip: "140.82.121.4", ttl: 60 },
  "youtube.com": { ip: "142.250.185.110", ttl: 300 },
  "example.edu.vn": { ip: "203.162.0.10", ttl: 86400 },
};

async function mod4RunDNS() {
  const domain = $("m4-domain").value;
  const cached = $("m4-cache").checked;
  const tree = $("m4-dns-tree");
  const info = DNS_DB[domain] || { ip: "93.184.216.34", ttl: 3600 };
  tree.innerHTML = "";
  logClear("m4-dns-log");

  const steps = cached
    ? [
        {
          label: "💻 Client (Cache HIT)",
          note: `Đã có trong local cache: ${domain}`,
          color: "resolved",
        },
        {
          label: `✅ IP: ${info.ip}`,
          note: `TTL còn lại: ${info.ttl}s`,
          color: "resolved",
        },
      ]
    : [
        { label: "💻 Client", note: `Query: ${domain}`, color: "" },
        { label: "📡 Local DNS", note: "Kiểm tra cache... miss", color: "" },
        {
          label: "🌍 Root DNS Server",
          note: "Trả về: TLD server cho .com/.vn",
          color: "",
        },
        {
          label: "📂 TLD DNS (.com)",
          note: `Trả về: authoritative NS của ${domain}`,
          color: "",
        },
        {
          label: `🏢 Auth NS (${domain})`,
          note: `Trả về: A record = ${info.ip}`,
          color: "",
        },
        {
          label: `✅ IP: ${info.ip}`,
          note: `TTL: ${info.ttl}s — Cache & return to client`,
          color: "resolved",
        },
      ];

  for (let i = 0; i < steps.length; i++) {
    const s = steps[i];
    const row = document.createElement("div");
    row.className = "dns-row";
    const arrow = i > 0 ? `<span class="dns-arrow">→</span>` : "";
    row.innerHTML = `${arrow}<div class="dns-node-box">${s.label}</div>`;
    tree.appendChild(row);

    await sleep(300);
    row.classList.add("show");
    const box = row.querySelector(".dns-node-box");
    await sleep(200);
    box.classList.add("active");
    logAppend(
      "m4-dns-log",
      `[Step ${i + 1}] ${s.label}: ${s.note}`,
      s.color === "resolved" ? "success" : "info",
    );
    await sleep(700);
    if (s.color === "resolved") box.classList.add("resolved");
  }

  logAppend(
    "m4-dns-log",
    `✓ DNS Resolution complete: ${domain} → ${info.ip}`,
    "success",
  );
}

function mod4RunHTTP() {
  const method = $("m4-method").value;
  const url = $("m4-url").value;
  const version = $("m4-version").value;

  // Build request
  const host = "www.example.com";
  const bodyContent = method === "POST" ? '\n{"data":"payload"}' : "";

  $("m4-req").innerHTML = `
    <span class="hm">${method}</span> <span class="hu">${url}</span> <span class="hv">${version}</span>
    <br><span class="hk">Host:</span> <span class="hval">${host}</span>
    <br><span class="hk">User-Agent:</span> <span class="hval">InternetSim/1.0</span>
    <br><span class="hk">Accept:</span> <span class="hval">text/html,application/json</span>
    <br><span class="hk">Accept-Encoding:</span> <span class="hval">gzip, deflate, br</span>
    <br><span class="hk">Connection:</span> <span class="hval">keep-alive</span>
    ${
      method === "POST"
        ? `<br><span class="hk">Content-Type:</span> <span class="hval">application/json</span>
    <br><span class="hk">Content-Length:</span> <span class="hval">18</span>`
        : ""
    }
    <br><span class="hb">${bodyContent}</span>`;

  // Simulate delay then response
  const statusCode =
    url.includes("login") && method === "GET"
      ? 301
      : url.includes(".png")
        ? 200
        : method === "POST"
          ? 201
          : 200;

  const statusText = { 200: "OK", 201: "Created", 301: "Moved Permanently" }[
    statusCode
  ];
  const statusColor = statusCode < 300 ? "hst" : "hk";

  $("m4-res").innerHTML =
    `<span class="text-muted small fst-italic">⏳ Waiting for response...</span>`;

  setTimeout(() => {
    const now = new Date().toUTCString();
    const size = Math.floor(Math.random() * 5000) + 500;
    $("m4-res").innerHTML = `
      <span class="${statusColor}">${version} ${statusCode} ${statusText}</span>
      <br><span class="hk">Date:</span> <span class="hval">${now}</span>
      <br><span class="hk">Server:</span> <span class="hval">nginx/1.24.0</span>
      <br><span class="hk">Content-Type:</span> <span class="hval">${url.includes(".json") ? "application/json" : url.includes(".png") ? "image/png" : "text/html; charset=utf-8"}</span>
      <br><span class="hk">Content-Length:</span> <span class="hval">${size}</span>
      <br><span class="hk">Cache-Control:</span> <span class="hval">max-age=3600</span>
      <br><span class="hk">X-Content-Type-Options:</span> <span class="hval">nosniff</span>
      ${statusCode === 301 ? `<br><span class="hk">Location:</span> <span class="hval">https://${host}${url}</span>` : ""}
      <br>
      <br><span class="hb">${statusCode < 300 ? "&lt;!DOCTYPE html&gt;\n&lt;html&gt;...&lt;/html&gt;" : `Redirecting to https://${host}${url}`}</span>`;
  }, 800);
}
