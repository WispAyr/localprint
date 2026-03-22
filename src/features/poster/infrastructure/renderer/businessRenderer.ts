import QRCode from "qrcode";
import type { BusinessBranding } from "@/features/business/domain/types";
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
