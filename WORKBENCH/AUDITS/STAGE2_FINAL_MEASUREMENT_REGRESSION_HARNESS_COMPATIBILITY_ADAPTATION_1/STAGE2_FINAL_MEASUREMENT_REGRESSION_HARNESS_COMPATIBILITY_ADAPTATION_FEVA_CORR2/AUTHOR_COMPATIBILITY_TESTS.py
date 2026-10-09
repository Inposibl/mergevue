"""Bounded author tests. Never calls adapted regress() or evaluates whole FEVA.
The historical replay alone uses the full unmodified original, on old inputs.
"""
import copy, hashlib, importlib.util, json, os, subprocess, sys, tempfile
from pathlib import Path
P=Path(__file__).resolve().parent
spec=importlib.util.spec_from_file_location('candidate',P/'ADAPTED_REGRESSION_HARNESS.py')
c=importlib.util.module_from_spec(spec);spec.loader.exec_module(c)
INPUT=P/'FEVA_CORR2_EXACT_INPUT.jsonl'
raw,rows=c.load_exact_input(INPUT)
edges=[r for r in rows if r['recordType']=='SECTION_I_RECORD']
FB=edges[0]['edgeId']
test_results=[]
fixture_outputs=[]
def test(name,fn,kind='author_component_test'):
 try:
  detail=fn();test_results.append({'name':name,'kind':kind,'passed':True,'evidence':detail})
 except Exception as ex:
  test_results.append({'name':name,'kind':kind,'passed':False,'exception':type(ex).__name__,'detail':str(ex)})
def require(condition,detail):
 if not condition:raise AssertionError(detail)
def rejected(fn,expected):
 try:fn()
 except c.InputRejected as ex:
  require(ex.code==expected,{'expected':expected,'actual':ex.code})
  return {'expectedDetector':expected,'actualDetector':ex.code,'failureDetail':ex.detail,'measurementPrevented':True}
 raise AssertionError('Failure was not rejected: '+expected)
def edge_by_id(rs,eid):return next(r for r in rs if r.get('edgeId')==eid)
def mutate_field(eid,field,value):
 def f(rs,facts):edge_by_id(rs,eid)[field]=copy.deepcopy(value)
 return f
def component(eid=FB,mutation=None,cells=()):
 out=c._measure_subset(INPUT,cell_indices=cells,edge_ids=(eid,) if eid else (),mutation=mutation)
 require(len(out['derivedOutputs'])<=1,'whole-view measurement is forbidden in author tests')
 return out
def diagnostic_control(name,eid,mutation,detector,cells=()):
 before=component(eid,cells=cells);after=component(eid,mutation,cells)
 base={json.dumps(d,sort_keys=True) for d in before['defects']}
 new=[d for d in after['defects'] if json.dumps(d,sort_keys=True) not in base]
 require(any(d['code']==detector for d in new),{'expected':detector,'new':new})
 return {'control':name,'expectedNewDetector':detector,'detected':True,'newDiagnostics':new,'baselineCanAlreadyContainDefects':True,'mutation':'IN_MEMORY_ONLY','wholeRegressionExecuted':False}

test('all_dependency_pins',lambda:(c.verify_dependency_bundle() or {'pins':len(c.PINBOOK['inputs'])}))
test('exact_input_and_composition',lambda:c.check_composition(raw))
test('original_harness_byte_preservation',lambda:require(hashlib.sha256((P/'ORIGINAL_FROZEN_HARNESS.py').read_bytes()).hexdigest()=='c99b8dc60dfd8d8594d903896c333bec673fa712150778f53bfd6f07243bb1dc','original changed'))
test('old_input_cannot_impersonate_FEVA',lambda:rejected(lambda:c.load_exact_input(c.HISTORICAL_VIEW),'EXACT_INPUT_IDENTITY'),'negative_control')
def physical_bad_input():
 bad=raw.replace(b'"PLAN"',b'"XXXX"',1)
 with tempfile.NamedTemporaryFile(dir=P,prefix='negative_input_',suffix='.jsonl') as f:
  f.write(bad);f.flush()
  return rejected(lambda:c.load_exact_input(f.name),'EXACT_INPUT_IDENTITY')
test('same_length_digest_mismatch',physical_bad_input,'negative_control')
test('corrupted_json_is_rejected',lambda:rejected(lambda:c.parse_jsonl(b'{broken}\n'),'CORRUPTED_RECORDS'),'negative_control')
test('duplicate_JSON_key_is_rejected',lambda:rejected(lambda:c.parse_jsonl(b'{"x":1,"x":2}\n'),'CORRUPTED_RECORDS'),'negative_control')
test('nonfinite_JSON_is_rejected',lambda:rejected(lambda:c.parse_jsonl(b'{"x":NaN}\n'),'CORRUPTED_RECORDS'),'negative_control')
test('record_loss',lambda:rejected(lambda:c.check_composition(b''.join(raw.splitlines(keepends=True)[:-1])),'COMPOSITION_RECORD_CENSUS'),'negative_control')
def reordered():
 lines=raw.splitlines(keepends=True);lines[0],lines[1]=lines[1],lines[0]
 return rejected(lambda:c.check_composition(b''.join(lines)),'COMPOSITION_ORDERED_IDENTITIES')
