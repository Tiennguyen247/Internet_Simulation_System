window.addEventListener("load", () => {
  mod2Generate(); // init graph ngay khi mở trang
  console.log("[SYSTEM] Internet Simulation System — Ready");
});

// Wire up toggle cho Module 1
document
  .getElementById("m1-enableLoss")
  .addEventListener("change", function () {
    document.getElementById("m1-lossGroup").style.display = this.checked
      ? "block"
      : "none";
  });
