import importlib.util, json, hashlib, inspect, copy
from pathlib import Path
BASE=Path(__file__).resolve().parent
AUD=BASE/'repo/WORKBENCH/AUDITS'
PREFIX='STAGE2_CORR4_L4_EFCA_OFFLINE_ENFORCEMENT_IMPLEMENTATION_1'
DATA=BASE/'independent_runs'; DATA.mkdir(exist_ok=True)
def load(v):
 p=AUD/(PREFIX+('_CORR'+str(v) if v else ''))/'offline_efca.py'
 sp=importlib.util.spec_from_file_location('iv1_engine_'+str(v),p);m=importlib.util.module_from_spec(sp);sp.loader.exec_module(m);return m
o=load(9)
RUB=AUD/'STAGE2_CORR4_L4_EFCA_OWNER_ACCEPTANCE_BINDING_1'/o.RUBRIC_FILE_NAME
SIDE=RUB.parent/'SHA256SUMS.txt'
C='SYN_CUST_001'; C2='SYN_CUST_211'; RP='SYN_RP1_211'; RP2='SYN_RP1_212'; RI='SYN_RIND_211'; LB='SYN_RLB_211'; LB2='SYN_RLB_212'
RESULTS=[]
def cb(x):return json.dumps(x,sort_keys=True,separators=(',',':'),ensure_ascii=False).encode()
def h(x):return hashlib.sha256(x).hexdigest()
def key(i,side='A'):return f'SYN_CASE_{i:03d}|SYN_SIDE_{side}|SYN_FACT_{i:03d}'
def spec(i,side='A'):
 content=f'SYNTHETIC independent authenticated record for invented tuple {i}'
 return dict(caseId=f'SYN_CASE_{i:03d}',sideId='SYN_SIDE_'+side,factId=f'SYN_FACT_{i:03d}',d='SYN_D_07',sealedFactText=f'SYNTHETIC independent fact {i}: an invented review occurred.',questionText='SYNTHETIC neutral question: does this invented record concern the named operation?',custodyMarks={'A':'YES','B':'NO'},retrospectiveRecords=[{'id':f'SYN_RET_{i:03d}','locator':f'SYN_LOCATOR_RET_{i:03d}','content':content,'sha':h(content.encode())}])
def doc(entries):return {'allocationAuthority':o.ALLOCATION_AUTHORITY_ID,'allocations':[{'tupleKey':k,'custodian':c} for k,c in entries]}
def session(m=o,**kw):return m.EFCASession(rubric_path=RUB,sidecar_path=SIDE,scratch_dir=DATA,**kw)
def actors(s):
 for a,r in [(C,'CUSTODIAN'),(C2,'CUSTODIAN'),(RP,'R_P1'),(RP2,'R_P1'),(RI,'R_IND'),(LB,'R_LB'),(LB2,'R_LB')]:s.register_actor(a,r)
def outcome(f,*args,**kw):
 try:return {'kind':'RETURN','value':f(*args,**kw)}
 except Exception as e:return {'kind':'EXCEPTION','class':type(e).__name__,'code':getattr(e,'code',None),'message':str(e),'args':list(e.args)}
def denied(f,*args,code=None,**kw):
 r=outcome(f,*args,**kw);assert r['kind']=='EXCEPTION',r
 if code is not None:assert r['code']==code,r
 return r
def snap(s):return cb({'events':s._events,'index':repr(s._ix),'views':{a:s.events(a) for a in [C,C2,RP,LB]}})
def write(name,events):
 p=DATA/name;p.write_bytes(b''.join(cb(e)+b'\n' for e in events));return p
def rehash(events):
 events=copy.deepcopy(events)
 for i,e in enumerate(events):
  e['prevEventSha']=events[i-1]['eventSha'] if i else '0'*64
  e['eventSha']=h(cb({k:v for k,v in e.items() if k!='eventSha'}))
 return events
