import React from "react";

export function PublicTrustItem({ label, href, onClick, children }) {
  return (
    <li className="mv-public-trust-item">
      <a className="mv-public-trust-link" href={href} onClick={onClick}>{label}</a>
      {children ? <p className="mv-public-trust-note">{children}</p> : null}
    </li>
  );
}