test('ordered_record_identity_change',reordered,'negative_control')
def altered_composition():
 rs=copy.deepcopy(rows);rs[115]['planCurrentState']='CURRENT'
 # Legacy lines are kept raw; only a §I line is deliberately changed.
 ls=raw.splitlines(keepends=True);ls[115]=(json.dumps(rs[115],ensure_ascii=True,separators=(', ',': '))+'\n').encode()
 return rejected(lambda:c.check_composition(b''.join(ls)),'UNAUTHORIZED_COMPOSITION')
test('unauthorized_accepted_overlay_reversion',altered_composition,'negative_control')
def raw_legacy_change():
 ls=raw.splitlines(keepends=True);ls[0]=ls[0].rstrip()+b' \n'
 return rejected(lambda:c.check_composition(b''.join(ls)),'LEGACY_RAW_PRESERVATION')
test('raw_legacy_reserialization_is_rejected',raw_legacy_change,'negative_control')
def families():
 _,ms,tt=c.load_registry()
 schema=c.readj(c.D/'STAGE2_CORR4_PILOT_ANALYTICAL_CODER_VIEW_SCHEMA_CORR2_CORR1_CORR2_CORR1.json')
 fields=list(dict.fromkeys(__import__('re').split(r'[\[{ (]',f)[0] for g in schema['requiredCodingFields']['groups'] for f in g['fields']))
 census=[]
 for e in edges:
  fs=c.section_fields(e,fields)
  require(set(e)==set(fs)|{'recordType'},e['edgeId'])
  require(('supportClass' in fs)==(e['edgeId']!='A-E001'),e['edgeId'])
  census.append({'edgeId':e['edgeId'],'fields':fs,'representation':'SUCCESSOR' if e['edgeId']=='A-E001' else 'LEGACY'})
 return {'registryCounts':[len(ms),len(tt)],'fieldCensus':census,'measurementExecuted':False}
test('all_six_schema_family_dispatches',families)
test('successor_does_not_require_old_supportClass',lambda:c.successor_comparison(edge_by_id(rows,'A-E001'),edges))
test('successor_dual_write_is_illegal',lambda:rejected(lambda:component('A-E001',mutate_field('A-E001','supportClass','DIRECT_SUPPORT')),'SECTION_SCHEMA'),'negative_control')
test('successor_required_field_loss',lambda:rejected(lambda:component('A-E001',lambda rs,fs:edge_by_id(rs,'A-E001').pop('bearingEvaluability')),'SECTION_SCHEMA'),'negative_control')
test('legacy_record_cannot_take_successor_fields',lambda:rejected(lambda:component(FB,mutate_field(FB,'supportBearing','DIRECT_SUPPORT')),'ILLEGAL_SCHEMA_VARIANT'),'negative_control')
test('successor_PR_basis_cannot_be_arbitrary_truthy_input',lambda:rejected(lambda:c.successor_comparison({**edge_by_id(rows,'A-E001'),'prOnlyBasis':{'invented':'basis'}},edges),'SUCCESSOR_PR_BASIS'),'negative_control')
def supported_from_missing(rs,fs):
 e=edge_by_id(rs,FB);e['componentSupply']=[];e['edgeState']='SUPPORTED';e['missingComponents']=[]
