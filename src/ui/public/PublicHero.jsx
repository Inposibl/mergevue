import React from "react";

export function PublicHero({ eyebrow, title, lead, children }) {
  return (
    <header className="mv-public-hero">
      {eyebrow ? <p className="mv-public-eyebrow">{eyebrow}</p> : null}
      <h1 className="mv-public-hero-title">{title}</h1>
      {lead ? <p className="mv-public-hero-lead">{lead}</p> : null}
      {children ? <div className="mv-public-hero-copy">{children}</div> : null}
    </header>
  );
}
