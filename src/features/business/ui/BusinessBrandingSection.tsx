import { useCallback, useRef } from "react";
import type {
  BusinessBranding,
  LogoPosition,
  LogoSize,
  QrPosition,
  QrSize,
} from "@/features/business/domain/types";

interface BusinessBrandingSectionProps {
  branding: BusinessBranding;
  onChange: (changes: Partial<BusinessBranding>) => void;
  onApplyBrandTheme: () => void;
}

const LOGO_POSITIONS: { value: LogoPosition; label: string }[] = [
  { value: "top-left", label: "Top Left" },
  { value: "top-center", label: "Top Center" },
  { value: "top-right", label: "Top Right" },
  { value: "bottom-left", label: "Bottom Left" },
  { value: "bottom-center", label: "Bottom Center" },
  { value: "bottom-right", label: "Bottom Right" },
];

const LOGO_SIZES: { value: LogoSize; label: string }[] = [
  { value: "small", label: "Small" },
  { value: "medium", label: "Medium" },
  { value: "large", label: "Large" },
];

const QR_POSITIONS: { value: QrPosition; label: string }[] = [
  { value: "bottom-left", label: "Bottom Left" },
  { value: "bottom-right", label: "Bottom Right" },
];

const QR_SIZES: { value: QrSize; label: string }[] = [
  { value: "small", label: "Small" },
  { value: "medium", label: "Medium" },
];

const MAX_LOGO_BYTES = 2 * 1024 * 1024; // 2MB

