export const ROUTE_SHELL_STRATEGIES = Object.freeze({
  LEGACY_SITE: "legacy-site",
  STANDALONE: "standalone",
  TARGET_CODE_CONDITIONAL: "target-code-conditional",
});

export const TARGET_PRODUCT_LAYERS = Object.freeze({
  PUBLIC_SITE: "public-site",
  ANONYMOUS_ANALYSIS: "anonymous-analysis",
  PUBLIC_RESULT: "public-result",
  REGISTERED_DEEPER_ANALYSIS: "registered-deeper-analysis",
  PARTICIPANT: "participant",
  PUBLIC_TO_DEEPER_TRANSITION: "public-to-deeper-transition",
});

const PROPS_KINDS = Object.freeze({
  NONE: "none",
  SCREEN: "screen",
  SESSION: "session",
  SET_SESSION: "set-session",
  SESSION_AND_SET_SESSION: "session-and-set-session",
  CASE_DETAIL: "case-detail",
  ENVIRONMENT_DETAIL: "environment-detail",
  TARGET_CODE_GATE: "target-code-gate",
  PAID_OFFER_HETEROGENEOUS: "paid-offer-heterogeneous",
  PAID_OFFER_HOMOGENEOUS: "paid-offer-homogeneous",
});

function defineRoute({
  id,
  title,
  route,
  rendererId,
  propsKind = PROPS_KINDS.NONE,
  navigationSection = "",
  shellStrategy = ROUTE_SHELL_STRATEGIES.LEGACY_SITE,
  targetLayer = TARGET_PRODUCT_LAYERS.REGISTERED_DEEPER_ANALYSIS,
  targetPath = null,
}) {
  return Object.freeze({
    id,
    title,
    route,
    rendererId,
    propsKind,
    navigationSection,
    shellStrategy,
    targetLayer,
    targetPath,
  });
}

