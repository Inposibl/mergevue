import { assembleEngineSnapshot } from "./engineSnapshot.js";
import { buildStructuredUncertainty } from "./structuredUncertainty.js";
import { buildInterpretationContextPack } from "./interpretationContextPack.js";
import { buildAgentInterpretationRequest } from "./agentInterpretationRequest.js";
import { projectProviderProjection } from "./providerProjection.js";
import { buildProviderPrompt } from "./providerPrompt.js";
import { executeGeminiProvider } from "./providerExecution.js";
import { ProviderExecutionError } from "./providerExecutionError.js";
import {
  assembleAgentInterpretationResult,
  mapProviderExecutionErrorToSystemFailure,
  mapResultAssemblyErrorToSystemFailure,
  ResultAssemblyError,
} from "./agentInterpretationResult.js";
import { validateAgentInterpretationSemantics } from "./semanticValidator.js";
import { SemanticValidationError } from "./semanticValidationError.js";
import { SemanticJudgeTransportError } from "./semanticJudgeTransportError.js";
import {
  mapSemanticJudgeTransportErrorToSystemFailure,
  mapSemanticValidationErrorToSystemFailure,
} from "./semanticSystemFailure.js";
import { XAI_SEMANTIC_JUDGE_MAX_CHECKS_PER_BATCH } from "./semanticJudgeTransportConstants.js";
import { createXaiSemanticJudge } from "./semanticJudgeAdapter.js";

function mapKnownFailure(error, agentInterpretationRequest) {
  if (error instanceof ProviderExecutionError) {
    return mapProviderExecutionErrorToSystemFailure({
      agentInterpretationRequest,
      providerExecutionError: error,
    });
  }
  if (error instanceof ResultAssemblyError) {
    return mapResultAssemblyErrorToSystemFailure({
      agentInterpretationRequest,
      resultAssemblyError: error,
    });
  }
  if (error instanceof SemanticJudgeTransportError) {
    return mapSemanticJudgeTransportErrorToSystemFailure({
      agentInterpretationRequest,
      semanticJudgeTransportError: error,
    });
  }
  if (error instanceof SemanticValidationError) {
    return mapSemanticValidationErrorToSystemFailure({
      agentInterpretationRequest,
      semanticValidationError: error,
    });
  }
  return null;
}

export async function runAgentInterpretation({
  coreOutput,
  identityContext,
  coreInput,
  establishedEnvironmentCodes,
  crossSideEnvironmentPair,
} = {}) {
  let agentInterpretationRequest = null;
  try {
    const engineSnapshot = assembleEngineSnapshot({ coreOutput, identityContext, coreInput });
    const structuredUncertainty = buildStructuredUncertainty(engineSnapshot);
    const interpretationContextPack = buildInterpretationContextPack({
      engineSnapshot,
      structuredUncertainty,
      establishedEnvironmentCodes,
      crossSideEnvironmentPair,
    });
    agentInterpretationRequest = buildAgentInterpretationRequest({
      engineSnapshot,
      structuredUncertainty,
      interpretationContextPack,
    });
    const providerProjection = projectProviderProjection(agentInterpretationRequest);
    const prompt = buildProviderPrompt(providerProjection);
    const providerExecutionOutput = await executeGeminiProvider(
      { providerProjection, prompt },
    );
    const assembledResult = assembleAgentInterpretationResult({
      agentInterpretationRequest,
      providerExecutionOutput,
    });
    const validatedResult = await validateAgentInterpretationSemantics({
      agentInterpretationRequest,
      agentInterpretationResult: assembledResult,
      semanticJudge: createXaiSemanticJudge(),
      maxChecksPerBatch: XAI_SEMANTIC_JUDGE_MAX_CHECKS_PER_BATCH,
    });
    if (validatedResult !== assembledResult) {
      throw new TypeError(
        "Semantic validation violated AgentInterpretationResult identity",
      );
    }
    return assembledResult;
  } catch (error) {
    const mapped = agentInterpretationRequest !== null
      ? mapKnownFailure(error, agentInterpretationRequest)
      : null;
    if (mapped !== null) return mapped;
    throw error;
  }
}
