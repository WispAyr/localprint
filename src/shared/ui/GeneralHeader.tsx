import { type ReactNode } from "react";
import { InfoIcon } from "@/shared/ui/Icons";
import SocialLinkGroup from "@/shared/ui/SocialLinkGroup";

interface GeneralHeaderProps {
  onAboutOpen: () => void;
  children?: ReactNode;
}

export default function GeneralHeader({ onAboutOpen, children }: GeneralHeaderProps) {
  return (
    <header className="general-header">
      <div className="desktop-brand">
        <img
          className="desktop-brand-logo brand-logo"
          src="/assets/logo.svg"
          alt="LocalPrint logo"
        />
        <div className="desktop-brand-copy brand-copy">
          <h1 className="desktop-brand-title">LocalPrint</h1>
          <p className="desktop-brand-kicker app-kicker">
            Branded Map Posters For Your Business
          </p>
        </div>
      </div>

      <div className="general-header-actions">
        {children}
        <SocialLinkGroup variant="header" />
        <button
          type="button"
          className="general-header-text-btn general-header-about-text-btn"
          onClick={onAboutOpen}
          aria-label="About"
          title="About"
        >
          <span className="general-header-btn-label">About</span>
          <span className="general-header-btn-icon" aria-hidden="true">
            <InfoIcon />
          </span>
        </button>
      </div>
    </header>
  );
}