export const SCREEN_REGISTRY = Object.freeze([
  defineRoute({ id: "diagnostic-before-you-begin", title: "Before You Begin", route: "/start-diagnostic/before-you-begin", rendererId: "DiagnosticGatePage", navigationSection: "diagnostic", targetLayer: TARGET_PRODUCT_LAYERS.ANONYMOUS_ANALYSIS, targetPath: "/analyze" }),
  defineRoute({ id: "deal-context-acquisition-motive", title: "Deal Context / Acquisition Motive", route: "/start-diagnostic/deal-context", rendererId: "AcquisitionMotiveScreen", propsKind: PROPS_KINDS.SESSION_AND_SET_SESSION, navigationSection: "diagnostic", targetLayer: TARGET_PRODUCT_LAYERS.ANONYMOUS_ANALYSIS, targetPath: "/analyze/context" }),
  defineRoute({ id: "deal-context-refine-evidence-quality", title: "Refine evidence quality (optional)", route: "/start-diagnostic/deal-context/refine-evidence-quality", rendererId: "RefineEvidenceQualityScreen", propsKind: PROPS_KINDS.SESSION_AND_SET_SESSION, navigationSection: "diagnostic" }),
  defineRoute({ id: "deal-context-transaction-details", title: "Acquirer Transaction Context", route: "/start-diagnostic/deal-context/details", rendererId: "TransactionDetailsScreen", propsKind: PROPS_KINDS.SESSION_AND_SET_SESSION, navigationSection: "diagnostic" }),
  defineRoute({ id: "screen-4-promise", title: "Promise and time anchor", route: "/screen-4-promise", rendererId: "PromiseScreen", propsKind: PROPS_KINDS.SESSION, navigationSection: "" }),
  defineRoute({ id: "screen-5-acquirer-module", title: "Acquirer module", route: "/screen-5-acquirer-module", rendererId: "AcquirerModuleScreen", propsKind: PROPS_KINDS.SESSION_AND_SET_SESSION, navigationSection: "" }),
  defineRoute({ id: "screen-6-acquirer-submit", title: "Acquirer module submit", route: "/screen-6-acquirer-submit", rendererId: "AcquirerSubmitScreen", propsKind: PROPS_KINDS.SESSION_AND_SET_SESSION, navigationSection: "" }),
  defineRoute({ id: "screen-6-acquirer-verification", title: "Authorized Acquirer Verification", route: "/screen-6-acquirer-verification", rendererId: "AuthorizedAcquirerVerificationScreen", propsKind: PROPS_KINDS.SET_SESSION, shellStrategy: ROUTE_SHELL_STRATEGIES.STANDALONE, targetLayer: TARGET_PRODUCT_LAYERS.PARTICIPANT }),
  defineRoute({ id: "screen-6a-target-observation-setup", title: "Target Observation Setup", route: "/screen-6a-target-observation-setup", rendererId: "TargetObservationSetupIntroScreen", propsKind: PROPS_KINDS.SESSION_AND_SET_SESSION, navigationSection: "" }),
  defineRoute({ id: "screen-6a-target-observation-setup-details", title: "Target Observation Setup Details", route: "/screen-6a-target-observation-setup/details", rendererId: "TargetObservationSetupScreen", propsKind: PROPS_KINDS.SESSION_AND_SET_SESSION, navigationSection: "" }),
  defineRoute({ id: "screen-6a-target-observation-authorized", title: "Authorized Target Observation Setup", route: "/screen-6a-target-observation-setup/authorized", rendererId: "AuthorizedTargetObservationSetupScreen", propsKind: PROPS_KINDS.SET_SESSION, shellStrategy: ROUTE_SHELL_STRATEGIES.STANDALONE, targetLayer: TARGET_PRODUCT_LAYERS.PARTICIPANT }),
  defineRoute({ id: "screen-6b-target-observation", title: "Target Observation", route: "/screen-6b-target-observation", rendererId: "TargetObservationScreen", propsKind: PROPS_KINDS.SESSION_AND_SET_SESSION, navigationSection: "" }),
  defineRoute({ id: "screen-7-step-2b-level-1", title: "Step 2-B Level 1", route: "/screen-7-step-2b-level-1", rendererId: "Step2BLevel1Screen", propsKind: PROPS_KINDS.SESSION_AND_SET_SESSION, navigationSection: "" }),
  defineRoute({ id: "screen-8-step-2b-transition", title: "Step 2-B transition", route: "/screen-8-step-2b-transition", rendererId: "Step2BTransitionScreen", propsKind: PROPS_KINDS.SESSION, navigationSection: "" }),
  defineRoute({ id: "screen-9-step-2b-level-2", title: "Step 2-B Level 2", route: "/screen-9-step-2b-level-2", rendererId: "Step2BLevel2Screen", propsKind: PROPS_KINDS.SESSION_AND_SET_SESSION, navigationSection: "" }),
  defineRoute({ id: "screen-2c-target-self-assessment", title: "Step 2-C Target Self-Assessment", route: "/screen-2c-target-self-assessment", rendererId: "TargetSelfAssessmentDirectScreen", propsKind: PROPS_KINDS.SESSION_AND_SET_SESSION, shellStrategy: ROUTE_SHELL_STRATEGIES.STANDALONE, targetLayer: TARGET_PRODUCT_LAYERS.PARTICIPANT }),
  defineRoute({ id: "screen-9a-target-code-gate", title: "Preliminary Target Link + Digital Code Gate", route: "/screen-9a-target-code-gate", rendererId: "PreliminaryTargetGateScreen", propsKind: PROPS_KINDS.TARGET_CODE_GATE, navigationSection: "", shellStrategy: ROUTE_SHELL_STRATEGIES.TARGET_CODE_CONDITIONAL, targetLayer: TARGET_PRODUCT_LAYERS.PARTICIPANT }),
  defineRoute({ id: "screen-10-reveal", title: "Reveal sequence", route: "/screen-10-reveal", rendererId: "FinalDeliverablesScreen", propsKind: PROPS_KINDS.SESSION_AND_SET_SESSION, navigationSection: "", targetLayer: TARGET_PRODUCT_LAYERS.PUBLIC_RESULT }),
  defineRoute({ id: "screen-10b-homogeneous", title: "Homogeneous Integration", route: "/screen-10b-homogeneous", rendererId: "FinalDeliverablesScreen", propsKind: PROPS_KINDS.SESSION_AND_SET_SESSION, navigationSection: "", targetLayer: TARGET_PRODUCT_LAYERS.PUBLIC_RESULT }),
  defineRoute({ id: "screen-11-paid-offer", title: "Paid offer", route: "/screen-11-paid-offer", rendererId: "PaidOfferScreen", propsKind: PROPS_KINDS.PAID_OFFER_HETEROGENEOUS, navigationSection: "", targetLayer: TARGET_PRODUCT_LAYERS.PUBLIC_TO_DEEPER_TRANSITION }),
  defineRoute({ id: "screen-11b-homogeneous-offer", title: "Homogeneous paid offer", route: "/screen-11b-homogeneous-offer", rendererId: "PaidOfferScreen", propsKind: PROPS_KINDS.PAID_OFFER_HOMOGENEOUS, navigationSection: "", targetLayer: TARGET_PRODUCT_LAYERS.PUBLIC_TO_DEEPER_TRANSITION }),
  defineRoute({ id: "screen-12-email-capture", title: "Email capture", route: "/screen-12-email-capture", rendererId: "EmailCaptureScreen", propsKind: PROPS_KINDS.SESSION_AND_SET_SESSION, navigationSection: "", targetLayer: TARGET_PRODUCT_LAYERS.PUBLIC_RESULT }),
  defineRoute({ id: "screen-12-consultation-request", title: "Consultation request", route: "/screen-12-consultation-request", rendererId: "ConsultationRequestScreen", propsKind: PROPS_KINDS.SESSION_AND_SET_SESSION, navigationSection: "", targetLayer: TARGET_PRODUCT_LAYERS.PUBLIC_TO_DEEPER_TRANSITION }),
  defineRoute({ id: "deal-context-public-result", title: "Public Research Result", route: "/start-diagnostic/deal-context/result", rendererId: "PublicResearchResultScreen", propsKind: PROPS_KINDS.NONE, navigationSection: "", shellStrategy: ROUTE_SHELL_STRATEGIES.LEGACY_SITE, targetLayer: TARGET_PRODUCT_LAYERS.PUBLIC_RESULT, targetPath: null }),
]);

