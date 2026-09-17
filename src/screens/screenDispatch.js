import React from "react";
import { PROPS_KINDS } from "../routes/routeModel.js";

function propsForScreen(screen, context) {
  switch (screen?.propsKind) {
    case PROPS_KINDS.SCREEN:
      return { screen };
    case PROPS_KINDS.SESSION:
      return { session: context.session };
    case PROPS_KINDS.SET_SESSION:
      return { setSession: context.setSession };
    case PROPS_KINDS.SESSION_AND_SET_SESSION:
      return { session: context.session, setSession: context.setSession };
    case PROPS_KINDS.CASE_DETAIL:
      return { caseId: screen.caseId };
    case PROPS_KINDS.ENVIRONMENT_DETAIL:
      return { environmentId: screen.environmentId };
    case PROPS_KINDS.PAID_OFFER_HETEROGENEOUS:
      return { session: context.session, setSession: context.setSession, variant: "heterogeneous" };
    case PROPS_KINDS.PAID_OFFER_HOMOGENEOUS:
      return { session: context.session, setSession: context.setSession, variant: "homogeneous" };
    case PROPS_KINDS.TARGET_CODE_GATE:
      return { session: context.session, setSession: context.setSession };
    default:
      return {};
  }
}

export function rendererIdForScreen(screen, context = {}) {
  if (screen?.propsKind === PROPS_KINDS.TARGET_CODE_GATE && context.targetSessionId) {
    return "TargetCodeEntryScreen";
  }
  return screen?.rendererId ?? "PlaceholderScreen";
}

export function renderResolvedScreen({ screen, context, components }) {
  const rendererId = rendererIdForScreen(screen, context);
  const Component = components[rendererId] ?? components.PlaceholderScreen;
  if (!Component) throw new Error(`No screen renderer registered for ${rendererId}.`);

  const props = screen?.propsKind === PROPS_KINDS.TARGET_CODE_GATE && context.targetSessionId
    ? { session: context.session, setSession: context.setSession, targetSessionId: context.targetSessionId }
    : propsForScreen(screen, context);

  return React.createElement(Component, props);
}
