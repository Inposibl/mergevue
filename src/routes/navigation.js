import { useEffect, useRef, useState } from "react";
import { resolveRoutePath } from "./routeModel.js";

export const BACK_NAVIGATION_WARNING = "Progress will be lost if you go back. Continue?";
export const NAVIGATE_EVENT = "st:navigate";

function browserWindow() {
  if (typeof window === "undefined") {
    throw new Error("Browser navigation requires a window object.");
  }
  return window;
}

export function currentRoutePath(location = browserWindow().location) {
  return location.pathname === "/" ? "/" : location.pathname;
}

export function navigate(route, targetWindow = browserWindow()) {
  targetWindow.history.pushState({}, "", route);
  targetWindow.dispatchEvent(new targetWindow.CustomEvent(NAVIGATE_EVENT));
}

export function handleRouteClick(route, targetWindow) {
  return (event) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    navigate(route, targetWindow);
  };
}

export function useCurrentRoute() {
  const [screen, setScreen] = useState(() => resolveRoutePath(currentRoutePath()));
  const activeRouteRef = useRef(screen.route);

  useEffect(() => {
    activeRouteRef.current = screen.route;
  }, [screen.route]);

  useEffect(() => {
    function syncScreen() {
      const nextScreen = resolveRoutePath(currentRoutePath());
      activeRouteRef.current = nextScreen.route;
      setScreen(nextScreen);
    }

    function handleBrowserBack() {
      const currentRoute = activeRouteRef.current;
      if (currentRoute.startsWith("/screen-") && !window.confirm(BACK_NAVIGATION_WARNING)) {
        window.history.pushState({}, "", currentRoute);
        syncScreen();
        return;
      }
      syncScreen();
    }

    window.addEventListener(NAVIGATE_EVENT, syncScreen);
    window.addEventListener("popstate", handleBrowserBack);
    return () => {
      window.removeEventListener(NAVIGATE_EVENT, syncScreen);
      window.removeEventListener("popstate", handleBrowserBack);
    };
  }, []);

  return screen;
}
