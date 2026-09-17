import React from "react";

export function PublicButton({
  href,
  onClick,
  children,
  variant = "primary",
  type = "button",
  className = "",
}) {
  const classes = ["mv-public-button", `mv-public-button-${variant}`, className].filter(Boolean).join(" ");

  if (href) {
    return (
      <a className={classes} href={href} onClick={onClick}>
        {children}
      </a>
    );
  }

  return (
    <button className={classes} type={type} onClick={onClick}>
      {children}
    </button>
  );
}