test('missing_support_cannot_establish_leaf',lambda:diagnostic_control('missing support',FB,supported_from_missing,'SECTION_I_edgeState'),'negative_control')
def noncanonical_source(rs,fs):edge_by_id(rs,FB)['sourceRefs'][0]['sourceId']='INVENTED_SOURCE'
test('actual_supplying_source_identity_is_checked',lambda:rejected(lambda:component(FB,noncanonical_source),'ACTUAL_SOURCE_BINDING'),'negative_control')
test('scope_cannot_propagate_upward',lambda:diagnostic_control('unsupported scope',FB,mutate_field(FB,'observedScope','unit'),'UPWARD_SCOPE_WITHOUT_BRIDGE'),'negative_control')
test('post_T0_cannot_supply_positive_support',lambda:diagnostic_control('post T0',FB,lambda rs,fs:edge_by_id(rs,FB).update(temporalState='POST_T0_EXCLUDED',edgeState='SUPPORTED'),'POST_T0_SUPPORT'),'negative_control')
test('counterfactual_relation_not_silently_positive',lambda:rejected(lambda:component(FB,mutate_field(FB,'relation','NEGATES_LEAF')),'COUNTERFACTUAL_SUPPORT_REJECTED'),'negative_control')
test('documentary_silence_not_silently_negative',lambda:rejected(lambda:component(FB,mutate_field(FB,'absenceEvidenceState','DOCUMENTARY_SILENCE')),'COUNTERFACTUAL_SUPPORT_REJECTED'),'negative_control')
test('forbidden_outcome_field',lambda:rejected(lambda:component(FB,mutate_field(FB,'realizedOutcome','WIN')),'SECTION_SCHEMA'),'negative_control')
test('original_NC_revert_accepted_value',lambda:diagnostic_control('REVERT_ACCEPTED_VALUE','A-E023',mutate_field('A-E023','planCurrentState','CURRENT'),'CORRECTION_PRESERVATION'),'negative_control')
def invalid_tt(rs,fs):rs[0]['targetId']='TT-INVALID-NEGATIVE-CONTROL'
test('original_NC_invalid_tree_target',lambda:diagnostic_control('INVALID_TREE_TARGET',None,invalid_tt,'CELL_BINDING',(1,)),'negative_control')
def missing_ref(rs,fs):edge_by_id(rs,FB)['factIds'].append('MISSING_FACT_NEGCTRL')
# Supply identity is rejected first by the stronger full PI-7 selector; the
# orphan detector is separately exercised on a reference that does not change
# the required singular supplying fact identity.
test('original_NC_missing_referenced_fact_fail_closed',lambda:rejected(lambda:component(FB,missing_ref),'ACTUAL_SOURCE_BINDING'),'negative_control')
test('orphan_support_reference_explicit_diagnostic',lambda:diagnostic_control('orphan ref',FB,mutate_field(FB,'scopeBridgeFactIds',['MISSING_FACT_NEGCTRL']),'ORPHAN_scopeBridgeFactIds'),'negative_control')
test('original_NC_inconsistent_aggregate',lambda:diagnostic_control('INCONSISTENT_SECTION_I_AGGREGATE',FB,mutate_field(FB,'missingComponents',[]),'SECTION_I_missingComponents'),'negative_control')
def quality_invariance():
 outs=[]
 for q in ('COMPETENT','COMPETENT_SELF_DESCRIPTION_UNCORROBORATED'):
  o=component(FB,mutate_field(FB,'sourceQualityState',q))['derivedOutputs'][0]
  outs.append({k:o[k] for k in ('recordedSuppliedComponents','missingComponentsFromRecordedSupply','edgeStateFromRecordedSupply','leafValue','sufficiencyExpressionResult','targetState')})
 require(outs[0]==outs[1],outs)
 return {'outputs':outs,'invariant':True,'boundedSingleEdgeTest':True}
test('F_B_0025_two_quality_sensitivity_preserved',quality_invariance)
def prose_invariance():
 eid=edges[2]['edgeId'];before=component(eid)
 def mutate(rs,fs):
  e=edge_by_id(rs,eid);e['decisionRef']=None
  for comp in e['componentSupply']:comp['entailmentBasis']='Diagnostic prose removed in memory only'
 after=component(eid,mutate)
 keys=('edgeStateFromRecordedSupply','missingComponentsFromRecordedSupply','leafValue','sufficiencyExpressionResult','targetState')
 a={k:before['derivedOutputs'][0][k] for k in keys};b={k:after['derivedOutputs'][0][k] for k in keys}
 require(a==b,{'before':a,'after':b});return {'invariant':True,'outputs':a}
test('ADV2_prose_only_component_probe',prose_invariance)
def deterministic_component():
 a=component('A-E001');b=component('A-E001')
 require(a==b,'fresh parsing differs')
 require(any(x['field']=='supportBearing' and x['result']=='MATCH' for x in a['sectionIComparisons']),'new bearing was not compared')
 fixture_outputs.append({'fixture':'accepted A-E001 single-edge author compatibility test','identity':c.identity(INPUT),'diagnostics':a,'scope':'ONE EDGE; not full FEVA measurement'})
 return {'sameStructures':True,'structureSha256':c.sha(c.canonical(a)),'edgesMeasuredPerInvocation':1,'measurementDefectsAreRetained':len(a['defects'])}