def run(name,f):
 try: detail=f();r={'id':name,'result':'PASS','detail':detail}
 except Exception as e:r={'id':name,'result':'FAIL','class':type(e).__name__,'detail':str(e)}
 RESULTS.append(r);print(json.dumps(r,ensure_ascii=False))

def first_writer():
 old=session(load(8));actors(old);ret=old.register_tuple(C2,spec(1));assert old.custody_view(C2,key(1))['tupleKey']==key(1)
 now=session();actors(now);before=snap(now);ref=denied(now.register_tuple,C2,spec(1),code='NOT_ENTITLED');assert snap(now)==before
 now.register_tuple(C,spec(1));assert now.custody_view(C,key(1))['tupleKey']==key(1)
 return {'corr8':ret,'corr9':ref}
run('IV-A01-first-writer-parent-and-correction',first_writer)

def uniform():
 s=session();actors(s);res=[]
 for i in [211,1]:
  b=snap(s);res.append(denied(s.register_tuple,C2,spec(i),code='NOT_ENTITLED'));assert snap(s)==b
 s.register_tuple(C,spec(1));b=snap(s);res.append(denied(s.register_tuple,C2,spec(1),code='NOT_ENTITLED'));assert snap(s)==b;assert res[0]==res[1]==res[2]
 return res
run('IV-B01-uniform-three-states',uniform)

def lawful():
 s=session();actors(s);r=s.register_tuple(C,spec(2,'B'));assert r['allocationDigest']==h(cb({'custodian':C,'tupleKey':key(2,'B')}))
 b=snap(s);denied(s.register_tuple,C,spec(2,'B'),code='DUPLICATE_TUPLE');assert snap(s)==b
 for actor,sp in [(RP,spec(1)),(C,spec(211)),('SYN_CUST_999',spec(1)),(C,None),(C,dict(spec(1),extra=True)),(C,dict(spec(1),custodyMarks={'A':'UNKNOWN','B':'NO'}))]:
  b=snap(s);denied(s.register_tuple,actor,sp);assert snap(s)==b
 for order in [(C2,C),(C,C2)]:
  t=session();actors(t)
  for a in order:
   if a==C:t.register_tuple(a,spec(1))
   else:
    b=snap(t);denied(t.register_tuple,a,spec(1),code='NOT_ENTITLED');assert snap(t)==b
  assert t.custody_view(C,key(1))['tupleKey']==key(1)
 return r
run('IV-C01-lawful-duplicate-malformed-competing',lawful)

def allocations():
 base=doc([(key(211),C2)]);observed={}
 variations={'extra_document':dict(base,ownerApproved=True),'extra_entry':doc([(key(211),C2)]),'duplicate':doc([(key(211),C2),(key(211),C2)]),'conflicting':doc([(key(211),C2),(key(211),C)]),'invalid_key':doc([('REAL_CASE|SYN_SIDE_A|SYN_FACT_211',C2)]),'invalid_actor':doc([(key(211),'REAL_CUSTODIAN')]),'wrong_id':dict(base,allocationAuthority='UNAPPROVED'),'not_list':dict(base,allocations={})}
 variations['extra_entry']['allocations'][0]['approved']=True
 for n,d in variations.items():observed[n]=denied(session,simulation_allocations=d)['code']
 raws={'malformed':b'{','BOM':b'\xef\xbb\xbf'+cb(base)+b'\n','pretty':json.dumps(base,indent=2).encode()+b'\n','no_newline':cb(base),'extra_newline':cb(base)+b'\n\n','dup_json_key':b'{"allocationAuthority":"bad","allocationAuthority":"'+o.ALLOCATION_AUTHORITY_ID.encode()+b'","allocations":[]}\n'}
 for n,raw in raws.items():
  p=DATA/('allocation_'+n+'.json');p.write_bytes(raw);observed[n]=denied(session,simulation_allocations_path=p)['code'];observed[n+'_pinned']=denied(session,allocations_path=p)['code']
 p=DATA/'unapproved_canonical.json';p.write_bytes(cb(base)+b'\n');observed['substitute_pinned']=denied(session,allocations_path=p,code='ALLOCATIONS_IDENTITY_MISMATCH')['code']
 observed['missing']=denied(session,allocations_path=DATA/'absent.json',code='ALLOCATIONS_AUTHORITY_UNAVAILABLE')['code']
 observed['digest_kwarg']=denied(session,allocations_path=p,allocations_sha256=h(p.read_bytes()))['class']
 assert session()._authority.mode=='OWNER_PINNED'
 return observed
