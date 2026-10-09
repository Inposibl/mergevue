"""Owner-authorized temporary package preparation; no repository writes."""
import ast
import base64
import hashlib
import json
import os
import re
import subprocess
from pathlib import Path

OUT = Path(__file__).resolve().parent
ROOT = Path.cwd().resolve()
PRIOR = Path('/private/tmp/STAGE2_FINAL_MEASUREMENT_REGRESSION_FEVA_CORR2')
HEAD = '2f7bcc5d33cf8009145aa85cbb39d2ae9084ec26'
FEVA = 'WORKBENCH/AUDITS/STAGE2_FINAL_EFFECTIVE_VIEW_ASSEMBLY_1_CORR2/STAGE2_FINAL_EFFECTIVE_VIEW_ASSEMBLY_1_CORR2_RECORDS.jsonl'
FROZEN = OUT / 'FROZEN_INPUTS'
assert OUT.is_relative_to(Path('/private/tmp')) and not OUT.is_relative_to(ROOT)
assert not OUT.is_symlink()
env = {**os.environ, 'GIT_OPTIONAL_LOCKS': '0', 'PYTHONDONTWRITEBYTECODE': '1'}
def git(*args):
    return subprocess.check_output(['git', *args], cwd=ROOT, env=env)
def sha(b): return hashlib.sha256(b).hexdigest()
def dump(name, obj):
    (OUT/name).write_text(json.dumps(obj, ensure_ascii=True, sort_keys=True, indent=2)+'\n')
def ident(b): return {'bytes':len(b), 'sha256':sha(b)}
assert git('rev-parse','HEAD').decode().strip() == HEAD
assert git('branch','--show-current').decode().strip() == 'main'
assert not git('diff','--name-only') and not git('diff','--cached','--name-only')
status_full = git('status','--porcelain=v1','--untracked-files=all')
status_default = git('status','--porcelain=v1')
old = json.loads((PRIOR/'COLLECTED_EVIDENCE.json').read_bytes())
inputs = {}
for x in old['load_bearing_input_identities']:
    if not x.get('exists'): continue
    rel = x['path']; b = (ROOT/rel).read_bytes()
    assert sha(b) == x['sha256'], ('PRIOR_INPUT_CHANGED',rel)
    inputs[rel] = {**ident(b),'roles':x['roles']}

D='WORKBENCH/DOWNLOADS/'
SEP=D+'STAGE2_SUPPORTCLASS_EVALUABILITY_SEMANTIC_SEPARATION_1_'
extra = [
 'docs/governance/MERGEVUE_MODEL_ROUTING_AND_VERIFICATION_POLICY_2026-09-08.md',
 'docs/governance/MERGEVUE_MODEL_ROUTING_AND_VERIFICATION_POLICY_2026-09-08.md.sha256',
 SEP+'CORR2_CORR1_CORR1_CORR1_CORR1_2026-10-05/'+Path(SEP).name+'CORR2_CORR1_CORR1_CORR1_CORR1_CANDIDATE.md',
 SEP+'CORR1_2026-10-05/'+Path(SEP).name+'CORR1_CANDIDATE.md',
 SEP+'IMPLEMENTATION_1_2026-10-05/'+Path(SEP).name+'IMPLEMENTATION_1_METHODOLOGY_SUCCESSOR.md',
 SEP+'IMPLEMENTATION_1_2026-10-05/'+Path(SEP).name+'IMPLEMENTATION_1_CODER_VIEW_SCHEMA_SUCCESSOR.json',
 SEP+'IMPLEMENTATION_1_2026-10-05/'+Path(SEP).name+'IMPLEMENTATION_1_FIELD_SOURCE_MATRIX_SUCCESSOR.json',
 SEP+'IMPLEMENTATION_1_CORR10_2026-10-07/'+Path(SEP).name+'IMPLEMENTATION_1_CORR10_SUCCESSOR_VIEW_BUILDER.py',
 SEP+'IMPLEMENTATION_1_CORR10_2026-10-07/'+Path(SEP).name+'IMPLEMENTATION_1_CORR10_CONTRACT_MODEL.json',
 D+'STAGE2_FINAL_EFFECTIVE_VIEW_ASSEMBLY_1_CORR1_2026-10-07/STAGE2_FINAL_EFFECTIVE_VIEW_ASSEMBLY_1_CORR1_BUILD.py',
 D+'STAGE2_FINAL_EFFECTIVE_VIEW_ASSEMBLY_1_CORR1_2026-10-07/STAGE2_FINAL_EFFECTIVE_VIEW_ASSEMBLY_1_CORR1_REPORT.md',
 D+'STAGE2_FINAL_EFFECTIVE_VIEW_ASSEMBLY_1_CORR1_2026-10-07/STAGE2_FINAL_EFFECTIVE_VIEW_ASSEMBLY_1_CORR1_MANIFEST.json',
 D+'STAGE2_FINAL_EFFECTIVE_VIEW_ASSEMBLY_1_CORR1_2026-10-07/STAGE2_FINAL_EFFECTIVE_VIEW_ASSEMBLY_1_CORR1_DELTA_PROVENANCE.json',
 D+'STAGE2_FINAL_EFFECTIVE_VIEW_ASSEMBLY_1_CORR1_2026-10-07/STAGE2_FINAL_EFFECTIVE_VIEW_ASSEMBLY_1_CORR1_MIGRATION_LEDGER.json',
 D+'A_E001_SCOPE_DISPOSITION_READJUDICATION_1_2026-10-07/A_E001_SCOPE_DISPOSITION_READJUDICATION_1_DECISION.json',
 D+'A_E001_BEARING_DIRECTIONALITY_READJUDICATION_1_2026-10-07/A_E001_BEARING_DIRECTIONALITY_READJUDICATION_1_DECISION.json',
 D+'A_E001_SEMANTIC_READJUDICATION_1_IV1_2026-10-07/A_E001_SEMANTIC_READJUDICATION_1_IV1_REPORT.md',
 D+'AOL_F0024_RECONCILIATION_1_2026-10-07/AOL_F0024_RECONCILIATION_1_PROVENANCE_PATCH.json',
]
for rel in extra:
    b=(ROOT/rel).read_bytes(); inputs.setdefault(rel,{**ident(b),'roles':['additional_authority_or_contract_evidence']})
