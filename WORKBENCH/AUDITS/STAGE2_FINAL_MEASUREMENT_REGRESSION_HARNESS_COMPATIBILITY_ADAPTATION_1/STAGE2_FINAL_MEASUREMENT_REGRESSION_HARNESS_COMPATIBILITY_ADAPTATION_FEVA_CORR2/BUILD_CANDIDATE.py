"""Deterministic, reviewable transformation of the unmodified original harness.
Every replacement is counted; no methodology or input record is rewritten.
"""
import ast, difflib, hashlib, json
from pathlib import Path
P=Path(__file__).resolve().parent
s=(P/'ORIGINAL_FROZEN_HARNESS.py').read_text()
original=s
changes=[]
def replace(old,new,rule):
    global s
    assert s.count(old)==1, (rule,s.count(old))
    line=s[:s.index(old)].count('\n')+1
    s=s.replace(old,new)
    changes.append({'rule':rule,'sourceLineAtTransformation':line,'old':old,'new':new})

replace('ROOT=Path.cwd().resolve()', "PACKAGE=Path(__file__).resolve().parent\nROOT=PACKAGE/'FROZEN_INPUTS'",'EXACT_LOCAL_INPUT_BUNDLE')
replace("D=Path('WORKBENCH/DOWNLOADS')", "D=ROOT/'WORKBENCH/DOWNLOADS'",'ABSOLUTE_READ_ONLY_DEPENDENCIES')
replace("VIEW=D/'STAGE2_EFFECTIVE_VIEW_ASSEMBLY_1_CORR1_2026-10-05/STAGE2_EFFECTIVE_VIEW_ASSEMBLY_1_RECORDS.jsonl'", "HISTORICAL_VIEW=D/'STAGE2_EFFECTIVE_VIEW_ASSEMBLY_1_CORR1_2026-10-05/STAGE2_EFFECTIVE_VIEW_ASSEMBLY_1_RECORDS.jsonl'",'NO_OLD_PATH_IMPERSONATION')
replace("CONTRACT=VIEW.parent/'STAGE2_EFFECTIVE_VIEW_ASSEMBLY_CONTRACT_1.md'", "CONTRACT=HISTORICAL_VIEW.parent/'STAGE2_EFFECTIVE_VIEW_ASSEMBLY_CONTRACT_1.md'",'HISTORICAL_CONTRACT_IS_LINEAGE_ONLY')
replace('def regress(mutation=None):', 'def _measure_subset(input_path, cell_indices=(), edge_ids=(), mutation=None):', 'PRIVATE_BOUNDED_AUTHOR_FIXTURE_ENTRYPOINT')
replace(' text,ms,tt=load_registry()', ' verify_dependency_bundle()\n text,ms,tt=load_registry()', 'PIN_VERIFICATION_BEFORE_REGISTRY_INTERPRETATION')
replace(' b=VIEW.read_bytes()\n rows=[json.loads(l,object_pairs_hook=no_dups) for l in b.splitlines()]', ' b,rows=load_exact_input(input_path)\n verify_dependency_bundle()', 'MANDATORY_IDENTITY_AND_COMPOSITION_GATE')
replace("view_schema=readj(D/'STAGE2_CORR4_PILOT_ANALYTICAL_CODER_VIEW_SCHEMA_CORR2_CORR1.json')", "view_schema=readj(D/'STAGE2_CORR4_PILOT_ANALYTICAL_CODER_VIEW_SCHEMA_CORR2_CORR1_CORR2_CORR1.json')",'ACCEPTED_47_FIELD_PREDECESSOR_SCHEMA')
replace(' for c in cells:\n  chk=', ' for c in cells:\n  if c["cellIndex"] not in cell_indices:continue\n  chk=', 'CELL_COMPONENT_TEST_SELECTION')
replace("elif c['assignedValue']!=e.get(c['field']):chk['carrierConsistency']='FAIL';issue('CELL_SECTION_I_DIVERGENCE',where,{'field':c['field'],'cell':c['assignedValue'],'sectionI':e[c['field']]})", "elif c['assignedValue']!=e.get(c['field']):\n   if accepted_carrier_supersession(e,c['field']):\n    chk['carrierConsistency']='ACCEPTED_NONCONSUMING_LEGACY_CARRIER'\n   else:\n    chk['carrierConsistency']='FAIL';issue('CELL_SECTION_I_DIVERGENCE',where,{'field':c['field'],'cell':c['assignedValue'],'sectionI':e.get(c['field'])})",'IMMUTABLE_LEGACY_VS_ACCEPTED_EFFECTIVE_FIELD')
replace(' for e in edges:\n  eid=', ' for e in edges:\n  if e["edgeId"] not in edge_ids:continue\n  applicable_fields=section_fields(e,schema_fields)\n  applicable_required=set(applicable_fields)|{"recordType"}\n  eid=', 'RECORD_CONTRACT_FAMILY_DISPATCH')
replace("if set(e)!=required:issue('SECTION_SCHEMA',eid,{'unknown':sorted(set(e)-required),'missing':sorted(required-set(e))})", "if set(e)!=applicable_required:raise InputRejected('SECTION_SCHEMA',{'edgeId':eid,'unknown':sorted(set(e)-applicable_required),'missing':sorted(applicable_required-set(e))})",'SUCCESSOR_REQUIRED_KEYS_AND_NO_DUAL_WRITE')
replace('  for field,values in enum.items():\n   if e.get(field) not in values:', '  for field,values in enum.items():\n   if field=="supportClass" and eid=="A-E001":continue\n   if e.get(field) not in values:', 'NO_LEGACY_SUPPORTCLASS_REQUIREMENT_ON_SUCCESSOR')
replace("assert e['relation']=='SUPPORTS_LEAF' and not e['counterevidenceFactIds'] and not e['conflictFactIds'] and e['absenceEvidenceState']=='NONE'", "if not (e['relation']=='SUPPORTS_LEAF' and not e['counterevidenceFactIds'] and not e['conflictFactIds'] and e['absenceEvidenceState']=='NONE'):\n   raise InputRejected('COUNTERFACTUAL_SUPPORT_REJECTED',eid)", 'EXPLICIT_FROZEN_POSITIVE_INPUT_BOUNDARY')
replace("assert ev=='OPEN'", "if ev!='OPEN':raise InputRejected('FROZEN_EXPRESSION_DOMAIN_EXCEEDED',eid)", 'NO_UNAUTHORIZED_TRUE_TARGET_IN_EXACT_FROZEN_LANE')
replace("'sourceClass':classmap[fid],", "'sourceClass':source_class_from_actual_binding(e,sc),", 'FULL_CASE_SIDE_FACT_SOURCE_PI7_BINDING')
replace('  for field in schema_fields:\n   if field in derived:', '  if eid=="A-E001":derived.update(successor_comparison(e,edges))\n  for field in applicable_fields:\n   if field in derived:', 'ACCEPTED_SEP_MEASUREMENT_COMPARISON')
replace("if carrier:compare(e,field,carrier[0]['assignedValue'],'Effective execution-cell carrier consistency; validates propagation, not independent analytical judgment')", "if carrier and accepted_carrier_supersession(e,field):\n     comparisons.append({'edgeId':eid,'field':field,'result':'NOT_DETERMINABLE','stored':e.get(field),'basis':'Accepted successor/overlay supersedes the immutable legacy carrier; no independent analytical assignment inferred from that carrier.'})\n    elif carrier:compare(e,field,carrier[0]['assignedValue'],'Unchanged applicable legacy carrier; propagation only, not independent analytical judgment')", 'NO_STALE_CARRIER_ORACLE_FOR_ACCEPTED_DIFFERENCES')
start=s.index(' ds=differences(readl(BASE),rows)')
end=s.index(" return {'identities'",start)
old=s[start:end]
replace(old, " composition=check_composition(b)\n ds=ORACLE['acceptedDifferenceFromHistoricalPredecessor']\n unexpected=[]  # exact accepted composition independently checked, never relaxed\n", 'EXACT_ACCEPTED_ASSEMBLY_ORACLE_REPLACES_EIGHT_HISTORICAL_PATHS')
replace("'effectiveView':identity(VIEW)", "'effectiveView':identity(Path(input_path))", 'TRUTHFUL_CURRENT_INPUT_IDENTITY')
# Old higher-order helpers are retained byte-exact in ORIGINAL_FROZEN_HARNESS.py.
# Their safe new-input equivalents are in the separate author test artifact.
s=s[:s.index('\ndef set_quality(')]

