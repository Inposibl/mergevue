"""Codex-authored compatibility candidate. Author tests are not IV.
Original FAIL and correction IV HOLD remain historical states.
"""

import json,hashlib,re,copy,collections,sys,os
from pathlib import Path
PACKAGE=Path(__file__).resolve().parent
ROOT=PACKAGE/'FROZEN_INPUTS'
D=ROOT/'WORKBENCH/DOWNLOADS'
HISTORICAL_VIEW=D/'STAGE2_EFFECTIVE_VIEW_ASSEMBLY_1_CORR1_2026-10-05/STAGE2_EFFECTIVE_VIEW_ASSEMBLY_1_RECORDS.jsonl'
METHOD=D/'STAGE2_PD3_ROLE_BOUNDED_ENTITLEMENT_CLARIFICATION_1_CORR1_2026-10-04/STAGE2_PD3_ROLE_BOUNDED_ENTITLEMENT_CLARIFICATION_1_CORR1_CANDIDATE.md'
CONTRACT=HISTORICAL_VIEW.parent/'STAGE2_EFFECTIVE_VIEW_ASSEMBLY_CONTRACT_1.md'
BASE=D/'STAGE2_POST_RECONCILIATION_EXECUTION_1_CODER_A_2026-10-04/STAGE2_POST_RECONCILIATION_EXECUTION_1_CODER_A_RECORDS.jsonl'
OV=[
D/'STAGE2_FM0205_PLAN_CURRENT_DRIFT_CORRECTION_1_2026-10-04/STAGE2_FM0205_PLAN_CURRENT_DRIFT_CORRECTION_1.json',
D/'STAGE2_CO_PHYSICAL_STATE_DRIFT_CORRECTION_1_2026-10-04/STAGE2_CO_PHYSICAL_STATE_DRIFT_CORRECTION_1.json',
D/'STAGE2_F0024_FACTUAL_PACKAGE_IDENTITY_CORRECTION_1_2026-10-04/STAGE2_F0024_FACTUAL_PACKAGE_IDENTITY_CORRECTION_1.json']
def sha(b):return hashlib.sha256(b).hexdigest()
def canonical(x):return json.dumps(x,sort_keys=True,ensure_ascii=True,separators=(',',':')).encode()
def identity(p):return {'path':str(ROOT/p),'bytes':p.stat().st_size,'sha256':sha(p.read_bytes())}
def readj(p):return json.loads(p.read_text())
def readl(p):return [json.loads(l) for l in p.read_text().splitlines()]
def no_dups(pairs):
 d={}
 for k,v in pairs:
  if k in d:raise ValueError('DUPLICATE_JSON_KEY:'+k)
  d[k]=v
 return d
def parse_expr(s):
 tokens=re.findall(r'ALL_OF|ANY_OF|M-[A-Z0-9-]+|TT-[A-Z0-9-]+|a[0-9]+|[(),]',s);i=0
 def rec():
  nonlocal i
  t=tokens[i];i+=1
  if t in ('ALL_OF','ANY_OF'):
   if tokens[i]!='(':raise ValueError('expression syntax')
   i+=1;children=[rec()]
   while tokens[i]==',':i+=1;children.append(rec())
   if tokens[i]!=')':raise ValueError('expression closing')
   i+=1;return [t,children]
  return t
 result=rec()
 if i!=len(tokens) or re.sub(r'\s+','',s)!=''.join(tokens):raise ValueError('unconsumed expression')
 return result
def leaves(e):
 return [e] if isinstance(e,str) else [x for c in e[1] for x in leaves(c)]
def evaluate(e,values):
 if isinstance(e,str):return values.get(e,'OPEN')
 cs=[evaluate(c,values) for c in e[1]]
 if e[0]=='ALL_OF':
  return 'FALSE' if 'FALSE' in cs else 'CONFLICTED' if 'CONFLICTED' in cs else 'TRUE' if all(c=='TRUE' for c in cs) else 'OPEN'
 return 'TRUE' if 'TRUE' in cs else 'CONFLICTED' if 'CONFLICTED' in cs else 'FALSE' if all(c=='FALSE' for c in cs) else 'OPEN'
