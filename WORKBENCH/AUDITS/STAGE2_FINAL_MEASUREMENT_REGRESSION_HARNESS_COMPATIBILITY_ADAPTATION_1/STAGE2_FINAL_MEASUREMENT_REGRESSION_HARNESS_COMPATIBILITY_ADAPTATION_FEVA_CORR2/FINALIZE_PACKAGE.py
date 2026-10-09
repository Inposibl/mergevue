"""Write the required temporary handoff and freeze identities; no repository writes."""
import ast, collections, hashlib, json, os, re, shlex, subprocess
from pathlib import Path
P=Path(__file__).resolve().parent
inputs=json.loads((P/'INPUT_IDENTITIES.json').read_bytes())
pre=json.loads((P/'PREFLIGHT_STATE.json').read_bytes())
tests=json.loads((P/'AUTHOR_COMPATIBILITY_RESULTS.json').read_bytes())
assert tests['failed']==0 and tests['adaptedRegressEntryPointCalls']==0
ROOT=Path(inputs['repositoryRoot']).resolve()
env={**os.environ,'GIT_OPTIONAL_LOCKS':'0','PYTHONDONTWRITEBYTECODE':'1'}
def sha(b):return hashlib.sha256(b).hexdigest()
def ident(p):
 b=p.read_bytes();return {'path':str(p),'bytes':len(b),'sha256':sha(b)}
def dump(name,x):(P/name).write_text(json.dumps(x,sort_keys=True,indent=2)+'\n')
def git(*args):return subprocess.check_output(['git',*args],cwd=ROOT,env=env)
HEAD=git('rev-parse','HEAD').decode().strip()
status=git('status','--porcelain=v1','--untracked-files=all')
default=git('status','--porcelain=v1')
changed=[]
for rel,pin in inputs['inputs'].items():
 b=(ROOT/rel).read_bytes()
 if len(b)!=pin['bytes'] or sha(b)!=pin['sha256']:changed.append(rel)
assert not changed and HEAD==pre['HEAD'] and status.decode()==pre['statusFull'] and default.decode()==pre['statusDefault']
assert not git('diff','--name-only') and not git('diff','--cached','--name-only')
post={'root':str(ROOT),'HEAD':HEAD,'branch':git('branch','--show-current').decode().strip(),
 'trackedDirty':0,'staged':0,'untrackedFileEntries':760,'untrackedDefaultEntries':431,
 'prePostStatusByteEqual':True,'statusFullSha256':sha(status),'statusFull':status.decode(),
 'inspectedSourceCount':len(inputs['inputs']),'changedInspectedSources':changed,'gitMutationPerformed':False,
 'repositoryWriteCommandsPerformed':False,'limitations':'No before/after byte census of every unrelated or ignored file; evidence is exact Git status and 107 inspected-source hashes.'}
dump('POSTFLIGHT_STATE.json',post)
oracle=json.loads((P/'ACCEPTED_FEVA_COMPOSITION_ORACLE.json').read_bytes())
historical=json.loads((P/'HISTORICAL_AUTHOR_REPRODUCTION.json').read_bytes())
schema_rel='WORKBENCH/DOWNLOADS/STAGE2_CORR4_PILOT_ANALYTICAL_CODER_VIEW_SCHEMA_CORR2_CORR1_CORR2_CORR1.json'
schema=json.loads((P/'FROZEN_INPUTS'/schema_rel).read_bytes())
fields={}
for g in schema['requiredCodingFields']['groups']:
 for f in g['fields']:fields[re.split(r'[\[{ (]',f)[0]]=g['authority']
