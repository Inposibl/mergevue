import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { SCREEN_REGISTRY, screenByRoute } from "../src/screenRegistry.js";
import {
  CURRENT_ROUTE_FAMILY_COUNT,
  ROUTE_COMPATIBILITY_MAP,
  resolveRoutePath,
} from "../src/routes/routeModel.js";
import {
  NAVIGATE_EVENT,
  handleRouteClick,
  navigate,
} from "../src/routes/navigation.js";
import {
  renderResolvedScreen,
  rendererIdForScreen,
} from "../src/screens/screenDispatch.js";
import {
  ROUTE_SHELL_IDS,
  resolveRouteShell,
} from "../src/shell/routeShell.js";

const appSource = await readFile(new URL("../src/App.jsx", import.meta.url), "utf8");
const navigationSource = await readFile(new URL("../src/routes/navigation.js", import.meta.url), "utf8");

const routeCases = Object.freeze([
  ["/", "home", "/"],
  ["/home", "home", "/home"],
  ["/about-methodology", "about-methodology", "/about-methodology"],
  ["/about-methodology/overview", "methodology-overview", "/about-methodology/overview"],
  ["/case-studies", "case-studies", "/case-studies"],
  ["/case-studies/amazon-whole-foods", "case-study-detail", "/case-studies/amazon-whole-foods"],
  ["/environments", "interaction-environments", "/environments"],
  ["/environments/idea-lab", "interaction-environments", "/environments/idea-lab"],
  ["/start-diagnostic", "diagnostic-before-you-begin", "/start-diagnostic/before-you-begin"],
  ["/screen-2-role", "diagnostic-before-you-begin", "/start-diagnostic/before-you-begin"],
  ["/not-a-current-route", "diagnostic-before-you-begin", "/start-diagnostic/before-you-begin"],
]);

const BASELINE_INACTIVE_SCREEN_ROUTES = Object.freeze([
  "/screen-4-promise",
  "/screen-5-acquirer-module",
  "/screen-6-acquirer-submit",
  "/screen-6a-target-observation-setup",
  "/screen-6a-target-observation-setup/details",
  "/screen-6b-target-observation",
  "/screen-7-step-2b-level-1",
  "/screen-8-step-2b-transition",
  "/screen-9-step-2b-level-2",
  "/screen-9a-target-code-gate",
  "/screen-10-reveal",
  "/screen-10b-homogeneous",
  "/screen-11-paid-offer",
  "/screen-11b-homogeneous-offer",
  "/screen-12-email-capture",
  "/screen-12-consultation-request",
]);

const BASELINE_ACTIVE_SECTION_CASES = Object.freeze([
  ["/", "home"],
  ["/home", "home"],
  ["/about-methodology", "methodology"],
  ["/about-methodology/overview", "methodology"],
  ["/case-studies", "case-studies"],
  ["/case-studies/amazon-whole-foods", "case-studies"],
  ["/environments", "environments"],
  ["/environments/idea-lab", "environments"],
  ["/start-diagnostic", "diagnostic"],
  ["/start-diagnostic/before-you-begin", "diagnostic"],
]);

const INACTIVE_TARGET_ONLY_PATHS = Object.freeze([
  "/how-it-works",
  "/methodology",
  "/methodology/overview",
  "/methodology/environments",
  "/historical-replays",
  "/analyze",
  "/analyze/context",
  "/workspace",
]);

assert.equal(SCREEN_REGISTRY.length, 24, "the registry must retain the 23 baseline routes plus the public research result");
assert.equal(CURRENT_ROUTE_FAMILY_COUNT, 33, "the current application must retain 33 route families");
assert.equal(new Set(SCREEN_REGISTRY.map((screen) => screen.id)).size, 24, "route ids must remain unique");
assert.equal(new Set(SCREEN_REGISTRY.map((screen) => screen.route)).size, 24, "exact routes must remain unique");

for (const [route, expectedId, expectedRoute] of routeCases) {
  const resolved = screenByRoute(route);
  assert.equal(resolved.id, expectedId, `${route} resolved to the wrong screen`);
  assert.equal(resolved.route, expectedRoute, `${route} returned the wrong compatibility route`);
}

assert.equal(screenByRoute("/case-studies/amazon-whole-foods/").caseId, "amazon-whole-foods");
assert.equal(screenByRoute("/environments/idea-lab").environmentId, "idea-lab");
assert.equal(resolveRoutePath("").id, "home", "an empty route must normalize to the home route");
assert.equal(ROUTE_COMPATIBILITY_MAP.length, 7, "the current-to-target path map must remain explicit");

for (const screen of SCREEN_REGISTRY) {
  assert.equal(screenByRoute(screen.route).id, screen.id, `${screen.route} is not reachable through its registered id`);
}

for (const route of BASELINE_INACTIVE_SCREEN_ROUTES) {
  assert.equal(
    resolveRoutePath(route).navigationSection,
    "",
    `${route} must preserve the baseline state with no active sidebar item`,
  );
}

for (const [route, expectedSection] of BASELINE_ACTIVE_SECTION_CASES) {
  assert.equal(
    resolveRoutePath(route).navigationSection,
    expectedSection,
    `${route} must preserve its baseline active sidebar section`,
  );
}

