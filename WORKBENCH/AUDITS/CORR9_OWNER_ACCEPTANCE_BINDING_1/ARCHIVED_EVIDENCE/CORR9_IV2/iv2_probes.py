"""New IV2 independent oracles; no author tests invoked; synthetic inputs only."""
import ast, copy, hashlib, importlib.util, inspect, itertools, json, traceback
from pathlib import Path
BASE=Path(__file__).resolve().parent
AUD=BASE/'repo/WORKBENCH/AUDITS'
PREFIX='STAGE2_CORR4_L4_EFCA_OFFLINE_ENFORCEMENT_IMPLEMENTATION_1'
DATA=BASE/'iv2_runs'; DATA.mkdir(exist_ok=True)
def load(v):
    p=AUD/(PREFIX+('_CORR'+str(v) if v else ''))/'offline_efca.py'
    sp=importlib.util.spec_from_file_location('iv2_engine_'+str(v),p)
    m=importlib.util.module_from_spec(sp); sp.loader.exec_module(m); return m
o=load(9)
RUB=AUD/'STAGE2_CORR4_L4_EFCA_OWNER_ACCEPTANCE_BINDING_1'/o.RUBRIC_FILE_NAME
SIDE=RUB.parent/'SHA256SUMS.txt'
C='SYN_CUST_001'; X='SYN_CUST_312'; R='SYN_RP1_312'; R2='SYN_RP1_313'
I='SYN_RIND_312'; B='SYN_RLB_312'; B2='SYN_RLB_313'
RESULTS=[]
def cb(v): return json.dumps(v,sort_keys=True,separators=(',',':'),ensure_ascii=False).encode()
def sha(v): return hashlib.sha256(v).hexdigest()
def key(n,side='A'): return 'SYN_CASE_%03d|SYN_SIDE_%s|SYN_FACT_%03d'%(n,side,n)
def spec(n,side='A'):
    text='SYNTHETIC IV2 invented record %03d: an invented operation was recorded.'%n
    return dict(caseId='SYN_CASE_%03d'%n,sideId='SYN_SIDE_'+side,factId='SYN_FACT_%03d'%n,
                d='SYN_D_08',sealedFactText='SYNTHETIC IV2 invented observation %03d'%n,
                questionText='SYNTHETIC does the invented observation concern this operation?',
                custodyMarks={'A':'NO','B':'YES'},retrospectiveRecords=[dict(id='SYN_RET_%03d'%n,
                locator='SYN_LOCATOR_RET_%03d'%n,content=text,sha=sha(text.encode()))])
def session(m=o,**kw):
    return m.EFCASession(rubric_path=RUB,sidecar_path=SIDE,scratch_dir=DATA,**kw)
def actors(s):
    for a,r in [(C,'CUSTODIAN'),(X,'CUSTODIAN'),(R,'R_P1'),(R2,'R_P1'),(I,'R_IND'),(B,'R_LB'),(B2,'R_LB')]:
        s.register_actor(a,r)
def outcome(fn,*a,**kw):
    try: return {'returned':fn(*a,**kw)}
    except Exception as e: return {'exception':type(e).__name__,'code':getattr(e,'code',None),'message':str(e),'args':list(e.args)}
def deny(fn,*a,code=None,**kw):
    r=outcome(fn,*a,**kw); assert 'exception' in r,r
    if code: assert r['code']==code,r
    return r
def snapshot(s):
    return cb({'events':s._events,'index':repr(s._ix),'authority':(s._authority.mode,s._authority.digest)})
def rehash(es):
    es=copy.deepcopy(es)
    for i,e in enumerate(es):
        e['prevEventSha']=es[i-1]['eventSha'] if i else '0'*64
        e['eventSha']=sha(cb({k:v for k,v in e.items() if k!='eventSha'}))
    return es
def envelope(es):
    for i,e in enumerate(es):
        assert e['prevEventSha']==(es[i-1]['eventSha'] if i else '0'*64)
        assert e['eventSha']==sha(cb({k:v for k,v in e.items() if k!='eventSha'}))
    assert o.verify_chain(es)[0]