const HOME_ROUTE = defineRoute({ id: "home", title: "Post-Deal Behavior Forecast", route: "/", rendererId: "HomeScreen", navigationSection: "home", targetLayer: TARGET_PRODUCT_LAYERS.PUBLIC_SITE, targetPath: "/" });
const ABOUT_METHODOLOGY_ROUTE = defineRoute({ id: "about-methodology", title: "The ST Framework", route: "/about-methodology", rendererId: "AboutMethodologyScreen", navigationSection: "methodology", targetLayer: TARGET_PRODUCT_LAYERS.PUBLIC_SITE, targetPath: "/methodology" });
const METHODOLOGY_OVERVIEW_ROUTE = defineRoute({ id: "methodology-overview", title: "Post-Deal Behavior Forecast Methodology Overview", route: "/about-methodology/overview", rendererId: "MethodologyOverviewScreen", navigationSection: "methodology", targetLayer: TARGET_PRODUCT_LAYERS.PUBLIC_SITE, targetPath: "/methodology/overview" });
const CASE_STUDIES_ROUTE = defineRoute({ id: "case-studies", title: "Case Studies", route: "/case-studies", rendererId: "CaseStudiesScreen", navigationSection: "case-studies", targetLayer: TARGET_PRODUCT_LAYERS.PUBLIC_SITE, targetPath: "/historical-replays" });
const CASE_STUDY_DETAIL_ROUTE = defineRoute({ id: "case-study-detail", title: "Case Study", route: "/case-studies/:caseId", rendererId: "CaseStudyDetailScreen", propsKind: PROPS_KINDS.CASE_DETAIL, navigationSection: "case-studies", targetLayer: TARGET_PRODUCT_LAYERS.PUBLIC_SITE, targetPath: "/historical-replays/:caseId" });
const ENVIRONMENTS_ROUTE = defineRoute({ id: "interaction-environments", title: "The 9 Interaction Environments", route: "/environments", rendererId: "EnvironmentsScreen", propsKind: PROPS_KINDS.ENVIRONMENT_DETAIL, navigationSection: "environments", targetLayer: TARGET_PRODUCT_LAYERS.PUBLIC_SITE, targetPath: "/methodology/environments" });