run('IV-D01-allocation-input-integrity-and-substitution',allocations)

def modes():
 assert not any('mode' in k.lower() for k in inspect.signature(o.EFCASession).parameters)
 pinned=session();actors(pinned);pinned.register_tuple(C,spec(1));p=pinned.persist_global_history('pinned.jsonl')['path']
 d=json.loads(o.DEFAULT_ALLOCATIONS_PATH.read_text());sim=session(simulation_allocations=d);actors(sim);sim.register_tuple(C,spec(1));q=sim.persist_global_history('simulation.jsonl')['path'];assert sim._authority.digest==pinned._authority.digest
 for dest,path in [(session(),q),(session(simulation_allocations=d),p)]:
  b=cb(dest._events);denied(dest.restore_global_history,path,code='AUTHORITY_CONTEXT_MISMATCH');assert cb(dest._events)==b
 other=session(simulation_allocations=doc([(key(211),C2)]));actors(other);r=other.persist_global_history('other.jsonl')['path']
 for dest,path in [(session(),r),(other,p),(sim,r)]:
  b=cb(dest._events);denied(dest.restore_global_history,path,code='AUTHORITY_CONTEXT_MISMATCH');assert cb(dest._events)==b
 for s in [sim,other]:
  ev=s.issue_evidence_record(C if s is sim else C2,key(1) if s is sim else key(211)) if s is sim else None
  if ev:assert ev['proceduralCompleteness']['allocationAuthorityMode']=='SIMULATION'
 return {'same_digest':sim._authority.digest,'pinned_mode':pinned._authority.mode,'simulation_mode':sim._authority.mode,'different_digest':other._authority.digest}
run('IV-E01-identical-and-different-context-cross-mode',modes)

def forgeries():
 s=session();actors(s);s.register_tuple(C,spec(1));base=copy.deepcopy(s._events);idx=next(i for i,e in enumerate(base) if e['eventType']=='TUPLE_REGISTERED');observed={}
 for n in ['unauthorized','wrong_digest','missing_digest','genesis_mode','genesis_digest','genesis_missing_mode','genesis_missing_digest','extra_genesis','old_schema','mixed_event']:
  e=copy.deepcopy(base)
  if n=='unauthorized':e[idx]['payload']['custodian']=C2;e[idx]['payload']['allocationDigest']=h(cb({'custodian':C2,'tupleKey':key(1)}))
  elif n=='wrong_digest':e[idx]['payload']['allocationDigest']='f'*64
  elif n in ('missing_digest','old_schema'):del e[idx]['payload']['allocationDigest']
  elif n=='genesis_mode':e[0]['payload']['allocationAuthorityMode']='SIMULATION'
  elif n=='genesis_digest':e[0]['payload']['allocationsSha256']='f'*64
  elif n=='genesis_missing_mode':del e[0]['payload']['allocationAuthorityMode']
  elif n=='genesis_missing_digest':del e[0]['payload']['allocationsSha256']
  elif n=='extra_genesis':e[0]['payload']['override']='SYNTHETIC'
  elif n=='mixed_event':e.append(copy.deepcopy(e[0]));e[-1]['seq']=len(e)-1;e[-1]['eventId']='E%04d'%(len(e)-1);e[-1]['t']=len(e)-1;e[-1]['payload']['engineActId']=load(8).ENGINE_ACT_ID
  e=rehash(e);assert o.verify_chain(e)[0];p=write('forged_'+n+'.jsonl',e);dest=session();before=cb(dest._events);observed[n]=denied(dest.restore_global_history,p)['code'];assert cb(dest._events)==before
 return observed