def write(name,es):
    p=DATA/name; p.write_bytes(b''.join(cb(e)+b'\n' for e in es)); return p
def doc(entries):
    return {'allocationAuthority':o.ALLOCATION_AUTHORITY_ID,'allocations':[dict(tupleKey=k,custodian=c) for k,c in entries]}
OWNER=json.loads(o.DEFAULT_ALLOCATIONS_PATH.read_text())
def run(name,fn):
    try: r={'id':name,'result':'PASS','observed':fn()}
    except Exception as e:
        r={'id':name,'result':'HARNESS_OR_CANDIDATE_FAILURE','exception':type(e).__name__,'detail':str(e),'trace':traceback.format_exc()}
    RESULTS.append(r); print(json.dumps(r,ensure_ascii=False))

def f45():
    old=session(load(8));actors(old); captured=old.register_tuple(X,spec(1));assert old.custody_view(X,key(1))['tupleKey']==key(1)
    new=session();actors(new); negatives=[]
    for n in [312,1]:
        before=snapshot(new);negatives.append(deny(new.register_tuple,X,spec(n),code='NOT_ENTITLED'));assert snapshot(new)==before
    own=new.register_tuple(C,spec(1));assert own['allocationDigest']==sha(cb(dict(custodian=C,tupleKey=key(1))))
    before=snapshot(new);negatives.append(deny(new.register_tuple,X,spec(1),code='NOT_ENTITLED'));assert snapshot(new)==before
    assert negatives[0]==negatives[1]==negatives[2]
    duplicate=deny(new.register_tuple,C,spec(1),code='DUPLICATE_TUPLE');assert snapshot(new)==before
    orders=[]
    for order in [(X,C),(C,X)]:
        s=session();actors(s)
        for who in order:
            if who==C:s.register_tuple(C,spec(1))
            else:
                b=snapshot(s);deny(s.register_tuple,X,spec(1),code='NOT_ENTITLED');assert snapshot(s)==b
        assert s.custody_view(C,key(1))['tupleKey']==key(1);orders.append(order)
    malformed=[]
    for who,sp in [(R,spec(1)),('SYN_CUST_999',spec(1)),(X,dict(spec(1),unexpected=True)),(X,dict(spec(1),custodyMarks={'A':'BAD','B':'NO'}))]:
        b=snapshot(new);malformed.append(deny(new.register_tuple,who,sp));assert snapshot(new)==b
    return dict(corr8Captured=captured,uniformThreeStates=negatives,own=own,duplicate=duplicate,competingOrders=orders,earlierInputRefusals=malformed)
run('RV03-F45',f45)

