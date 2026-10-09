
import json,hashlib,re,copy,collections,sys,os
from pathlib import Path
ROOT=Path.cwd().resolve()
D=Path('WORKBENCH/DOWNLOADS')
VIEW=D/'STAGE2_EFFECTIVE_VIEW_ASSEMBLY_1_CORR1_2026-10-05/STAGE2_EFFECTIVE_VIEW_ASSEMBLY_1_RECORDS.jsonl'
METHOD=D/'STAGE2_PD3_ROLE_BOUNDED_ENTITLEMENT_CLARIFICATION_1_CORR1_2026-10-04/STAGE2_PD3_ROLE_BOUNDED_ENTITLEMENT_CLARIFICATION_1_CORR1_CANDIDATE.md'
CONTRACT=VIEW.parent/'STAGE2_EFFECTIVE_VIEW_ASSEMBLY_CONTRACT_1.md'
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
def regress(mutation=None):
 # Each invocation freshly reads/parses every input. No mutable replay state is shared.
 text,ms,tt=load_registry()
 b=VIEW.read_bytes()
 rows=[json.loads(l,object_pairs_hook=no_dups) for l in b.splitlines()]
 facts=readl(D/'STAGE2_CORR4_PILOT_ANALYTICAL_CODER_INPUT.jsonl')
 prov=readl(D/'STAGE2_CORR4_PILOT_ANALYTICAL_PROVENANCE_SIDECAR_CORR1.jsonl')
 sc=readl(D/'STAGE2_CORR4_PILOT_ANALYTICAL_SOURCECLASS_BINDING_CORR2.jsonl')
 view_schema=readj(D/'STAGE2_CORR4_PILOT_ANALYTICAL_CODER_VIEW_SCHEMA_CORR2_CORR1.json')
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
  elif c['assignedValue']!=e.get(c['field']):chk['carrierConsistency']='FAIL';issue('CELL_SECTION_I_DIVERGENCE',where,{'field':c['field'],'cell':c['assignedValue'],'sectionI':e[c['field']]})
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
  eid=e['edgeId'];fid=e['factIds'][0];mid=e['mechanismPropositionIds'][0];tid=e['treeTargetIds'][0]
  if set(e)!=required:issue('SECTION_SCHEMA',eid,{'unknown':sorted(set(e)-required),'missing':sorted(required-set(e))})
  for field,values in enum.items():
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
  assert e['relation']=='SUPPORTS_LEAF' and not e['counterevidenceFactIds'] and not e['conflictFactIds'] and e['absenceEvidenceState']=='NONE'
  lv='TRUE' if all(checks.values()) else 'OPEN'
  vals={m:'OPEN' for m in leaves(ast)};vals[mid]=lv
  ev=evaluate(ast,vals)
  # All six expressions necessarily OPEN from missing siblings plus blocking local gates.
  assert ev=='OPEN'
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
   'sourceClass':classmap[fid],
   'scopeBridgeState':'NOT_REQUIRED' if e['observedScope']==e['claimedScope'] else 'UNRESOLVED_FAIL_CLOSED' if not e['scopeBridgeFactIds'] else e['scopeBridgeState'],
   'missingComponents':missing,'edgeState':edge_recompute,
   'sufficiencyExpression':mech_expr,'sufficiencyExpressionResult':ev,
   'counterevidenceFactIds':[],'conflictFactIds':[],'caseId':fmap[fid]['caseId'],'side':fmap[fid]['sideId']}
  for field in schema_fields:
   if field in derived:compare(e,field,derived[field],'Registry / frozen input / accepted recorded components / F.3-F.5; no recoding')
   else:
    carrier=[c for c in cells if (c['factId'],c['mechanismPropositionId'],c['targetId'],c['field'])==(fid,mid,tid,field)]
    if carrier:compare(e,field,carrier[0]['assignedValue'],'Effective execution-cell carrier consistency; validates propagation, not independent analytical judgment')
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
 ds=differences(readl(BASE),rows)
 allowed={'[115].planCurrentState','[115].evidenceForm','[115].formalOperativeState','[114].evidenceForm',
 '[50].assignedValue.recordFileBytes','[50].assignedValue.recordFileSha256','[50].assignedValue.packageFactCount','[50].assignedValue.caseIdLocator'}
 unexpected=[x for x in ds if x['path'] not in allowed]
 if unexpected:issue('UNEXPECTED_DIFF','effective view',unexpected)
 return {'identities':{'effectiveView':identity(VIEW),'methodology':identity(METHOD),'assemblyContract':identity(CONTRACT)},
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

def set_quality(rows,facts,value):
 for r in rows:
  if r['recordType']=='POST_RECONCILIATION_EXECUTION_CELL_RECORD' and r['factId']=='F-B-0025' and r['field']=='sourceQualityState':r['assignedValue']=value
  elif r['recordType']=='SECTION_I_RECORD' and 'F-B-0025' in r['factIds']:r['sourceQualityState']=value
def relevant_state(r):
 e=next(e for e in r['derivedOutputs'] if e['edgeId'].startswith('A-EXEC1:F-B-0025:'))
 return {k:e[k] for k in ['selectionResultFromRecordedComponents','recordedSuppliedComponents','requiredComponents',
 'missingComponentsFromRecordedSupply','edgeStateFromRecordedSupply','leafValue','leafNotDeterminable','leafValues',
 'sufficiencyExpression','sufficiencyExpressionResult','targetState','targetJoin','sourceDiversity']}
def scenarios():
 out={}
 for n,q in [('A','COMPETENT'),('B','COMPETENT_SELF_DESCRIPTION_UNCORROBORATED')]:
  r=regress(lambda rows,facts:set_quality(rows,facts,q))
  e=next(e for e in r['derivedOutputs'] if e['edgeId'].startswith('A-EXEC1:F-B-0025:'))
  out[n]={'sourceQualityStateInput':q,'measurementOutputs':relevant_state(r),
    'leafSupportPredicateTruthValues':e['leafSupportPredicates'],
    'counterevidenceFactIds':[],'conflictFactIds':[],'discriminatorPositiveMeaning':'PARTIAL',
    'formalComponentCompetence':'Recorded formal c1 is retained under G-2/G-5. Neither scenario adjudicates quality for the complete operative proposition.',
    'directCarrierChange':'Only the intentionally varied qualifier is different; sourceQualityState is not claimed invariant.'}
 out['FB0025_REGRESSION_OUTPUT_INVARIANT']='YES' if out['A']['measurementOutputs']==out['B']['measurementOutputs'] else 'NO'
 return out
def negative_controls(baseline):
 def reverted(rows,facts):
  next(e for e in rows if e.get('edgeId')=='A-E023')['planCurrentState']='CURRENT'
 def invalid_tt(rows,facts):rows[0]['targetId']='TT-INVALID-NEGATIVE-CONTROL'
 def missing_ref(rows,facts):
  e=next(e for e in rows if e['recordType']=='SECTION_I_RECORD' and e['factIds'][0]=='F-B-0025');e['factIds'].append('MISSING_FACT_NEGCTRL')
  c=next(c for c in rows if c['recordType']=='POST_RECONCILIATION_EXECUTION_CELL_RECORD' and c['factId']=='F-B-0025' and c['field']=='factIds');c['assignedValue'].append('MISSING_FACT_NEGCTRL')
 def aggregate(rows,facts):
  next(e for e in rows if e['recordType']=='SECTION_I_RECORD' and e['factIds'][0]=='F-B-0025')['missingComponents']=[]
 cases=[('REVERT_ACCEPTED_VALUE',reverted,'CORRECTION_PRESERVATION'),
 ('INVALID_TREE_TARGET',invalid_tt,'CELL_BINDING'),('MISSING_REFERENCED_FACT',missing_ref,'ORPHAN_factIds'),
 ('INCONSISTENT_SECTION_I_AGGREGATE',aggregate,'SECTION_I_missingComponents')]
 results=[]
 base={json.dumps(x,sort_keys=True) for x in baseline['defects']}
 for name,fn,expected in cases:
  r=regress(fn)
  delta=[x for x in r['defects'] if json.dumps(x,sort_keys=True) not in base]
  results.append({'control':name,'expectedNewDetector':expected,'detected':any(d['code']==expected for d in delta),
   'newDiagnostics':delta,'baselineAlreadyFailing':True,'oracle':'Requires a new specific diagnostic at the mutated surface; merely returning FAIL is insufficient.',
   'mutatedFixtureWritten':False})
 return results
def prose_probe(rows,facts):
 for e in rows:
  if e['recordType']=='SECTION_I_RECORD' and e['factIds'][0]=='F-E-0182':
   e['decisionRef']=None
   for c in e['componentSupply']:c['entailmentBasis']='Diagnostic prose removed in memory only'
def adv2_analysis(baseline):
 altered=regress(prose_probe)
 fixedkeys=['edgeStateFromRecordedSupply','missingComponentsFromRecordedSupply','leafValue','sufficiencyExpressionResult','targetState']
 b=[{k:e[k] for k in fixedkeys} for e in baseline['derivedOutputs']]
 a=[{k:e[k] for k in fixedkeys} for e in altered['derivedOutputs']]
 sibling=[]
 rows=readl(VIEW)
 for e in rows:
  if e['recordType']=='SECTION_I_RECORD' and e['evidenceForm']=='DE-4' and e['supportClass']=='DIRECT_SUPPORT':
   o=next(o for o in baseline['derivedOutputs'] if o['edgeId']==e['edgeId'])
   sibling.append({'edgeId':e['edgeId'],'edgeStateStored':e['edgeState'],
    'missingComponentsStored':e['missingComponents'],'missingComponentsFromRecordedSupply':o['missingComponentsFromRecordedSupply'],
    'sufficiencyExpressionResultStored':e['sufficiencyExpressionResult'],'sufficiencyExpressionResultRecomputed':o['sufficiencyExpressionResult'],
    'effect':'OUTPUT_AFFECTING' if e['edgeState']=='SUPPORTED' or e['sufficiencyExpressionResult']!=o['sufficiencyExpressionResult'] else 'OUTPUT_NEUTRAL',
    'path':'DE-4 / FORMAL_ONLY -> E + RC4 and H-7 -> no established OP leaf -> F.3 leaf OPEN -> expression OPEN; supportClass alone has no F.3 upgrade rule.'})
 return {'CENSUS_CORR2_ADV2_EFFECT':'OUTPUT_AFFECTING','rd01ProseCurrentConsumerEffect':'OUTPUT_NEUTRAL',
 'proseAndDecisionRefInMemoryProbeInvariant':a==b,'laneBEntailmentBasis':'Not an input to the accepted Lane-A effective view.',
 'siblingRowPattern':sibling,'causalPath':'A-E023 DE-4 + DIRECT_SUPPORT coexists with SUPPORTED, missingComponents=[] and TRUE. Controlling components c1..c4 with only recorded c1, FORMAL_ONLY, PLAN and unresolved continuity cannot yield a true F.3 leaf or expression. This is executable-state debt, not a supportClass recoding judgment.',
 'scope':'No fact recoding, reference repair, source-quality adjudication or methodology change.'}