run('IV-FG01-rehashed-semantic-forgeries-and-closed-schemas',forgeries)

def persistence():
 s=session();actors(s);s.register_tuple(C,spec(1));p=s.persist_global_history('native_roundtrip.jsonl')['path'];v={a:s.events(a) for a in [C,C2,RP,LB]};t=session();assert t.restore_global_history(p)['restored'];assert {a:t.events(a) for a in v}==v;assert t.custody_view(C,key(1))==s.custody_view(C,key(1));t.register_tuple(C,spec(3));q=t.persist_global_history('native_extended.jsonl')['path'];u=session();u.restore_global_history(q);assert u.events(C)==t.events(C)
 return {'first_events':len(s._events),'extended_events':len(u._events)}
run('IV-H01-native-roundtrip-equivalence-extension',persistence)

LB_SPEC={'question':'SYNTHETIC independent schema question','surface':'SYNTHETIC_SCHEMA_211','schemaClaim':'SYNTHETIC independent schema observation'}
def confidentiality():
 d=doc([(key(211),C),(key(212),C2)])
 def build(foreign):
  s=session(simulation_allocations=d);actors(s);s.register_tuple(C,spec(211));s.register_lane_b(LB,key(211),LB_SPEC)
  if foreign:
   s.register_tuple(C2,spec(212));s.issue_packet(C2,RP2,key(212));s.register_lane_b(LB2,key(212),LB_SPEC);s.issue_evidence_record(C2,key(212))
  return s
 a=build(False);b=build(True);records={}
 for name,fun in {'events_cust':lambda s:s.events(C),'events_p1':lambda s:s.events(RP),'events_lb':lambda s:s.events(LB),'diag_cust':lambda s:s.verify_integrity(C),'diag_p1':lambda s:s.verify_integrity(RP),'own_custody':lambda s:s.custody_view(C,key(211)),'foreign_status':lambda s:s.workflow_status(key(212),C),'foreign_lane':lambda s:outcome(s.lane_b_view,LB,key(212)),'foreign_custody':lambda s:outcome(s.custody_view,C,key(212)),'foreign_packet':lambda s:outcome(s.fetch_packet,RP,key(212)),'foreign_issue':lambda s:outcome(s.issue_packet,C,RP,key(212)),'foreign_registration':lambda s:outcome(s.register_tuple,C,spec(212))}.items():
  x=fun(a);y=fun(b);assert x==y,(name,x,y);records[name]='identical'
 # Same bare filename per actor, separate namespace from host; negatives identical.
 pa=a.persist_history('shared.json',C)['path'];pb=a.persist_history('shared.json',C2)['path'];host=a.persist_global_history('shared.json')['path'];assert len({pa,pb,host})==3
 negatives=[a.verify_persisted_history(p,C) for p in [pb,host,str(DATA/'absent_projection')]];assert negatives[0]==negatives[1]==negatives[2]
 records['negative_artifacts']=negatives
 # Deterministic filer identity independent of the other reviewer's filing order.
 vals=[]
 for order in [(LB,LB2),(LB2,LB)]:
  s=session(simulation_allocations=d);actors(s);s.register_tuple(C,spec(211));subs={}
  for actor in order:subs[actor]=s.register_lane_b(actor,key(211),LB_SPEC)
  vals.append(subs)
 assert vals[0]==vals[1];records['lane_b_orders']=vals
 return records
run('IV-I01-cross-actor-metamorphic-surfaces-F40-F44',confidentiality)