governance=[]
for rel,x in inputs.items():
    p=ROOT/rel
    if rel.startswith('docs/governance/') and rel.endswith('.md'):
        side=p.with_suffix('.sha256')
        if not side.exists(): side=Path(str(p)+'.sha256')
        expected=re.search(r'\b[0-9a-f]{64}\b',side.read_text()).group()
        assert expected==x['sha256']
        assert git('show', HEAD+':'+rel)==p.read_bytes()
        governance.append({'path':rel,'sidecarMatches':True,'lastBinding':git('log','-1','--format=%H|%cI|%s',HEAD,'--',rel).decode().strip()})
    dest=FROZEN/rel
    assert dest.resolve().is_relative_to(OUT)
    dest.parent.mkdir(parents=True,exist_ok=True)
    dest.write_bytes(p.read_bytes())

feva_b=(ROOT/FEVA).read_bytes()
assert git('show', HEAD+':'+FEVA)==feva_b
assert ident(feva_b)=={'bytes':104722,'sha256':'5b37071a5fa5374c77b149bfde5c230c228cdf73d9785e5ea55346f9fab28daa'}
historical_rel=D+'STAGE2_EFFECTIVE_VIEW_ASSEMBLY_1_CORR1_2026-10-05/STAGE2_EFFECTIVE_VIEW_ASSEMBLY_1_RECORDS.jsonl'
historical_b=(ROOT/historical_rel).read_bytes()
raw=feva_b.splitlines(keepends=True); oldraw=historical_b.splitlines(keepends=True)
assert raw[:110]==oldraw[:110]
rows=[json.loads(x) for x in raw]; predecessor=[json.loads(x) for x in oldraw]
def diff(a,b,path=''):
    if type(a)!=type(b):return [{'path':path,'before':{'present':True,'value':a},'after':{'present':True,'value':b}}]
    if isinstance(a,dict):
        out=[]
        for k in sorted(set(a)|set(b)):
            if k not in a or k not in b:
                out.append({'path':path+'.'+k,'before':{'present':k in a,**({'value':a[k]} if k in a else {})},'after':{'present':k in b,**({'value':b[k]} if k in b else {})}})
            else:out.extend(diff(a[k],b[k],path+'.'+k))
        return out
    if isinstance(a,list):
        if len(a)!=len(b):return [{'path':path,'before':{'present':True,'value':a},'after':{'present':True,'value':b}}]
        return [d for i,(x,y) in enumerate(zip(a,b)) for d in diff(x,y,path+'['+str(i)+']')]
    return [] if a==b else [{'path':path,'before':{'present':True,'value':a},'after':{'present':True,'value':b}}]