test('fresh_parse_component_repeat',deterministic_component)
test('legacy_typed_component_requirement_is_not_removed',lambda:require(any(x['code']=='COMPONENT_SCHEMA' for x in component(FB)['defects']),'component schema check was lost'))
test('discriminator_routing_is_recomputed',lambda:diagnostic_control('D route',FB,mutate_field(FB,'discriminatorIds',['D-01']),'SECTION_I_discriminatorIds'),'negative_control')
test('successor_bearing_does_not_manufacture_support',lambda:diagnostic_control('bearing mismatch','A-E001',mutate_field('A-E001','supportBearing','DIRECT_SUPPORT'),'SECTION_I_supportBearing'),'negative_control')
test('successor_evaluability_does_not_read_establishment_scope',lambda:require(c.successor_comparison({**edge_by_id(rows,'A-E001'),'scopeBridgeState':'NOT_REQUIRED'},edges)==c.successor_comparison(edge_by_id(rows,'A-E001'),edges),'EV incorrectly reads scope'))
def f0024_provenance():
 eid=edges[1]['edgeId'];d=component(eid)
 a=next(x for x in d['sectionIComparisons'] if x['field']=='factualPackageIdentity')
 require(a['result']=='MATCH',a)
 return {'fixture':'one F0024 edge only','acceptedProvenanceComparison':a}
test('accepted_F0024_provenance_supersedes_old_identity',f0024_provenance)
def all_binding_surface_checks():
 bindings=c.readl(c.D/'STAGE2_CORR4_PILOT_ANALYTICAL_SOURCECLASS_BINDING_CORR2.jsonl')
 results=[]
 for e in edges:
  value=c.source_class_from_actual_binding(e,bindings)
  require(value==e['sourceClass'],e['edgeId'])
  results.append({'edgeId':e['edgeId'],'boundValue':value,'consumer':'sourceClass field only'})
 return {'surface':'6/6 source identity bindings only; no expressions/leaf/target evaluation','bindings':results}
test('full_actual_source_binding_field_census',all_binding_surface_checks)

def historical_replay():
 pinbook=json.loads((P/'INPUT_IDENTITIES.json').read_bytes())
 root=pinbook['repositoryRoot']
 script='import runpy,json; n=runpy.run_path('+repr(str(P/'ORIGINAL_FROZEN_HARNESS.py'))+'); r=n["regress"](); print(json.dumps({"regression":r,"negativeControls":n["negative_controls"](r),"sensitivity":n["scenarios"](),"ADV2":n["adv2_analysis"](r)},sort_keys=True,ensure_ascii=True,separators=(",",":")))'
 run=subprocess.run([sys.executable,'-B','-c',script],cwd=root,capture_output=True,env={**os.environ,'PYTHONDONTWRITEBYTECODE':'1','GIT_OPTIONAL_LOCKS':'0'})
 require(run.returncode==0,run.stderr.decode())
 got=json.loads(run.stdout)
 old=json.loads((c.D/'STAGE2_FINAL_MEASUREMENT_REGRESSION_1_2026-10-05/STAGE2_FINAL_MEASUREMENT_REGRESSION_1_RESULTS.json').read_bytes())
 require(c.exact_equal(got['regression'],old['regression']),'historical regression output changed')
 require(c.sha(c.canonical(got['regression']))==old['replay']['resultStructureSha256'][0],'historical hash differs')
 require(all(x['detected'] for x in got['negativeControls']),'original negative control failed')
 require(got['sensitivity']['FB0025_REGRESSION_OUTPUT_INVARIANT']=='YES','original sensitivity differs')
 (P/'HISTORICAL_AUTHOR_REPRODUCTION.json').write_text(json.dumps(got,sort_keys=True,indent=2)+'\n')
 return {'originalHarnessUnmodified':True,'input':'a1fcae68939decd0a3c4a39c0a0bc48e8d285bd9cd7ce1928b0d025056244047','resultStructureSha256':c.sha(c.canonical(got['regression'])),'matchesHistoricalOriginalExactly':True,'historicalResult':'FAIL','negativeControls':4,'currentFEVARegressed':False,'command':[sys.executable,'-B','-c',script],'cwd':root}
test('historical_original_FAIL_is_reproducible',historical_replay,'historical_non_regression_author_test')
result={'author':'Codex','scope':'bounded compatibility, single-edge/cell fixtures and old-input historical reproduction',
 'independentlyVerified':False,'ownerAccepted':False,'wholeCurrentFEVARegressionExecuted':False,
 'adaptedRegressEntryPointCalls':0,'tests':test_results,'passed':sum(x['passed'] for x in test_results),'failed':sum(not x['passed'] for x in test_results),
 'historicalOriginalVerdict':'FAIL','historicalCorrectionIVVerdict':'HOLD','noHistoricalFindingClosureClaimed':True}
(P/'AUTHOR_COMPATIBILITY_RESULTS.json').write_text(json.dumps(result,sort_keys=True,indent=2)+'\n')
(P/'SINGLE_EDGE_AUTHOR_FIXTURE_EVIDENCE.json').write_text(json.dumps(fixture_outputs,sort_keys=True,indent=2)+'\n')
print(json.dumps({'passed':result['passed'],'failed':result['failed'],'failedTests':[x for x in test_results if not x['passed']]}))
sys.exit(1 if result['failed'] else 0)