def constructor():
    exact=DATA/'iv2_exact_owner.json';exact.write_bytes(o.DEFAULT_ALLOCATIONS_PATH.read_bytes())
    explicit=[{}, {'allocations_path':exact}, {'simulation_allocations':copy.deepcopy(OWNER)}, {'simulation_allocations_path':exact}]
    modes=[]
    for kw in explicit:
        s=session(**kw);modes.append({'form':list(kw),'mode':s._authority.mode,'digest':s._authority.digest})
    assert [r['mode'] for r in modes]==['OWNER_PINNED','OWNER_PINNED','SIMULATION','SIMULATION']
    assert len({r['digest'] for r in modes})==1
    combinations=[]
    options=[('allocations_path',exact),('simulation_allocations',OWNER),('simulation_allocations_path',exact)]
    for mask in itertools.product([False,True],repeat=3):
        kw={k:v for yes,(k,v) in zip(mask,options) if yes}
        if sum(mask)>1:combinations.append({'forms':list(kw),'outcome':deny(session,**kw,code='ALLOCATIONS_MODE_CONFLICT')})
    callerClaims=[]
    for kw in [{'allocationAuthorityMode':'OWNER_PINNED'},{'mode':'OWNER_PINNED'},{'allocations_sha256':sha(exact.read_bytes())}]:callerClaims.append(deny(session,**kw))
    source=doc([(key(312),X)]);s=session(simulation_allocations=source);source['allocations'][0]['custodian']=C;actors(s)
    deny(s.register_tuple,C,spec(312),code='NOT_ENTITLED');s.register_tuple(X,spec(312))
    p=DATA/'mutating_source.json';p.write_bytes(cb(doc([(key(313),X)]))+b'\n');t=session(simulation_allocations_path=p)
    p.write_bytes(cb(doc([(key(313),C)]))+b'\n');actors(t);deny(t.register_tuple,C,spec(313),code='NOT_ENTITLED');t.register_tuple(X,spec(313))
    invalid=[]
    variants=[dict(OWNER,extra=True),dict(OWNER,allocationAuthority='UNAPPROVED'),doc([(key(312),X),(key(312),C)]),doc([('REAL_CASE|SYN_SIDE_A|SYN_FACT_312',X)])]
    for d in variants:invalid.append(deny(session,simulation_allocations=d))
    bad=DATA/'unapproved_owner.json';bad.write_bytes(cb(doc([(key(312),X)]))+b'\n');invalid.append(deny(session,allocations_path=bad,code='ALLOCATIONS_IDENTITY_MISMATCH'))
    invalid.append(deny(session,allocations_path=DATA/'missing_owner.json',code='ALLOCATIONS_AUTHORITY_UNAVAILABLE'))
    return dict(forms=modes,sourceCombinations=combinations,callerClaims=callerClaims,documentMutationIgnored=True,pathMutationIgnored=True,invalidAuthorities=invalid)
run('RV04-CONSTRUCTOR',constructor)

def origins():
    rows=[]
    for origin,target in [('SIMULATION','OWNER_PINNED'),('OWNER_PINNED','SIMULATION')]:
        def build(mode):return session(**({'simulation_allocations':copy.deepcopy(OWNER)} if mode=='SIMULATION' else {}))
        src=build(origin);actors(src);reg=src.register_tuple(C,spec(1));issued=src.issue_evidence_record(C,key(1))
        assert issued['proceduralCompleteness']['allocationAuthorityMode']==origin
        assert issued['categoryAssignment']==issued['tupleLevelName']=='UNASSIGNED'
        assert 'allocationDigest' not in issued # digest is registration context, not an evidence-record field
        native=Path(src.persist_global_history('iv2_native_'+origin+'.jsonl')['path'])
        ctl=build(target);before=snapshot(ctl);refusal=deny(ctl.restore_global_history,native,code='AUTHORITY_CONTEXT_MISMATCH');assert snapshot(ctl)==before
        es=[json.loads(line) for line in native.read_text().splitlines()]
        es[0]['payload']['allocationAuthorityMode']=target
        for e in es:
            if e['eventType']=='EVIDENCE_RECORD_ISSUED':e['payload']['proceduralCompleteness']['allocationAuthorityMode']=target
        es=rehash(es);envelope(es);forged=write('iv2_forged_to_'+target+'.jsonl',es)
        dest=build(target);before=sha(snapshot(dest));verified=dest.verify_global_history(forged);restored=dest.restore_global_history(forged)
        assert verified['valid'] and restored['restored'];after=sha(snapshot(dest));assert before!=after
        visible=[e['payload'] for e in dest.events(C) if e['eventType']=='EVIDENCE_RECORD_ISSUED'][0]
        assert visible['proceduralCompleteness']['allocationAuthorityMode']==target
        extension=dest.register_tuple(C,spec(3));nextEvidence=dest.issue_evidence_record(C,key(3))
        assert nextEvidence['proceduralCompleteness']['allocationAuthorityMode']==target
        rows.append(dict(origin=origin,target=target,allocationDigest=reg['allocationDigest'],sameAllocationBytes=True,nativeEvidence=issued,
            untouchedRefusal=refusal,untouchedNoAdoption=True,forgedEnvelope=verified,restore=restored,
            stateBefore=before,stateAfter=after,requesterVisibleEvidence=visible,extension=extension,continuedEvidence=nextEvidence,
            nativePath=str(native),forgedPath=str(forged),attackerCapabilities=['privileged complete-history read/write','recompute entire SHA chain','trusted host restore invocation'],
            disposition='NG-01 accepted limitation; no requester operation accepts this chain'))
    return rows