METHOD='WORKBENCH/DOWNLOADS/STAGE2_PD3_ROLE_BOUNDED_ENTITLEMENT_CLARIFICATION_1_CORR1_2026-10-04/STAGE2_PD3_ROLE_BOUNDED_ENTITLEMENT_CLARIFICATION_1_CORR1_CANDIDATE.md'
SEP='WORKBENCH/DOWNLOADS/STAGE2_SUPPORTCLASS_EVALUABILITY_SEMANTIC_SEPARATION_1_IMPLEMENTATION_1_2026-10-05/STAGE2_SUPPORTCLASS_EVALUABILITY_SEMANTIC_SEPARATION_1_IMPLEMENTATION_1_METHODOLOGY_SUCCESSOR.md'
SEP_PRIMARY='WORKBENCH/DOWNLOADS/STAGE2_SUPPORTCLASS_EVALUABILITY_SEMANTIC_SEPARATION_1_CORR2_CORR1_CORR1_CORR1_CORR1_2026-10-05/STAGE2_SUPPORTCLASS_EVALUABILITY_SEMANTIC_SEPARATION_1_CORR2_CORR1_CORR1_CORR1_CORR1_CANDIDATE.md'
CLOSURE='WORKBENCH/AUDITS/STAGE2_FINAL_EFFECTIVE_VIEW_ASSEMBLY_1_CORR2_GIT_CLOSURE_1.md'
ROWS=oracle['lineIdentities']
rule_sources={
 'EXACT_INPUT_IDENTITY':[CLOSURE+' §1/§3/§6','current Owner authorization source baseline'],
 'COMPOSITION':[CLOSURE+' §3/§4/§6','accepted Git object '+HEAD+':'+oracle['acceptedPath']],
 'LEGACY_VS_SUCCESSOR':[SEP_PRIMARY+' §14 Decision 1/Architecture C',SEP+' §2/SEP-I-4; §7/BC-1/BC-2/BC-5',CLOSURE+' §3 migrated A-E001'],
 'F3_F5_UNCHANGED':[METHOD+' §F.3/§F.4/§F.5',SEP+' SEP-I-9; §10.1 non-superseded semantics'],
 'SUCCESSOR_TRIPLE':[SEP_PRIMARY+' SEP-EV/SEP-B/§14',SEP+' §4/§5/§6',
  'WORKBENCH/DOWNLOADS/A_E001_BEARING_DIRECTIONALITY_READJUDICATION_1_2026-10-07/A_E001_BEARING_DIRECTIONALITY_READJUDICATION_1_DECISION.json recordedPrOnlyBasisForMaterialization',
  'WORKBENCH/DOWNLOADS/STAGE2_FINAL_EFFECTIVE_VIEW_ASSEMBLY_1_CORR1_2026-10-07/STAGE2_FINAL_EFFECTIVE_VIEW_ASSEMBLY_1_CORR1_BUILD.py evaluate_record, exact empty W/T context'],
 'SOURCE_BINDING':[schema_rel+' sourceClassBindingRule',
  'WORKBENCH/AUDITS/STAGE2_FINAL_EFFECTIVE_VIEW_ASSEMBLY_1_CORR2/STAGE2_FINAL_EFFECTIVE_VIEW_ASSEMBLY_1_CORR2_BUILD.py load_pi7_index/derive_source_class',
  'WORKBENCH/DOWNLOADS/STAGE2_CORR4_PILOT_ANALYTICAL_SOURCECLASS_BINDING_CORR2.jsonl'],
 'COMPONENT_SHAPE':[METHOD+' §I',schema_rel+' requiredCodingFields.component satisfaction'],
 'MISSINGNESS_UNCERTAINTY':[METHOD+' §J-1..J-6/§F.3/§F.5',SEP+' §4 PART(r,c); SEP-FW-3/FW-20'],
 'NO_OUTCOMES':[schema_rel+' forbiddenInput/forbiddenOutputFields',SEP+' §9', 'current Owner write/effect boundaries'],
 'NONCONSUMING_CARRIER':[CLOSURE+' §3 raw legacy preservation; §7 no measurement PASS',
  'WORKBENCH/AUDITS/STAGE2_FINAL_EFFECTIVE_VIEW_ASSEMBLY_1_CORR2/STAGE2_FINAL_EFFECTIVE_VIEW_ASSEMBLY_1_CORR2_REPORT.md §5/§6 legacy outside §I emission rule',
  'accepted presence-aware predecessor→CORR2 delta; immutable legacy values are not a new analytical judgment'],
}
derived={'factIds','mechanismPropositionIds','discriminatorIds','treeTargetIds','relation','mechanismObjectTypes','factualPackageIdentity','sourceRefs','sourceClass','scopeBridgeState','missingComponents','edgeState','sufficiencyExpression','sufficiencyExpressionResult','counterevidenceFactIds','conflictFactIds','caseId','side'}
matrix=[]
for field,authority in fields.items():
 matrix.append({'field':field,'original':'legacy schema required; enum/derived/carrier or NOT_DETERMINABLE as applicable',
  'legacyFiveSectionI':'RETAINED — frozen predecessor 47-field schema; no invented analytical recoding',
  'successorAE001':'FORBIDDEN/REPLACED_BY_SEP_TRIPLE' if field=='supportClass' else 'RETAINED — accepted field state and original applicable checks',
  'comparison':'DERIVED_FROM_BOUND_REGISTRY_INPUT_RECORDED_SUPPLY' if field in derived else 'CARRIER_WHEN_UNCHANGED; NOT_DETERMINABLE_IF_NO_CURRENT_DERIVATION',
  'authority':[schema_rel+' '+authority,METHOD,*(rule_sources['LEGACY_VS_SUCCESSOR'] if field=='supportClass' else [])],
  'weakeningPermitted':False})
