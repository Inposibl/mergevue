import React from "react";

export function PublicSection({ children, className = "", labelledBy, label }) {
  const classes = ["mv-public-section", className].filter(Boolean).join(" ");
  const labelledProps = labelledBy
    ? { "aria-labelledby": labelledBy }
    : (label ? { "aria-label": label } : {});

  return (
    <section className={classes} {...labelledProps}>
      {children}
    </section>
  );
}