run('RV05-RV06-RV08-BIDIRECTIONAL',origins)

def semantic():
    src=session();actors(src);src.register_tuple(C,spec(1));src.issue_packet(C,R,key(1));src.issue_evidence_record(C,key(1))
    base=copy.deepcopy(src._events);ri=next(i for i,e in enumerate(base) if e['eventType']=='TUPLE_REGISTERED')
    variants={}
    def edit(name,fn):
        es=copy.deepcopy(base);fn(es);variants[name]=rehash(es)
    def unauthorized(es):
        es[ri]['payload']['custodian']=X;es[ri]['payload']['allocationDigest']=sha(cb(dict(tupleKey=key(1),custodian=X)))
    edit('unauthorized_registration',unauthorized)
    edit('wrong_entry_digest',lambda es:es[ri]['payload'].__setitem__('allocationDigest','f'*64))
    edit('missing_entry_digest',lambda es:es[ri]['payload'].pop('allocationDigest'))
    edit('extra_registration_field',lambda es:es[ri]['payload'].__setitem__('callerRole','CUSTODIAN'))
    edit('missing_genesis_mode',lambda es:es[0]['payload'].pop('allocationAuthorityMode'))
    edit('wrong_genesis_digest',lambda es:es[0]['payload'].__setitem__('allocationsSha256','a'*64))
    edit('incorrect_evidence_completeness',lambda es:es[-1]['payload']['proceduralCompleteness'].__setitem__('phase1Sealed',True))
    edit('incorrect_evidence_mode',lambda es:es[-1]['payload']['proceduralCompleteness'].__setitem__('allocationAuthorityMode','SIMULATION'))
    edit('scientific_promotion',lambda es:es[-1]['payload'].__setitem__('categoryAssignment','CODER_ERROR'))
    edit('missing_evidence_mode',lambda es:es[-1]['payload']['proceduralCompleteness'].pop('allocationAuthorityMode'))
    edit('invalid_packet_reviewer',lambda es:es[-2]['payload'].__setitem__('reviewer',B))
    edit('old_native_act',lambda es:es[0]['payload'].__setitem__('engineActId',load(8).ENGINE_ACT_ID))
    # Reorder a fully correctly re-enveloped actor registration after its tuple registration.
    es=copy.deepcopy(base);ai=next(i for i,e in enumerate(es) if e['eventType']=='ACTOR_REGISTERED' and e['payload']['actorId']==C)
    actor=es.pop(ai);ri2=next(i for i,e in enumerate(es) if e['eventType']=='TUPLE_REGISTERED');es.insert(ri2+1,actor)
    for n,e in enumerate(es):e.update(seq=n,eventId='E%04d'%n,t=n)
    variants['illegal_transition_order']=rehash(es)
    rows=[]
    for name,es in variants.items():
        envelope(es);p=write('iv2_semantic_'+name+'.jsonl',es);dest=session();before=snapshot(dest)
        result=deny(dest.restore_global_history,p);assert snapshot(dest)==before
        # Also reject on a non-empty lawful prefix, with zero events/index/view adoption.
        populated=session();populated.register_actor(C,'CUSTODIAN');b=snapshot(populated)
        second=deny(populated.restore_global_history,p);assert snapshot(populated)==b
        rows.append(dict(attack=name,envelopeValid=True,emptyRefusal=result,nonemptyRefusal=second,noPartialAdoption=True,path=str(p)))
    return rows
run('RV07-SEMANTIC',semantic)

