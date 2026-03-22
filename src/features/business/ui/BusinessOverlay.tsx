import { useEffect, useState, useMemo } from "react";
import QRCode from "qrcode";
import type { BusinessBranding } from "@/features/business/domain/types";
import { LOGO_SIZE_PX } from "@/features/business/domain/types";

interface BusinessOverlayProps {
  branding: BusinessBranding;
  fontFamily: string;
  textColor: string;
}

const MARGIN_RATIO = 0.03;

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
    if (!branding.qrUrl) {
      setQrDataUrl("");
      return;
    }
    QRCode.toDataURL(branding.qrUrl, {
      width: 200,
      margin: 1,
      color: { dark: "#000000", light: "#FFFFFF" },
    })
      .then(setQrDataUrl)
      .catch(() => setQrDataUrl(""));
  }, [branding.qrUrl]);

  const logoSizePx = LOGO_SIZE_PX[branding.logoSize] || 100;
  const logoCqmin = (logoSizePx / 1000) * 100;

  const logoStyle = useMemo(() => {
    const s: React.CSSProperties = {
      position: "absolute",
      width: `${logoCqmin}cqmin`,
      height: "auto",
      maxHeight: `${logoCqmin}cqmin`,
      objectFit: "contain",
      zIndex: 10,
    };
    const m = `${MARGIN_RATIO * 100}%`;
    switch (branding.logoPosition) {
      case "top-left": s.top = m; s.left = m; break;
      case "top-center": s.top = m; s.left = "50%"; s.transform = "translateX(-50%)"; break;
      case "top-right": s.top = m; s.right = m; break;
      case "bottom-left": s.bottom = m; s.left = m; break;
      case "bottom-center": s.bottom = m; s.left = "50%"; s.transform = "translateX(-50%)"; break;
      case "bottom-right": s.bottom = m; s.right = m; break;
    }
    return s;
  }, [branding.logoPosition, logoCqmin]);

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
    const m = `${MARGIN_RATIO * 100 + 3}%`; // offset above attribution
    if (branding.qrPosition === "bottom-left") {
      s.bottom = m;
      s.left = `${MARGIN_RATIO * 100}%`;
    } else {
      s.bottom = m;
      s.right = `${MARGIN_RATIO * 100}%`;
    }
    return s;
  }, [branding.qrPosition, qrSizeCq]);

  const hasBusinessName = branding.businessName.trim().length > 0;
  const hasTagline = branding.tagline.trim().length > 0;
  const hasAddress = branding.addressLine.trim().length > 0;

  return (
    <div className="business-overlay" style={{ color: textColor }}>
      {/* Logo */}
      {branding.logoDataUrl && (
        <img
          src={branding.logoDataUrl}
          alt="Business logo"
          style={logoStyle}
        />
      )}

      {/* Business Name - top center */}
      {hasBusinessName && (
        <div
          className="business-overlay-name"
          style={{
            position: "absolute",
            top: "4%",
            left: "50%",
            transform: "translateX(-50%)",
            fontFamily: titleFont,
            fontWeight: 700,
            fontSize: "5cqmin",
            textAlign: "center",
            whiteSpace: "nowrap",
            zIndex: 10,
            textShadow: "0 1px 6px rgba(0,0,0,0.3)",
          }}
        >
          {branding.businessName}
        </div>
      )}

      {/* Tagline - below business name */}
      {hasTagline && (
        <div
          className="business-overlay-tagline"
          style={{
            position: "absolute",
            top: hasBusinessName ? "9%" : "4%",
            left: "50%",
            transform: "translateX(-50%)",
            fontFamily: titleFont,
            fontWeight: 300,
            fontSize: "2.5cqmin",
            textAlign: "center",
            whiteSpace: "nowrap",
            opacity: 0.85,
            zIndex: 10,
            textShadow: "0 1px 4px rgba(0,0,0,0.2)",
          }}
        >
          {branding.tagline}
        </div>
      )}

      {/* Address - bottom center */}
      {hasAddress && (
        <div
          className="business-overlay-address"
          style={{
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
          }}
        >
          {branding.addressLine}
        </div>
      )}

      {/* QR Code */}
      {qrDataUrl && (
        <img
          src={qrDataUrl}
          alt="QR Code"
          style={qrStyle}
        />
      )}

      {/* Business Marker (star at center) */}
      {branding.showBusinessMarker && (
        <div
          className="business-center-marker"
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            fontSize: "6cqmin",
            zIndex: 15,
            filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.4))",
            pointerEvents: "none",
          }}
        >
          ⭐
        </div>
      )}
    </div>
  );
}
