export async function downloadCoachFlyer({ qr, name, period, expires, c }) {
  const canvas = document.createElement("canvas");
  canvas.width = 1200;
  canvas.height = 1700;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, 1200, 1700);
  ctx.fillStyle = "#047857";
  ctx.fillRect(0, 0, 1200, 16);
  ctx.textAlign = "center";
  const text = (value, y, size, width = 1020, color = "#111827") => {
    ctx.font = `600 ${size}px Arial, sans-serif`;
    ctx.fillStyle = color;
    const words = value.split(/\s+/);
    let line = "";
    for (const word of words) {
      const candidate = line ? line + " " + word : word;
      if (ctx.measureText(candidate).width > width && line) {
        ctx.fillText(line, 600, y, width);
        y += size * 1.35;
        line = word;
      } else line = candidate;
    }
    if (line) ctx.fillText(line, 600, y, width);
    return y + size * 1.35;
  };
  text("FULL BALANCE", 140, 68);
  const titleEnd = text(c("promo"), 235, 42);
  const nameEnd = text(name, Math.max(360, titleEnd + 30), 40, 1000, "#047857");
  const periodEnd = text(period, nameEnd + 18, 30);
  const image = new Image();
  image.src = qr;
  await image.decode();
  ctx.drawImage(image, 300, Math.max(500, periodEnd + 30), 600, 600);
  text("fullbalance.app", 1250, 34);
  text(c("printNote"), 1350, 28);
  text(c("inviteExpiry") + ": " + expires, 1570, 24, 1050, "#4b5563");
  const blob = await new Promise((resolve) =>
    canvas.toBlob(resolve, "image/png"),
  );
  if (!blob) throw new Error("Image export failed");
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "full-balance-pt-tanitim.png";
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
