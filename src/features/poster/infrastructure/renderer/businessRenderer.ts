import QRCode from "qrcode";
import type { BusinessBranding } from "@/features/business/domain/types";
import type { MarkerItem } from "@/features/markers/domain/types";
import { LOGO_SIZE_PX } from "@/features/business/domain/types";

/**
 * Draw business branding elements onto the export canvas.
 * Called after poster text so business elements overlay correctly.
 */
export async function drawBusinessBranding(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  branding: BusinessBranding,
  fontFamily: string,
  textColor: string,
  markers?: MarkerItem[],
): Promise<void> {
  const dimScale = Math.max(0.45, Math.min(width, height) / 1000);
  const margin = Math.round(width * 0.03);
  const titleFontFamily = fontFamily
    ? `"${fontFamily}", "Space Grotesk", sans-serif`
    : '"Space Grotesk", sans-serif';

  // ── Logo ──
  if (branding.logoDataUrl) {
    try {
      const logoImg = await loadImage(branding.logoDataUrl);
      const maxSize = LOGO_SIZE_PX[branding.logoSize] * dimScale;
      const scale = Math.min(maxSize / logoImg.width, maxSize / logoImg.height, 1);
      const w = logoImg.width * scale;
      const h = logoImg.height * scale;
      const pos = getLogoPosition(branding.logoPosition, width, height, w, h, margin);
      ctx.drawImage(logoImg, pos.x, pos.y, w, h);
    } catch {
      // Skip logo if it fails to load
    }
  }

  // ── Business Name ──
  if (branding.businessName.trim() && (branding as any).showBusinessName !== false) {
    const fontSize = 50 * dimScale;
    ctx.fillStyle = textColor;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `700 ${fontSize}px ${titleFontFamily}`;
    ctx.shadowColor = "rgba(0,0,0,0.3)";
    ctx.shadowBlur = 6 * dimScale;
    ctx.fillText(branding.businessName, width * 0.5, height * 0.05);
    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;
  }

  // ── Tagline ──
  if (branding.tagline.trim()) {
    const fontSize = 25 * dimScale;
    const yOffset = branding.businessName.trim() ? 0.09 : 0.05;
    ctx.fillStyle = textColor;
    ctx.globalAlpha = 0.85;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `300 ${fontSize}px ${titleFontFamily}`;
    ctx.shadowColor = "rgba(0,0,0,0.2)";
    ctx.shadowBlur = 4 * dimScale;
    ctx.fillText(branding.tagline, width * 0.5, height * yOffset);
    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
  }

  // ── Address ──
  if (branding.addressLine.trim()) {
    const fontSize = 20 * dimScale;
    ctx.fillStyle = textColor;
    ctx.globalAlpha = 0.75;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `300 ${fontSize}px ${titleFontFamily}`;
    ctx.shadowColor = "rgba(0,0,0,0.2)";
    ctx.shadowBlur = 4 * dimScale;
    ctx.fillText(branding.addressLine, width * 0.5, height * 0.95);
    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
  }

  // ── Business Marker (star at center) ──
  if (branding.showBusinessMarker) {
    const starSize = 60 * dimScale;
    ctx.font = `${starSize}px serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.shadowColor = "rgba(0,0,0,0.4)";
    ctx.shadowBlur = 4 * dimScale;
    ctx.fillText("⭐", width * 0.5, height * 0.5);
    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;
  }

  // ── Timeline Bar ──
  if (branding.showTimeline && markers && markers.length > 0) {
    drawTimelineBar(ctx, width, height, markers, titleFontFamily, dimScale);
  }

  // ── QR Code ──
  if (branding.qrUrl.trim()) {
    try {
      const qrSize = (branding.qrSize === "medium" ? 120 : 80) * dimScale;
      const qrDataUrl = await QRCode.toDataURL(branding.qrUrl, {
        width: Math.round(qrSize),
        margin: 1,
        color: { dark: "#000000", light: "#FFFFFF" },
      });
      const qrImg = await loadImage(qrDataUrl);
      const qrMargin = margin + Math.round(height * 0.03);
      const x = branding.qrPosition === "bottom-left" ? margin : width - qrSize - margin;
      const y = height - qrSize - qrMargin;
      ctx.drawImage(qrImg, x, y, qrSize, qrSize);
    } catch {
      // Skip QR if generation fails
    }
  }
}

const DAYS_ORDER = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const DAY_SHORT: Record<string, string> = {
  Monday: "MON", Tuesday: "TUE", Wednesday: "WED",
  Thursday: "THU", Friday: "FRI", Saturday: "SAT", Sunday: "SUN",
};

function drawTimelineBar(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  markers: MarkerItem[],
  fontFamily: string,
  dimScale: number,
): void {
  const byDay = new Map<string, MarkerItem[]>();
  for (const day of DAYS_ORDER) byDay.set(day, []);
  for (const m of markers) {
    if (m.day && byDay.has(m.day)) byDay.get(m.day)!.push(m);
  }
  const hasAny = markers.some(m => m.day);
  if (!hasAny) return;

  const barH = height * 0.12;
  const barY = height * 0.78;
  const barX = width * 0.03;
  const barW = width * 0.94;
  const colW = barW / 7;
  const radius = 8 * dimScale;

  // Background
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(barX, barY, barW, barH, radius);
  ctx.fillStyle = "rgba(0,0,0,0.45)";
  ctx.fill();
  ctx.clip();

  // Day columns
  for (let i = 0; i < 7; i++) {
    const day = DAYS_ORDER[i];
    const stops = byDay.get(day) || [];
    const cx = barX + colW * i;
    const headerColor = stops.length > 0 ? stops[0].color : "rgba(255,255,255,0.5)";

    // Column divider
    if (i > 0) {
      ctx.strokeStyle = "rgba(255,255,255,0.12)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cx, barY);
      ctx.lineTo(cx, barY + barH);
      ctx.stroke();
    }

    // Day header
    const headerSize = Math.max(10, 14 * dimScale);
    ctx.font = `700 \${headerSize}px \${fontFamily}`;
    ctx.fillStyle = headerColor;
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText(DAY_SHORT[day] || day.slice(0,3).toUpperCase(), cx + colW / 2, barY + 6 * dimScale);

    // Stops
    const nameSize = Math.max(8, 11 * dimScale);
    const timeSize = Math.max(7, 9 * dimScale);
    let sy = barY + headerSize + 10 * dimScale;
    for (const stop of stops) {
      if (sy > barY + barH - 8 * dimScale) break;
      ctx.font = `500 \${nameSize}px \${fontFamily}`;
      ctx.fillStyle = "#ffffff";
      ctx.fillText(stop.title || stop.label || "", cx + colW / 2, sy);
      sy += nameSize + 2 * dimScale;
      if (stop.time) {
        ctx.font = `400 \${timeSize}px \${fontFamily}`;
        ctx.fillStyle = "rgba(255,255,255,0.65)";
        ctx.fillText(stop.time, cx + colW / 2, sy);
        sy += timeSize + 4 * dimScale;
      }
    }
  }

  ctx.restore();
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function getLogoPosition(
  position: string,
  canvasW: number,
  canvasH: number,
  logoW: number,
  logoH: number,
  margin: number,
): { x: number; y: number } {
  switch (position) {
    case "top-left": return { x: margin, y: margin };
    case "top-center": return { x: (canvasW - logoW) / 2, y: margin };
    case "top-right": return { x: canvasW - logoW - margin, y: margin };
    case "bottom-left": return { x: margin, y: canvasH - logoH - margin };
    case "bottom-center": return { x: (canvasW - logoW) / 2, y: canvasH - logoH - margin };
    case "bottom-right": return { x: canvasW - logoW - margin, y: canvasH - logoH - margin };
    default: return { x: margin, y: margin };
  }
}
