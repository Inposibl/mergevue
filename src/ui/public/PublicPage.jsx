import React from "react";

export const HOME_MAIN_CONTENT_ID = "mv-home-main-content";

export function PublicPage({ children, className = "", mainId = "mv-public-main" }) {
  const classes = ["mv-public-page", className].filter(Boolean).join(" ");
  const contentId = mainId === "mv-home-main" ? HOME_MAIN_CONTENT_ID : `${mainId}-content`;

  return (
    <main className={classes} id={mainId}>
      <div className="mv-public-page-inner" id={contentId} tabIndex={-1}>
        {children}
      </div>
    </main>
  );
}