export default function BusinessBrandingSection({
  branding,
  onChange,
  onApplyBrandTheme,
}: BusinessBrandingSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      if (file.size > MAX_LOGO_BYTES) {
        alert("Logo must be under 2MB");
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        onChange({ logoDataUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    },
    [onChange],
  );

  const handleRemoveLogo = useCallback(() => {
    onChange({ logoDataUrl: "" });
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [onChange]);

  return (
    <section className="panel-block business-branding-section">
      <p className="section-summary-label">BUSINESS BRANDING</p>

      {/* Logo Upload */}
      <div className="business-field-group">
        <label className="business-field-label">Business Logo</label>
        <div className="business-logo-upload">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/svg+xml"
            onChange={handleLogoUpload}
            className="business-file-input"
          />
          {branding.logoDataUrl && (
            <div className="business-logo-preview">
              <img
                src={branding.logoDataUrl}
                alt="Business logo"
                className="business-logo-thumb"
              />
              <button
                type="button"
                className="business-remove-btn"
                onClick={handleRemoveLogo}
              >
                Remove
              </button>
            </div>
          )}
        </div>
        {branding.logoDataUrl && (
          <>
            <div className="business-field-row">
              <label className="business-field-label">Logo Position</label>
              <select
                className="form-control-tall"
                value={branding.logoPosition}
                onChange={(e) =>
                  onChange({ logoPosition: e.target.value as LogoPosition })
                }
              >
                {LOGO_POSITIONS.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="business-field-row">
              <label className="business-field-label">Logo Size</label>
              <select
                className="form-control-tall"
                value={branding.logoSize}
                onChange={(e) =>
                  onChange({ logoSize: e.target.value as LogoSize })
                }
              >
                {LOGO_SIZES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}
      </div>

      {/* Business Text Fields */}
      <div className="business-field-group">
        <label className="business-field-label">Business Name</label>
        <input
          className="form-control-tall"
          type="text"
          placeholder="Your Business Name"
          value={branding.businessName}
          onChange={(e) => onChange({ businessName: e.target.value })}
        />
      </div>

      <div className="business-field-group">
        <label className="business-field-label">Tagline / Subtitle</label>
        <input
          className="form-control-tall"
          type="text"
          placeholder="Your tagline here"
          value={branding.tagline}
          onChange={(e) => onChange({ tagline: e.target.value })}
        />
      </div>

      <div className="business-field-group">
        <label className="business-field-label">Address</label>
        <input
          className="form-control-tall"
          type="text"
          placeholder="123 Main Street, City"
          value={branding.addressLine}
          onChange={(e) => onChange({ addressLine: e.target.value })}
        />
      </div>

      {/* Business Marker Toggle */}
      <div className="business-field-group">
        <label className="business-toggle-row">
          <input
            type="checkbox"
            checked={branding.showBusinessName}
            onChange={(e) =>
              onChange({ showBusinessName: e.target.checked })
            }
          />
          <span>Show business pin at map center</span>
        </label>
<label className="business-field-label">Business Logo</label>
        <div className="business-logo-upload">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/svg+xml"
            onChange={handleLogoUpload}
            className="business-file-input"
          />
          {branding.logoDataUrl && (
            <div className="business-logo-preview">
              <img
                src={branding.logoDataUrl}
                alt="Business logo"
                className="business-logo-thumb"
              />
              <button
                type="button"
                className="business-remove-btn"
                onClick={handleRemoveLogo}
              >
                Remove
              </button>
            </div>
          )}
        </div>
        {branding.logoDataUrl && (
          <>
            <div className="business-field-row">
              <label className="business-field-label">Logo Position</label>
              <select
                className="form-control-tall"
                value={branding.logoPosition}
                onChange={(e) =>
                  onChange({ logoPosition: e.target.value as LogoPosition })
                }
              >
                {LOGO_POSITIONS.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="business-field-row">
              <label className="business-field-label">Logo Size</label>
              <select
                className="form-control-tall"
                value={branding.logoSize}
                onChange={(e) =>
                  onChange({ logoSize: e.target.value as LogoSize })
                }
              >
                {LOGO_SIZES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}
      </div>

      {/* Business Text Fields */}
      <div className="business-field-group">
        <label className="business-field-label">Business Name</label>
        <input
          className="form-control-tall"
          type="text"
          placeholder="Your Business Name"
          value={branding.businessName}
          onChange={(e) => onChange({ businessName: e.target.value })}
        />
      </div>

      <div className="business-field-group">
        <label className="business-field-label">Tagline / Subtitle</label>
        <input
          className="form-control-tall"
          type="text"
          placeholder="Your tagline here"
          value={branding.tagline}
          onChange={(e) => onChange({ tagline: e.target.value })}
        />
      </div>

      <div className="business-field-group">
        <label className="business-field-label">Address</label>
        <input
          className="form-control-tall"
          type="text"
          placeholder="123 Main Street, City"
          value={branding.addressLine}
          onChange={(e) => onChange({ addressLine: e.target.value })}
        />
      </div>

      {/* Business Marker Toggle */}
      <div className="business-field-group">
        <label className="business-toggle-row">
          <input
            type="checkbox"
            checked={branding.showBusinessMarker}
            onChange={(e) =>
              onChange({ showBusinessMarker: e.target.checked })
            }
          />
          <span>Show business pin at map center</span>
        </label>
      </div>

      {/* QR Code */}
      <div className="business-field-group">
        <label className="business-field-label">QR Code URL</label>
        <input
          className="form-control-tall"
          type="url"
          placeholder="https://yourbusiness.com"
          value={branding.qrUrl}
          onChange={(e) => onChange({ qrUrl: e.target.value })}
        />
        {branding.qrUrl && (
          <div className="business-field-row-pair">
            <div className="business-field-row">
              <label className="business-field-label">QR Position</label>
              <select
                className="form-control-tall"
                value={branding.qrPosition}
                onChange={(e) =>
                  onChange({ qrPosition: e.target.value as QrPosition })
                }
              >
                {QR_POSITIONS.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="business-field-row">
              <label className="business-field-label">QR Size</label>
              <select
                className="form-control-tall"
                value={branding.qrSize}
                onChange={(e) =>
                  onChange({ qrSize: e.target.value as QrSize })
                }
              >
                {QR_SIZES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Brand Colours */}
      <div className="business-field-group">
        <label className="business-field-label">Brand Colours</label>
        <div className="brand-color-pickers">
          <div className="brand-color-field">
            <label>Primary</label>
            <input
              type="color"
              value={branding.brandPrimary}
              onChange={(e) => onChange({ brandPrimary: e.target.value })}
            />
            <span className="brand-color-hex">{branding.brandPrimary}</span>
          </div>
          <div className="brand-color-field">
            <label>Secondary</label>
            <input
              type="color"
              value={branding.brandSecondary}
              onChange={(e) => onChange({ brandSecondary: e.target.value })}
            />
            <span className="brand-color-hex">{branding.brandSecondary}</span>
          </div>
          <div className="brand-color-field">
            <label>Accent</label>
            <input
              type="color"
              value={branding.brandAccent}
              onChange={(e) => onChange({ brandAccent: e.target.value })}
            />
            <span className="brand-color-hex">{branding.brandAccent}</span>
          </div>
        </div>
        <button
          type="button"
          className="brand-apply-btn"
          onClick={onApplyBrandTheme}
        >
          Apply Brand Colours to Theme
        </button>
      </div>
    </section>
  );
}