def compatibility():
 dest=session();before=cb(dest._events);obs={}
 for ver in [5,6,7,8]:
  m=load(ver);s=session(m);actors(s);s.register_tuple(C,spec(211));p=(s.persist_history('legacy_'+str(ver)+'.jsonl',C)['path'] if ver==5 else s.persist_global_history('legacy_'+str(ver)+'.jsonl')['path']);bh=h(Path(p).read_bytes())
  obs[str(ver)]={'native':denied(dest.restore_global_history,p)['code']}
  if ver==5:
   r=dest.replay_legacy_history(p);assert r['adopted'] is False and r['extendable'] is False and r['propositionsIndexed']==0;obs[str(ver)]['legacy']=r
  else:obs[str(ver)]['legacy']=denied(dest.replay_legacy_history,p,code='NOT_A_LEGACY_HISTORY')['code']
  assert h(Path(p).read_bytes())==bh;assert cb(dest._events)==before
 actors(dest);dest.register_tuple(C,spec(1));p=dest.persist_history('projection.json',C)['path']
 for f in [dest.restore_global_history,dest.replay_legacy_history]:denied(f,p,code='PROJECTION_IS_NOT_A_CHAIN')
 native=dest.persist_global_history('native_backup.jsonl')['path'];assert dest.verify_persisted_history(native,C)=={'valid':False,'reason':'not_a_lawful_projection'}
 return obs
run('IV-J01-frozen-legacy-and-projection-firewall',compatibility)

def science():
 s=session();actors(s);s.register_tuple(C,spec(1));s.issue_packet(C,RP,key(1));p=s.fetch_packet(RP,key(1));assert set(p)=={'caseId','sideId','factId','sealedFactText','questionText'},p
 before=cb(s._events)
 for field in ['custodyMarks','retrospectiveRecords','categoryAssignment','allocationDigest']:
  denied(s.fetch_packet,RP,key(1),fields=[field]);assert cb(s._events)==before
 s.register_lane_b(LB,key(1),LB_SPEC)
 assert s.lane_b_view(LB,key(1))['submissions'][0]['causeLink']=='UNASSIGNED_PENDING_J1'
 e=s.issue_evidence_record(C,key(1));assert e['categoryAssignment']==e['tupleLevelName']=='UNASSIGNED';assert e['proceduralCompleteness']['allocationAuthorityMode']=='OWNER_PINNED';assert s.category_assignment(key(1))['categoryAssignment']=='UNASSIGNED'
 return {'packet_fields':sorted(p),'evidence_record':e}
run('IV-K01-scientific-firewall-and-five-field-packet',science)

# Characterize origin-authentication limitation separately: no candidate edits.
def mode_laundering():
 s=session(simulation_allocations_path=o.DEFAULT_ALLOCATIONS_PATH);actors(s);s.register_tuple(C,spec(1));s.issue_evidence_record(C,key(1));events=copy.deepcopy(s._events)
 events[0]['payload']['allocationAuthorityMode']='OWNER_PINNED'
 for e in events:
  if e['eventType']=='EVIDENCE_RECORD_ISSUED':e['payload']['proceduralCompleteness']['allocationAuthorityMode']='OWNER_PINNED'
 events=rehash(events);assert o.verify_chain(events)[0];p=write('origin_mode_relabel.jsonl',events);t=session();r=outcome(t.restore_global_history,p)
 return {'origin_mode':s._authority.mode,'destination_mode':t._authority.mode,'replay':r,'requester_evidence_mode':next((e['payload']['proceduralCompleteness']['allocationAuthorityMode'] for e in t._events if e['eventType']=='EVIDENCE_RECORD_ISSUED'),None),'candidate_source_modified':False}
run('IV-L01-origin-mode-relabel-trust-characterization',mode_laundering)
(BASE/'independent_results.json').write_text(json.dumps(RESULTS,indent=2,ensure_ascii=False)+'\n')
print('TOTALS',len(RESULTS),sum(r['result']=='PASS' for r in RESULTS),sum(r['result']=='FAIL' for r in RESULTS))