const REGISTERED_ROUTE_BY_PATH = new Map(SCREEN_REGISTRY.map((route) => [route.route, route]));

function resolvedRoute(definition, requestedPath, extra = {}) {
  return Object.freeze({
    ...definition,
    route: requestedPath,
    canonicalRoute: definition.route,
    requestedPath,
    isFallback: false,
    ...extra,
  });
}

const ROUTE_MATCHERS = Object.freeze([
  Object.freeze({
    match: (path) => path === "/" || path === "/home",
    resolve: (path) => resolvedRoute(HOME_ROUTE, path),
  }),
  Object.freeze({
    match: (path) => path === "/about-methodology",
    resolve: (path) => resolvedRoute(ABOUT_METHODOLOGY_ROUTE, path),
  }),
  Object.freeze({
    match: (path) => path === "/about-methodology/overview",
    resolve: (path) => resolvedRoute(METHODOLOGY_OVERVIEW_ROUTE, path),
  }),
  Object.freeze({
    match: (path) => path === "/case-studies",
    resolve: (path) => resolvedRoute(CASE_STUDIES_ROUTE, path),
  }),
  Object.freeze({
    match: (path) => path.startsWith("/case-studies/"),
    resolve: (path) => resolvedRoute(CASE_STUDY_DETAIL_ROUTE, path, {
      caseId: path.slice("/case-studies/".length).replace(/\/$/, ""),
    }),
  }),
  Object.freeze({
    match: (path) => path === "/environments" || path.startsWith("/environments/"),
    resolve: (path) => resolvedRoute(ENVIRONMENTS_ROUTE, path, {
      environmentId: path.startsWith("/environments/") ? path.slice("/environments/".length) : undefined,
    }),
  }),
  Object.freeze({
    match: (path) => path === "/start-diagnostic" || path === "/screen-2-role",
    resolve: (path) => resolvedRoute(SCREEN_REGISTRY[0], SCREEN_REGISTRY[0].route, {
      requestedPath: path,
      compatibilityAlias: true,
    }),
  }),
  Object.freeze({
    match: (path) => REGISTERED_ROUTE_BY_PATH.has(path),
    resolve: (path) => resolvedRoute(REGISTERED_ROUTE_BY_PATH.get(path), path),
  }),
]);

export const CURRENT_ROUTE_FAMILY_COUNT = 33;

export function normalizeRoutePath(pathname) {
  return typeof pathname === "string" && pathname.length > 0 ? pathname : "/";
}

export function resolveRoutePath(pathname) {
  const path = normalizeRoutePath(pathname);
  const matcher = ROUTE_MATCHERS.find((candidate) => candidate.match(path));
  if (matcher) return matcher.resolve(path);
  return Object.freeze({
    ...SCREEN_REGISTRY[0],
    canonicalRoute: SCREEN_REGISTRY[0].route,
    requestedPath: path,
    isFallback: true,
  });
}

export const ROUTE_COMPATIBILITY_MAP = Object.freeze([
  Object.freeze({ currentPath: "/home", currentResolution: "/home", targetPath: "/", activation: "future-redirect" }),
  Object.freeze({ currentPath: "/about-methodology", currentResolution: "/about-methodology", targetPath: "/methodology", activation: "future-route-act" }),
  Object.freeze({ currentPath: "/about-methodology/overview", currentResolution: "/about-methodology/overview", targetPath: "/methodology/overview", activation: "future-route-act" }),
  Object.freeze({ currentPath: "/environments/:environmentId?", currentResolution: "/environments/:environmentId?", targetPath: "/methodology/environments/:environmentId?", activation: "future-route-act" }),
  Object.freeze({ currentPath: "/case-studies/:caseId?", currentResolution: "/case-studies/:caseId?", targetPath: "/historical-replays/:caseId?", activation: "future-route-act" }),
  Object.freeze({ currentPath: "/start-diagnostic", currentResolution: "/start-diagnostic/before-you-begin", targetPath: "/analyze", activation: "current-compatibility-alias" }),
  Object.freeze({ currentPath: "/screen-2-role", currentResolution: "/start-diagnostic/before-you-begin", targetPath: "/analyze", activation: "current-compatibility-alias" }),
]);

export { PROPS_KINDS };