helpers=r'''

class InputRejected(ValueError):
 def __init__(self,code,detail):
  self.code=code;self.detail=detail
  super().__init__(code+': '+str(detail))

EXPECTED_FEVA_SHA='5b37071a5fa5374c77b149bfde5c230c228cdf73d9785e5ea55346f9fab28daa'
EXPECTED_FEVA_BYTES=104722
ORACLE_SHA=__ORACLE_SHA__
PINBOOK_SHA=__PINBOOK_SHA__
def checked_json(p,expected):
 b=p.read_bytes()
 if sha(b)!=expected:raise InputRejected('PACKAGE_AUTHORITY_IDENTITY',str(p))
 return json.loads(b)
ORACLE=checked_json(PACKAGE/'ACCEPTED_FEVA_COMPOSITION_ORACLE.json',ORACLE_SHA)
PINBOOK=checked_json(PACKAGE/'INPUT_IDENTITIES.json',PINBOOK_SHA)

def exact_equal(a,b):
 if type(a)!=type(b):return False
 if isinstance(a,dict):return set(a)==set(b) and all(exact_equal(a[k],b[k]) for k in a)
 if isinstance(a,list):return len(a)==len(b) and all(exact_equal(x,y) for x,y in zip(a,b))
 return a==b

def parse_jsonl(raw):
 try:
  rows=[json.loads(l,object_pairs_hook=no_dups,parse_constant=lambda v:(_ for _ in ()).throw(ValueError('NONFINITE_JSON:'+v))) for l in raw.splitlines()]
 except (ValueError,UnicodeError) as ex:raise InputRejected('CORRUPTED_RECORDS',str(ex)) from ex
 if not all(isinstance(r,dict) for r in rows):raise InputRejected('CORRUPTED_RECORDS','record is not an object')
 return rows

def check_composition(raw):
 rows=parse_jsonl(raw); lines=raw.splitlines(keepends=True)
 if len(rows)!=116:raise InputRejected('COMPOSITION_RECORD_CENSUS',len(rows))
 ids=[[r.get('recordType'),r.get('cellIndex',r.get('edgeId'))] for r in rows]
 if not exact_equal(ids,ORACLE['orderedIdentities']):raise InputRejected('COMPOSITION_ORDERED_IDENTITIES',ids)
 if sha(b''.join(lines[:110]))!=ORACLE['legacyRawSha256']:raise InputRejected('LEGACY_RAW_PRESERVATION','110 legacy raw lines altered')
 for x,r,line in zip(ORACLE['lineIdentities'],rows,lines):
  if not exact_equal(x['record'],r) or len(line)!=x['bytes'] or sha(line)!=x['sha256']:
   raise InputRejected('UNAUTHORIZED_COMPOSITION',x['line'])
 return {'records':116,'legacy':110,'sectionI':6,'orderedIdentitiesPreserved':True,'rawLegacyPreserved':True,'acceptedDifferenceExactlyPreserved':True}

def load_exact_input(input_path):
 p=Path(input_path).resolve(strict=True)
 b=p.read_bytes()
 if len(b)!=EXPECTED_FEVA_BYTES or sha(b)!=EXPECTED_FEVA_SHA:
  raise InputRejected('EXACT_INPUT_IDENTITY',{'path':str(p),'bytes':len(b),'sha256':sha(b)})
 check_composition(b)
 return b,parse_jsonl(b)

def verify_dependency_bundle():
 for rel,pin in PINBOOK['inputs'].items():
  p=ROOT/rel
  if not p.resolve().is_relative_to(ROOT) or p.is_symlink():raise InputRejected('DEPENDENCY_PATH',rel)
  b=p.read_bytes()
  if len(b)!=pin['bytes'] or sha(b)!=pin['sha256']:raise InputRejected('DEPENDENCY_IDENTITY',rel)
 if sha((PACKAGE/'ORIGINAL_FROZEN_HARNESS.py').read_bytes())!=PINBOOK['originalHarness']['sha256']:
  raise InputRejected('ORIGINAL_HARNESS_ALTERED','original frozen source')

def accepted_carrier_supersession(edge,field):
 # Actual, presence-aware accepted differences; acceptance authorizes preservation,
 # not an inferred analytical reassignment or a synthesized new field comparison.
 line=next(x['line'] for x in ORACLE['lineIdentities'] if x['record'].get('edgeId')==edge['edgeId'])
 prefix='['+str(line-1)+'].'+field
 return any(d['path']==prefix or d['path'].startswith(prefix+'.') or d['path'].startswith(prefix+'[') for d in ORACLE['acceptedDifferenceFromHistoricalPredecessor'])

def section_fields(edge,legacy_fields):
 if edge['edgeId']=='A-E001':
  # Accepted closure + CORR1 delta + SEP-I-4 / BC-2 / BC-5.
  return [f for f in legacy_fields if f!='supportClass']+['prOnlyBasis','bearingEvaluability','bearingIndeterminacyReasons','supportBearing']
 if any(f in edge for f in ('supportBearing','bearingEvaluability','bearingIndeterminacyReasons','prOnlyBasis')):
  raise InputRejected('ILLEGAL_SCHEMA_VARIANT',edge['edgeId'])
 return list(legacy_fields)

def load_frozen_module(rel,name):
 # No main(), filesystem writes or pycache. Source identity checked before exec.
 import types
 b=(ROOT/rel).read_bytes()
 if sha(b)!=PINBOOK['inputs'][rel]['sha256']:raise InputRejected('DEPENDENCY_IDENTITY',rel)
 mod=types.ModuleType(name);mod.__file__=str(ROOT/rel);sys.modules[name]=mod
 exec(compile(b,mod.__file__,'exec'),mod.__dict__)
 return mod

def source_class_from_actual_binding(edge,bindings):
 rel='WORKBENCH/AUDITS/STAGE2_FINAL_EFFECTIVE_VIEW_ASSEMBLY_1_CORR2/STAGE2_FINAL_EFFECTIVE_VIEW_ASSEMBLY_1_CORR2_BUILD.py'
 mod=load_frozen_module(rel,'_accepted_feva_binding')
 try:
  index=mod.load_pi7_index(b''.join(canonical(r)+b'\n' for r in bindings))
  return mod.derive_source_class(edge,index,'measurement fixture')[0]
 except mod.GateFailure as ex:raise InputRejected('ACTUAL_SOURCE_BINDING',str(ex)) from ex

def successor_comparison(edge,edges):
 rel='WORKBENCH/DOWNLOADS/STAGE2_SUPPORTCLASS_EVALUABILITY_SEMANTIC_SEPARATION_1_IMPLEMENTATION_1_CORR10_2026-10-07/STAGE2_SUPPORTCLASS_EVALUABILITY_SEMANTIC_SEPARATION_1_IMPLEMENTATION_1_CORR10_SUCCESSOR_VIEW_BUILDER.py'
 mod=load_frozen_module(rel,'_accepted_sep_corr10')
 # Exact accepted basis is mandatory: arbitrary truthy prOnlyBasis is not authority.
 expected=ORACLE['lineIdentities'][114]['record']['prOnlyBasis']
 if not exact_equal(edge.get('prOnlyBasis'),expected):raise InputRejected('SUCCESSOR_PR_BASIS',edge.get('prOnlyBasis'))
 reg=mod.parse_registry(METHOD.read_text())
 # Exact context used by accepted CORR1 evaluate_record (BUILD.py line 312):
 # B-1b terminates before W/T. No synthetic selection/witness is introduced.
 out=mod.evaluate(copy.deepcopy(edge),reg,{'coderOutput':{},'traces':{},'witness':{}},registry_sha=sha(METHOD.read_bytes()))
 if out.get('admission')!='ADMITTED':raise InputRejected('SUCCESSOR_ADMISSION_HELD',out)
 return {**{f:out.get(f) for f in ('bearingEvaluability','bearingIndeterminacyReasons','supportBearing')},'prOnlyBasis':expected}

def regress(input_path):
 """Future separately authorized evaluation entrypoint; NOT called in this act.
 Returns diagnostics, never synthesizes a whole Stage-2 PASS/acceptance decision.
 """
 _,rows=load_exact_input(input_path)
 return _measure_subset(input_path,
  cell_indices=tuple(r['cellIndex'] for r in rows if r['recordType']=='POST_RECONCILIATION_EXECUTION_CELL_RECORD'),
  edge_ids=tuple(r['edgeId'] for r in rows if r['recordType']=='SECTION_I_RECORD'))

if __name__=='__main__':
 import argparse
 ap=argparse.ArgumentParser(description='FEVA CORR2 candidate input/composition gate only; full regression requires a separate Owner act')
 ap.add_argument('--exact-input',required=True)
 args=ap.parse_args()
 try:
  verify_dependency_bundle();b,rows=load_exact_input(args.exact_input)
  print(json.dumps({'mode':'INPUT_COMPOSITION_COMPATIBILITY_ONLY','sha256':sha(b),'bytes':len(b),'census':check_composition(b),'measurementExecuted':False},sort_keys=True))
 except (InputRejected,OSError) as ex:
  print(str(ex),file=sys.stderr);sys.exit(2)
'''
helpers=helpers.replace('__ORACLE_SHA__',repr(hashlib.sha256((P/'ACCEPTED_FEVA_COMPOSITION_ORACLE.json').read_bytes()).hexdigest())).replace('__PINBOOK_SHA__',repr(hashlib.sha256((P/'INPUT_IDENTITIES.json').read_bytes()).hexdigest()))
s='"""Codex-authored compatibility candidate. Author tests are not IV.\nOriginal FAIL and correction IV HOLD remain historical states.\n"""\n'+s+helpers
ast.parse(s)
(P/'ADAPTED_REGRESSION_HARNESS.py').write_text(s)
(P/'SOURCE_TRANSFORMATIONS.json').write_text(json.dumps(changes,indent=2,sort_keys=True)+'\n')
(P/'ORIGINAL_TO_CANDIDATE.diff').write_text(''.join(difflib.unified_diff(original.splitlines(keepends=True),s.splitlines(keepends=True),fromfile='ORIGINAL_FROZEN_HARNESS.py',tofile='ADAPTED_REGRESSION_HARNESS.py')))
print(json.dumps({'transformations':len(changes),'candidateSha256':hashlib.sha256(s.encode()).hexdigest(),'candidateBytes':len(s.encode())}))
