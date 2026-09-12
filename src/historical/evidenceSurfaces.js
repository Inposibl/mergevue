export function had1Surface(runtime, historicalExecutionId) {
  return runtime.store.get("had1", historicalExecutionId);
}

export function had2Surfaces(runtime) {
  return runtime.traces.filter((trace) => trace.kind === "HAD-2");
}

export function xad1Surfaces(runtime) {
  return runtime.traces.filter((trace) => trace.kind === "XAD-1");
}

export function had1Match(runtime, historicalExecutionId) {
  const surface = had1Surface(runtime, historicalExecutionId);
  return surface.match === true;
}

export function xad1StayedOnPath(runtime, executionId) {
  const traces = xad1Surfaces(runtime).filter((trace) => trace.payload.executionId === executionId);
  return traces.length > 0 && traces.every((trace) => trace.payload.path !== "UNAUTHORIZED_EXECUTION_PATH" || trace.payload.blocked === true);
}