for (const route of INACTIVE_TARGET_ONLY_PATHS) {
  assert.equal(resolveRoutePath(route).isFallback, true, `${route} must remain inactive until a separate route act`);
}

const publicResearchResult = resolveRoutePath("/start-diagnostic/deal-context/result");
assert.equal(publicResearchResult.id, "deal-context-public-result");
assert.equal(publicResearchResult.rendererId, "PublicResearchResultScreen");
assert.equal(publicResearchResult.propsKind, "none");
assert.equal(publicResearchResult.targetLayer, "public-result");
assert.equal(publicResearchResult.isFallback, false);
assert.equal(publicResearchResult.canonicalRoute, "/start-diagnostic/deal-context/result");
assert.equal(publicResearchResult.navigationSection, "");
assert.equal(rendererIdForScreen(publicResearchResult), "PublicResearchResultScreen");
assert.equal(resolveRoutePath("/start-diagnostic/deal-context/resul").isFallback, true);

const pushedRoutes = [];
const dispatchedEvents = [];
class FakeCustomEvent {
  constructor(type) {
    this.type = type;
  }
}
const fakeWindow = {
  CustomEvent: FakeCustomEvent,
  history: { pushState: (_state, _title, route) => pushedRoutes.push(route) },
  dispatchEvent: (event) => dispatchedEvents.push(event.type),
};
navigate("/case-studies", fakeWindow);
assert.deepEqual(pushedRoutes, ["/case-studies"], "navigation must push the requested History API route");
assert.deepEqual(dispatchedEvents, [NAVIGATE_EVENT], "navigation must dispatch the existing synchronization event");

let prevented = false;
handleRouteClick("/home", fakeWindow)({
  defaultPrevented: false,
  button: 0,
  metaKey: false,
  ctrlKey: false,
  shiftKey: false,
  altKey: false,
  preventDefault: () => { prevented = true; },
});
assert.equal(prevented, true, "an unmodified primary click must stay inside client navigation");
assert.deepEqual(pushedRoutes, ["/case-studies", "/home"]);
handleRouteClick("/environments", fakeWindow)({
  defaultPrevented: false,
  button: 0,
  metaKey: true,
  ctrlKey: false,
  shiftKey: false,
  altKey: false,
  preventDefault: () => assert.fail("modified clicks must retain browser behavior"),
});
assert.deepEqual(pushedRoutes, ["/case-studies", "/home"]);

assert.match(navigationSource, /window\.addEventListener\("popstate", handleBrowserBack\)/, "browser back navigation must remain subscribed");

const standaloneRouteIds = [
  "screen-6-acquirer-verification",
  "screen-6a-target-observation-authorized",
  "screen-2c-target-self-assessment",
];
for (const routeId of standaloneRouteIds) {
  const screen = SCREEN_REGISTRY.find((candidate) => candidate.id === routeId);
  assert.equal(resolveRouteShell(screen), ROUTE_SHELL_IDS.STANDALONE, `${routeId} must remain standalone`);
}
const targetGate = SCREEN_REGISTRY.find((screen) => screen.id === "screen-9a-target-code-gate");
assert.equal(resolveRouteShell(targetGate), ROUTE_SHELL_IDS.LEGACY_SITE, "the preliminary target gate must retain the site shell");
assert.equal(resolveRouteShell(targetGate, { targetSessionId: "target-1" }), ROUTE_SHELL_IDS.STANDALONE, "target code entry must remain standalone");
assert.equal(rendererIdForScreen(targetGate), "PreliminaryTargetGateScreen");
assert.equal(rendererIdForScreen(targetGate, { targetSessionId: "target-1" }), "TargetCodeEntryScreen");
const dispatchContext = { session: { sessionId: "session-1" }, setSession: () => {}, targetSessionId: null };
const preliminaryElement = renderResolvedScreen({
  screen: targetGate,
  context: dispatchContext,
  components: {
    PreliminaryTargetGateScreen: () => null,
    PlaceholderScreen: () => null,
  },
});
assert.equal(preliminaryElement.props.session, dispatchContext.session, "the preliminary target gate must retain session props");
assert.equal(preliminaryElement.props.setSession, dispatchContext.setSession, "the preliminary target gate must retain its state setter");
const codeEntryElement = renderResolvedScreen({
  screen: targetGate,
  context: { ...dispatchContext, targetSessionId: "target-1" },
  components: {
    TargetCodeEntryScreen: () => null,
    PlaceholderScreen: () => null,
  },
});
assert.equal(codeEntryElement.props.targetSessionId, "target-1", "the target code renderer must receive its session id");

for (const finalRoute of ["/screen-10-reveal", "/screen-10b-homogeneous"]) {
  assert.equal(rendererIdForScreen(screenByRoute(finalRoute)), "FinalDeliverablesScreen", `${finalRoute} must retain the server-authority renderer`);
}
assert.match(appSource, /authorityState\.status !== "report-ready" \|\| !authorityState\.projection/, "final deliverables must remain fail-closed without server report authority");
assert.match(appSource, /productionAuthorityRequest\(\{[\s\S]*?action: "STATUS",[\s\S]*?sessionId: session\.sessionId,[\s\S]*?\}, controller\.signal\)/, "final deliverables must still request server authority status");

console.log("WEB-ARCH-01 characterization: 33 route families, sidebar baseline parity, and shell/dispatch behavior preserved");