for field in ('prOnlyBasis','bearingEvaluability','bearingIndeterminacyReasons','supportBearing'):
 matrix.append({'field':field,'original':'NOT_A_PREDECESSOR_FIELD','legacyFiveSectionI':'FORBIDDEN','successorAE001':'REQUIRED; old supportClass forbidden',
  'comparison':'Exact accepted PR basis / accepted CORR10 evaluate() result; held evaluation rejected; no field mapping invented',
  'authority':rule_sources['SUCCESSOR_TRIPLE']+rule_sources['LEGACY_VS_SUCCESSOR'],'weakeningPermitted':False})
special=[
 {'check':'110 legacy outer/sparse field/census/fact/M-TT/binding checks','oldToNew':'Preserved; immutable raw legacy and historical defects are not erased. Accepted changed §I fields no longer treat stale legacy carriers as current analytical oracles. Existing cell SOURCECLASS/PROVENANCE/D/schema diagnostics remain.', 'authority':rule_sources['NONCONSUMING_CARRIER']+[METHOD+' §I; frozen historical source lines 130–160']},
 {'check':'nested componentSupply shape','oldToNew':'Retain typed six-key requirement and linkageEvidence object requirement. Current accepted legacy encoding can therefore produce COMPONENT_SCHEMA. No automatic conversion, copied nested references or invented supply.', 'authority':rule_sources['COMPONENT_SHAPE']},
 {'check':'sourceClass','oldToNew':'Use exact accepted PI-7 supplier identity (case/side/fact/refIndex/sourceId); non-ASSIGNED state copied verbatim. Frozen predecessor cell diagnostics remain separate.', 'authority':rule_sources['SOURCE_BINDING']},
 {'check':'F0024 provenance','oldToNew':'Current PI-3 sidecar and accepted patch supply §I provenance. Immutable execution-cell identity remains unchanged and can remain discrepant.', 'authority':[CLOSURE+' §3 line112','WORKBENCH/DOWNLOADS/AOL_F0024_RECONCILIATION_1_2026-10-07/AOL_F0024_RECONCILIATION_1_PROVENANCE_PATCH.json',METHOD+' §I']},
 {'check':'legacy supportClass vs successor supportBearing','oldToNew':'Five legacy supportClass records remain legacy; only accepted A-E001 reads SEP triple. No automatic migration of A-E023 or other DE4 records, no conversion of bearing into establishment.', 'authority':rule_sources['LEGACY_VS_SUCCESSOR']+rule_sources['F3_F5_UNCHANGED']},
 {'check':'negative/control input domain','oldToNew':'Original supports-only assertion is an explicit InputRejected now. Changed relation/absence/counter/conflict is an author negative fixture and is not given a fabricated FALSE/CONFLICTED interpretation. Public exact-input gate rejects such changes before measurement.', 'authority':[METHOD+' §F.3/§F.5/§J; original harness supports-only assert','current Owner exact-input and fail-closed requirements']},
 {'check':'composition eight-path oracle','oldToNew':'Replace with exact accepted 116-record oracle, ordered IDs, 110 raw lines, all six §I bytes, presence-aware accepted delta and bound provenance. No looser allowed-diff list.', 'authority':rule_sources['COMPOSITION']},
 {'check':'historical sensitivity/ADV2 and negative controls','oldToNew':'Original helpers unmodified in original source and reproducible. New tests use single edge/cell fixtures, new specific diagnostics or stronger early input rejection, not merely pre-existing FAIL.', 'authority':['current Owner mandatory design §8–§10','original frozen source scenarios/negative_controls/adv2_analysis']},
]
dump('OLD_TO_NEW_APPLICABILITY_MATRIX.json',{'scope':'exact accepted FEVA only','fields':matrix,'specialChecks':special,'authorityGapCount':0,'noGeneralSuccessorProjectionInvented':True})
dump('PRESERVATION_AND_NEGATIVE_CONTROLS.json',{'originalSource':ident(P/'ORIGINAL_FROZEN_HARNESS.py'),
 'originalInput':oracle['historicalPredecessor'],'acceptedInput':oracle['acceptedIdentity'],
 'legacyRawPreserved':True,'orderedIdentitiesPreserved':True,'acceptedDifferences':oracle['acceptedDifferenceFromHistoricalPredecessor'],
 'originalHistoricalVerdict':'FAIL','correctionIVVerdict':'HOLD','historicalReproductionStructureSha256':sha(json.dumps(historical['regression'],sort_keys=True,ensure_ascii=True,separators=(',',':')).encode()),
 'controls':[x for x in tests['tests'] if x['kind']=='negative_control'],
 'expectedConditions':'Specified literally in separate AUTHOR_COMPATIBILITY_TESTS.py before execution, from frozen contract/accepted data; no expected detector is calculated by candidate-under-test.',
 'sameAuthorLimitation':'Independent expected assertions are author-side assertions; they do not establish independent verification.',
 'controlFailurePath':'Public identity and composition guard prevents altered data entering measurement; private in-memory fixtures show named applicable detector or explicit fail-closed rejection; no altered FEVA written.',
 'wholeCurrentRegressionExecuted':False,'postflight':post})

