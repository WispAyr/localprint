import { useEffect, useState, useMemo } from "react";
import QRCode from "qrcode";
import type { BusinessBranding } from "@/features/business/domain/types";

interface BusinessOverlayProps {
  branding: BusinessBranding;
  fontFamily: string;
  textColor: string;
}

export default function BusinessOverlay({
  branding,
  fontFamily,
  textColor,
}: BusinessOverlayProps) {
  const [qrDataUrl, setQrDataUrl] = useState("");

  const titleFont = fontFamily
    ? `"${fontFamily}", "Space Grotesk", sans-serif`
    : '"Space Grotesk", sans-serif';

  useEffect(() => {
    if (!branding.qrUrl) { setQrDataUrl(""); return; }
    QRCode.toDataURL(branding.qrUrl, { width: 200, margin: 1, color: { dark: "#000000", light: "#FFFFFF" } })
      .then(setQrDataUrl).catch(() => setQrDataUrl(""));
  }, [branding.qrUrl]);

  const hasLogo = Boolean(branding.logoDataUrl);
  const hasBusinessName = (branding as any).showBusinessName !== false && branding.businessName.trim().length > 0;
  const hasTagline = branding.tagline.trim().length > 0;
  const hasAddress = branding.addressLine.trim().length > 0;

  const qrSizeCq = branding.qrSize === "medium" ? 12 : 8;
  const qrStyle = useMemo(() => {
    const s: React.CSSProperties = {
      position: "absolute",
      width: `${qrSizeCq}cqmin`,
      height: `${qrSizeCq}cqmin`,
      zIndex: 10,
      borderRadius: "4px",
      overflow: "hidden",
    };
    const m = "6%";
    if (branding.qrPosition === "bottom-left") { s.bottom = m; s.left = "3%"; }
    else { s.bottom = m; s.right = "3%"; }
    return s;
  }, [branding.qrPosition, qrSizeCq]);

  return (
    <div className="business-overlay" style={{ color: textColor }}>
      {/* Top branding block — logo, name, tagline stacked vertically */}
      {(hasLogo || hasBusinessName || hasTagline) && (
        <div style={{
          position: "absolute",
          top: "2%",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "0.5cqmin",
          zIndex: 10,
          pointerEvents: "none",
        }}>
          {hasLogo && (
            <img src={branding.logoDataUrl} alt="Logo" style={{
              width: "18cqmin",
              height: "auto",
              maxHeight: "10cqmin",
              objectFit: "contain",
            }} />
          )}
          {hasBusinessName && (
            <div style={{
              fontFamily: titleFont,
              fontWeight: 700,
              fontSize: "5cqmin",
              textAlign: "center",
              whiteSpace: "nowrap",
              textShadow: "0 1px 6px rgba(0,0,0,0.3)",
            }}>
              {branding.businessName}
            </div>
          )}
          {hasTagline && (
            <div style={{
              fontFamily: titleFont,
              fontWeight: 300,
              fontSize: "2.5cqmin",
              textAlign: "center",
              whiteSpace: "nowrap",
              opacity: 0.85,
              textShadow: "0 1px 4px rgba(0,0,0,0.2)",
            }}>
              {branding.tagline}
            </div>
          )}
        </div>
      )}

      {/* Address - bottom center */}
      {hasAddress && (
        <div style={{
          position: "absolute",
          bottom: "5%",
          left: "50%",
          transform: "translateX(-50%)",
          fontFamily: titleFont,
          fontWeight: 300,
          fontSize: "2cqmin",
          textAlign: "center",
          whiteSpace: "nowrap",
          opacity: 0.75,
          zIndex: 10,
          textShadow: "0 1px 4px rgba(0,0,0,0.2)",
        }}>
          {branding.addressLine}
        </div>
      )}

      {/* QR Code */}
      {qrDataUrl && <img src={qrDataUrl} alt="QR Code" style={qrStyle} />}

      {/* Business Marker */}
      {branding.showBusinessMarker && (
        <div style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          fontSize: "6cqmin",
          zIndex: 15,
          filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.4))",
          pointerEvents: "none",
        }}>⭐</div>
      )}
    </div>
  );
}
