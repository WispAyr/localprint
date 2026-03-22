/** Business branding state for LocalPrint */

export type LogoPosition =
  | "top-left"
  | "top-right"
  | "top-center"
  | "bottom-left"
  | "bottom-right"
  | "bottom-center";

export type LogoSize = "small" | "medium" | "large";

export type QrPosition = "bottom-left" | "bottom-right";
export type QrSize = "small" | "medium";

export interface MarkerCategory {
  id: string;
  label: string;
  emoji: string;
  color: string;
}

export const MARKER_CATEGORIES: MarkerCategory[] = [
  { id: "parking", label: "Parking", emoji: "🅿️", color: "#3B82F6" },
  { id: "food", label: "Food & Drink", emoji: "🍽️", color: "#EF4444" },
  { id: "attraction", label: "Attraction", emoji: "⭐", color: "#F59E0B" },
  { id: "transport", label: "Transport", emoji: "🚂", color: "#8B5CF6" },
  { id: "accommodation", label: "Accommodation", emoji: "🏨", color: "#10B981" },
  { id: "custom", label: "Custom", emoji: "📍", color: "#6B7280" },
];

export interface BusinessBranding {
  /** Business logo as base64 data URL */
  logoDataUrl: string;
  logoPosition: LogoPosition;
  logoSize: LogoSize;

  /** Business text fields */
  businessName: string;
  tagline: string;
  addressLine: string;

  /** QR code */
  qrUrl: string;
  qrPosition: QrPosition;
  qrSize: QrSize;

  /** Show business marker at center */
  showBusinessMarker: boolean;

  /** Brand colours */
  brandPrimary: string;
  brandSecondary: string;
  brandAccent: string;
}

export const DEFAULT_BUSINESS_BRANDING: BusinessBranding = {
  logoDataUrl: "",
  logoPosition: "top-left",
  logoSize: "medium",
  businessName: "",
  tagline: "",
  addressLine: "",
  qrUrl: "",
  qrPosition: "bottom-right",
  qrSize: "small",
  showBusinessMarker: false,
  brandPrimary: "#1E3A5F",
  brandSecondary: "#FFFFFF",
  brandAccent: "#4A90D9",
};

export const LOGO_SIZE_PX: Record<LogoSize, number> = {
  small: 60,
  medium: 100,
  large: 150,
};
