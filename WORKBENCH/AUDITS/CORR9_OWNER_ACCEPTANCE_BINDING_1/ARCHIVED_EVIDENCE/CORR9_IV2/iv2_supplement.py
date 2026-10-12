from pathlib import Path
exec(Path(__file__).with_name('iv2_probes.py').read_text().split("run('RV03-F45'")[0])
def durability_and_failure():
    rows=[]
    for mode in ['OWNER_PINNED','SIMULATION']:
        kw={} if mode=='OWNER_PINNED' else {'simulation_allocations':copy.deepcopy(OWNER)}
        src=session(**kw);actors(src);src.register_tuple(C,spec(1));src.issue_evidence_record(C,key(1))
        path=src.persist_global_history('iv2_roundtrip_'+mode+'.jsonl')['path']
        dest=session(**kw);dest.restore_global_history(path)
        assert dest._events==src._events and dest._ix==src._ix
        for actor in [C,X,R,I,B]:assert dest.events(actor)==src.events(actor)
        dest.register_tuple(C,spec(2,'B'));dest.issue_evidence_record(C,key(2,'B'))
        later=dest.persist_global_history('iv2_extension_'+mode+'.jsonl')['path']
        restored=session(**kw);restored.restore_global_history(later);assert restored._events==dest._events
        bad=DATA/('bad_rubric_'+mode+'.md');bad.write_bytes(RUB.read_bytes()+b'\nSYNTHETIC changed rubric\n')
        gated=o.EFCASession(rubric_path=bad,sidecar_path=SIDE,scratch_dir=DATA,**kw)
        actors(gated);gated.register_tuple(C,spec(1));before=snapshot(gated)
        refuse=deny(gated.issue_evidence_record,C,key(1));assert snapshot(gated)==before
        gated2=o.EFCASession(rubric_path=bad,sidecar_path=SIDE,scratch_dir=DATA,**kw);before=snapshot(gated2)
        replayRefusal=deny(gated2.restore_global_history,path,code='PROCEDURALLY_INVALID_HISTORY');assert snapshot(gated2)==before
        rows.append(dict(mode=mode,roundtripEventCount=len(src._events),extendedEventCount=len(restored._events),viewsAndIndexEqual=True,
            livePhysicalGateRefusal=refuse,replayPhysicalGateRefusal=replayRefusal,noAdoptionOrIssuance=True))
    return rows
run('RV07-PHYSICAL-GATE-AND-NATIVE-DURABILITY',durability_and_failure)

def legacy_schema():
    old=session(load(5));actors(old);old.register_tuple(C,spec(1));path=Path(old.persist_history('iv2_legacy_schema.jsonl',C)['path'])
    events=[json.loads(line) for line in path.read_text().splitlines()];idx=next(i for i,e in enumerate(events) if e['eventType']=='TUPLE_REGISTERED')
    events[idx]['payload']['allocationDigest']=sha(cb(dict(tupleKey=key(1),custodian=C)))
    events=rehash(events);envelope(events);forged=write('iv2_mixed_legacy_schema.jsonl',events);dest=session();before=snapshot(dest)
    refusal=deny(dest.replay_legacy_history,forged,code='LEGACY_HISTORY_INVALID');assert snapshot(dest)==before
    return dict(validEnvelope=True,refusal=refusal,originalBytesUnchanged=True,noAdoption=True)
run('RV07-LEGACY-NATIVE-MIXED-SCHEMA',legacy_schema)

(BASE/'supplemental_results.json').write_text(json.dumps(RESULTS,indent=2)+'\n')
print('GROUPS',len(RESULTS),'PASS',sum(r['result']=='PASS' for r in RESULTS))
