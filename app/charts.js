/* MapleHome Budget charts: canvas donut + grouped bars, no libraries. */
function setupCanvas(canvas, height) {
  const dpr = window.devicePixelRatio || 1;
  const w = canvas.clientWidth || canvas.parentElement.clientWidth || 600;
  canvas.width = w * dpr; canvas.height = height * dpr;
  canvas.style.height = height + "px";
  const ctx = canvas.getContext("2d");
  ctx.scale(dpr, dpr);
  return { ctx, w, h: height };
}

function drawDonut(canvas, slices, opts) {
  const { ctx, w, h } = setupCanvas(canvas, opts.height || 240);
  const cx = 110, cy = h / 2, r = Math.min(95, h / 2 - 12), ir = r * 0.58;
  const total = slices.reduce((a, s) => a + s.value, 0);
  ctx.clearRect(0, 0, w, h);
  let a0 = -Math.PI / 2;
  slices.forEach((s) => {
    const a1 = a0 + (s.value / total) * Math.PI * 2;
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, r, a0, a1); ctx.closePath();
    ctx.fillStyle = s.color; ctx.fill(); a0 = a1;
  });
  ctx.beginPath(); ctx.arc(cx, cy, ir, 0, Math.PI * 2); ctx.fillStyle = "#fff"; ctx.fill();
  ctx.fillStyle = "#17324a"; ctx.font = "bold 20px system-ui, sans-serif"; ctx.textAlign = "center";
  ctx.fillText("$" + total.toLocaleString("en-US"), cx, cy - 2);
  ctx.font = "12px system-ui, sans-serif"; ctx.fillStyle = "#5b6b7a";
  ctx.fillText("spent", cx, cy + 16);
  ctx.textAlign = "left"; ctx.font = "13px system-ui, sans-serif";
  slices.forEach((s, i) => {
    const y = 24 + i * 24;
    ctx.fillStyle = s.color; ctx.fillRect(230, y - 10, 12, 12);
    ctx.fillStyle = "#17324a";
    ctx.fillText(`${s.label} — $${s.value.toLocaleString("en-US")} (${Math.round(s.value / total * 100)}%)`, 248, y);
  });
}

function drawMonthBars(canvas, months, income, expense) {
  const { ctx, w, h } = setupCanvas(canvas, 240);
  const padL = 52, padB = 30, padT = 16, padR = 10;
  const max = Math.max.apply(null, income.concat(expense)) * 1.1;
  const gw = (w - padL - padR) / months.length;
  ctx.clearRect(0, 0, w, h);
  ctx.font = "11px system-ui, sans-serif"; ctx.fillStyle = "#5b6b7a"; ctx.strokeStyle = "#d7dee6";
  for (let g = 0; g <= 4; g++) {
    const y = padT + (h - padB - padT) * (1 - g / 4);
    ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(w - padR, y); ctx.stroke();
    ctx.fillText("$" + Math.round(max * g / 4).toLocaleString("en-US"), 2, y + 4);
  }
  months.forEach((m, i) => {
    const x = padL + i * gw;
    const pairs = [[income[i], "#0e7a6d", "in"], [expense[i], "#c96a1e", "out"]];
    pairs.forEach((p, j) => {
      const bh = (h - padB - padT) * (p[0] / max);
      ctx.fillStyle = p[1];
      ctx.fillRect(x + gw * 0.16 + j * gw * 0.36, h - padB - bh, gw * 0.3, bh);
    });
    ctx.fillStyle = "#17324a";
    ctx.fillText("$" + income[i].toLocaleString("en-US"), x + gw * 0.14, h - padB - (h - padB - padT) * (income[i] / max) - 5);
    ctx.fillStyle = "#5b6b7a"; ctx.fillText(m, x + gw * 0.3, h - 10);
  });
  ctx.fillStyle = "#0e7a6d"; ctx.fillRect(w - 150, 4, 12, 12);
  ctx.fillStyle = "#17324a"; ctx.fillText("Income", w - 134, 14);
  ctx.fillStyle = "#c96a1e"; ctx.fillRect(w - 82, 4, 12, 12);
  ctx.fillStyle = "#17324a"; ctx.fillText("Spending", w - 66, 14);
}