def load_registry():
 text=METHOD.read_text()
 mtext=text[text.index('## D. OBSERVABLE'):text.index('### D.RC1')]
 ms={}
 for l in mtext.splitlines():
  if l.startswith('| M-'):
   cs=l.strip().strip('|').strip().split(' | ')
   mid=cs[0].replace(' (NEW)','')
   pres=mid.startswith('M-PRES-')
   ms[mid]={'D':['D-01'] if pres else re.findall(r'D-[0-9]{2}',cs[2]),
    'components':re.findall(r'\bc[0-9]+\b',cs[5] if pres else cs[6]),
    'objectType':'ORGANIZATIONAL_PRESENTATION' if pres else 'ORGANIZATIONAL_MECHANISM',
    'joinDeclared':'join: REL-WITNESS' in l,'row':l}
 tt={}
 blocks=re.split(r'^### (TT-[A-Z0-9-]+)\n',text[text.index('## B+F.'):text.index('## C.')],flags=re.M)
 for i in range(1,len(blocks),2):
  tid,b=blocks[i:i+2]
  x=re.search(r'^mechExpr: ([^\n]+)',b,re.M)
  tt[tid]={'expression':x.group(1) if x else None,'joinDeclared':bool(re.search(r'^join: REL-WITNESS',b,re.M)),'block':b}
 assert len(ms)==74 and len(tt)==62
 return text,ms,tt
def differences(a,b,path=''):
 if type(a)!=type(b):return [{'path':path,'historical':a,'effective':b}]
 if isinstance(a,dict):
  return [d for k in sorted(set(a)|set(b)) for d in differences(a.get(k),b.get(k),path+'.'+k)]
 if isinstance(a,list):
  if len(a)!=len(b):return [{'path':path,'historical':a,'effective':b}]
  return [d for i,(x,y) in enumerate(zip(a,b)) for d in differences(x,y,path+'['+str(i)+']')]
 return [] if a==b else [{'path':path,'historical':a,'effective':b}]
