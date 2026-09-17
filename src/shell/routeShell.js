import { ROUTE_SHELL_STRATEGIES } from "../routes/routeModel.js";

export const ROUTE_SHELL_IDS = Object.freeze({
  LEGACY_SITE: "legacy-site",
  STANDALONE: "standalone",
});

export function resolveRouteShell(screen, { targetSessionId = null } = {}) {
  if (screen?.shellStrategy === ROUTE_SHELL_STRATEGIES.STANDALONE) {
    return ROUTE_SHELL_IDS.STANDALONE;
  }
  if (screen?.shellStrategy === ROUTE_SHELL_STRATEGIES.TARGET_CODE_CONDITIONAL && targetSessionId) {
    return ROUTE_SHELL_IDS.STANDALONE;
  }
  return ROUTE_SHELL_IDS.LEGACY_SITE;
}