def link(rel):return '['+Path(rel).name+'](<'+str(ROOT/rel)+'>)'
links=lambda xs:'; '.join(link(x.split(' §')[0])+' '+x[len(x.split(' §')[0]):] if x.split(' §')[0] in inputs['inputs'] else '`'+x+'`' for x in xs)
specmd='''# Harness compatibility adaptation — specification and traceability

Actor/role: IMPLEMENTATION AUTHOR — CODEX, current explicit Owner appointment.
This task supersedes the prior read-only auditor appointment only within its
new temporary-harness write boundary. No project product write is authorized.

The physically intended result is a separate candidate that accepts only the
exact accepted FEVA CORR2, uses an accepted assembly oracle, dispatches the
five legacy §I records and the single A-E001 successor lawfully, and preserves
applicable measurement diagnostics. This is candidate author evidence.

## Authority and current state

Current branch main, HEAD 2f7bcc5d33cf8009145aa85cbb39d2ae9084ec26.
FEVA lane B17.5 resolves through later exact CORR2 acceptance; older Control
Tree reconstruction headers do not supersede the closure. B5.8 measurement
normalization/downstream gates are unchanged. Original regression FAIL,
correction IV1 HOLD, and last compatibility HOLD remain historical evidence.
Current Owner authorization alone authorizes this adaptation, not acceptance.

The pre-act quality-gate mode is bounded self-checking: source of expected
bytes is the accepted Git object; the future consumer is a separately
authorized measurement regression. No product/runtime consumer is wired.

## Rule anchors

'''
for k,v in rule_sources.items():specmd+='- **'+k+'**: '+links(v)+'\n'
specmd+='''
## Inputs and composition

`load_exact_input(path)` requires explicit physical input, 104722 bytes and
SHA-256 5b37071a5fa5374c77b149bfde5c230c228cdf73d9785e5ea55346f9fab28daa.
No original VIEW pathname or content is overwritten. The historical old
104310-byte input is rejected as current FEVA. Every dependency is pinned and
checked before registry interpretation. Oracle and pinbook identities are
embedded in candidate source. JSON duplicate keys and non-finite values fail.

The oracle is extracted from the accepted Git object independently of the
adaptation's measurement computation. It freezes ordered 116 identities,
each raw line identity, 110 legacy raw bytes, all six §I record objects,
presence-aware historical→accepted differences and provenance path inventory.
Allowed differences mean exactly these accepted bytes; generic extra changes,
record reordering, dropped records and legacy reserialization are rejected.
No builder, schema or old regression result is used to assert current PASS.

## Applicability and comparison

The complete 51-field union and special cases are in
OLD_TO_NEW_APPLICABILITY_MATRIX.json. Five legacy records retain the 47
predecessor schema fields. A-E001 removes supportClass, adds the three SEP
fields and the exact accepted prOnlyBasis. That dispatch is valid only for
the exact accepted identity, never a general inference from an edge name.

Old legacy execution records remain immutable, including their historical
defects. The accepted §I-only changes do not rewrite a legacy carrier or
manufacture an independent new assignment from it. Accepted superseded
carrier surfaces are labelled non-consuming/NOT_DETERMINABLE; all applicable
source, discriminator, nested shape, membership and enum checks remain.

Typed component shape failures are deliberately retained. The adapter reads
recorded supply under the frozen harness and does not recode fact content or
complete a missing component. Exact current §I sourceClass binding reuses the
accepted FEVA builder's full PI-7 supplier-key resolver. A-E001 triple
comparison reuses the accepted CORR10 evaluate() and accepted empty W/T
context used by CORR1; arbitrary truthy PR inputs are rejected first.

SEP-I-9 keeps F.3/F.5 unchanged. Bearing never establishes the leaf, changes
scope/time, completes components or upgrades a target. Legacy DE4 records
are not silently migrated. Missing comparisons remain NOT_DETERMINABLE.

The immutable lane contains supports-only edges with empty counter/conflict
references and NONE absence. Counterfactual negative/absence fixtures fail
closed rather than receiving an invented new interpretation. The adapter
does not expand into a general new-input multi-edge determination engine.
It preserves the original OPEN-valued missing-leaf behavior and the exact
frozen measurement scope. No outcome-based repair or classifier is invoked.

## Test and review boundary

Author tests call only private single-edge/cell functions and pure field/input
guards. They never call adapted regress(). A separate historical reproduction
calls the unmodified original on the original frozen input and proves the
previous FAIL structure byte-for-byte. Original helpers/controls remain
available unchanged in ORIGINAL_FROZEN_HARNESS.py. Adapted controls require
new specific diagnostics or explicit early rejection, with literal expected
conditions in the separate test artifact, even if baseline has defects.

No successor measurement mapping outside accepted rules is supplied. A future
new field/version/input that needs a new mapping is CONTRACT_AUTHORITY_GAP,
not permission to infer one. No such gap remains for this exact accepted
mixed-representation input; this conclusion still needs non-author IV.

ADAPTED_REGRESSION_HARNESS.py CLI performs only input/composition checking.
Its regress(path) function is reserved for a separately authorized evaluation
act after independent verification and Owner disposition. It returns diagnostic
structures, never a synthetic whole-Stage-2 PASS or Owner acceptance.
'''
(P/'ADAPTATION_SPECIFICATION.md').write_text(specmd)
repro=f'''# Deterministic reproduction

Use the bundled Python stdlib runtime recorded in PREFLIGHT_STATE.json.
Do not install packages or write inside the repository. Run with bytecode
disabled. Commands below write only existing author test evidence inside this
temporary package; historical input reads use the recorded repository root.

```bash
PYTHONDONTWRITEBYTECODE=1 GIT_OPTIONAL_LOCKS=0 python3 {shlex.quote(str(P/'BUILD_CANDIDATE.py'))}
PYTHONDONTWRITEBYTECODE=1 GIT_OPTIONAL_LOCKS=0 python3 {shlex.quote(str(P/'ADAPTED_REGRESSION_HARNESS.py'))} --exact-input {shlex.quote(str(P/'FEVA_CORR2_EXACT_INPUT.jsonl'))}
PYTHONDONTWRITEBYTECODE=1 GIT_OPTIONAL_LOCKS=0 python3 {shlex.quote(str(P/'AUTHOR_COMPATIBILITY_TESTS.py'))}
```

BUILD_CANDIDATE.py transforms only its frozen original copy, counts exactly
20 replacements, appends separately specified guards, and writes the candidate,
transformation ledger and unified diff. Existing oracle/pinbook must first
match MANIFEST_SHA256.json; regeneration is not authority to change them.

The second command performs zero measurement comparisons. The third performs
40 bounded author tests, 27 negative controls. It does not invoke adapted
regress(). It also runs one historical original reproduction in a fresh child
process using the unchanged source and original inputs; that child replays
original scenarios and all four original controls. Its result structure hash
is 58c2080b9d038ce91330fa8af7cf30ebb9d6b1920b9dc238a62e2904ec6b8e37.

Copied FROZEN_INPUTS includes all 107 inspected dependencies at their observed
identities. Clean-checkout availability of the original untracked dependencies
is not claimed. Historical child uses the original repository cwd so physical
input identities in its JSON exactly reproduce the original report. A moved
package must record changed physical paths rather than impersonating that cwd.

FINALIZE_PACKAGE.py rechecks Git status and all 107 original source hashes,
then writes report/handoff/manifest. The manifest excludes itself to avoid a
circular hash; record its external SHA-256 after writing. No current full
regression command is provided as part of this authorized reproduction.
'''
(P/'REPRODUCTION.md').write_text(repro)
source_id=ident(P/'ADAPTED_REGRESSION_HARNESS.py')
handoff=f'''# Independent audit handoff

Candidate ready for a separately Owner-authorized non-author IV. Codex authored
the historical original harness and this adaptation, and may not independently
verify it. Use Claude or Z.ai provided the chosen verifier did not materially
author this adaptation. Do not create another audit of historical IV evidence.

Candidate source: `{source_id['path']}`
SHA-256: `{source_id['sha256']}`; bytes: {source_id['bytes']}.
Exact input: `{P/'FEVA_CORR2_EXACT_INPUT.jsonl'}`
SHA-256: `{oracle['acceptedIdentity']['sha256']}`; 104722 bytes, 116 records.
Repository expected baseline: main @ `{HEAD}`.

Read current Owner IV authorization, AGENTS role mandate and controlling
governance first. Inspect MANIFEST_SHA256.json and exact source/diff, specification,
matrix, oracle, pinbook, accepted closure and source contracts. Confirm the
oracle directly against accepted Git bytes and derive applicability independently;
candidate self-tests are evidence to inspect, not the IV oracle.

Protect these concrete risks: old-path impersonation; a loose allowed-diff oracle;
silent dropping of supportClass checks across all records; using legacy carriers
as successor analytical assignment; erasing retained measurement failures;
invented PR basis/EV comparisons; outcome/scope/temporality promotion; pre-existing
FAIL satisfying a negative control; a mutation hook bypassing public identity gates.

Independently challenge digest and composition mismatches, all required key
families (including absent vs explicit null), supplier-key uniqueness and wrong
side/source, schema/typed components, missing/counterfactual support, upward scope,
post-T0, illegal output fields, successor held states, unchanged F.3/F.5 and all
four historical negative-control equivalents. Inspect fresh per-call state and
book/oracle pin checks; use independent expected conditions, not copied PASSes.

40 author tests passed; 27 are negative controls. Three retained A-E001 single-edge
diagnostics are in SINGLE_EDGE_AUTHOR_FIXTURE_EVIDENCE.json. They are author
fixture observations, not closure of historical findings or a full measurement
verdict. Original FAIL and correction IV HOLD remain unchanged.

Do not mutate FEVA, evidence, methodology, Stage-1 or repository files. No HEDC,
Environment determination, product wiring, Git or full final regression is
authorized by this handoff. IV should decide compatibility and preservation
within this adapter's frozen domain. Full final regression needs a subsequent
separate Owner authorization/disposition after the non-author IV outcome.
'''
(P/'INDEPENDENT_AUDIT_HANDOFF.md').write_text(handoff)
required=['ADAPTED_REGRESSION_HARNESS.py','ADAPTATION_SPECIFICATION.md','MANIFEST_SHA256.json','AUTHOR_COMPATIBILITY_TESTS.py','AUTHOR_COMPATIBILITY_RESULTS.json','OLD_TO_NEW_APPLICABILITY_MATRIX.json','PRESERVATION_AND_NEGATIVE_CONTROLS.json','INDEPENDENT_AUDIT_HANDOFF.md','REPRODUCTION.md']
report=f'''# Implementation report

**CANDIDATE_READY_FOR_IV**

ACT: STAGE-2 FINAL MEASUREMENT REGRESSION — HARNESS COMPATIBILITY ADAPTATION.
ROLE: IMPLEMENTATION AUTHOR — CODEX, under the current explicit Owner instruction.
Codex authored both the historical original harness and this adaptation.
This is author-side compatibility evidence; independentlyVerified=false,
ownerAccepted=false, controllingRegressionClosure=false.

Exact baseline main @ {HEAD}. Canonical tracked FEVA bytes equal the accepted
Git object: 104722 bytes / 116 records, SHA-256
`{oracle['acceptedIdentity']['sha256']}`. Governing sidecars and prior 89 input
identities matched at preflight; 107 source identities were frozen and unchanged
at postflight. No conflict or CONTRACT_AUTHORITY_GAP was inferred for this
exact accepted mixed-representation input. See traceability for each rule.

The candidate supplies explicit exact-input selection, a byte-strict accepted
116-record composition oracle with 110 preserved raw legacy records, and
five-legacy/one-successor field dispatch. A-E001 required-field replacement and
SEP comparisons are anchored in accepted separation, readjudication and assembly
authority. Typed component, source, discriminator, missingness, scope/time,
admissibility and expression diagnostics are retained. No fact is recoded.

Source SHA-256: `{source_id['sha256']}` ({source_id['bytes']} bytes).
Original source SHA-256 remains
`c99b8dc60dfd8d8594d903896c333bec673fa712150778f53bfd6f07243bb1dc`
(26040 bytes). Twenty counted transformations and the complete unified diff
are supplied. The original source/input are unchanged and do not impersonate FEVA.

40 bounded author tests passed / 0 failed, including 27 negative controls.
Tests are input/composition/field guards and single-edge/cell fixtures; adapted
regress() was never invoked. The unchanged historical original reproduced its
full prior FAIL structure with exact SHA-256
`58c2080b9d038ce91330fa8af7cf30ebb9d6b1920b9dc238a62e2904ec6b8e37`,
including the original four negative controls and quality/prose probes.
Expected new-control conditions are literal separate author assertions and
require a new detector or early fail-closed rejection, never baseline FAIL alone.

The one-edge A-E001 compatibility fixture retains COMPONENT_SCHEMA,
SECTION_I_sufficiencyExpression and ORPHAN_EXPRESSION_MECHANISM diagnostics
while comparing successor prOnlyBasis/bearingEvaluability/supportBearing as
MATCH. These observations show that the adapter does not erase accepted-input
measurement diagnostics. They are not a current full-regression result.

Historical states remain original regression FAIL and correction IV1 HOLD.
No historical finding has been closed by this act. Whole Stage-2 regression
PASS is neither run nor claimed. Environment determination, HEDC, Stage-1,
methodology/evidence changes, production wiring, deployment and Git mutation
remain outside scope. The adapter is bounded to the exact accepted input;
counterfactual relations fail closed instead of receiving invented semantics.

Repository pre/post: 0 tracked dirty / 0 staged; 760 full untracked file entries
(431 default porcelain entries), exact status bytes unchanged. All 107 inspected
source byte identities unchanged. No repository files were written. A whole
filesystem byte census of unrelated/ignored files was not performed. Cached
origin/main matches baseline; live remote confirmation is not claimed.
All new files are under `{P}`. Prior HOLD outputs remain untouched.

## Required deliverables

'''
for name in required:
 report+='- ['+name+'](<'+str(P/name)+'>)'+('\n' if name=='MANIFEST_SHA256.json' else ' — SHA-256 `'+ident(P/name)['sha256']+'`, '+str(ident(P/name)['bytes'])+' bytes.\n')