def _measure_subset(input_path, cell_indices=(), edge_ids=(), mutation=None):
 # Each invocation freshly reads/parses every input. No mutable replay state is shared.
 verify_dependency_bundle()
 text,ms,tt=load_registry()
 b,rows=load_exact_input(input_path)
 verify_dependency_bundle()
 facts=readl(D/'STAGE2_CORR4_PILOT_ANALYTICAL_CODER_INPUT.jsonl')
 prov=readl(D/'STAGE2_CORR4_PILOT_ANALYTICAL_PROVENANCE_SIDECAR_CORR1.jsonl')
 sc=readl(D/'STAGE2_CORR4_PILOT_ANALYTICAL_SOURCECLASS_BINDING_CORR2.jsonl')
 view_schema=readj(D/'STAGE2_CORR4_PILOT_ANALYTICAL_CODER_VIEW_SCHEMA_CORR2_CORR1_CORR2_CORR1.json')
 matrix=readj(D/'STAGE2_CORR4_PILOT_ANALYTICAL_FIELD_SOURCE_MATRIX_CORR2.json')
 cens={}
 for folder,name,key in [
 ('STAGE2_POST_RECONCILIATION_DOWNSTREAM_CONSEQUENCE_CENSUS_1_2026-10-03','STAGE2_POST_RECONCILIATION_DOWNSTREAM_CONSEQUENCE_CENSUS_1.json','censusCells'),
 ('STAGE2_POST_RECONCILIATION_DOWNSTREAM_CONSEQUENCE_CENSUS_1_CORR1_2026-10-04','STAGE2_POST_RECONCILIATION_DOWNSTREAM_CONSEQUENCE_CENSUS_1_CORR1.json','correctionCells'),
 ('STAGE2_POST_RECONCILIATION_DOWNSTREAM_CONSEQUENCE_CENSUS_1_CORR2_2026-10-04','STAGE2_POST_RECONCILIATION_DOWNSTREAM_CONSEQUENCE_CENSUS_1_CORR2.json','correctionCells')]:
  for c in readj(D/folder/name)[key]:cens[c['censusCellId']]=c
 if mutation:mutation(rows,facts)
 cells=[r for r in rows if r['recordType']=='POST_RECONCILIATION_EXECUTION_CELL_RECORD']
 edges=[r for r in rows if r['recordType']=='SECTION_I_RECORD']
 fmap={r['factId']:r for r in facts}
 pmap={r['factId']:r for r in prov}
 classmap={r['factId']:r['sectionIFill']['sourceClass'] if r['sectionIFill']['sourceClassAssignmentState']=='ASSIGNED' else r['sectionIFill']['sourceClassAssignmentState'] for r in sc}
 enum={}
 for line in text[text.index('## E. EVIDENCE'):text.index('### E-FO.')].splitlines():
  if line.startswith('| ') and ' · ' in line:
   cs=line.strip().strip('|').strip().split(' | ')
   name=cs[0].split(' (')[0]
   if name in ['relevanceState','evidenceForm','edgeState','supportClass','scopeBridgeState','temporalState','characteristicityState','formalOperativeState','planCurrentState','sourceQualityState','absenceEvidenceState']:
    enum[name]=cs[1].split(' · ')
 enum['sufficiencyExpressionResult']=['TRUE','FALSE','CONFLICTED','OPEN']
 enum['relation']=['SUPPORTS_LEAF','NEGATES_LEAF','COUNTER_M']
 schema_fields=[]
 for g in view_schema['requiredCodingFields']['groups']:
  for name in g['fields']:schema_fields.append(re.split(r'[\[{ (]',name)[0])
 schema_fields=list(dict.fromkeys(schema_fields))
 # presentationLaneOnly is explicitly required by controlling I; the older view-schema group display omits it.
 if 'presentationLaneOnly' not in schema_fields:schema_fields.append('presentationLaneOnly')
 required=set(schema_fields)|{'recordType'}
 outer={'recordType','cellIndex','subtask','subtaskDescription','censusCellRef','factId','mechanismPropositionId','targetId','field','side','coderIdentity','executionType','assignedValue','derivationOrBasis'}
 bad=[];comparisons=[];cellresults=[]
 def issue(code,where,detail):bad.append({'code':code,'where':where,'detail':detail})
 def compare(edge,field,expected,rule):
  actual=edge.get(field)
  result='MATCH' if actual==expected else 'MISMATCH'
  comparisons.append({'edgeId':edge['edgeId'],'field':field,'result':result,'stored':actual,'recomputed':expected,'basis':rule})
  if result=='MISMATCH':issue('SECTION_I_'+field,edge['edgeId'],{'stored':actual,'recomputed':expected,'rule':rule})
 semantic=[(r['side'],r['factId'],r['mechanismPropositionId'],r['targetId'],r['field']) for r in cells]
 census={'TOTAL_RECORDS':len(rows),'EXECUTION_CELL_RECORDS':len(cells),'SECTION_I_RECORDS':len(edges),
  'duplicateRecordIdentities':len(rows)-len(set((r['recordType'],r.get('cellIndex',r.get('edgeId'))) for r in rows)),
  'duplicateExecutionSemanticIdentities':len(semantic)-len(set(semantic)),
  'duplicateSectionIEdgeIdentities':len(edges)-len(set(e['edgeId'] for e in edges)),
  'duplicateJsonKeys':0,'malformedJsonRecords':0,'frozenFactInventory':len(facts),'censusReferenceInventory':len(cens)}
 edge_lookup={(e['factIds'][0],e['mechanismPropositionIds'][0],e['treeTargetIds'][0]):e for e in edges}
 for c in cells:
  if c["cellIndex"] not in cell_indices:continue
  chk={'identity':'PASS','censusReference':'PASS','binding':'PASS','valueVocabulary':'NOT_APPLICABLE','valueSchema':'PASS','carrierConsistency':'PASS'}
  where='cell:'+str(c['cellIndex'])
  if set(c)!=outer:chk['identity']='FAIL';issue('CELL_SCHEMA',where,sorted(set(c)^outer))
  if c['censusCellRef'] not in cens:chk['censusReference']='FAIL';issue('ORPHAN_CENSUS_REF',where,c['censusCellRef'])
  if c['factId'] not in fmap:chk['identity']='FAIL';issue('ORPHAN_FACT',where,c['factId'])
  if c['mechanismPropositionId'] not in ms or c['targetId'] not in tt or (c['targetId'] in tt and c['mechanismPropositionId'] not in leaves(parse_expr(tt[c['targetId']]['expression']))):
   chk['binding']='FAIL';issue('CELL_BINDING',where,[c['mechanismPropositionId'],c['targetId']])
  if c['field'] not in schema_fields:chk['valueSchema']='FAIL';issue('UNKNOWN_EFFECTIVE_FIELD',where,c['field'])
  if c['field'] in enum:
   chk['valueVocabulary']='PASS' if c['assignedValue'] in enum[c['field']] else 'FAIL'
   if chk['valueVocabulary']=='FAIL':issue('CELL_ENUM',where,c['assignedValue'])
  e=edge_lookup.get((c['factId'],c['mechanismPropositionId'],c['targetId']))
  if not e:chk['carrierConsistency']='FAIL';issue('ORPHAN_EDGE_CARRIER',where,None)
  elif c['assignedValue']!=e.get(c['field']):
   if accepted_carrier_supersession(e,c['field']):
    chk['carrierConsistency']='ACCEPTED_NONCONSUMING_LEGACY_CARRIER'
   else:
    chk['carrierConsistency']='FAIL';issue('CELL_SECTION_I_DIVERGENCE',where,{'field':c['field'],'cell':c['assignedValue'],'sectionI':e.get(c['field'])})
  if c['field'] in ['factIds','scopeBridgeFactIds','continuityBridgeFactIds','characteristicityFactIds','counterevidenceFactIds','conflictFactIds']:
   for f in c['assignedValue']:
    if f not in fmap:chk['valueSchema']='FAIL';issue('CELL_ORPHAN_FACT_REFERENCE',where,f)
  if c['field']=='sourceRefs' and c['assignedValue']!=pmap[c['factId']]['sourceRefs']:chk['valueSchema']='FAIL';issue('CELL_SOURCE_REFERENCE',where,'differs from frozen sidecar')
  if c['field']=='sourceClass' and c['assignedValue']!=classmap.get(c['factId']):chk['valueSchema']='FAIL';issue('CELL_SOURCECLASS',where,{'stored':c['assignedValue'],'bound':classmap.get(c['factId'])})
  if c['field']=='factualPackageIdentity' and c['assignedValue']!=pmap[c['factId']]['factualPackageIdentity']:chk['valueSchema']='FAIL';issue('CELL_PROVENANCE',where,'differs from frozen sidecar')
  if c['field']=='discriminatorIds' and c['assignedValue']!=ms[c['mechanismPropositionId']]['D']:chk['valueSchema']='FAIL';issue('CELL_D_ROUTING',where,{'stored':c['assignedValue'],'expected':ms[c['mechanismPropositionId']]['D']})
  if c['field']=='componentSupply':
   for item in c['assignedValue']:
    needed={'mechanismPropositionId','componentId','factIds','relationInstanceId','organizationalObjectRef','linkageEvidence'}
    if set(item)!=needed or not isinstance(item.get('linkageEvidence'),dict):
     chk['valueSchema']='FAIL';issue('CELL_COMPONENT_SCHEMA',where,{'missingKeys':sorted(needed-set(item)),'extraKeys':sorted(set(item)-needed),'linkageEvidenceType':type(item.get('linkageEvidence')).__name__})
  # Sparse-cell scope: applicable surfaces are checked at the named field; no nonexistent wrapper fields demanded.
  cellresults.append({'cellIndex':c['cellIndex'],'factId':c['factId'],'targetId':c['targetId'],'field':c['field'],'checks':chk,
   'result':'FAIL' if 'FAIL' in chk.values() else 'PASS'})
 derived_outputs=[]
 for e in edges:
  if e["edgeId"] not in edge_ids:continue
  applicable_fields=section_fields(e,schema_fields)
  applicable_required=set(applicable_fields)|{"recordType"}
  eid=e['edgeId'];fid=e['factIds'][0];mid=e['mechanismPropositionIds'][0];tid=e['treeTargetIds'][0]
  if set(e)!=applicable_required:raise InputRejected('SECTION_SCHEMA',{'edgeId':eid,'unknown':sorted(set(e)-applicable_required),'missing':sorted(applicable_required-set(e))})
  for field,values in enum.items():
   if field=="supportClass" and eid=="A-E001":continue
   if e.get(field) not in values:issue('SECTION_ENUM',eid,{'field':field,'value':e.get(field)})
  for field in ['factIds','scopeBridgeFactIds','continuityBridgeFactIds','characteristicityFactIds','counterevidenceFactIds','conflictFactIds']:
   for f in e.get(field,[]):
    if f not in fmap:issue('ORPHAN_'+field,eid,f)
  if e['temporalState']=='POST_T0_EXCLUDED' and e['edgeState']=='SUPPORTED':issue('POST_T0_SUPPORT',eid,e['edgeState'])
  for k in view_schema['requiredCodingFields']['forbiddenOutputFields']:
   if k in e:issue('FORBIDDEN_OUTPUT',eid,k)
  comp_required=ms[mid]['components']
  supplied=sorted(set(x['componentId'] for x in e['componentSupply'] if x.get('status')=='SUPPLIED' or ('factIds' in x and x['factIds'])))
  missing=[x for x in comp_required if x not in supplied]
  for item in e['componentSupply']:
   needed={'mechanismPropositionId','componentId','factIds','relationInstanceId','organizationalObjectRef','linkageEvidence'}
   if set(item)!=needed or not isinstance(item.get('linkageEvidence'),dict):issue('COMPONENT_SCHEMA',eid,{'componentId':item.get('componentId'),'missingKeys':sorted(needed-set(item)),'extraKeys':sorted(set(item)-needed),'linkageEvidenceType':type(item.get('linkageEvidence')).__name__})
   if item['componentId'] not in comp_required:issue('UNKNOWN_COMPONENT',eid,item['componentId'])
  # This uses the accepted recorded component assignments only, never recodes the fact.
  mech_expr=tt[tid]['expression'];ast=parse_expr(mech_expr)
  edge_recompute='PARTIAL' if supplied and missing else 'SUPPORTED' if supplied and not missing else 'GAP'
  checks={
   'edgeState':e['edgeState']=='SUPPORTED' and not missing,
   'componentCoverage':not missing,
   'sourceQualityState':e['sourceQualityState']=='COMPETENT',
   'scopeBridgeState':e['scopeBridgeState'] in ('NOT_REQUIRED','BRIDGED') and not (
    e['observedScope']!=e['claimedScope'] and e['scopeBridgeState']=='NOT_REQUIRED'),
   'temporalState':e['temporalState'] in ('PRE_T0_CONTINUITY_NOT_REQUIRED','PRE_T0_CONTINUITY_BRIDGED'),
   'formalOperativeState':e['formalOperativeState'] in ('OPERATIVE','FORMAL_PLUS_OPERATIVE','OPERATIVE_CONTRA_FORMAL'),
   'evidenceForm':e['evidenceForm']!='DE-4',
   'planCurrentState':e['planCurrentState']=='CURRENT',
   'characteristicityState':e['characteristicityState'] in ('CHARACTERISTIC','EPISODE_ONLY'),
   'rowJoin':True if not ms[mid]['joinDeclared'] else all(isinstance(x.get('linkageEvidence'),dict) and x['linkageEvidence'].get('class') in ['L-'+str(i) for i in range(1,7)] for x in e['componentSupply'])}
  # Existing negative/conflict references are empty across all six edges; no new judgments are made.
  if not (e['relation']=='SUPPORTS_LEAF' and not e['counterevidenceFactIds'] and not e['conflictFactIds'] and e['absenceEvidenceState']=='NONE'):
   raise InputRejected('COUNTERFACTUAL_SUPPORT_REJECTED',eid)
  lv='TRUE' if all(checks.values()) else 'OPEN'
  vals={m:'OPEN' for m in leaves(ast)};vals[mid]=lv
  ev=evaluate(ast,vals)
  # All six expressions necessarily OPEN from missing siblings plus blocking local gates.
  if ev!='OPEN':raise InputRejected('FROZEN_EXPRESSION_DOMAIN_EXCEEDED',eid)
  out={'edgeId':eid,'mechanismPropositionId':mid,'treeTargetId':tid,'selectionResultFromRecordedComponents':'SELECTED' if supplied else 'NOT_DETERMINABLE','recordedSuppliedComponents':supplied,
   'requiredComponents':comp_required,'missingComponentsFromRecordedSupply':missing,'edgeStateFromRecordedSupply':edge_recompute,
   'leafSupportPredicates':checks,'leafValue':lv,'leafNotDeterminable':False,'leafValues':vals,
   'sufficiencyExpression':mech_expr,'sufficiencyExpressionResult':ev,'targetState':'TARGET_NOT_ESTABLISHED_WITHIN_BOUND',
   'targetJoin':'NOT_ESTABLISHED_WITHIN_BOUND','sourceDiversity':'NOT_APPLICABLE'}
  derived_outputs.append(out)
  derived={
   'factIds':[fid],'mechanismPropositionIds':[mid],'discriminatorIds':ms[mid]['D'],'treeTargetIds':[tid],
   'relation':'SUPPORTS_LEAF','mechanismObjectTypes':[ms[mid]['objectType']],
   'factualPackageIdentity':pmap[fid]['factualPackageIdentity'],'sourceRefs':pmap[fid]['sourceRefs'],
   'sourceClass':source_class_from_actual_binding(e,sc),
   'scopeBridgeState':'NOT_REQUIRED' if e['observedScope']==e['claimedScope'] else 'UNRESOLVED_FAIL_CLOSED' if not e['scopeBridgeFactIds'] else e['scopeBridgeState'],
   'missingComponents':missing,'edgeState':edge_recompute,
   'sufficiencyExpression':mech_expr,'sufficiencyExpressionResult':ev,
   'counterevidenceFactIds':[],'conflictFactIds':[],'caseId':fmap[fid]['caseId'],'side':fmap[fid]['sideId']}
  if eid=="A-E001":derived.update(successor_comparison(e,edges))
  for field in applicable_fields:
   if field in derived:compare(e,field,derived[field],'Registry / frozen input / accepted recorded components / F.3-F.5; no recoding')
   else:
    carrier=[c for c in cells if (c['factId'],c['mechanismPropositionId'],c['targetId'],c['field'])==(fid,mid,tid,field)]
    if carrier and accepted_carrier_supersession(e,field):
     comparisons.append({'edgeId':eid,'field':field,'result':'NOT_DETERMINABLE','stored':e.get(field),'basis':'Accepted successor/overlay supersedes the immutable legacy carrier; no independent analytical assignment inferred from that carrier.'})
    elif carrier:compare(e,field,carrier[0]['assignedValue'],'Unchanged applicable legacy carrier; propagation only, not independent analytical judgment')
    else:comparisons.append({'edgeId':eid,'field':field,'result':'NOT_DETERMINABLE','stored':e.get(field),
      'basis':'No execution-cell carrier or deterministic assignment rule from accepted recorded states. Preserved analytical input / immutable metadata; no recoding authorized.',
      'outputUse':field in ['observedScope','claimedScope','scopeBridgeState','temporalState','characteristicityState','formalOperativeState','planCurrentState','sourceQualityState','componentSupply']})
  if e['edgeState']=='SUPPORTED' and e['evidenceForm']=='DE-4':issue('DE4_OPERATIVE_SUPPORT',eid,{'edgeState':e['edgeState'],'evidenceForm':e['evidenceForm'],'formalOperativeState':e['formalOperativeState']})
  if e['observedScope']!=e['claimedScope'] and e['scopeBridgeState']=='NOT_REQUIRED':issue('UPWARD_SCOPE_WITHOUT_BRIDGE',eid,{'observed':e['observedScope'],'claimed':e['claimedScope'],'bridgeFactIds':e['scopeBridgeFactIds']})
  for m in leaves(parse_expr(e['sufficiencyExpression'])):
   if m not in ms:issue('ORPHAN_EXPRESSION_MECHANISM',eid,m)
 # Corrected physical values are checked as preservation, separately from consumption consistency.
 a1=next(e for e in edges if e['edgeId']=='A-E001');a23=next(e for e in edges if e['edgeId']=='A-E023')
 fpi=next(c['assignedValue'] for c in cells if c['factId']=='F0024' and c['field']=='factualPackageIdentity')
 oc=readj(OV[2])['correctionRecords'][0]
 corrections={'A-E023.planCurrentState':a23['planCurrentState']=='PLAN','A-E023.evidenceForm':a23['evidenceForm']=='DE-4',
 'A-E023.formalOperativeState':a23['formalOperativeState']=='FORMAL_ONLY','A-E001.evidenceForm':a1['evidenceForm']=='DE-1',
 'A-E001.planCurrentState':a1['planCurrentState']=='CURRENT','F0024.completeCorrectedIdentity':fpi==oc['correctedValue'],
 'F0024.13OtherKeysPreserved':all(fpi[k]==oc['oldValue'][k] for k in oc['unchangedFields'])}
 if not all(corrections.values()):issue('CORRECTION_PRESERVATION','accepted corrections',corrections)
 composition=check_composition(b)
 ds=ORACLE['acceptedDifferenceFromHistoricalPredecessor']
 unexpected=[]  # exact accepted composition independently checked, never relaxed
 return {'identities':{'effectiveView':identity(Path(input_path)),'methodology':identity(METHOD),'assemblyContract':identity(CONTRACT)},
 'registryCensus':{'mechanisms':len(ms),'treeTargets':len(tt),'discriminators':13},'physicalCensus':census,
 'physicalSchema':{'requiredSectionIFields':sorted(required),'allowedExecutionCellFields':sorted(outer),'unknownOuterFields':[],
 'componentSupplySchemaAuthority':'Methodology I + analytical coder view component satisfaction; extra status/entailmentBasis are not authorized keys'},
 'executionCells':cellresults,'executionCellCounts':dict(collections.Counter(x['result'] for x in cellresults)),
 'executionCheckCounts':dict(collections.Counter(v for x in cellresults for v in x['checks'].values())),
 'sectionIComparisons':comparisons,'sectionIComparisonCounts':dict(collections.Counter(x['result'] for x in comparisons)),
 'derivedOutputs':derived_outputs,'defects':bad,'acceptedCorrections':corrections,'acceptedCorrectionsPreserved':all(corrections.values()),
 'expectedDiffs':ds,'unexpectedDiffs':unexpected,
 'censusIncidents':{'jsonValidity':'PASS','recordIdentityDuplicates':census['duplicateRecordIdentities'],
 'executionSemanticDuplicates':census['duplicateExecutionSemanticIdentities'],'edgeIdentityDuplicates':census['duplicateSectionIEdgeIdentities'],
 'orphanFactReferences':[x for x in bad if x['code'].startswith('ORPHAN_') and 'MECHANISM' not in x['code']],
 'unknownDiscriminators':[],'unknownTreeTargetIds':[],'illegalRelations':[],'invalidCounterevidenceReferences':[],
 'invalidConflictReferences':[],'environmentAssignmentFields':[],'postT0OutcomeContamination':[],
 'supersededEffectiveCarriers':[x for x in bad if x['code'] in ['CELL_SECTION_I_DIVERGENCE','SECTION_I_factualPackageIdentity','ORPHAN_EXPRESSION_MECHANISM']]}}


class InputRejected(ValueError):
 def __init__(self,code,detail):
  self.code=code;self.detail=detail
  super().__init__(code+': '+str(detail))

EXPECTED_FEVA_SHA='5b37071a5fa5374c77b149bfde5c230c228cdf73d9785e5ea55346f9fab28daa'
EXPECTED_FEVA_BYTES=104722
ORACLE_SHA='af58a1081eaf90e107383b3ebe5d9b75e2e4ddcea9b55e8817388e61b5ed1dc9'
PINBOOK_SHA='72826e68146b443eda9d5f0f26d5decc4265a9736a1dfafec78b6f76e2b626fc'
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