oracle={'acceptedCommit':HEAD,'acceptedPath':FEVA,'acceptedIdentity':ident(feva_b),
 'assemblyAuthority':'WORKBENCH/AUDITS/STAGE2_FINAL_EFFECTIVE_VIEW_ASSEMBLY_1_CORR2_GIT_CLOSURE_1.md §1, §3, §6',
 'sourceOfExpectedBytes':'git show exact accepted commit:path, independently of adaptation execution',
 'recordCount':116,'legacyCount':110,'sectionICount':6,
 'orderedIdentities':[[r['recordType'],r.get('cellIndex',r.get('edgeId'))] for r in rows],
 'lineIdentities':[{'line':i,'sha256':sha(x),'bytes':len(x),'record':r} for i,(x,r) in enumerate(zip(raw,rows),1)],
 'legacyRawSha256':sha(b''.join(raw[:110])),
 'historicalPredecessor':{'path':historical_rel,**ident(historical_b)},
 'acceptedDifferenceFromHistoricalPredecessor':diff(predecessor,rows),
 'provenanceArtifacts':[r for r in inputs if any(t in r for t in ('FINAL_EFFECTIVE_VIEW_ASSEMBLY','A_E001_','AOL_F0024','SEMANTIC_SEPARATION'))],
 'authorityDoesNotAssertMeasurementPass':True}
dump('ACCEPTED_FEVA_COMPOSITION_ORACLE.json',oracle)
orig=json.loads((ROOT/(D+'STAGE2_FINAL_MEASUREMENT_REGRESSION_1_2026-10-05/STAGE2_FINAL_MEASUREMENT_REGRESSION_1_RESULTS.json')).read_bytes())['reproduction']['pythonSource'].encode()
assert sha(orig)=='c99b8dc60dfd8d8594d903896c333bec673fa712150778f53bfd6f07243bb1dc'
(OUT/'ORIGINAL_FROZEN_HARNESS.py').write_bytes(orig)
(OUT/'FEVA_CORR2_EXACT_INPUT.jsonl').write_bytes(feva_b)
for name in ('REGRESSION_REPORT.md','REGRESSION_RESULTS.json'):
    (OUT/('PRIOR_HOLD_'+name)).write_bytes((PRIOR/name).read_bytes())
dump('INPUT_IDENTITIES.json',{'repositoryRoot':str(ROOT),'expectedHEAD':HEAD,'inputs':inputs,
 'priorHold':{k:ident((PRIOR/k).read_bytes()) for k in ('REGRESSION_REPORT.md','REGRESSION_RESULTS.json')},
 'originalHarness':ident(orig),'originalSourceField':'STAGE2_FINAL_MEASUREMENT_REGRESSION_1_RESULTS.json#reproduction.pythonSource'})
dump('PREFLIGHT_STATE.json',{'root':str(ROOT),'HEAD':HEAD,'branch':'main','cachedOriginMain':git('rev-parse','origin/main').decode().strip(),
 'statusFull':status_full.decode(),'statusFullIdentity':ident(status_full),'statusDefault':status_default.decode(),
 'untrackedFileEntries':sum(x.startswith(b'??') for x in status_full.splitlines()),
 'untrackedDefaultEntries':sum(x.startswith(b'??') for x in status_default.splitlines()),'trackedDirty':0,'staged':0,
 'governanceSidecars':governance,'gitMutationPerformed':False,'remoteLiveCheck':'NOT_PERFORMED_THIS_ACT; prior DNS failure retained; local and cached refs only',
 'readInventory':list(inputs),'runtime':{'python':__import__('sys').version,'executable':__import__('sys').executable},
 'qualityGate':{'mode':'PRE_ACT_SELF_CHECK','humanClaim':'A separate frozen compatibility candidate accepts exact FEVA CORR2 and retains applicable checks and forced failure behavior.',
 'entrypoint':'candidate.load_exact_input(path)','chain':'accepted bytes -> composition gate -> contract-family dispatch -> applicable measurement diagnostics',
 'consumer':'future separately authorized final measurement regression; no current product consumer',
 'failureConsequence':'identity/composition/schema failure prevents measurement or emits explicit diagnostic; no rewritten evidence',
 'independentVerifierRequired':'non-author Claude or Z.ai; Codex authors original and adaptation'}})
print(json.dumps({'preflight':'satisfied','inputsCopied':len(inputs),'legacyBytePreservation':True,'outputDir':str(OUT)}))
