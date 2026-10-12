from pathlib import Path
exec(Path(__file__).with_name('independent_probes.py').read_text().split("run('IV-A01")[0])
r={}
for origin,target in [('SIMULATION','OWNER_PINNED'),('OWNER_PINNED','SIMULATION')]:
 s=session(**({'simulation_allocations_path':o.DEFAULT_ALLOCATIONS_PATH} if origin=='SIMULATION' else {}));actors(s);s.register_tuple(C,spec(1));e=s.issue_evidence_record(C,key(1));assert e['proceduralCompleteness']['allocationAuthorityMode']==origin
 original=s.persist_global_history('mode_origin_'+origin+'.jsonl')['path'];events=json.loads('[]')
 events=[json.loads(line) for line in Path(original).read_text().splitlines()]
 def destination():return session(**({'simulation_allocations_path':o.DEFAULT_ALLOCATIONS_PATH} if target=='SIMULATION' else {}))
 control=destination();untouched=denied(control.restore_global_history,original,code='AUTHORITY_CONTEXT_MISMATCH')
 events[0]['payload']['allocationAuthorityMode']=target
 for event in events:
  if event['eventType']=='EVIDENCE_RECORD_ISSUED':event['payload']['proceduralCompleteness']['allocationAuthorityMode']=target
 events=rehash(events);forged=write('mode_congruent_forgery_'+target+'.jsonl',events);assert o.verify_chain(events)[0]
 dest=destination();before=h(cb(dest._events));restored=outcome(dest.restore_global_history,forged);after=h(cb(dest._events))
 assert restored['kind']=='RETURN' and restored['value']['restored'];issued=[x for x in dest.events(C) if x['eventType']=='EVIDENCE_RECORD_ISSUED'][0]['payload'];assert issued['proceduralCompleteness']['allocationAuthorityMode']==target
 extended=dest.register_tuple(C,spec(3));record=dest.issue_evidence_record(C,key(3));assert record['proceduralCompleteness']['allocationAuthorityMode']==target
 r[origin+'->'+target]={'untouchedControl':untouched,'fullyRehashedChainValid':True,'observedRestore':restored,'stateBeforeSha256':before,'stateAfterSha256':after,'requesterEvidenceMode':issued['proceduralCompleteness']['allocationAuthorityMode'],'continuedRegistration':extended,'continuedEvidenceMode':record['proceduralCompleteness']['allocationAuthorityMode'],'originPath':original,'forgedPath':str(forged),'expectedUnderCurrentAuditContract':'refusal of forged cross-mode provenance without state adoption','contractSatisfied':False,'sourceConstantsModified':False,'allocationBytesModified':False}
(BASE/'mode_origin_contract_results.json').write_text(json.dumps(r,indent=2)+'\n')
print(json.dumps(r,indent=2))
