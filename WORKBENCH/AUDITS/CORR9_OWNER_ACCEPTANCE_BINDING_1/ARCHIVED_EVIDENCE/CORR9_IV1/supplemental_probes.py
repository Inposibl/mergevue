from pathlib import Path
exec(Path(__file__).with_name('independent_probes.py').read_text().split("run('IV-A01")[0])

def scopes():
 s=session();actors(s);s.register_tuple(C,spec(1));s.issue_packet(C,RI,key(1));r=spec(1)['retrospectiveRecords'][0];refs=[{'recordId':r['id'],'locator':r['locator'],'content':r['content']}]
 s.begin_independent_reproduction(RI,key(1));s.declare_records_rederived(RI,key(1),refs)
 before=cb(s._events);denied(s.adjudicate_claim,RI,key(1),'HISTORICAL_RECORD_EVENT','SYN_CLAIM_211',record_refs=refs,proposition={'operationId':'SYN_OP_211'},code='REFUSED_INCOMPLETE_PROPOSITION_SCOPE');assert cb(s._events)==before
 returned=[]
 for cid,op in [('SYN_CLAIM_211','SYN_OP_211'),('SYN_CLAIM_212','SYN_OP_212'),('SYN_CLAIM_213','SYN_OP_211')]:
  ret=s.adjudicate_claim(RI,key(1),'HISTORICAL_RECORD_EVENT',cid,record_refs=refs,proposition={'operationId':op,'coveredTime':'SYN_TIME_211'});returned.append(ret);assert ret['claimLevelStatus']=='PROVENANCE_VERIFIED_NOT_ADJUDICATED'
 cv=s.custody_view(C,key(1));assert cv['provenanceAttestationCount']==3 and cv['distinctBoundPropositionCount']==2
 st=s.workflow_status(key(1),C);assert st['claimLevel']=='PROVENANCE_VERIFIED_NOT_ADJUDICATED' and st['effectiveAdjudications']==[]
 p=s.persist_global_history('od38_native.jsonl')['path'];t=session();t.restore_global_history(p);assert t.custody_view(C,key(1))==cv
 return {'attestations':3,'distinctPropositions':2,'claimLevel':st['claimLevel']}
run('IV-M01-OD38-complete-proposition-independent-identity',scopes)

def construction():
 sim=doc([(key(211),C2)]);s=session(simulation_allocations=sim);sim['allocations'][0]['custodian']=C
 actors(s);denied(s.register_tuple,C,spec(211),code='NOT_ENTITLED');s.register_tuple(C2,spec(211))
 r={}
 for n,kwargs in [('dual_sim',dict(simulation_allocations=sim,simulation_allocations_path=o.DEFAULT_ALLOCATIONS_PATH)),('mixed',dict(simulation_allocations=sim,allocations_path=o.DEFAULT_ALLOCATIONS_PATH)),('supplied_mode',dict(allocationAuthorityMode='OWNER_PINNED'))]:r[n]=denied(session,**kwargs)
 copy_path=DATA/'exact_owner_copy.json';copy_path.write_bytes(o.DEFAULT_ALLOCATIONS_PATH.read_bytes());p=session(allocations_path=copy_path);q=session(simulation_allocations_path=copy_path);assert p._authority.mode=='OWNER_PINNED' and q._authority.mode=='SIMULATION' and p._authority.digest==q._authority.digest
 return {'construction_refusals':r,'mode_from_copied_bytes':[p._authority.mode,q._authority.mode],'caller_document_mutation_ignored':True}
run('IV-M02-mode-conflicts-and-input-copying',construction)

def evidence_schema():
 s=session(simulation_allocations_path=o.DEFAULT_ALLOCATIONS_PATH);actors(s);s.register_tuple(C,spec(1));e=s.issue_evidence_record(C,key(1));assert e['proceduralCompleteness']['allocationAuthorityMode']=='SIMULATION';base=copy.deepcopy(s._events);idx=len(base)-1;r={}
 for label in ['missing','altered','extra','digest']:
  ev=copy.deepcopy(base);p=ev[idx]['payload']['proceduralCompleteness']
  if label=='missing':del p['allocationAuthorityMode']
  elif label=='altered':p['allocationAuthorityMode']='OWNER_PINNED'
  elif label=='extra':p['ownerAccepted']=True
  elif label=='digest':ev[idx]['payload']['allocationDigest']='f'*64
  ev=rehash(ev);assert o.verify_chain(ev)[0];path=write('evidence_schema_'+label+'.jsonl',ev);t=session(simulation_allocations_path=o.DEFAULT_ALLOCATIONS_PATH);before=cb(t._events);r[label]=denied(t.restore_global_history,path,code='PROCEDURALLY_INVALID_HISTORY')['code'];assert cb(t._events)==before
 return r
run('IV-M03-evidence-mode-rehashed-closed-payload',evidence_schema)

def implicit_custody():
 s=session();actors(s);s.register_lane_b(LB,key(211),{'question':'SYNTHETIC question','surface':'SYNTHETIC surface','schemaClaim':'SYNTHETIC observation'});denied(s.register_tuple,C2,spec(211),code='NOT_ENTITLED');assert s.workflow_status(key(211),C2)['disclosure']=='WITHHELD_BEFORE_OWN_SEAL';denied(s.issue_packet,C2,RP,key(211));denied(s.custody_view,C2,key(211))
 return {'lane_b_filing_grants_no_registration_or_custody':True}
run('IV-M04-pre-registration-filing-is-not-custody',implicit_custody)
(BASE/'supplemental_results.json').write_text(json.dumps(RESULTS,indent=2)+'\n')
print('TOTALS',len(RESULTS),sum(r['result']=='PASS' for r in RESULTS),sum(r['result']=='FAIL' for r in RESULTS))