report+='''
The manifest pins every package member including all frozen input copies,
reports, tests and evidence, except itself. Its SHA-256 is computed externally
after write, avoiding circular self-hashing.

Next requirement: non-author independent verification of this exact candidate,
using accepted authorities and independently specified failure expectations.
No IV has been started or claimed. A current full final regression remains a
separate Owner-authorized evaluation act. Stop here after hashing deliverables.
'''
(P/'IMPLEMENTATION_REPORT.md').write_text(report)
# Manifest is written last and never self-hashes.
files={}
for p in sorted(P.rglob('*')):
 if p.is_file() and p.name!='MANIFEST_SHA256.json':
  assert p.resolve().is_relative_to(P) and not p.is_symlink()
  files[str(p.relative_to(P))]=ident(p)
dump('MANIFEST_SHA256.json',{'act':'STAGE-2 FINAL MEASUREMENT REGRESSION — HARNESS COMPATIBILITY ADAPTATION',
 'author':'Codex','role':'IMPLEMENTATION AUTHOR — CODEX','terminal':'CANDIDATE_READY_FOR_IV',
 'repositoryBaseline':HEAD,'canonicalFEVA':oracle['acceptedIdentity'],'originalHarness':inputs['originalHarness'],
 'candidateSource':source_id,'files':files,'fileCountExcludingManifest':len(files),
 'authorTests':{'passed':40,'failed':0,'negativeControls':27,'currentWholeRegressionExecuted':False},
 'independentlyVerified':False,'ownerAccepted':False,'historicalOriginalVerdict':'FAIL','historicalCorrectionIVVerdict':'HOLD',
 'selfHashPolicy':'Manifest excludes itself; its SHA-256 is an external post-write anchor reported in final output.'})
print(json.dumps({'terminal':'CANDIDATE_READY_FOR_IV','candidate':source_id,'manifest':ident(P/'MANIFEST_SHA256.json'),
 'report':ident(P/'IMPLEMENTATION_REPORT.md'),'fileCount':len(files)+1,'tests':[40,0,27],'repositoryStatusUnchanged':True},sort_keys=True))