LB={'question':'SYNTHETIC IV2 question','surface':'SYNTHETIC IV2 surface','schemaClaim':'SYNTHETIC IV2 schema claim'}
def requester():
    authority=doc([(key(312),C),(key(313),X)])
    def make(foreign):
        s=session(simulation_allocations=authority);actors(s);s.register_tuple(C,spec(312));s.register_lane_b(B,key(312),LB)
        if foreign:
            s.register_tuple(X,spec(313));s.issue_packet(X,R2,key(313));s.register_lane_b(B2,key(313),LB);s.issue_evidence_record(X,key(313))
        return s
    a=make(False);b=make(True);equal={}
    operations={'events':lambda s:s.events(C),'anonymousEvents':lambda s:s.events(),'diagnostics':lambda s:s.verify_integrity(C),
        'foreignCustody':lambda s:outcome(s.custody_view,C,key(313)),'foreignStatus':lambda s:s.workflow_status(key(313),C),
        'foreignPacket':lambda s:outcome(s.fetch_packet,R,key(313)),'foreignLaneB':lambda s:outcome(s.lane_b_view,B,key(313)),
        'foreignRegistration':lambda s:outcome(s.register_tuple,C,spec(313))}
    for n,fn in operations.items():
        left=fn(a);right=fn(b);assert left==right,(n,left,right);equal[n]=left
    own=b.persist_history('iv2_projection.json',C);foreign=b.persist_history('iv2_projection.json',X);host=b.persist_global_history('iv2_projection.json')
    assert len({own['path'],foreign['path'],host['path']})==3
    projection=json.loads(Path(own['path']).read_text());assert projection['completeGlobalChainProof'] is False and projection['authoritativeChainBackup'] is False
    assert not any(any(k in e for k in ('seq','eventId','t','eventSha','prevEventSha')) for e in projection['scopedEvents'])
    negatives=[b.verify_persisted_history(p,C) for p in [foreign['path'],host['path'],DATA/'iv2_missing']];assert negatives[0]==negatives[1]==negatives[2]
    before=snapshot(b);assert not b.verify_persisted_history(host['path'],C)['valid'];assert snapshot(b)==before
    badp=DATA/'untrusted_projection.json';badp.write_text(json.dumps(dict(projection,scopedEvents=[{'untrusted':'SYNTHETIC history substitute'}])))
    unchecked=b.verify_persisted_history(badp,C);assert unchecked['valid'];assert snapshot(b)==before
    # This diagnostic is shape-only; it does not adopt or authenticate projections.
    noAdopt=deny(session().restore_global_history,own['path'],code='PROJECTION_IS_NOT_A_CHAIN')
    attempts=[]
    for fn,args in [(b.events,(C,)),(b.persist_history,('substitute.json',C)),(b.verify_persisted_history,(host['path'],C))]:
        attempts.append(deny(fn,*args,allocationAuthorityMode='OWNER_PINNED'))
    # Explicit privileged-object counterexamples. No Python access-control wrapper is invented.
    raw=json.loads(Path(host['path']).read_text().splitlines()[0]);assert raw['eventType']=='GENESIS'
    unrestrictedChainCount=b.verify_global_history(host['path'])['eventCount']
    fresh=session(simulation_allocations=authority);adopt=fresh.restore_global_history(host['path']);assert adopt['restored']
    # A trusted caller can supply someone else's ID. Actor strings are host bindings, not credentials.
    impersonated=b.custody_view(X,key(313));assert impersonated['tupleKey']==key(313)
    setup=session();setup.register_actor('SYN_CUST_314','CUSTODIAN')
    deniedRebind=deny(setup.register_actor,'SYN_CUST_314','R_P1')
    return dict(requesterNonDisclosure=equal,projection=projection,constantNegatives=negatives,verificationNoAdoption=True,
        substitutedProjectionShapeDiagnostic=unchecked,projectionNotNative=noAdopt,callerAuthorityKeywordsRefused=attempts,
        directPrivilegedObject={'completeHistoryCount':unrestrictedChainCount,'restoreCallable':adopt,'foreignIDCallable':impersonated['tupleKey'],
        'registerActorCallable':True,'rebindExistingRefusal':deniedRebind},
        classification='Requester methods enforce supplied-actor scope. Authentication/binding and withholding session object/host methods are external trusted-host ASSUMPTIONS; no wrapper/OS isolation is implemented.')
run('RV09-REQUESTER-HOST',requester)

def science_and_compatibility():
    s=session();actors(s);s.register_tuple(C,spec(1));s.issue_packet(C,R,key(1));packet=s.fetch_packet(R,key(1));assert set(packet)=={'caseId','sideId','factId','sealedFactText','questionText'}
    deny(s.fetch_packet,R,key(1),fields=['custodyMarks'],code='FORBIDDEN_FIELD_REJECTED')
    s.register_lane_b(B,key(1),LB);lane=s.lane_b_view(B,key(1));assert all(z['causeLink']=='UNASSIGNED_PENDING_J1' for z in lane['submissions'])
    assert s.category_assignment(key(1))['categoryAssignment']=='UNASSIGNED';evidence=s.issue_evidence_record(C,key(1));assert evidence['tupleLevelName']=='UNASSIGNED'
    s.issue_packet(C,I,key(1));r=spec(1)['retrospectiveRecords'][0];refs=[{'recordId':r['id'],'locator':r['locator'],'content':r['content']}]
    s.begin_independent_reproduction(I,key(1));s.declare_records_rederived(I,key(1),refs)
    deny(s.adjudicate_claim,I,key(1),'HISTORICAL_RECORD_EVENT','SYN_CLAIM_312',record_refs=refs,proposition={'operationId':'SYN_OP_312'},code='REFUSED_INCOMPLETE_PROPOSITION_SCOPE')
    for n,op in [(312,312),(313,313),(314,312)]:
        r=s.adjudicate_claim(I,key(1),'HISTORICAL_RECORD_EVENT','SYN_CLAIM_%03d'%n,record_refs=refs,proposition={'operationId':'SYN_OP_%03d'%op,'coveredTime':'SYN_TIME_312'})
        assert r['claimLevelStatus']=='PROVENANCE_VERIFIED_NOT_ADJUDICATED'
    view=s.custody_view(C,key(1));assert view['provenanceAttestationCount']==3 and view['distinctBoundPropositionCount']==2
    compat=[]
    for version in [5,6,7,8]:
        old=session(load(version));actors(old);old.register_tuple(C,spec(1))
        if version==5:path=Path(old.persist_history('iv2_corr5.jsonl',C)['path'])
        else:path=Path(old.persist_global_history('iv2_corr%d.jsonl'%version)['path'])
        beforeBytes=path.read_bytes();dest=session();before=snapshot(dest)
        reject=deny(dest.restore_global_history,path);assert snapshot(dest)==before
        if version==5:admission=dest.replay_legacy_history(path);assert admission['adopted'] is False and admission['extendable'] is False
        else:admission=deny(dest.replay_legacy_history,path,code='NOT_A_LEGACY_HISTORY')
        assert snapshot(dest)==before and path.read_bytes()==beforeBytes
        compat.append(dict(version=version,restoreRefusal=reject,legacyAdmission=admission,bytesUnchanged=True,noStateAdoption=True))
    identities=[]
    for order in [(B,B2),(B2,B)]:
        t=session();actors(t);t.register_tuple(C,spec(1));v={}
        for who in order:v[who]=t.register_lane_b(who,key(1),LB)
        identities.append(v)
    assert identities[0]==identities[1]
    return dict(packetFields=sorted(packet),categories=['UNASSIGNED','UNASSIGNED'],causeLink='UNASSIGNED_PENDING_J1',provenanceAttestations=3,distinctPropositions=2,compatibility=compat,laneBOrderIdentity=identities)
run('RV07-RV08-INV07-INV08',science_and_compatibility)

(BASE/'independent_results.json').write_text(json.dumps(RESULTS,indent=2,ensure_ascii=False)+'\n')
print('GROUPS',len(RESULTS),'PASS',sum(r['result']=='PASS' for r in RESULTS))
