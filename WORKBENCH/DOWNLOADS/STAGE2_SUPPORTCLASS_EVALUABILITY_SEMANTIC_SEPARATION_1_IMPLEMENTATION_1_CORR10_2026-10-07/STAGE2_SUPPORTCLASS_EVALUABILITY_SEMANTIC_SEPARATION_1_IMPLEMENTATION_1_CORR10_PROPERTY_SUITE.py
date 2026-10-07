#!/usr/bin/env python3
"""CORR10 deterministic author self-validation. No independent verification.
CORR4 utilities retained only for data construction, adapters and preserved replays.
Expectations use distinct raw boundary and canonical reference; no prior IV harness.
"""
import argparse,ast,copy,hashlib,importlib.util,itertools,json,os,sys,subprocess
from pathlib import Path
sys.dont_write_bytecode=True
PREFIX='STAGE2_SUPPORTCLASS_EVALUABILITY_SEMANTIC_SEPARATION_1_IMPLEMENTATION_1_CORR10'
HERE=Path(__file__).resolve().parent
ROOT=Path('/Users/entp_psyche/Desktop/InvestProjects2026/MergeVue PayProduct (june 2026)/MergeVue-M&A (August 2026)') # explicit trusted repository root; never CWD
ENUMERATION='CORR6-SHAPES-LEXICOGRAPHIC-1; seed=0; no random generator'
def module(path,name):
    spec=importlib.util.spec_from_file_location(name,path);result=importlib.util.module_from_spec(spec);sys.modules[name]=result;spec.loader.exec_module(result);return result
K=module(HERE/(PREFIX+'_CONTRACT_VERIFICATION_KERNEL.py'),'corr8_kernel')
MODEL=json.loads((HERE/(PREFIX+'_CONTRACT_MODEL.json')).read_text())
CONTRACT=K.Contract.load(MODEL)
def small_contract(components=2,targets=2):
    """Bounded grammar instantiation, independently of historical corpus IDs."""
    ms={};ts={}
    for i in range(3):
        names=frozenset('T%d_%d'%(i,j) for j in range(targets))
        comps=frozenset('c%d'%j for j in range(1,components+1))
        ms['M%d'%i]=K.Mechanism('M%d'%i,comps,'E%d'%i,frozenset('M%d'%j for j in range(3) if j!=i),names,'Not "M%d test found defect; fixed"; not M%d mere inventory.'%(i,i))
        for t in names: ts[t]=K.Target(t,frozenset({'M%d'%i}),True)
    return K.Contract(ms,ts,CONTRACT.registry_identity,{},CONTRACT.relations,CONTRACT.forms,CONTRACT.codes,CONTRACT.predicate_sources,CONTRACT.output_prohibited,{},CONTRACT.domains)

def package(scratch):
    path=Path(scratch).resolve()/'SYNTHETIC_FACT_PACKAGE.json'
    if not path.is_relative_to(Path('/private/tmp')):raise ValueError('scratch containment')
    path.parent.mkdir(parents=True,exist_ok=True)
    raw=json.dumps({'caseId':'SYN-CORR4','facts':[{'factId':f'F{i}','side':'A','certifiedText':f'Synthetic F{i} supplies documented component c1 and component c2.'} for i in (1,2,3)]},sort_keys=True).encode()
    path.write_bytes(raw)
    identity={'syntheticAuthority':'CORR6-AUTHOR-TEST-ONLY','recordFileSha256':hashlib.sha256(raw).hexdigest()}
    return identity,raw

def world(c,identity,raw,nfacts=1,ncomp=1,verdicts=None,wstates=None,alternatives=(),altstates=(),subject=None,supply_mode='split'):
    """Synthetic judgments only. Every dimension is independently settable.
    Missing judgments are modeled, not replaced by summary closure booleans.
    """
    subject=subject or next(iter(c.mechanisms)); m=c.mechanisms[subject]
    fids=tuple('F%d'%i for i in range(1,nfacts+1)); comps=sorted(m.components)[:ncomp]
    ident={'caseId':'SYN-CORR4','side':'A','factualPackageIdentity':copy.deepcopy(identity),'contractIdentity':c.registry_identity,'vocabularyVersion':'SYN-CORR4','coderIdentity':'AUTHOR_SYNTHETIC'}
    facts={f:K.Fact(f,'Synthetic %s supplies documented component c1 and component c2.'%f,copy.deepcopy(identity),raw) for f in fids}
    def edge(name,mid,fs,targets):
        cs=sorted(c.mechanisms[mid].components)[:ncomp]
        supplies=[]
        for j,comp in enumerate(cs):
            suppliers=fs if len(cs)==1 or supply_mode=='joint' else ((fs[j%len(fs)],) if fs else ())
            supplies.append(K.Supply(mid,comp,tuple(suppliers)))
        return K.Edge(name,tuple(fs),mid,tuple(targets),tuple(supplies),tuple(sorted(c.mechanisms[mid].components-set(cs))),'SUPPORTS_LEAF','DE-1',copy.deepcopy(ident),edge_state='PARTIAL' if set(cs)!=c.mechanisms[mid].components else 'SUPPORTED')
    primary=edge('E0',subject,fids,sorted(m.consumers)); rows=[primary]
    for i,mid in enumerate(alternatives): rows.append(edge('E%d'%(i+1),mid,fids[:1],sorted(c.mechanisms[mid].consumers)))
    witnesses={}
    for f in fids:
        entries=[]
        for mid,mm in c.mechanisms.items():
            supplied={s.component for r in rows for s in r.supplies if s.mechanism==mid and f in s.suppliers}
            entries.append(K.Entry(mid,'SELECTED' if supplied else 'NOT_SELECTABLE',tuple(sorted(supplied)),tuple(sorted(mm.components-supplied)),{v:'recorded synthetic judgment' for v in supplied}))
        witnesses[f]=K.Witness(f,copy.deepcopy(ident),c.registry_identity,tuple(entries))
    traces={}
    for i,r in enumerate(rows):
        selected={e.mechanism for f in r.facts for e in witnesses[f].entries if e.disposition=='SELECTED'}
        uni=c.mechanisms[r.mechanism].comparators|{mid for mid in selected if c.mechanisms[mid].environment!=c.mechanisms[r.mechanism].environment}
        states=verdicts if i==0 else (altstates[i-1],)*len(r.targets)
        states=states or ('D',)*len(r.targets)
        if i and states[0]=='I':r.source='CONTENT_INACCESSIBLE'
        for j,t in enumerate(r.targets):
            state=states[j] if len(states)>1 else states[0]
            judgments={}
            for s in r.supplies:
                spans={f:facts[f].asserted_text for f in s.suppliers}
                co={mid:'NO_CO_ENTAILMENT' for mid in sorted(uni)}
                negative='NOT_TRIGGERED';clause=None
                if state=='N':negative='TRIGGERED';clause=next(iter(sorted(K.clauses(c.mechanisms[r.mechanism].negative))))
                if state=='H': co={}
                judgments[s.component]=K.Judgment(s.suppliers,spans,negative,clause,co)
            traces[(r.name,t)]=K.Trace(r.name,t,r.mechanism,r.facts,c.registry_identity,ident['coderIdentity'],tuple(sorted(uni)),judgments,True)
    for f,state in zip(fids,wstates or ('C',)*nfacts):
        if state=='A':witnesses.pop(f,None)
        if state=='O':witnesses[f].entries=witnesses[f].entries[:-1]
    return K.World(tuple(rows),facts,witnesses,traces,True,c.registry_identity),primary

def native_registry(c):
    """Thin structural projection; no decisions and no builder constants."""
    return {'m':{m:{'id':m,'objectType':'ORGANIZATIONAL_MECHANISM','requiredComponents':sorted(v.components),'explicitNonMeaning':v.negative,'D':[],'altDeclared':[]} for m,v in c.mechanisms.items()},'tt':{t:{'id':t,'env':next((c.mechanisms[m].environment for m in v.leaves if m in c.mechanisms),None),'mechExpr':sorted(v.leaves),'verdict':'EXACT' if v.exact else 'UNRESOLVED','docStatus':'DOCUMENTARY_COMPLETE_CANDIDATE' if v.exact else 'UNRESOLVED','prohib':[]} for t,v in c.targets.items()},'envOfM':{m:v.environment for m,v in c.mechanisms.items()},'cmp':{m:sorted(v.comparators) for m,v in c.mechanisms.items()},'counterOf':copy.deepcopy(c.counter_of),'nacr':{n:{'mechanismPropositionId':v['mechanism'],'componentId':v['component']} for n,v in c.nacr.items()}}

def native(world):
    """External adapter only: contract relations ↔ existing builder boundary."""
    records={}
    for e in world.edges:
        records[e.name]={'edgeId':e.name,'factIds':list(e.facts),'mechanismPropositionIds':[e.mechanism],'treeTargetIds':list(e.targets),'componentSupply':[{'mechanismPropositionId':s.mechanism,'componentId':s.component,'factIds':list(s.suppliers),'relationInstanceId':None,'organizationalObjectRef':None,'linkageEvidence':{'class':'NO_LAWFUL_LINKAGE','identifier':None}} for s in e.supplies],'missingComponents':list(e.missing),'relation':e.relation,'evidenceForm':e.form,'relevanceState':'ANALYTICAL_MAPPED' if e.analytical else 'NON_ANALYTICAL','sourceQualityState':e.source,'edgeState':e.edge_state,'ambiguity':{'competingMechanismIds':['synthetic competing reading'],'resolutionState':'UNRESOLVED'} if e.ambiguity else None,'abstention':{'declarations':[{'code':a,'mechanismPropositionId':b,'componentId':cc} for a,b,cc in e.declarations]} if e.declarations else None,'absenceEvidenceState':e.absence,'prOnlyBasis':e.prohibited_only,**copy.deepcopy(e.identity)}
    witnesses={f:{'factId':w.fact,'registryIdentity':w.registry,**copy.deepcopy(w.identity),'entries':[{'mechanismPropositionId':x.mechanism,'disposition':x.disposition,'entailedComponents':list(x.entailed),'missingComponents':list(x.missing),'bases':copy.deepcopy(x.bases)} for x in w.entries]} for f,w in world.witnesses.items()}
    traces={key:{'record':t.edge,'treeTargetId':t.target,'mechanismPropositionId':t.mechanism,'factIds':list(t.facts),'registryIdentity':t.registry,'coderIdentity':t.coder,'universe':list(t.universe),'judgmentFlags':{'MD1':{},'MD2':{},'MD3':{}} if t.provenance else {},'components':{c:{'basis':{'factIds':list(j.suppliers),'entailmentBasis':copy.deepcopy(j.spans)},'MD2':j.negative,'explicitNonMeaningClause':j.clause,'MD3':copy.deepcopy(j.co)} for c,j in t.judgments.items()}} for key,t in world.traces.items()}
    evidence={f:{'certifiedText':x.asserted_text,'factualPackageIdentity':copy.deepcopy(x.evidence_identity)} for f,x in world.facts.items()}
    ctx={'witness':witnesses,'traces':traces,'coderOutput':{'caller-key-unrelated-to-facts':list(records.values())},'factualEvidence':evidence}
    if not world.enumerable:
        shape=getattr(world,'shape','tuple');hidden=list(records.values())
        if shape=='tuple':bad=tuple(hidden)
        elif shape=='dict':bad={str(i):r for i,r in enumerate(hidden)}
        elif shape=='scalar':bad=42
        elif shape=='entry-string':bad=['unreadable record']
        else:
            bad=[copy.deepcopy(hidden[0])]
            if shape=='entry-facts-string':bad[0]['factIds']='F1'
            else:bad[0]['relation']='SUPPORTS_LEAF '
        ctx['coderOutput']['non-enumerable']=bad
    for key,value in getattr(world,'caller_fields',{}).items():records[world.edges[0].name][key]=value
    if getattr(world,'group_move',False):ctx['coderOutput']={'not-F1':list(records.values())}
    return records,ctx

def state(o):
    if o.get('admission')=='HELD' or o.get('holdCode'):return 'HELD'
    if o.get('pipelineState')=='UNIQUENESS_UNRESOLVED':return 'UNIQUENESS_UNRESOLVED'
    if o.get('supportBearing'):return o['supportBearing']
    if o.get('bearingEvaluability')=='INDETERMINATE':return 'INDETERMINATE'
    if o.get('ev0Applicable') is False:return 'NOT_APPLICABLE'
    return 'DIRECTIONAL'


def synthetic_spec(identity,raw,scratch):
    path=Path(scratch)/('authority_'+hashlib.sha256(raw).hexdigest()+'.json');path.write_bytes(raw)
    return {'identity':copy.deepcopy(identity),'path':str(path.resolve()),'digest':hashlib.sha256(raw).hexdigest()}

def raw_case(cid,c,w,s,scratch,properties=(),axes=None):
    records,ctx=native(w)
    first=next(iter(w.facts.values()))
    spec=synthetic_spec(first.evidence_identity,first.package_bytes,scratch)
    return {'id':cid,'contract':c,'records':records,'context':ctx,'subject':s.name,'authority':spec,'properties':list(properties),'axes':axes or {}}

def with_authority(builder,case):
    ctx=copy.deepcopy(case['context']);spec=case.get('authority')
    if spec:
        ctx['packageAuthority']=builder.SyntheticTestAuthority(spec['identity'],spec['path'],spec['digest'])
    else:
        ctx['packageAuthority']=builder.ProductionPackageAuthority(ROOT,case.get('trusted_base'))
    return ctx

def canonical(case):
    oracle=K.BoundaryOracle(MODEL,ROOT,case.get('trusted_base'),case.get('authority'))
    w=oracle.canonicalize(case['records'],case['context'],case['contract'].registry_identity)
    subject=next(e for e in w.edges if e.name==case['subject'])
    return w,subject

def reference(case):
    w,s=canonical(case);k=K.Kernel(case['contract'])
    return {t:k.evaluate(w,s,t) for t in sorted(s.targets)}

def execute(builder,case):
    record=copy.deepcopy(case['records'][case['subject']]);ctx=with_authority(builder,case)
    before=copy.deepcopy({'record':record,'ctx':case['context']})
    registry=builder.parse_registry((ROOT/MODEL['sources']['registry']['path']).read_text()) if case.get('useFrozenRegistry') else native_registry(case['contract'])
    result=builder.evaluate_per_tt(record,registry,ctx,case['contract'].registry_identity)
    if before!={'record':record,'ctx':{k:v for k,v in ctx.items() if k!='packageAuthority'}}:raise AssertionError('input mutation')
    return {t:state(o) for t,o in result.items()},result

def observed(builder,c,w,subject,transform=None):
    scratch=ACTIVE_SCRATCH
    case=raw_case('preserved-replay',c,w,subject,scratch)
    if transform:transform(case['records'][subject.name],case['context'])
    return execute(builder,case)

def expected(c,w,s):
    return reference(raw_case('canonical-replay',c,w,s,ACTIVE_SCRATCH))

def rows(case):return sum(case['context']['coderOutput'].values(),[])
def refresh(case):
    case['records']={r['edgeId']:r for r in rows(case) if isinstance(r,dict) and 'edgeId' in r}
    return case

def rebuild(c,identity,raw,scratch,nf=1,nt=1,alternatives=(),states=(),nrecords=1,alt_nf=1,subject_states=None):
    c=copy.deepcopy(c)
    w,s=world(c,identity,raw,nf,1,subject_states,alternatives=alternatives,altstates=tuple('N' for _ in alternatives))
    # Alternate own records may span two TT and independently 1/2 facts.
    es=list(w.edges)
    for i,e in enumerate(es[1:]):
        e.facts=tuple('F%d'%j for j in range(1,alt_nf+1));e.supplies=tuple(K.Supply(e.mechanism,x.component,e.facts) for x in e.supplies)
        for fid in e.facts:
            if fid not in w.facts:w.facts[fid]=K.Fact(fid,'Synthetic %s supplies documented component c1 and component c2.'%fid,copy.deepcopy(identity),raw)
    if nrecords==2 and len(es)>1:
        e=copy.deepcopy(es[1]);e.name='E_ALT_SECOND';es.append(e)
    w.edges=tuple(es)
    # Rebuild W from actual materialized records, including alternative-only fact.
    for fid in w.facts:
        ident=copy.deepcopy(s.identity);entries=[]
        for mid,m in c.mechanisms.items():
            supplied={sup.component for e in es for sup in e.supplies if e.mechanism==mid and fid in sup.suppliers}
            entries.append(K.Entry(mid,'SELECTED' if supplied else 'NOT_SELECTABLE',tuple(sorted(supplied)),tuple(sorted(m.components-supplied)),{comp:'recorded synthetic basis' for comp in supplied}))
        w.witnesses[fid]=K.Witness(fid,ident,c.registry_identity,tuple(entries))
    w.traces={}
    for i,e in enumerate(es):
        selected={v.mechanism for fid in e.facts for v in w.witnesses[fid].entries if v.disposition=='SELECTED'}
        universe=c.mechanisms[e.mechanism].comparators|{m for m in selected if c.mechanisms[m].environment!=c.mechanisms[e.mechanism].environment}
        for j,t in enumerate(e.targets):
            flag=(subject_states or ('D',)*len(e.targets))[j] if i==0 else (states[i-1] if i-1<len(states) else 'N')
            if isinstance(flag,tuple):flag=flag[j]
            if flag=='I':e.source='CONTENT_INACCESSIBLE'
            judgments={}
            for sup in e.supplies:
                negative='TRIGGERED' if flag=='N' else 'NOT_TRIGGERED'
                clause=next(iter(sorted(K.clauses(c.mechanisms[e.mechanism].negative)))) if flag=='N' else None
                co={} if flag=='H' else {mid:'NO_CO_ENTAILMENT' for mid in sorted(universe)}
                judgments[sup.component]=K.Judgment(sup.suppliers,{f:w.facts[f].asserted_text for f in sup.suppliers},negative,clause,co)
            w.traces[(e.name,t)]=K.Trace(e.name,t,e.mechanism,e.facts,c.registry_identity,e.identity['coderIdentity'],tuple(sorted(universe)),judgments,True)
    return w,s

# CORR6 additions are raw constructions derived from frozen rules, not IV code.
FX_INVARIANTS={
 'FX01':('P09','cor1 §6.6 T-2 / B3-2; registry H-5 supplying fact'),
 'FX02':('P02','cor1 §6.5 W-1 exact census'),
 'FX03':('P15','cor1 §9.2 B-2(ii) evaluated TT'),
 'FX05':('P12','accepted §10 S2 before S6; §6.3 holds'),
 'FX06':('P02','cor1 §6.5 W-2 all records of f'),
 'FX09':('P08','accepted §6.2/§6.3 SEP-AV-6'),
 'FX11':('P11','registry §E; cor1 §9.2 B-2(i) exact absence'),
 'FX12':('P09','registry H-1; c34 §13.3 exact fact membership'),
 'FX13':('P06','cor1 §6.5 W-3 complete TT coverage'),
 'FX14':('P13','accepted §7.1 U-X before U-2'),
 'FX15':('P09','cor1 §6.6 T-2; §9.4 B3-6 all supplied components'),
}

def replace_package(case,identity):
    for row in rows(case):row['factualPackageIdentity']=copy.deepcopy(identity)
    for w in case['context']['witness'].values():w['factualPackageIdentity']=copy.deepcopy(identity)
    for ev in case['context']['factualEvidence'].values():ev['factualPackageIdentity']=copy.deepcopy(identity)


def rename_facts(case,mapping):
    ctx=case['context']
    for row in rows(case):
        row['factIds']=[mapping.get(f,f) for f in row['factIds']]
        for s in row.get('componentSupply') or []:s['factIds']=[mapping.get(f,f) for f in s['factIds']]
    ctx['witness']={mapping.get(f,f):w for f,w in ctx['witness'].items()}
    for f,w in ctx['witness'].items():w['factId']=f
    ctx['factualEvidence']={mapping.get(f,f):e for f,e in ctx['factualEvidence'].items()}
    for tr in ctx['traces'].values():
        tr['factIds']=[mapping.get(f,f) for f in tr['factIds']]
        for j in tr['components'].values():j['basis']['factIds']=[mapping.get(f,f) for f in j['basis']['factIds']]


def real_case(template,cid,identity,fid,case_id,side,text):
    a=copy.deepcopy(template);a['id']=cid;a['authority']=None;a['useFrozenRegistry']=True
    rename_facts(a,{a['records'][a['subject']]['factIds'][0]:fid})
    replace_package(a,identity)
    for row in rows(a):row.update(caseId=case_id,side=side)
    for w in a['context']['witness'].values():w.update(caseId=case_id,side=side)
    a['context']['factualEvidence']={fid:{'certifiedText':text,'factualPackageIdentity':copy.deepcopy(identity)}}
    for tr in a['context']['traces'].values():
        for j in tr['components'].values():j['basis']={'factIds':[fid],'entailmentBasis':{'physical-proposition':text}}
    a['properties']=['P09','M-AUTHORITY'];a['axes']={'identityShape':cid}
    a['categorical']={t:'DIRECT_SUPPORT' for t in a['records'][a['subject']]['treeTargetIds']}
    return a


def corr6_cases(scratch,existing):
    result=[];identity,raw=package(scratch);lookup={a['id']:a for a in existing}
    def add(a,cid,ps,axis,wanted='HELD'):
        a['id']=cid;a['properties']=list(ps);a['axes']=axis
        if isinstance(wanted,str):a['categorical']={t:wanted for t in a['records'][a['subject']]['treeTargetIds']}
        elif wanted is not None:a['categorical']=wanted
        result.append(a);return a
    def fresh(nf=1,nt=1,nc=1,als=(),states=(),comp=2,sub='M0',c=None):
        c=c or small_contract(comp,nt);w,s=world(c,identity,raw,nf,nc,alternatives=als,altstates=states,subject=sub)
        return raw_case('new',c,w,s,scratch)
    # Eleven material classes, with distinct neighboring topology per class.
    for nf in (2,3):
        a=fresh(nf,nc=nf,comp=nf)
        for tr in a['context']['traces'].values():
            for j in tr['components'].values():
                own=j['basis']['factIds'];foreign=next(f for f in a['context']['factualEvidence'] if f not in own)
                j['basis']['entailmentBasis']={'foreign':a['context']['factualEvidence'][foreign]['certifiedText']}
        add(a,'FX01-'+str(nf),['P09'],{'supplierFacts':nf,'span':'nonsupplying fact'})
    for order in ('first','last','selected-duplicate'):
        a=fresh(nt=2);wi=a['context']['witness']['F1'];dup=copy.deepcopy(wi['entries'][0 if order=='selected-duplicate' else -1]);wi['entries'].insert(0 if order=='first' else len(wi['entries']),dup)
        add(a,'FX02-'+order,['P02'],{'censusDuplicate':order})
    for wrong in ('TT-NTSTP-RS','TT-STPSTJ-ESS'):
        a=copy.deepcopy(lookup['COUNTER-lawful-D']);ctr=a['records'][a['subject']];good=ctr['treeTargetIds'][0];ctr['treeTargetIds'].append(wrong);tr=copy.deepcopy(a['context']['traces'][(ctr['edgeId'],good)]);tr['treeTargetId']=wrong;a['context']['traces'][(ctr['edgeId'],wrong)]=tr
        add(a,'FX03-'+wrong,['P01','P15'],{'counterTT':'lawful + wrong TT'}, {good:'DIRECT_CONTRADICTION',wrong:'INDETERMINATE'})
    for nt,mode in itertools.product((1,2),('ND','AMB','NA')):
        a=fresh(nt=nt);r=a['records'][a['subject']];r['evidenceForm']='DE-4'
        if mode=='ND':r['edgeState']='NOT_DETERMINABLE'
        if mode=='AMB':r['edgeState']='AMBIGUOUS'
        if mode=='NA':r['abstention']={'declarations':[{'code':'NACR-1:FOREIGN','mechanismPropositionId':'M0','componentId':'c1'}]}
        add(a,'FX05-'+mode+'-'+str(nt),['P12','P08'],{'admission':'HOLD-'+mode,'form':'DE-4'})
    for field in ('coderIdentity','vocabularyVersion','contractIdentity'):
        a=fresh(nt=2,als=('M1',),states=('N',));alt=a['records']['E1'];alt[field]='FOREIGN'
        if field=='coderIdentity':
            for key,tr in a['context']['traces'].items():
                if key[0]=='E1':tr['coderIdentity']='FOREIGN'
        add(a,'FX06-'+field,['P02'],{'foreignIdentityOn':'ancillary record','field':field})
    # Same-Environment row is still W-2 material, even though not Alt.
    a=fresh(als=('M1',),states=('N',));mm=a['contract'].mechanisms['M1'];a['contract'].mechanisms['M1']=K.Mechanism(mm.name,mm.components,'E0',mm.comparators,mm.consumers,mm.negative)
    for tr in a['context']['traces'].values():
        uni=set(a['contract'].mechanisms[tr['mechanismPropositionId']].comparators);tr['universe']=sorted(uni)
        for j in tr['components'].values():j['MD3']={m:'NO_CO_ENTAILMENT' for m in sorted(uni)}
    for field in ('contractIdentity','coderIdentity','vocabularyVersion'):
        neighbor=copy.deepcopy(a);neighbor['records']['E1'][field]='FOREIGN'
        add(neighbor,'FX06-same-env-'+field,['P02'],{'foreignIdentityOn':'same Environment ancillary','field':field})
    for nf in (1,2):
        a=fresh(nf=nf,nc=3,c=CONTRACT,sub='M-RES-ASYMMETRIC-RETENTION');r=a['records'][a['subject']];r['abstention']={'declarations':[{'code':'NACR-1','mechanismPropositionId':r['mechanismPropositionIds'][0],'componentId':'c3'}]}
        add(a,'FX09-'+str(nf),['P08'],{'component':'c3 supplied + NACR','recordFacts':nf})
    for value in ('COMPETENT_AFFIRMATIVE_ABSENCE ','competent_affirmative_absence',' COMPETENT_AFFIRMATIVE_ABSENCE','COMPETENT_AFFIRMATIVE_ABSENCE'):
        a=fresh(nt=2);a['records'][a['subject']].update(relation='NEGATES_LEAF',absenceEvidenceState=value)
        add(a,'FX11-'+repr(value),['P11'],{'absence':value},'DIRECT_CONTRADICTION' if value=='COMPETENT_AFFIRMATIVE_ABSENCE' else 'NON_DISCRIMINATING')
    for replacement,label in [(42,'integer'),(True,'boolean'),('FOREIGN-FACT','foreign')]:
        a=copy.deepcopy(lookup['PI3-LAWFUL']);fid=a['records'][a['subject']]['factIds'][0];rename_facts(a,{fid:replacement})
        add(a,'FACT-IDENTITY-'+label,['P09'],{'factIdentity':label})
    for label in ('lower','swapcase'):
        a=copy.deepcopy(lookup['PI3-LAWFUL']);fid=a['records'][a['subject']]['factIds'][0];rename_facts(a,{fid:fid.lower() if label=='lower' else fid.swapcase()})
        add(a,'FX12-'+label,['P09'],{'factIdentity':label})
    for nt,which in ((2,'subject'),(3,'alternative')):
        a=fresh(nt=nt,als=('M1',),states=('N',));r=a['records'][a['subject'] if which=='subject' else 'E1'];r['treeTargetIds']=r['treeTargetIds'][:1]
        add(a,'FX13-'+which,['P06','P02'],{'coverage':f'1/{nt}','record':which})
    for nf,nt in ((1,1),(3,2)):
        a=fresh(nf,nt,als=('M1','M2'),states=('D','H'))
        add(a,'FX14-'+str(nf),['P13'],{'distinctAlternatives':['D','H'],'recordFacts':nf})
    for nc,nt in ((2,1),(3,2)):
        a=fresh(nf=1,nt=nt,nc=nc,comp=nc)
        for tr in a['context']['traces'].values():tr['components'].pop('c'+str(nc))
        add(a,'FX15-'+str(nc),['P09'],{'suppliedCount':nc,'traceCount':nc-1})
    # General W-4 grammar: 1/2/3 supply-bearing records, every relation, selected
    # vs not-selectable, exact/subset/superset/disjoint supplied component set.
    for rel,disposition,shape,nrecords,nt,nf in itertools.product(('SUPPORTS_LEAF','COUNTER_M','NEGATES_LEAF'),('SELECTED','NOT_SELECTABLE'),('exact','subset','superset','disjoint'),(1,2,3),(1,2),(1,2)):
        # Sparse covering design rather than an uninformative full Cartesian grid.
        if (nrecords+nt+nf)%3!=0:continue
        a=fresh(nf,nt,als=('M1',),states=('N',),comp=3);alt=a['records']['E1'];ent=['c1','c2'] if shape=='subset' else ['c1'];sup={'exact':['c1'],'subset':['c1'],'superset':['c1','c2'],'disjoint':['c3']}[shape]
        for f,wi in a['context']['witness'].items():
            e=next(e for e in wi['entries'] if e['mechanismPropositionId']=='M1')
            # Alternative supplies F1 only. Non-suppliers stay NOT_SELECTABLE.
            selected=disposition=='SELECTED' and f=='F1';e.update(disposition='SELECTED' if selected else 'NOT_SELECTABLE',entailedComponents=ent if selected else [],missingComponents=sorted(a['contract'].mechanisms['M1'].components-set(ent)) if selected else sorted(a['contract'].mechanisms['M1'].components),bases={c:'basis' for c in ent} if selected else None)
        if disposition=='NOT_SELECTABLE':
            a['context']['coderOutput']={k:[r for r in group if r['edgeId']!='E1'] for k,group in a['context']['coderOutput'].items()}
        else:
            alt['componentSupply']=[dict(alt['componentSupply'][0],componentId=c) for c in ent];alt['missingComponents']=sorted(a['contract'].mechanisms['M1'].components-set(ent))
            for (eid,tt),tr in a['context']['traces'].items():
                if eid=='E1':tr['components']={c:copy.deepcopy(next(iter(tr['components'].values()))) for c in ent}
        for i in range(nrecords):
            row=copy.deepcopy(alt);row.update(edgeId='SUPPLY-'+str(i),relation=rel)
            row['componentSupply']=[dict(row['componentSupply'][0],componentId=c,factIds=['F1']) for c in sup];row['missingComponents']=sorted(a['contract'].mechanisms['M1'].components-set(sup))
            if rel=='COUNTER_M':row['treeTargetIds']=[sorted(a['contract'].mechanisms['M0'].consumers)[0]];a['contract'].counter_of['M1']=['M0']
            a['context']['coderOutput'].setdefault('all-relations',[]).append(row)
            # SUPPORTS rows are actual Alt records; make each trace non-directional.
            for tt in row['treeTargetIds']:
                tr=copy.deepcopy(next(v for (e,t),v in a['context']['traces'].items() if e=='E1'));tr.update(record=row['edgeId'],treeTargetId=tt);tr['components']={c:copy.deepcopy(next(iter(tr['components'].values()))) for c in sup};a['context']['traces'][(row['edgeId'],tt)]=tr
        ok=disposition=='SELECTED' and set(sup)<=set(ent)
        add(refresh(a),'W4:'+':'.join(map(str,(rel,disposition,shape,nrecords,nt,nf))),['P10','P02'],{'supplyRelation':rel,'witness':disposition,'components':shape,'supplyRecords':nrecords,'recordTTs':nt,'recordFacts':nf},'DIRECT_SUPPORT' if ok else 'HELD')
    # Multi-fact counter supply is attributed only to the bound supplying fact.
    for supplier in ('F1','F2'):
        a=fresh(nf=2,nt=2);x=a['records'][a['subject']]
        ctr=copy.deepcopy(x);ctr.update(edgeId='MULTIFACT-COUNTER',relation='COUNTER_M',mechanismPropositionIds=['M1'],treeTargetIds=['T0_0'])
        ctr['componentSupply']=[dict(x['componentSupply'][0],mechanismPropositionId='M1',factIds=[supplier])]
        a['contract'].counter_of['M1']=['M0'];a['context']['coderOutput']['counter']=[ctr]
        add(refresh(a),'W4:MULTIFACT:'+supplier,['P10','P02'],{'supplyRelation':'COUNTER_M','recordFacts':2,'supplyingFact':supplier})
    # Exact W-1 census, complete T binding and legal admission as paired controls.
    for nf,nt,nc in ((1,1,1),(2,2,2),(3,3,3)):
        a=fresh(nf,nt,nc,comp=max(2,nc));add(a,'C6-POSITIVE-STRUCTURE-'+str(nf),['P02','P06','P09','P10'],{'recordFacts':nf,'recordTTs':nt,'suppliedCount':nc},'DIRECT_SUPPORT')
    # Physical PI-3 positives; no analytical adjudication of source propositions.
    view=ROOT/'WORKBENCH/DOWNLOADS/STAGE2_EFFECTIVE_VIEW_ASSEMBLY_1_CORR1_2026-10-05/STAGE2_EFFECTIVE_VIEW_ASSEMBLY_1_RECORDS.jsonl'
    si=[json.loads(l) for l in view.read_text().splitlines() if json.loads(l).get('recordType')=='SECTION_I_RECORD']
    a001=next(r for r in si if r['edgeId']=='A-E001');full=a001['factualPackageIdentity'];pi=lookup['PI3-LAWFUL'];fid=pi['records'][pi['subject']]['factIds'][0];text=pi['context']['factualEvidence'][fid]['certifiedText'];r=pi['records'][pi['subject']]
    for label,ident in [('A01-verbatim',full),('A02-matrix',{k:v for k,v in full.items() if k not in ('identityAuthority','identityAuthoritySha256')}),('A03-count',dict(r['factualPackageIdentity'],packageFactCount=43))]:
        result.append(real_case(pi,'PI3-POSITIVE-'+label,ident,fid,r['caseId'],r['side'],text))
    # Every lawful optional field wrong + unknown/injected keys fail closed.
    positive=result[-3]
    for key in full:
        bad=copy.deepcopy(full);bad[key]=bad[key]+1 if type(bad[key])==int else 'WRONG-'+str(bad[key]);a=copy.deepcopy(positive);replace_package(a,bad)
        add(a,'PI3-NEGATIVE-MEMBER-'+key,['P09'],{'identityMember':key,'assertion':'wrong'})
    for key in ('unknown','recordListKey','factTextKey','factTextLocator'):
        a=copy.deepcopy(positive);bad=copy.deepcopy(full);bad[key]='scope';replace_package(a,bad);add(a,'PI3-NEGATIVE-EXTRA-'+key,['P09'],{'injection':key})
    for value,label in [(str(full['recordFileBytes']),'bytes-string'),(float(full['recordFileBytes']),'bytes-float'),(True,'count-bool')]:
        a=copy.deepcopy(positive);bad=copy.deepcopy(full);bad['packageFactCount' if label=='count-bool' else 'recordFileBytes']=value;replace_package(a,bad);add(a,'PI3-NEGATIVE-'+label,['P09'],{'typedIdentity':label})
    a=copy.deepcopy(positive);bad=copy.deepcopy(full);rp=Path(full['recordFile']);bad['recordFile']=str(rp.parent/'..'/rp.parent.name/rp.name);replace_package(a,bad);add(a,'PI3-NEGATIVE-TRAVERSAL',['P09'],{'path':'traversal'})
    for row in si:
        ident=row['factualPackageIdentity'];fid=row['factIds'][0];oracle=K.BoundaryOracle(MODEL,ROOT);text,authority=oracle.proposition(ident,fid,row['caseId'],row['side'])
        # This establishes only physical certification, no H-2.2/MD judgment.
        if not text:
            # Frozen view's AOL identity asserts a different package generation
            # than its named source-map authority. Preserve the negative control;
            # do not repair history or promote this stale assertion to authority.
            sources=json.loads((ROOT/MODEL['sources']['package_locators']['path']).read_text())['cases']
            entry=next(e for e in sources if e['caseSlug']==ident['caseSlug'])
            assert any(ident[k]!=entry[k] for k in ('recordFileBytes','recordFileSha256'))
            a=real_case(pi,'PI3-STALE-VIEW-'+row['edgeId'],ident,fid,row['caseId'],row['side'],'Stale physical identity cannot certify this asserted text.')
            a['categorical']={t:'HELD' for t in a['records'][a['subject']]['treeTargetIds']};result.append(a)
        else:result.append(real_case(pi,'PI3-POSITIVE-VIEW-'+row['edgeId'],ident,fid,row['caseId'],row['side'],text))
    mapped=MODEL['package_locators']
    # An additional non-Daimler real source-map package path, when physically present.
    source=json.loads((ROOT/MODEL['sources']['package_locators']['path']).read_text())['cases'][1]
    path=Path(source['recordFile']);doc=None;raw2=path.read_bytes()
    doc=json.loads(raw2) if source['recordFormat']=='json' else None
    rr=(doc[source['recordListKey']] if isinstance(doc,dict) else doc) if doc is not None else [json.loads(x) for x in raw2.splitlines() if x.strip()]
    rr=rr[0];ident={k:source[k] for k in K.BoundaryOracle.KEYS};ident.update(packageFactCount=source['factCount'],packageSideCount=source['sideCount'],identityAuthority=Path(MODEL['sources']['package_locators']['path']).name,identityAuthoritySha256=K.BoundaryOracle.MAP_SHA)
    caseid=doc[source['caseIdKey']] if source['caseIdLocator'].startswith('package-level') else rr[source['caseIdKey']]
    result.append(real_case(pi,'PI3-POSITIVE-EXTRA-PACKAGE',ident,rr[source['factIdKey']],caseid,rr[source['sideIdKey']],rr[source['factTextKey']]))
    # B25/B28 real-package regressions. X plus counter supply contradicting W.
    for variant in ('NOT_SELECTABLE','COMPONENT','CONSISTENT'):
        a=copy.deepcopy(positive);x=a['records'][a['subject']];fid=x['factIds'][0];mid='M-AUTH-TOPDOWN-EXPLICIT';cs=CONTRACT.mechanisms[mid].components
        counter=copy.deepcopy(x);counter.update(edgeId='B25-COUNTER',mechanismPropositionIds=[mid],treeTargetIds=['TT-NTSTP-ES'],relation='COUNTER_M');component='c2' if variant=='COMPONENT' else 'c1'
        counter['componentSupply']=[dict(x['componentSupply'][0],mechanismPropositionId=mid,componentId=component)];counter['missingComponents']=sorted(cs-{component});a['context']['coderOutput']['counter']=[counter]
        if variant!='NOT_SELECTABLE':
            wi=a['context']['witness'][fid];e=next(e for e in wi['entries'] if e['mechanismPropositionId']==mid);e.update(disposition='SELECTED',entailedComponents=['c1'],missingComponents=sorted(cs-{'c1'}),bases={'c1':'explicit structural test judgment'})
            support=copy.deepcopy(counter);support.update(edgeId='B25-MATERIALIZED',relation='SUPPORTS_LEAF',treeTargetIds=sorted(CONTRACT.mechanisms[mid].consumers));support['componentSupply'][0]['componentId']='c1';support['missingComponents']=sorted(cs-{'c1'});a['context']['coderOutput']['material']=[support]
            for row2 in rows(a):
                other=sorted(CONTRACT.mechanisms[row2['mechanismPropositionIds'][0]].comparators|{mid if row2['edgeId']==x['edgeId'] else x['mechanismPropositionIds'][0]})
                for tt in row2['treeTargetIds']:
                    tr=copy.deepcopy(next(iter(a['context']['traces'].values())));tr.update(record=row2['edgeId'],mechanismPropositionId=row2['mechanismPropositionIds'][0],treeTargetId=tt,universe=other)
                    tr['components']={s['componentId']:copy.deepcopy(next(iter(tr['components'].values()))) for s in row2['componentSupply']}
                    for j in tr['components'].values():j['MD3']={m:'NO_CO_ENTAILMENT' for m in other}
                    a['context']['traces'][(row2['edgeId'],tt)]=tr
        add(refresh(a),'B25-'+variant,['P10','P15'],{'W4CounterRegression':variant},'SHARED_NON_UNIQUE' if variant=='CONSISTENT' else 'HELD')
        if variant=='NOT_SELECTABLE':a['expectedHold']='HOLD-U'
    return result


def physical_pi3_controls(builder):
    view=ROOT/'WORKBENCH/DOWNLOADS/STAGE2_EFFECTIVE_VIEW_ASSEMBLY_1_CORR1_2026-10-05/STAGE2_EFFECTIVE_VIEW_ASSEMBLY_1_RECORDS.jsonl'
    sidecar=ROOT/'WORKBENCH/DOWNLOADS/STAGE2_CORR4_PILOT_ANALYTICAL_PROVENANCE_SIDECAR_CORR1.jsonl'
    auth=builder.ProductionPackageAuthority(ROOT);oracle=K.BoundaryOracle(MODEL,ROOT);ledger=[]
    for label,path in [('view',view),('sidecar',sidecar)]:
        for row in (json.loads(l) for l in path.read_text().splitlines() if l.strip()):
            if label=='view' and row.get('recordType')!='SECTION_I_RECORD':continue
            ident=row['factualPackageIdentity'];fids=row.get('factIds') or [row.get('factId')];side=row.get('side',row.get('sideId'));caseid=row['caseId']
            expected_source=next((e for e in auth.entries if e['caseSlug']==ident.get('caseSlug')),None)
            mismatches={k:{'asserted':ident.get(k),'authority':expected_source.get(k)} for k in K.BoundaryOracle.KEYS if expected_source is not None and not K.typed_equal(ident.get(k),expected_source.get(k))}
            if expected_source is not None:
                for k,v in [('packageFactCount',expected_source['factCount']),('packageSideCount',expected_source['sideCount']),('caseIdLocator',expected_source['caseIdLocator'])]:
                    if not K.typed_equal(ident.get(k),v):mismatches[k]={'asserted':ident.get(k),'authority':v}
            eligible=expected_source is not None and not mismatches
            good=True
            for fid in fids:
                actual=auth.certify(ident,fid,caseid,side);text,authority=oracle.proposition(ident,fid,caseid,side)
                good=good and ((actual is not None and text is not None and actual.proposition==text) if eligible else (actual is None and text is None))
            ledger.append({'source':label,'record':row.get('edgeId',row.get('factId')),'identity':ident,'factIds':fids,'otherwiseLawful':eligible,'identityMismatches':mismatches,'certified':eligible and good,'result':'PASS' if good else 'FAIL'})
    return {'ledger':ledger,'viewTotal':sum(r['source']=='view' for r in ledger),'viewEligible':sum(r['source']=='view' and r['otherwiseLawful'] for r in ledger),'viewCertified':sum(r['source']=='view' and r['certified'] for r in ledger),'sidecarTotal':sum(r['source']=='sidecar' for r in ledger),'sidecarCertified':sum(r['source']=='sidecar' and r['certified'] for r in ledger),'failures':sum(r['result']=='FAIL' for r in ledger)}


def cases(scratch):
    identity,raw=package(scratch);result=[]
    def add(cid,c,w,s,ps,axes=None):
        case=raw_case(cid,c,w,s,scratch,ps,axes);result.append(case);return case
    # Shape grid: each alternative TT, fact, record and priority state is genuinely
    # varied; counts do not substitute for the targeted witnesses below.
    for nf,nt,na,ar,af,astate in itertools.product((1,2,3),(1,2),(0,1,2),(1,2),(1,2),('D','N','H','I')):
        if na==0 and (ar,af,astate)!=(1,1,'D'):continue
        c=small_contract(2,nt);als=tuple('M%d'%i for i in range(1,na+1))
        w,s=rebuild(c,identity,raw,scratch,nf,nt,als,tuple(astate for _ in range(max(na,ar))),ar,af)
        cid='SHAPE:%d:%d:%d:%d:%d:%s'%(nf,nt,na,ar,af,astate)
        add(cid,c,w,s,('P01','P02','P10','P13'),{'subjectFacts':nf,'subjectTTs':nt,'alternativeMechanisms':na,'alternativeRecords':len(w.edges)-1,'alternativeTTs':nt,'alternativeFacts':af,'alternativeState':astate})
    c=small_contract(2,2)
    for states,nrec,label in [((('N','D'),),1,'ALT-SECOND-TT-D'),((('N','H'),),1,'ALT-SECOND-TT-H'),(('N','H'),2,'ALT-N-H'),(('H','I'),2,'ALT-H-I'),(('D','H'),2,'ALT-D-H')]:
        w,s=rebuild(c,identity,raw,scratch,1,2,('M1',),states,nrec,1)
        add(label,c,w,s,('P01','P13'))
    # Only second subject fact selects the alternative; comparator not in Cmp.
    c2=small_contract(2,1);c2.mechanisms['M0']=K.Mechanism('M0',frozenset({'c1','c2'}),'E0',frozenset(),frozenset({'T0_0'}),c2.mechanisms['M0'].negative)
    w,s=rebuild(c2,identity,raw,scratch,2,1,('M1',),('D',),1,1)
    ar=w.edges[1];ar.facts=('F2',);ar.supplies=(K.Supply('M1','c1',('F2',)),)
    for f in ('F1','F2'):
        ents=[]
        for e in w.witnesses[f].entries:
            if e.mechanism=='M1':e=K.Entry('M1','SELECTED' if f=='F2' else 'NOT_SELECTABLE',('c1',) if f=='F2' else (),('c2',),{'c1':'basis'} if f=='F2' else None)
            ents.append(e)
        w.witnesses[f].entries=tuple(ents)
    for (eid,t),tr in w.traces.items():
        tr.facts=ar.facts if eid==ar.name else tr.facts
        tr.universe=('M1',) if eid==s.name else tuple(sorted(c2.mechanisms['M1'].comparators|{'M0'}))
        for j in tr.judgments.values():
            if eid==ar.name:j.suppliers=('F2',);j.spans={'F2':w.facts['F2'].asserted_text}
            j.co={mid:'NO_CO_ENTAILMENT' for mid in tr.universe}
    add('SECOND-FACT-ALTERNATIVE',c2,w,s,('P02','P13'))
    for states,label in [(('D','N'),'SUBJECT-D-N'),(('D','H'),'SUBJECT-D-H'),(('H','D'),'SUBJECT-H-D')]:
        w,s=world(c,identity,raw,1,1,states);add(label,c,w,s,('P01','P03'),{'subjectStates':list(states),'subjectTTs':2})
    # Explicit W states, malformed membership, W2 exact nested identity.
    w,s=world(c,identity,raw,2,1);base=add('BASE',c,w,s,('P01','P02','P09','P10'))
    for mode in ('absent','open','malformed'):
        a=copy.deepcopy(base);a['id']='W-'+mode;a['axes']={'W':mode}
        if mode=='absent':a['context']['witness'].pop('F2')
        elif mode=='open':a['context']['witness']['F2']['entries'].pop()
        else:a['context']['witness']['F2']['entries'][0]['disposition']='SELECTED '
        result.append(a)
    a=copy.deepcopy(base);a['id']='W2-PACKAGE-NONDIGEST';a['context']['witness']['F1']['factualPackageIdentity']['syntheticAuthority']='FOREIGN';a['properties']=['P09'];result.append(a)
    # Non-mapped variants both null and in-domain metadata, hidden and ambiguous.
    for kind in ('NON_ANALYTICAL','UNMAPPED_OBSERVATION'):
        for metadata in (False,True):
            a=copy.deepcopy(base);a['id']=kind+('-METADATA' if metadata else '-NULL');a['properties']=['P05','P06','M-NONMAPPED'];a['axes']={'recordClass':kind}
            row={'edgeId':'UNRELATED','factIds':['UNRELATED-F'],'relevanceState':kind,'mechanismPropositionIds':None,'treeTargetIds':None,'componentSupply':None,'relation':'NEGATES_LEAF' if metadata else None,'evidenceForm':'DE-2' if metadata else None,'sourceQualityState':'COMPETENT' if metadata else None,'edgeState':'GAP' if metadata else None}
            a['context']['coderOutput']['unrelated']=[row];result.append(a)
    a=copy.deepcopy(base);a['id']='SIX-NON-ANALYTICAL';a['properties']=['P05','M-NONMAPPED'];a['context']['coderOutput']['pilot-controls']=[{'edgeId':'NA%d'%i,'factIds':['OTHER%d'%i],'relevanceState':'NON_ANALYTICAL','mechanismPropositionIds':None,'treeTargetIds':None,'componentSupply':None,'relation':None,'evidenceForm':None} for i in range(6)];result.append(a)
    a=copy.deepcopy(base);a['id']='AMBIGUOUS-ROW';a['properties']=['P05','P06'];a['context']['coderOutput']['ambiguous']=[{'relevanceState':'NON_ANALYTICAL','factIds':'F1'}];result.append(a)
    a=copy.deepcopy(base);a['id']='HIDDEN-SUPPORT';a['properties']=['P06'];hidden=copy.deepcopy(rows(a)[0]);hidden.update(edgeId='HIDDEN',relevanceState='NON_ANALYTICAL');a['context']['coderOutput']['hidden']=[hidden];result.append(a)
    # Exact enum plus all three near miss kinds, every semantic closed domain.
    for field,domain in {k:MODEL['domains'][k] for k in ('relation','evidenceForm','sourceQualityState','edgeState','relevanceState')}.items():
        for val in domain+[domain[0]+' ',domain[0].lower(),domain[0].replace('_','-') if '_' in domain[0] else domain[0].replace('-','_')]:
            a=copy.deepcopy(base);a['id']='ENUM:'+field+':'+repr(val);a['properties']=['P11','M-ENUM'];a['axes']={'enum':field,'value':val};a['records'][a['subject']][field]=val
            # keep lawful ambiguity consistency, not an accidental AV-2 witness
            if field=='edgeState' and val=='AMBIGUOUS':a['records'][a['subject']]['ambiguity']={'competingMechanismIds':['M1'],'resolutionState':'UNRESOLVED'}
            result.append(a)
    # Exact demonstrated C5-06 regressions, beyond first-enum-member near misses.
    for field,val in [('sourceQualityState','CONTENT_INACCESSIBLE '),('sourceQualityState','content_inaccessible'),('sourceQualityState','CONTENT-INACCESSIBLE'),('edgeState','NOT_DETERMINABLE ')]:
        a=copy.deepcopy(base);a['id']='DIRECT-ENUM:'+field+':'+repr(val);a['properties']=['P11','M-ENUM'];a['axes']={'enum':field,'value':val};a['records'][a['subject']][field]=val;result.append(a)
    # Distinct same-M/other-M clauses, partial, escaped, case, quote syntax.
    for val,label in [(next(iter(sorted(K.clauses(c.mechanisms['M0'].negative)))),'EXACT'),(next(iter(sorted(K.clauses(c.mechanisms['M1'].negative)))),'OTHER-M'),('Not "M0 test found','PARTIAL'),(next(iter(sorted(K.clauses(c.mechanisms['M0'].negative)))).lower(),'CASE')]:
        a=copy.deepcopy(base);a['id']='CLAUSE-'+label;a['properties']=['P07'];a['axes']={'clause':label}
        for tr in a['context']['traces'].values():
            for j in tr['components'].values():j.update(MD2='TRIGGERED',explicitNonMeaningClause=val)
        result.append(a)
    for lifted in (False,True):
        a=copy.deepcopy(base);a['id']='DE4-'+str(lifted);a['properties']=['P12'];a['records'][a['subject']].update(evidenceForm='DE-4',constitutiveExceptionAvailable=lifted);result.append(a)
    # Per-component co-entailment right/wrong W4 supplier binding, one other D
    w,s=world(c,identity,raw,1,2,alternatives=('M1',),altstates=('N',));a=add('COENTAIL-RIGHT',c,w,s,('P10',))
    for tr in a['context']['traces'].values():
        if tr['record']==s.name:tr['components']['c1']['MD3']['M1']='CO_ENTAILS c1'
    # select only alt.c1: component c2 exists in registry but not entailed by F1
    alt=a['records']['E1'];alt['componentSupply']=alt['componentSupply'][:1];alt['missingComponents']=['c2']
    for tr in a['context']['traces'].values():
        if tr['record']=='E1':tr['components']={k:v for k,v in tr['components'].items() if k=='c1'}
    e=next(e for e in a['context']['witness']['F1']['entries'] if e['mechanismPropositionId']=='M1');e.update(entailedComponents=['c1'],missingComponents=['c2'],bases={'c1':'basis'})
    a2=copy.deepcopy(a);a2['id']='COENTAIL-WRONG'
    for tr in a2['context']['traces'].values():
        if tr['record']==s.name:tr['components']['c1']['MD3']['M1']='CO_ENTAILS c2'
    result.append(a2)
    # T1 cannot skip an unclosed fact carried only by an alternative.
    w,s=rebuild(c,identity,raw,scratch,1,2,('M1',),('N',),1,2);a=add('ALT-SECOND-W-ABSENT',c,w,s,('P02',));a['context']['witness'].pop('F2')
    # Frozen NACR positives and mechanism binding negative.
    for mid,label in [('M-RES-ASYMMETRIC-RETENTION','NACR-BOUND'),('M-WORKING-RESULT','NACR-WRONG-M')]:
        w,s=world(CONTRACT,identity,raw,1,1,subject='M-RES-ASYMMETRIC-RETENTION');s.declarations=(('NACR-1',mid,'c3'),)
        add(label,CONTRACT,w,s,('P08',))
    # P15: use actual frozen registry counter map, no synthetic incompatible fact.
    for mode in ('own','lawful-D','lawful-N','no-relation','wrong-leaf','held','indeterminate'):
        mid='M-AUTH-TOPDOWN-EXPLICIT';w,s=world(CONTRACT,identity,raw,1,1,subject=mid)
        # Preserve own SUPPORTS materialization for W3; counter is a separate row.
        ctr=copy.deepcopy(s);ctr.name='COUNTER';ctr.relation='COUNTER_M'
        tt='TT-NTSTP-ES' if mode!='own' else s.targets[0]
        if mode=='wrong-leaf':tt='TT-STPSTJ-ESS'
        ctr.targets=(tt,);w.edges=tuple(list(w.edges)+[ctr]);tr=copy.deepcopy(w.traces[(s.name,s.targets[0])]);tr.edge=ctr.name;tr.target=tt
        if mode=='lawful-N':
            for j in tr.judgments.values():j.negative='TRIGGERED';j.clause=next(iter(sorted(K.clauses(CONTRACT.mechanisms[mid].negative))))
        if mode=='held':tr.provenance=False
        if mode=='indeterminate':ctr.source='CONTENT_INACCESSIBLE'
        w.traces[(ctr.name,tt)]=tr;c15=copy.deepcopy(CONTRACT)
        if mode=='no-relation':c15.counter_of={}
        add('COUNTER-'+mode,c15,w,ctr,('P15','M-COUNTER'),{'relation':'COUNTER_M','counter':mode})
    # Production authority positives / negatives directly reuse semantic synthetic
    # grammar with REAL immutable proposition, never infer new source entailment.
    mapped=json.loads((ROOT/'WORKBENCH/DOWNLOADS/STAGE2_CORR4_PILOT_STAGE1_SOURCE_MAP.json').read_text())['cases']
    m=mapped[0];doc=json.loads(Path(m['recordFile']).read_text());fact=doc[m['recordListKey']][0];fid=fact[m['factIdKey']];side=fact[m['sideIdKey']];text=fact[m['factTextKey']]
    pw,ps=world(CONTRACT,base['authority']['identity'],raw,1,1,subject='M-INSIDER-OUTSIDER-RULE-ASYMMETRY')
    pcase=raw_case('PI3-LAWFUL',CONTRACT,pw,ps,scratch,('P09','M-AUTHORITY','M-CWD'),{'packageAuthority':'PI3'})
    pcase['authority']=None
    identity={k:copy.deepcopy(m[k]) for k in K.BoundaryOracle.KEYS}
    for r in rows(pcase):
        r['factIds']=[fid];r.update(caseId=doc['caseId'],side=side,factualPackageIdentity=copy.deepcopy(identity))
        for sup in r['componentSupply']:sup['factIds']=[fid]
    wi=pcase['context']['witness']['F1'];wi.update(factId=fid,caseId=doc['caseId'],side=side,factualPackageIdentity=copy.deepcopy(identity));pcase['context']['witness']={fid:wi}
    for tr in pcase['context']['traces'].values():
        tr['factIds']=[fid]
        for j in tr['components'].values():j['basis']={'factIds':[fid],'entailmentBasis':{'physical-proposition':text}}
    pcase['context']['factualEvidence']={fid:{'certifiedText':text,'factualPackageIdentity':copy.deepcopy(identity)}};result.append(pcase)
    def change_identity(a,key,val):
        for r in rows(a):r['factualPackageIdentity'][key]=val
        for w in a['context']['witness'].values():w['factualPackageIdentity'][key]=val
        for ev in a['context']['factualEvidence'].values():ev['factualPackageIdentity'][key]=val
    for key in ('scope','temporalContinuityToT0','contradictionState'):
        a=copy.deepcopy(pcase);a['id']='PI3-INJECT-'+key;a['axes']={'packageAuthority':'locator injection'};change_identity(a,'factTextKey',key);change_identity(a,'recordListKey','admittedFacts')
        value=fact.get(key)
        if isinstance(value,str):
            a['context']['factualEvidence'][fid]['certifiedText']=value
            for tr in a['context']['traces'].values():
                for j in tr['components'].values():j['basis']['entailmentBasis']={'injected':value}
        result.append(a)
    for key,val,label in [('recordFileSha256','0'*64,'DIGEST'),('recordFile',str(Path(scratch)/'FAKE.json'),'PATH'),('factIdKey','other','FACTID-LOCATOR'),('sideIdKey','other','SIDE-LOCATOR'),('caseIdKey','other','CASE-LOCATOR')]:
        a=copy.deepcopy(pcase);a['id']='PI3-'+label;change_identity(a,key,val);result.append(a)
    for key,val,label in [('side','WRONG-SIDE','SIDE'),('caseId','WRONG-CASE','CASE')]:
        a=copy.deepcopy(pcase);a['id']='PI3-WRONG-'+label
        for r in rows(a):r[key]=val
        for w in a['context']['witness'].values():w[key]=val
        result.append(a)
    for text2,label in [(text+' altered','ALTERED-TEXT'),(text[:max(1,len(text)//2)],'TRUNCATED-TEXT')]:
        a=copy.deepcopy(pcase);a['id']='PI3-'+label;a['context']['factualEvidence'][fid]['certifiedText']=text2;result.append(a)
    a=copy.deepcopy(pcase);a['id']='PI3-OTHER-FACT-SPAN'
    for tr in a['context']['traces'].values():
        for j in tr['components'].values():j['basis']['entailmentBasis']={'other':doc[m['recordListKey']][1][m['factTextKey']]}
    result.append(a)
    a=copy.deepcopy(pcase);a['id']='PI3-WRONG-FACT'
    for r in rows(a):r['factIds']=['NONMEMBER'];[sup.update(factIds=['NONMEMBER']) for sup in r['componentSupply']]
    wi=next(iter(a['context']['witness'].values()));wi['factId']='NONMEMBER';a['context']['witness']={'NONMEMBER':wi};a['context']['factualEvidence']={'NONMEMBER':a['context']['factualEvidence'][fid]}
    for tr in a['context']['traces'].values():
        tr['factIds']=['NONMEMBER'];[j['basis'].update(factIds=['NONMEMBER']) for j in tr['components'].values()]
    result.append(a)
    for replacement,label in [({'recordFileSha256':m['recordFileSha256']},'BARE-DIGEST'),({k:mapped[1][k] for k in K.BoundaryOracle.KEYS},'OTHER-PACKAGE')]:
        a=copy.deepcopy(pcase);a['id']='PI3-'+label
        for r in rows(a):r['factualPackageIdentity']=copy.deepcopy(replacement)
        for w in a['context']['witness'].values():w['factualPackageIdentity']=copy.deepcopy(replacement)
        for ev in a['context']['factualEvidence'].values():ev['factualPackageIdentity']=copy.deepcopy(replacement)
        result.append(a)
    fakepath=Path(scratch)/'FAKE.json';fakefact=copy.deepcopy(fact);fakefact['proposition']='Invented caller statement, absent from every frozen certified proposition.';fakeraw=json.dumps({'caseId':doc['caseId'],'admittedFacts':[fakefact]},sort_keys=True).encode();fakepath.write_bytes(fakeraw)
    a=copy.deepcopy(pcase);a['id']='PI3-FABRICATED';change_identity(a,'recordFile',str(fakepath));change_identity(a,'packageDir',str(fakepath.parent));change_identity(a,'recordFileSha256',hashlib.sha256(fakeraw).hexdigest());change_identity(a,'recordFileBytes',len(fakeraw));a['context']['factualEvidence'][fid]['certifiedText']=fakefact['proposition']
    for tr in a['context']['traces'].values():
        for j in tr['components'].values():j['basis']['entailmentBasis']={'invented':fakefact['proposition']}
    result.append(a)
    copied=Path(scratch)/'REAL_PACKAGE_COPY.json';copied.write_bytes(Path(m['recordFile']).read_bytes())
    a=copy.deepcopy(pcase);a['id']='PI3-COPIED-REAL-PATH';change_identity(a,'recordFile',str(copied));change_identity(a,'packageDir',str(copied.parent));result.append(a)
    a=copy.deepcopy(pcase);a['id']='PI3-CONTAINMENT';a['trusted_base']=str(Path(scratch));result.append(a)
    # Additional clause quote shape where escaping actually participates in grammar.
    cq=small_contract(2,1);mm=cq.mechanisms['M0'];cq.mechanisms['M0']=K.Mechanism(mm.name,mm.components,mm.environment,mm.comparators,mm.consumers,'Not "test \\"defect\\"; fixed"; not mere inventory.')
    w,s=world(cq,identity if False else base['authority']['identity'],raw,1,1,('N',));add('CLAUSE-ESCAPED',cq,w,s,('P07',),{'clause':'escaped/quoted'})
    # General H5 split/joint supplier shapes and affirmative absence witnesses.
    sid=base['authority']['identity']
    for nf,mode in itertools.product((2,3),('split','joint')):
        cc=small_contract(2,2);ww,ss=world(cc,sid,raw,nf,2,supply_mode=mode)
        add('H5-%d-%s'%(nf,mode),cc,ww,ss,('P10','P02'),{'supply':mode,'subjectFacts':nf})
    for competent in (False,True):
        a=copy.deepcopy(base);a['id']='NEGATES-'+str(competent);a['properties']=['P11'];a['axes']={'relation':'NEGATES_LEAF','absenceCompetent':competent};a['records'][a['subject']].update(relation='NEGATES_LEAF',absenceEvidenceState='COMPETENT_AFFIRMATIVE_ABSENCE' if competent else 'DOCUMENTARY_SILENCE');result.append(a)
    result.extend(corr6_cases(scratch,result))
    return result

def evidence_case(case):
    # Minimal actual executable raw counterexample, not a fixture title. Synthetic
    # authority identity/path/digest are explicit and production cannot accept it.
    return {'subject':case['subject'],'rawRecords':case['records'],'context':{k:([[list(key),value] for key,value in v.items()] if k=='traces' else v) for k,v in case['context'].items()},'authority':case.get('authority'),'trustedBase':case.get('trusted_base'),'registry':native_registry(case['contract'])}

def validate_model(builder):
    raw=(ROOT/MODEL['sources']['registry']['path']).read_bytes();reg=builder.parse_registry(raw.decode())
    matches=all(reg['m'][m]['requiredComponents']==v['components'] and reg['m'][m]['explicitNonMeaning']==v['negative_cell'] and reg['cmp'][m]==v['comparators'] and reg['envOfM'][m]==v['environment'] for m,v in MODEL['mechanisms'].items())
    # Counter pairs are cross-checked by direct literal extraction from E-R8 DATA;
    # model facts are not generated by builder/CVK semantics.
    pair1='M-ADJ-ARGUMENT-QUALITY ↔ M-AUTH-TOPDOWN-EXPLICIT';pair2='M-ADJ-TEST-RESULT ↔ M-AUTH-TOPDOWN-EXPLICIT'
    assert pair1 in raw.decode() and pair2 in raw.decode()
    return {'result':'PASS' if matches and reg['counterOf']==MODEL['counterOf'] and hashlib.sha256(raw).hexdigest()==CONTRACT.registry_identity else 'FAIL','mechanisms':len(reg['m']),'targets':len(reg['tt']),'counterMap':reg['counterOf'],'rawRegistrySha256':hashlib.sha256(raw).hexdigest()}

def parser_checks(builder):
    # Third direct/simple oracle supplies literal known complete clause sets.
    vectors=[('A; B',{'A','B'}),('Not "a; b"; C.',{'Not "a; b"','C'}),('Not “a; b”; C',{'Not “a; b”','C'}),('Not ‘a; b’; C',{'Not ‘a; b’','C'}),('Not "a \\"b\\"; c"; D',{'Not "a \\"b\\"; c"','D'}),('Not "unfinished; X',set()),("Not an organization's inventory; C",{"Not an organization's inventory",'C'})]
    results=[]
    for cell,wanted in vectors:
        left=set(builder._md2_clause_set(cell));right=set(K.clauses(cell));results.append({'cell':cell,'expected':sorted(wanted),'builder':sorted(left),'reference':sorted(right),'pass':left==right==wanted})
    return results

def check_case(builder,case):
    expected=reference(case);got,outputs=execute(builder,case);wanted={t:o.state for t,o in expected.items()}
    mismatch=got!=wanted
    triples={}
    for tt,o in outputs.items():
        e=expected[tt];actual=(o.get('bearingEvaluability'),o.get('supportBearing'),tuple(o.get('bearingIndeterminacyReasons') or ()));required=(e.evaluability,e.bearing,e.reasons)
        if e.state=='HELD':mismatch=mismatch or o.get('supportBearing') is not None
        else:mismatch=mismatch or actual!=required
        triples[tt]={'actual':actual,'expected':required}
    if any(not K.Kernel(case['contract']).contained(o) or builder.assert_environment_safe(o) for o in outputs.values()):mismatch=True
    # Direct categorical expectations do not come from either executable oracle.
    if case['id']=='PI3-LAWFUL':mismatch=mismatch or any(x!='DIRECT_SUPPORT' for x in got.values())
    if case['id'].startswith('PI3-') and case['id']!='PI3-LAWFUL' and not case['id'].startswith('PI3-POSITIVE-'):mismatch=mismatch or any(x!='HELD' for x in got.values())
    if case['id'] in ('NON_ANALYTICAL-NULL','UNMAPPED_OBSERVATION-NULL','NON_ANALYTICAL-METADATA','UNMAPPED_OBSERVATION-METADATA','SIX-NON-ANALYTICAL'):mismatch=mismatch or any(x!='DIRECT_SUPPORT' for x in got.values())
    if case['id']=='COUNTER-lawful-D':mismatch=mismatch or set(got.values())!={'DIRECT_CONTRADICTION'}
    if case['id']=='COUNTER-own':mismatch=mismatch or 'DIRECT_CONTRADICTION' in got.values()
    if 'categorical' in case:mismatch=mismatch or got!=case['categorical'] or wanted!=case['categorical']
    if case.get('expectedHold'):mismatch=mismatch or any(o.get('holdCode')!=case['expectedHold'] for o in outputs.values())
    return {'id':case['id'],'properties':case['properties'],'branch':case['axes'] or case['id'],'expected':wanted,'actual':got,'triples':triples,'result':'FAIL' if mismatch else 'PASS'}

def metamorphic_checks(builder,allcases):
    lookup={x['id']:x for x in allcases};base=lookup['BASE'];results=[]
    def pair(name,left,right,predicate):
        a,_=execute(builder,left);b,_=execute(builder,right);refa={t:o.state for t,o in reference(left).items()};refb={t:o.state for t,o in reference(right).items()}
        results.append({'property':name,'witnessIDs':[left['id'],right['id']],'before':a,'after':b,'referenceBefore':refa,'referenceAfter':refb,'result':'PASS' if a==refa and b==refb and predicate(a,b) else 'FAIL'})
    for typ in ('NON_ANALYTICAL','UNMAPPED_OBSERVATION'):pair('M-NONMAPPED',base,lookup[typ+'-NULL'],lambda a,b:a==b)
    for name,key in [('M-TT-ORDER','treeTargetIds'),('M-FACT-ORDER','factIds')]:
        original=lookup['SUBJECT-D-N'] if key=='treeTargetIds' else lookup['SECOND-FACT-ALTERNATIVE']
        a=copy.deepcopy(original);a['id']=name
        for r in rows(a):r[key]=list(reversed(r[key]))
        pair(name,original,a,lambda a,b:a==b)
    original=lookup['ALT-D-H']
    a=copy.deepcopy(original);a['id']='M-RECORD-ORDER';a['context']['coderOutput']={k:list(reversed(v)) for k,v in reversed(list(a['context']['coderOutput'].items()))};pair('M-RECORD-ORDER',original,a,lambda a,b:a==b)
    pair('M-MISSING-W',base,lookup['W-absent'],lambda a,b:set(b.values())=={'HELD'})
    unresolved=next(x for x in allcases if x['id'].startswith('SHAPE:1:1:1:1:1:I'));pair('M-UNRESOLVED',base,unresolved,lambda a,b:'SHARED_NON_UNIQUE' not in b.values() and 'DIRECT_SUPPORT' not in b.values())
    for key in ('sourceQualityState','edgeState'):
        a=next(x for x in allcases if x['id'].startswith('ENUM:'+key) and repr(x['axes']['value']).endswith(" '") );pair('M-ENUM',base,a,lambda a,b:'DIRECT_SUPPORT' not in b.values())
    pair('M-COUNTER',base,lookup['COUNTER-own'],lambda a,b:'DIRECT_CONTRADICTION' not in b.values())
    for key in ('scope','temporalContinuityToT0','contradictionState'):
        pair('M-LOCATOR',lookup['PI3-LAWFUL'],lookup['PI3-INJECT-'+key],lambda a,b:set(b.values())=={'HELD'})
    # Exact certified proposition itself, separately from the semantic outcome.
    pi=lookup['PI3-LAWFUL'];subject=pi['records'][pi['subject']];fid=subject['factIds'][0]
    auth=builder.ProductionPackageAuthority(ROOT);fact=auth.certify(subject['factualPackageIdentity'],fid,subject['caseId'],subject['side'])
    vals=[]
    for key in ('scope','temporalContinuityToT0','contradictionState'):
        ident=copy.deepcopy(subject['factualPackageIdentity']);ident['factTextKey']=key;hit=auth.certify(ident,fid,subject['caseId'],subject['side']);vals.append(hit.proposition if hit else None)
    results.append({'property':'M-AUTHORITY','witnessIDs':['PI3-LAWFUL','PI3-INJECT-scope','PI3-INJECT-temporalContinuityToT0','PI3-INJECT-contradictionState'],'certifiedProposition':fact.proposition if fact else None,'injectedPropositions':vals,'result':'PASS' if fact is not None and vals==[None]*3 else 'FAIL'})
    return results

def run(builder,scratch):
    global ACTIVE_SCRATCH
    ACTIVE_SCRATCH=Path(scratch).resolve();allcases=cases(ACTIVE_SCRATCH)
    ledger=[check_case(builder,case) for case in allcases];meta=metamorphic_checks(builder,allcases);parsers=parser_checks(builder);model=validate_model(builder)
    coverage={p['PROPERTY_ID']:{'witnessIDs':[],'branches':[],'result':'PASS'} for p in MODEL['properties']}
    for row in ledger:
        for prop in row['properties']:
            x=coverage.setdefault(prop,{'witnessIDs':[],'branches':[],'result':'PASS'});x['witnessIDs'].append(row['id']);x['branches'].append(row['branch']);x['result']='FAIL' if row['result']=='FAIL' else x['result']
    coverage['P03']={'witnessIDs':['SUBJECT-D-N','M-TT-ORDER'],'branches':['mixed TT set permutation'],'result':next(x['result'] for x in meta if x['property']=='M-TT-ORDER')}
    coverage['P04']={'witnessIDs':['SECOND-FACT-ALTERNATIVE','ALT-D-H','M-FACT-ORDER','M-RECORD-ORDER'],'branches':['second-fact alternative and mixed record permutations'],'result':'PASS' if all(x['result']=='PASS' for x in meta if x['property'] in ('M-FACT-ORDER','M-RECORD-ORDER')) else 'FAIL'}
    coverage['P14']={'witnessIDs':[x['id'] for x in ledger],'branches':['recursive output-key containment'],'result':'PASS' if all(x['result']=='PASS' for x in ledger) else 'FAIL'}
    pi3=physical_pi3_controls(builder)
    countfail=pi3['failures']+sum(x['result']=='FAIL' for x in ledger+meta)+sum(not x['pass'] for x in parsers)+int(model['result']!='PASS')
    return {'physicalPI3':pi3,'label':'AUTHOR_SELF_VALIDATION','PROPERTY_CASE_COUNT':len(ledger),'failures':countfail,'caseLedger':ledger,'coverageLedger':coverage,'metamorphicLedger':meta,'thirdOracleParserChecks':parsers,'contractModelValidation':model,'semanticAxes':{'subjectFactCounts':sorted({c['axes']['subjectFacts'] for c in allcases if 'subjectFacts' in c['axes']}),'subjectTTCounts':sorted({c['axes']['subjectTTs'] for c in allcases if 'subjectTTs' in c['axes']}),'alternativeRecordCounts':sorted({len(rows(c))-1 for c in allcases if c['id'].startswith('SHAPE:')}),'alternativeFactCounts':[1,2],'alternativeTTCounts':[1,2],'alternativeStates':['DIRECTIONAL','NON_DIRECTIONAL','HELD','INDETERMINATE','mixed'],'W':['absent','open','closed','malformed']},'expectationDigest':hashlib.sha256(json.dumps(ledger,sort_keys=True).encode()).hexdigest()}
def syn_pc2(scratch):
    """Reconstruct accepted §8/census DATA, never an auditor oracle/harness."""
    source=ROOT/'WORKBENCH/DOWNLOADS/STAGE2_SUPPORTCLASS_EVALUABILITY_SEMANTIC_SEPARATION_1_CORR2_CORR1_CORR1_CORR1_CORR1_2026-10-05'
    census=next(source.glob('*CENSUS.json'));pc=json.loads(census.read_text())['positiveControl'];cert=pc['certifiedText']
    dest=Path(scratch).resolve()/'SYN_PC2_FACT_PACKAGE.json'
    raw=json.dumps({'caseId':'SYN-CORR4','facts':[{'factId':'F1','side':'A','certifiedText':cert}]},sort_keys=True).encode();dest.write_bytes(raw)
    identity={'syntheticAuthority':'CORR6-SYN-PC2-TEST-ONLY','recordFileSha256':hashlib.sha256(raw).hexdigest()}
    ident={'caseId':'SYN-CORR4','side':'A','factualPackageIdentity':identity,'contractIdentity':CONTRACT.registry_identity,'vocabularyVersion':'SYN-PC2','coderIdentity':'AUTHOR_SYNTHETIC'}
    rows=[]
    for data in pc['materializedRecords']:
        mid=data['mechanismPropositionId'];cs=data['componentSupply']
        rows.append(K.Edge(data['recordId'],('F1',),mid,(data['treeTargetId'],),tuple(K.Supply(mid,c,('F1',)) for c in cs),tuple(data['missingComponents']),'SUPPORTS_LEAF','DE-1',copy.deepcopy(ident),edge_state=data['edgeState']))
    entries=tuple(K.Entry(v['mechanismPropositionId'],v['disposition'],tuple(v.get('entailedComponents',())),tuple(v.get('missingComponents',())),v.get('bases')) for v in pc['witness'])
    wi=K.Witness('F1',copy.deepcopy(ident),CONTRACT.registry_identity,entries)
    b={'b1':'In the 1995 brake-design dispute, two competing designs (A and B)','b2':'were put through the same physical road test','b3':'The design retained was determined solely by the measured test result; the other design was discarded.','b4':'Neither rank, status, a prior agreement nor the identity of the proposer decided the choice','b5':'no rule of argument was used to select a better-argued position'}
    traces={}
    for key in ('traceX','traceArgumentQuality','traceDecisionsSeekRelationalSafety'):
        data=pc[key];r=next(r for r in rows if r.name==data['record']);judgments={}
        for comp,j in data['components'].items():
            co={mid:(token.split(' (')[0] if token.startswith('CO_ENTAILS ') else ('UNRESOLVED' if token.startswith('UNRESOLVED') else token)) for mid,token in j['MD3'].items()}
            judgments[comp]=K.Judgment(('F1',),{name:b[name] for name in j['basis'].split('+')},'NOT_TRIGGERED',None,co)
        traces[(r.name,r.targets[0])]=K.Trace(r.name,r.targets[0],r.mechanism,r.facts,CONTRACT.registry_identity,ident['coderIdentity'],tuple(data['universe']),judgments,True)
    return K.World(tuple(rows),{'F1':K.Fact('F1',cert,copy.deepcopy(identity),raw)},{'F1':wi},traces,True,CONTRACT.registry_identity),next(r for r in rows if r.mechanism=='M-ADJ-TEST-RESULT')


def regression_replay(builder,scratch):
    """Separate REGRESSION_EVIDENCE. Prior findings supply failure descriptions
    only; these are disclosed declarative reconstructions, not byte-exact old
    harness inputs. Accepted PC and immutable historical view are replayed as data.
    """
    identity,raw=package(scratch);rows=[]
    for cid,c,w,s in []:
        exp={t:o.state for t,o in expected(c,w,s).items()};got,out=observed(builder,c,w,s)
        rows.append({'id':'REGRESSION:'+cid,'pass':exp==got,'expected':exp,'actual':got})
    w,s=syn_pc2(scratch);exp=expected(CONTRACT,w,s);got,out=observed(builder,CONTRACT,w,s)
    pc_ok=all(o.state=='DIRECT_SUPPORT' and o.uniqueness=='U-1' for o in exp.values()) and all(v=='DIRECT_SUPPORT' for v in got.values()) and all(o.get('b3ComponentVerdicts',{}).get('c2')=='DISTINGUISHING' for o in out.values()) and all(o.get('b3ComponentVerdicts',{}).get(cc)=='NON_DISTINGUISHING' for o in out.values() for cc in ('c1','c3','c4'))
    rows.append({'id':'SYN-PC2','pass':pc_ok,'expected':'DIRECT_SUPPORT/U-1; c2 alone distinguishing','actual':got})
    # F03: separate EV from bearing on missing ordinary assessable components.
    nw,ns=world(CONTRACT,identity,raw,1,1,subject='M-RES-ASYMMETRIC-RETENTION');ns.declarations=(('NACR-1',ns.mechanism,'c3'),)
    got,_=observed(builder,CONTRACT,nw,ns);f03=all(v=='INDETERMINATE' for v in got.values())
    aw,asub=world(CONTRACT,identity,raw,1,1,subject='M-WORKING-RESULT');got,_=observed(builder,CONTRACT,aw,asub);f03=f03 and all(v=='DIRECT_SUPPORT' for v in got.values())
    ns.declarations=(('NACR-1','M-WORKING-RESULT','c3'),);got,_=observed(builder,CONTRACT,nw,ns);f04=all(v=='HELD' for v in got.values())
    f05=all(bool(builder.assert_environment_safe({'nested':{key:1}})) for key in ('Environment','ENVIRONMENTASSIGNMENT','ECs','Pair','Friction'))
    view=ROOT/'WORKBENCH/DOWNLOADS/STAGE2_EFFECTIVE_VIEW_ASSEMBLY_1_CORR1_2026-10-05/STAGE2_EFFECTIVE_VIEW_ASSEMBLY_1_RECORDS.jsonl'
    historical=[json.loads(l) for l in view.read_text().splitlines() if l.strip()]
    reg_source=ROOT/MODEL['sources']['registry']['path'];reg=builder.parse_registry(reg_source.read_text())
    migration=ROOT/'WORKBENCH/DOWNLOADS/STAGE2_SUPPORTCLASS_EVALUABILITY_SEMANTIC_SEPARATION_1_IMPLEMENTATION_1_2026-10-05/STAGE2_SUPPORTCLASS_EVALUABILITY_SEMANTIC_SEPARATION_1_IMPLEMENTATION_1_MIGRATION_CONTRACT.json'
    mc=json.loads(migration.read_text());first=builder.build_successor_view(historical,reg,mc,CONTRACT.registry_identity);second=builder.build_successor_view(copy.deepcopy(historical),reg,copy.deepcopy(mc),CONTRACT.registry_identity)
    digest=lambda x:hashlib.sha256(json.dumps(x,sort_keys=True,ensure_ascii=False).encode()).hexdigest()
    a001=next(e for e in first['ledger'] if e['edgeId']=='A-E001');a023=next(e for e in first['ledger'] if e['edgeId']=='A-E023')
    # F06: execute the existing SEP-MIG-8 machinery on a synthetic multi-TT row,
    # with native §I record shape. No final effective view is persisted.
    c=small_contract();ww,ss=world(c,identity,raw,1,1,('D','N'));rs,ctx=native(ww);r=rs[ss.name];r['recordType']='SECTION_I_RECORD';r['supportClass']='DIRECT_SUPPORT'
    split=builder.build_successor_view([r],native_registry(c),mc,c.registry_identity)
    f06=len(split['ledger'])==len(ss.targets) and all(e.get('splitVia')=='SEP-MIG-8' and e.get('boundTreeTargetId') in ss.targets for e in split['ledger'])
    frozen_parser=all(reg['m'][m]['requiredComponents']==v['components'] and reg['m'][m]['explicitNonMeaning']==v['negative_cell'] and reg['cmp'][m]==v['comparators'] and reg['envOfM'][m]==v['environment'] for m,v in MODEL['mechanisms'].items())
    return {'label':'REGRESSION_REPLAY / SELF_VALIDATION','fixture_provenance':'descriptions reconstructed without imported/copied prior oracle/harness; SYN-PC2 from accepted census data; historical view byte-exact','cases':len(rows),'failures':sum(not r['pass'] for r in rows)+sum(not ok for ok in (f03,f04,f05,f06,frozen_parser,first==second,a001['projectionClass']=='RE_ADJUDICATION' and a001['migrationRuleId']=='SEP-MIG-6c' and a001['successorTriple']==[None,None,None] and a001['holdCode']=='HOLD-T',a023['successorTriple']==['EVALUABLE',None,'NON_DISCRIMINATING'])),'rows':rows,'F03_PRESERVED':'PASS' if f03 else 'FAIL','F04_PRESERVED':'PASS' if f04 else 'FAIL','F05_PRESERVED':'PASS' if f05 else 'FAIL','F06_PRESERVED':'PASS' if f06 else 'FAIL','SYN_PC2':'PASS' if pc_ok else 'FAIL','A_E023_GENERAL_DE4':'PASS' if a023['successorTriple']==['EVALUABLE',None,'NON_DISCRIMINATING'] else 'FAIL','A_E001_REMAINS_READJUDICATION':'YES' if a001['projectionClass']=='RE_ADJUDICATION' and a001['migrationRuleId']=='SEP-MIG-6c' and a001['successorTriple']==[None,None,None] and a001['holdCode']=='HOLD-T' else 'NO','A_E001_ADJUDICATED':'NO','A_E001_BOUNDARY':a001,'IDENTICAL_INPUT_DETERMINISM':'PASS' if first==second else 'FAIL','historicalProjectionCounts':first['counts'],'historicalProjectionDigest':digest(first),'historicalViewSha256':hashlib.sha256(view.read_bytes()).hexdigest(),'FROZEN_REGISTRY_ADAPTER_AGREEMENT':'PASS' if frozen_parser else 'FAIL','final_effective_view_assembled':False}



# CORR7 authored from frozen invariants. No IV fixture/harness is imported.
C7_INVARIANTS={
 'XW3':'registry H-5/§I; cor1 §6.5 W-4 supplying-fact identity',
 'XW4':'cor1 §6.5 W-4: witness entry for ITS M; accepted §7.1',
 'XW5':'registry H-5/§I per-entry supplying fact; cor1 W-3 vs W-4',
 'XP2':'field_source_matrix PI-3 NOTE; registry H-1; cor1 W-2/T-2 type-exact identity',
 'XO6':'accepted §14 Decision 3; cor1 §9.3 B-1a precedes B-2 in every direction',
 'XO7':'accepted §6.3 AV-1; cor1 §6.7: valid NACR explains ND, CONDITION_NOT_MET does not',
 'XO9':'registry §E/H-2/§I: non-mapped rows cannot conceal analytical content',
 'HOLD':'accepted §10 S6 before S7; §7.1 U-X; cor1 §6.7/§9.5/§12'
}

def corr7_cases(scratch, existing):
    made=[];identity,raw=package(scratch);byid={a['id']:a for a in existing}
    def add(a,cid,family,axes,wanted,hold=None):
        a['id']=cid;a['c7Family']=family;a['frozenInvariant']=C7_INVARIANTS[family]
        a['axes']=axes;a['properties']=['P10','P02'] if family.startswith('XW') else ['P09'] if family=='XP2' else ['P12'] if family=='XO6' else ['P08'] if family=='XO7' else ['P06'] if family=='XO9' else ['P01','P02','P10']
        a['categorical']={t:wanted for t in a['records'][a['subject']]['treeTargetIds']}
        if hold:a['expectedHold']=hold;a['holdOracle']=True
        made.append(a);return a
    def fresh(nf=1,nt=1,nc=1,als=(),states=(),contract=None,sub='M0'):
        c=copy.deepcopy(contract or small_contract(3,nt));w,s=world(c,identity,raw,nf,nc,alternatives=als,altstates=states,subject=sub,supply_mode='joint')
        return raw_case('c7',c,w,s,scratch)
    def set_ent(a,f,mid,cs):
        e=next(e for e in a['context']['witness'][f]['entries'] if e['mechanismPropositionId']==mid)
        e.update(disposition='SELECTED' if cs else 'NOT_SELECTABLE',entailedComponents=list(cs),missingComponents=sorted(a['contract'].mechanisms[mid].components-set(cs)),bases={c:'explicit author judgment' for c in cs} if cs else None)
    def repair_traces(a):
        # New trace judgments are independently stated. Supply membership defines
        # the trace basis, never the expected analytic result.
        c=a['contract'];a['context']['traces']={}
        for r in rows(a):
            if r['relevanceState']!='ANALYTICAL_MAPPED':continue
            mid=r['mechanismPropositionIds'][0]
            selected={e['mechanismPropositionId'] for f in r['factIds'] for e in a['context']['witness'][f]['entries'] if e['disposition']=='SELECTED'}
            uni=sorted(c.mechanisms[mid].comparators|{m for m in selected if c.mechanisms[m].environment!=c.mechanisms[mid].environment})
            for tt in r['treeTargetIds']:
                js={s['componentId']:{'basis':{'factIds':list(s['factIds']),'entailmentBasis':{f:a['context']['factualEvidence'][f]['certifiedText'] for f in s['factIds']}},'MD2':'NOT_TRIGGERED','explicitNonMeaningClause':None,'MD3':{m:'NO_CO_ENTAILMENT' for m in uni}} for s in r['componentSupply']}
                a['context']['traces'][(r['edgeId'],tt)]={'record':r['edgeId'],'treeTargetId':tt,'mechanismPropositionId':mid,'factIds':list(r['factIds']),'registryIdentity':c.registry_identity,'coderIdentity':r['coderIdentity'],'universe':uni,'components':js,'judgmentFlags':{'MD1':{},'MD2':{},'MD3':{}}}
    def attribution(nf,position,rel,valid,nt):
        a=fresh(nf,nt);c=a['contract'];m=c.mechanisms['M1'];c.mechanisms['M1']=K.Mechanism(m.name,m.components,'E0',m.comparators,m.consumers,m.negative)
        supplier='F'+str(position);x=a['records'][a['subject']]
        if not valid:
            x['factIds']=[supplier]
            for s in x['componentSupply']:s['factIds']=[supplier]
            for f in a['context']['witness']:
                if f!=supplier:set_ent(a,f,'M0',[])
        ctr=copy.deepcopy(x);ctr.update(edgeId='C7-SHARED-RECORD',factIds=['F'+str(i) for i in range(1,nf+1)],relation=rel,mechanismPropositionIds=['M1'],treeTargetIds=['T0_0'] if rel=='COUNTER_M' else sorted(m.consumers))
        ctr['componentSupply']=[dict(x['componentSupply'][0],mechanismPropositionId='M1',factIds=[supplier])];ctr['missingComponents']=sorted(m.components-{'c1'})
        c.counter_of['M1']=['M0'];a['context']['coderOutput']['shared']=[ctr]
        if valid:
            set_ent(a,supplier,'M1',['c1']);support=copy.deepcopy(ctr);support.update(edgeId='C7-MATERIALIZED-SUPPLIER',factIds=[supplier],relation='SUPPORTS_LEAF',treeTargetIds=sorted(m.consumers));a['context']['coderOutput']['material']=[support]
            if rel=='SUPPORTS_LEAF':
                # W-3 requires selected materialization for all carried facts;
                # the distinct lawful multi-fact positive uses COUNTER/NEGATES.
                ctr['factIds']=[supplier]
        repair_traces(a);return refresh(a)
    for nf,pos,rel,nt in [(1,1,'COUNTER_M',1),(2,1,'COUNTER_M',1),(2,2,'COUNTER_M',1),(3,1,'COUNTER_M',2),(3,2,'COUNTER_M',2),(3,3,'COUNTER_M',2),(2,2,'NEGATES_LEAF',2),(3,2,'SUPPORTS_LEAF',1)]:
        for valid in (True,False):
            a=attribution(nf,pos,rel,valid,nt)
            family='XW5' if valid else 'XW3'
            add(a,f'C7-{family}-{nf}-{pos}-{rel}-{valid}',family,{'recordFactCount':nf,'supplierPosition':pos,'supplyRelation':rel,'valid':valid},'DIRECT_SUPPORT' if valid else 'HELD',None if valid else 'HOLD-U')
    # XW3 direct positive is also explicitly labelled for regression/neighbor ledger.
    for nf,pos in [(2,2),(3,2),(3,3)]:
        add(attribution(nf,pos,'COUNTER_M',True,2),f'C7-XW3-POS-{nf}-{pos}','XW3',{'supplierPosition':pos,'recordFactCount':nf,'valid':True},'DIRECT_SUPPORT')
    # Per-M entailment cannot be borrowed from a different selected M. Keep all
    # other records lawful: the contradictory component occurs on a counter row.
    for nc,nt,component in [(2,1,'c2'),(3,2,'c3')]:
        a=fresh(1,nt,1,('M1','M2'),('N','N'));c=a['contract']
        for mid in ('M1','M2'):
            m=c.mechanisms[mid];c.mechanisms[mid]=K.Mechanism(m.name,m.components,'E0',m.comparators,m.consumers,m.negative)
        m2=a['records']['E2'];m2['componentSupply'][0]['componentId']=component;m2['missingComponents']=sorted(c.mechanisms['M2'].components-{component});set_ent(a,'F1','M2',[component])
        extra=copy.deepcopy(a['records']['E1']);extra.update(edgeId='C7-PER-M-COUNTER',relation='COUNTER_M',treeTargetIds=['T0_0']);extra['componentSupply'][0]['componentId']=component;extra['missingComponents']=sorted(c.mechanisms['M1'].components-{component});c.counter_of['M1']=['M0'];a['context']['coderOutput']['per-m']=[extra];repair_traces(a)
        bad=copy.deepcopy(a);add(refresh(bad),f'C7-XW4-BORROW-{component}-{nt}','XW4',{'component':component,'mechanismRelation':'different selected M'},'HELD','HOLD-U')
        a['records']['E1']['componentSupply'].append(dict(a['records']['E1']['componentSupply'][0],componentId=component));a['records']['E1']['missingComponents']=sorted(c.mechanisms['M1'].components-{'c1',component});set_ent(a,'F1','M1',['c1',component]);repair_traces(a)
        add(refresh(a),f'C7-XW4-OWN-{component}-{nt}','XW4',{'component':component,'mechanismRelation':'same M'},'DIRECT_SUPPORT')
    # Wrong/duplicate supply: already represented in CORR6, add exact-code neighbors.
    for typ in ('wrong','duplicate','nonselected'):
        a=fresh();x=a['records'][a['subject']];anc=copy.deepcopy(x);anc.update(edgeId='C7-COMPONENT',relation='NEGATES_LEAF')
        if typ=='wrong':anc['componentSupply'][0]['componentId']='c3';anc['missingComponents']=['c1','c2']
        if typ=='duplicate':
            wrong=dict(anc['componentSupply'][0],componentId='c2');anc['componentSupply'] += [wrong,copy.deepcopy(wrong)];anc['missingComponents']=['c3']
        if typ=='nonselected':anc['mechanismPropositionIds']=['M1'];anc['treeTargetIds']=['T1_0'];anc['componentSupply'][0]['mechanismPropositionId']='M1'
        a['context']['coderOutput']['extra']=[anc];add(refresh(a),'C7-XW4-'+typ,'XW4',{'component':typ},'HELD','HOLD-U')
    pi=byid['PI3-POSITIVE-A01-verbatim']
    for key in ('packageFactCount','packageSideCount'):
        original=pi['records'][pi['subject']]['factualPackageIdentity'][key]
        for label,value in [('int',original),('float',float(original)),('bool',True),('string',str(original)),('null',None)]:
            a=copy.deepcopy(pi);ident=copy.deepcopy(a['records'][a['subject']]['factualPackageIdentity']);ident[key]=value;replace_package(a,ident)
            add(a,f'C7-XP2-{key}-{label}','XP2',{'identityMember':key,'numericType':label},'DIRECT_SUPPORT' if label=='int' else 'HELD',None if label=='int' else 'HOLD-T')
    # Python 1==True is exercised without inventing a physical count-one package.
    # This is a comparison law, explicitly separate from physical certification.
    for left,right,label in [(1,True,'int-bool'),(False,0,'bool-int'),(1,1.0,'int-float'),(1,'1','int-string')]:
        a=copy.deepcopy(pi);a['typePair']=(left,right)
        add(a,'C7-XP2-COMPARISON-'+label,'XP2',{'typedEquality':label},'DIRECT_SUPPORT')
    for mode in ('lawful-D','lawful-N'):
        a=copy.deepcopy(byid['COUNTER-'+mode]);a['records'][a['subject']]['evidenceForm']='DE-4'
        add(a,'C7-XO6-'+mode,'XO6',{'DE4Relation':'COUNTER_M','uncappedDirection':mode},'NON_DISCRIMINATING')
    for form in ('DE-1','DE-4'):
        a=copy.deepcopy(byid['COUNTER-lawful-D']);r=a['records'][a['subject']];oldtt=r['treeTargetIds'][0];newtt='TT-NFNT-CORE';r.update(treeTargetIds=[newtt],evidenceForm=form)
        tr=a['context']['traces'].pop((r['edgeId'],oldtt));tr['treeTargetId']=newtt;a['context']['traces'][(r['edgeId'],newtt)]=tr
        add(a,'C7-XO6-NFNT-'+form,'XO6',{'DE4Relation':'COUNTER_M','counterTarget':newtt,'form':form},'NON_DISCRIMINATING' if form=='DE-4' else 'DIRECT_CONTRADICTION')
    a=fresh(nt=2);a['records'][a['subject']]['evidenceForm']='DE-4';add(a,'C7-XO6-SUPPORT','XO6',{'DE4Relation':'SUPPORTS_LEAF'},'NON_DISCRIMINATING')
    for nt in (1,2):
        a=fresh(nf=nt,nt=nt,contract=CONTRACT,sub='M-RES-ASYMMETRIC-RETENTION');r=a['records'][a['subject']];r['edgeState']='NOT_DETERMINABLE'
        for code,source,wanted,hold in [('NACR-1:CONDITION_NOT_MET','COMPETENT','HELD','HOLD-ND'),('NACR-1','COMPETENT','INDETERMINATE',None),('NACR-1:CONDITION_NOT_MET','CONTENT_INACCESSIBLE','INDETERMINATE',None),(None,'COMPETENT','HELD','HOLD-ND')]:
            q=copy.deepcopy(a);qr=q['records'][q['subject']];qr['sourceQualityState']=source;qr['abstention']={'declarations':[{'code':code,'mechanismPropositionId':qr['mechanismPropositionIds'][0],'componentId':'c3'}]} if code else None
            add(q,f'C7-XO7-{nt}-{code}-{source}','XO7',{'AV1Cause':code or 'none','source':source},wanted,hold)
    for kind in ('NON_ANALYTICAL','UNMAPPED_OBSERVATION'):
        for payload in ('empty','M','TT','supply','fully-identified-supply'):
            a=fresh(nt=2);hidden=copy.deepcopy(a['records'][a['subject']]);hidden.update(edgeId='C7-FULLY-IDENTIFIED-NONMAPPED',relevanceState=kind)
            if payload=='empty':hidden.update(factIds=['UNRELATED'],mechanismPropositionIds=None,treeTargetIds=None,componentSupply=None)
            elif payload=='M':hidden.update(treeTargetIds=None,componentSupply=None)
            elif payload=='TT':hidden.update(mechanismPropositionIds=None,componentSupply=None)
            elif payload=='supply':hidden.update(mechanismPropositionIds=None,treeTargetIds=None)
            a['context']['coderOutput']['hidden']=[hidden]
            add(refresh(a),f'C7-XO9-{kind}-{payload}','XO9',{'nonmappedPayload':payload,'ordinaryIdentity':'complete and lawful','relevance':kind},'DIRECT_SUPPORT' if payload=='empty' else 'HELD',None if payload=='empty' else 'HOLD-U')
    for nt in (1,2):
        base=fresh(nt=nt)
        add(copy.deepcopy(base),f'C7-HOLD-CLOSED-{nt}','HOLD',{'holdPrecedence':'closed control'},'DIRECT_SUPPORT')
        for wfail in ('W1','W2','W3','W4'):
            a=copy.deepcopy(base)
            if wfail=='W1':a['context']['witness']['F1']['entries'].pop()
            if wfail=='W2':a['context']['witness']['F1']['vocabularyVersion']='FOREIGN'
            if wfail=='W3':a['records'][a['subject']]['treeTargetIds']=a['records'][a['subject']]['treeTargetIds'][:1] if nt==2 else ['T0_0'];m=a['contract'].mechanisms['M0'];a['contract'].mechanisms['M0']=K.Mechanism(m.name,m.components,m.environment,m.comparators,m.consumers|{'T0_EXTRA'},m.negative);a['contract'].targets['T0_EXTRA']=K.Target('T0_EXTRA',frozenset({'M0'}),True)
            if wfail=='W4':set_ent(a,'F1','M0',['c1','c2'])
            add(copy.deepcopy(a),f'C7-HOLD-{wfail}-{nt}','HOLD',{'holdPrecedence':'W only','WFailure':wfail},'HELD','HOLD-U')
            for tr in a['context']['traces'].values():tr['judgmentFlags']={}
            add(a,f'C7-HOLD-T-AND-{wfail}-{nt}','HOLD',{'holdPrecedence':'T + W','WFailure':wfail},'HELD','HOLD-T')
        a=copy.deepcopy(base)
        for tr in a['context']['traces'].values():tr['components']={}
        add(a,f'C7-HOLD-T-ONLY-{nt}','HOLD',{'holdPrecedence':'T only'},'HELD','HOLD-T')
    for label,value in [('null',None),('list',[]),('entries-null',{'entries':None}),('string','malformed witness')]:
        a=fresh();a['context']['witness']['F1']=value
        add(a,'C7-HOLD-W1-MALFORMED-'+label,'HOLD',{'holdPrecedence':'W only','WFailure':'W1','witnessShape':label},'HELD','HOLD-U')
    return made

_corr6_cases_preserved=cases
def cases(scratch):
    old=_corr6_cases_preserved(scratch)
    assert len(old)==479
    return old+corr7_cases(scratch,old)

_bearing_check=check_case
def check_case(builder,case):
    row=_bearing_check(builder,case);refs=reference(case);_,out=execute(builder,case)
    axes={name:False for name in ('bearingMismatch','evaluabilityMismatch','directionMismatch','uniquenessMismatch','holdCodeMismatch','certificationMismatch','boundaryMismatch')}
    exact={};world,edge=canonical(case)
    for tt,actual in out.items():
        e=refs[tt]
        axes['bearingMismatch']|=actual.get('supportBearing')!=e.bearing
        if e.state!='HELD':
            axes['evaluabilityMismatch']|=actual.get('bearingEvaluability')!=e.evaluability
            d=actual.get('b3RecordVerdict')
            if actual.get('capFired') and e.direction=='NON_DIRECTIONAL':d='NON_DIRECTIONAL'
            if e.direction is not None:axes['directionMismatch']|=d!=e.direction
            if e.uniqueness is not None:axes['uniquenessMismatch']|=not str(actual.get('uniquenessBasis') or '').startswith(e.uniqueness)
        axes['boundaryMismatch']|=not K.Kernel(case['contract']).contained(actual) or bool(builder.assert_environment_safe(actual))
    if case.get('c7Family')=='XP2':
        r=case['records'][case['subject']];f=r['factIds'][0]
        actual=builder.ProductionPackageAuthority(ROOT).certify(r['factualPackageIdentity'],f,r['caseId'],r['side'])
        expected,_=K.BoundaryOracle(MODEL,ROOT).proposition(r['factualPackageIdentity'],f,r['caseId'],r['side'])
        axes['certificationMismatch']|=(actual is not None)!=(expected is not None)
    if 'typePair' in case:
        left,right=case['typePair'];same=builder._canon(left)==builder._canon(right)
        axes['certificationMismatch']|=same!=K.typed_equal(left,right)
        row['typeComparison']={'left':left,'right':right,'expectedEqual':False,'actualEqual':same,'physicalCertificationClaim':False}
    row['mismatchAxes']=axes;row['holdCodeComparison']=exact
    if case.get('c7Family'):row.update(c7Family=case['c7Family'],frozenInvariant=case['frozenInvariant'])
    if any(axes.values()):row['result']='FAIL'
    return row

_original_run=run
def run(builder,scratch):
    result=_original_run(builder,scratch)
    result['NEW_PROPERTY_CASE_COUNT']=result['PROPERTY_CASE_COUNT']-479
    result['mismatchTotals']={axis:sum(row['mismatchAxes'][axis] for row in result['caseLedger']) for axis in result['caseLedger'][0]['mismatchAxes']}
    return result


# CORR8 branch closure: accepted §10 / §6.3 AV-4/5 / §7.1 U-X; CORR1 §9.3/9.5/12.
C8_AUTHORITY='accepted 2f595ab5ddecc7e8149f751c661470bbae1fa3abfb1fb207b2b65c4c4565d6c8 §10; CORR1 §9.3/9.5/12'
def c8_entry(a,f,mid,cs):
 e=next(e for e in a['context']['witness'][f]['entries'] if e['mechanismPropositionId']==mid);e.update(disposition='SELECTED' if cs else 'NOT_SELECTABLE',entailedComponents=list(cs),missingComponents=sorted(a['contract'].mechanisms[mid].components-set(cs)),bases={x:'explicit synthetic judgment' for x in cs} if cs else None)
def c8_retrace(a,states=None):
 c=a['contract'];a['context']['traces']={};states=states or {}
 for r in rows(a):
  if r['relevanceState']!='ANALYTICAL_MAPPED':continue
  mid=r['mechanismPropositionIds'][0];sel={e['mechanismPropositionId'] for f in r['factIds'] for e in a['context']['witness'][f]['entries'] if e['disposition']=='SELECTED'};uni=sorted(c.mechanisms[mid].comparators|{m for m in sel if c.mechanisms[m].environment!=c.mechanisms[mid].environment})
  for tt in r['treeTargetIds']:
   d=states.get((r['edgeId'],tt),'D');js={}
   for s in r['componentSupply']:
    js[s['componentId']]={'basis':{'factIds':list(s['factIds']),'entailmentBasis':{f:a['context']['factualEvidence'][f]['certifiedText'] for f in s['factIds']}},'MD2':'NOT_TRIGGERED','explicitNonMeaningClause':None,'MD3':{} if d=='H' else {m:'UNRESOLVED' if d=='N' else 'NO_CO_ENTAILMENT' for m in uni}}
   a['context']['traces'][(r['edgeId'],tt)]={'record':r['edgeId'],'treeTargetId':tt,'mechanismPropositionId':mid,'factIds':list(r['factIds']),'registryIdentity':c.registry_identity,'coderIdentity':r['coderIdentity'],'universe':uni,'components':js,'judgmentFlags':{'MD1':{},'MD2':{},'MD3':{}}}
 return refresh(a)
def c8_fresh(scratch,rel='SUPPORTS_LEAF',d='D',nt=1,nf=1,frozen=False):
 ident,raw=package(scratch);c=copy.deepcopy(CONTRACT if frozen else small_contract(3,nt));mid=('M-AUTH-TOPDOWN-EXPLICIT' if rel=='COUNTER_M' else 'M-ADJ-TEST-RESULT') if frozen else 'M0';w,s=world(c,ident,raw,nf,1,subject=mid,supply_mode='joint');a=raw_case('C8',c,w,s,scratch);r=a['records'][a['subject']];r['relation']=rel
 if rel=='COUNTER_M':
  mat=copy.deepcopy(r);mat.update(edgeId='C8-COUNTER-MATERIAL',relation='SUPPORTS_LEAF');a['context']['coderOutput']['material']=[mat]
  if not frozen:c.counter_of[mid]=['M1']
  r['treeTargetIds']=['TT-NTSTP-ES'] if frozen else sorted(c.mechanisms['M1'].consumers)
 return c8_retrace(a,{(r['edgeId'],t):d for t in r['treeTargetIds']})
def c8_break(a,kind,f=None):
 r=a['records'][a['subject']];f=f or r['factIds'][0];c=a['contract'];mid=r['mechanismPropositionIds'][0];w=a['context']['witness'][f]
 if kind=='W1':w['entries'].remove(next(e for e in w['entries'] if e['disposition']=='NOT_SELECTABLE'))
 elif kind=='W2':w['vocabularyVersion']='different-W2-vocabulary'
 elif kind=='W3':
  eligible=[m for m in c.mechanisms if m!=mid and all(m!=x['mechanismPropositionIds'][0] for x in rows(a))];same=[m for m in eligible if c.mechanisms[m].environment==c.mechanisms[mid].environment];other=(same or eligible)[0]
  if not same:
   assert set(c.mechanisms)=={'M0','M1','M2'},'frozen registry is immutable in witnesses'
   mm=c.mechanisms[other];c.mechanisms[other]=K.Mechanism(mm.name,mm.components,c.mechanisms[mid].environment,mm.comparators,mm.consumers,mm.negative)
  c8_entry(a,f,other,['c1'])
 elif kind in ('W4','W4c'):
  x=copy.deepcopy(r);x.update(edgeId='C8-W4-SUPPLY',relation='COUNTER_M' if kind=='W4c' else 'NEGATES_LEAF',factIds=[f]);sup=copy.deepcopy(x['componentSupply'][0]);sup.update(componentId='c2',factIds=[f]);x['componentSupply']=[sup];x['missingComponents']=sorted(c.mechanisms[mid].components-{'c2'});a['context']['coderOutput']['broken-supply']=[x]
 else:raise ValueError(kind)
 return refresh(a)
def c8_expect(a,cid,fam,wanted,hold=None,iv1=None):
 a.update(id=cid,c8Family=fam,frozenInvariant=C8_AUTHORITY,properties=['P01','P02','P03','P04','P06','P08','P09','P10','P12','P13','P15']);ts=a['records'][a['subject']]['treeTargetIds'];a['categorical']=wanted if isinstance(wanted,dict) else {t:wanted for t in ts};a['expectedHoldCodes']=hold if isinstance(hold,dict) else {t:hold for t in ts}
 if iv1:a['iv1LeakID']=iv1;a['useFrozenRegistry']=True
 return a
def corr8_cases(scratch,existing):
 made=[];byid={a['id']:a for a in existing};wf=('W1','W2','W3','W4','W4c')
 for k in wf:made.append(c8_expect(c8_break(c8_fresh(scratch,d='N',frozen=True),k),'C8-L1-'+k,'L1','NON_DISCRIMINATING',iv1='H-XN-T0-'+k))
 for k in wf:
  for d in ('D','N'):
   fam='L2' if k in wf[:3] else 'L3';made.append(c8_expect(c8_break(c8_fresh(scratch,'COUNTER_M',d,frozen=True),k),'C8-'+fam+'-'+d+'-'+k,fam,'DIRECT_CONTRADICTION' if d=='D' else 'NON_DISCRIMINATING',iv1='H-C'+d+'-T0-'+k))
 for k in wf[3:]:
  for d in ('D','N'):
   a=c8_break(c8_fresh(scratch,'COUNTER_M',d,frozen=True),k)
   for (e,t),tr in a['context']['traces'].items():
    if e==a['subject']:
     for j in tr['components'].values():j['MD3']={}
   made.append(c8_expect(a,'C8-L4-'+d+'-'+k,'L4','HELD','HOLD-T','H-C'+d+'-T1-'+k))
 # Exact ALTG-W3: the subject's F1 W is closed; alternative F2 W is open.
 ident,raw=package(scratch);c=copy.deepcopy(CONTRACT);w,s=world(c,ident,raw,2,1,subject='M-ADJ-TEST-RESULT',alternatives=('M-AUTH-TOPDOWN-EXPLICIT',),altstates=('D',),supply_mode='joint');a=raw_case('C8',c,w,s,scratch);r=a['records'][a['subject']];r['factIds']=['F1'];r['componentSupply'][0]['factIds']=['F1'];c8_entry(a,'F2',s.mechanism,[]);alt=a['records']['E1'];alt['factIds']=['F1','F2'];alt['componentSupply'][0]['factIds']=['F1','F2'];c8_entry(a,'F2',alt['mechanismPropositionIds'][0],['c1']);c8_retrace(a);c8_break(a,'W3','F2');c8_retrace(a);made.append(c8_expect(a,'C8-L5-ALT-OTHER-FACT-W3','L5','SHARED_NON_UNIQUE',iv1='ALTG-W3'))
 for rel in ('SUPPORTS_LEAF','COUNTER_M'):
  for d in ('D','N','H'):
   for k in ('closed',)+wf:
    for nt,nf in ((1,1),(2,3)):
     a=c8_fresh(scratch,rel,d,nt,nf)
     if k!='closed':c8_break(a,k,'F'+str(nf))
     bearing='HELD' if d=='H' else ('NON_DISCRIMINATING' if d=='N' else ('DIRECT_CONTRADICTION' if rel=='COUNTER_M' else ('DIRECT_SUPPORT' if k=='closed' else 'HELD')));hold='HOLD-T' if d=='H' else ('HOLD-U' if bearing=='HELD' else None);a['axes']={'relation':rel,'direction':d,'W':k,'subjectFacts':nf,'subjectTTs':nt};made.append(c8_expect(a,f'C8-NEIGHBOR-{rel}-{d}-{k}-{nt}-{nf}','GENERAL',bearing,hold))
 for k in wf:
  for stage in ('ND','AMB','NA','EV','DE4','NEG'):
   a=c8_break(c8_fresh(scratch),k);r=a['records'][a['subject']];expected='HELD';hold=None
   if stage=='ND':r['edgeState']='NOT_DETERMINABLE';hold='HOLD-ND'
   elif stage=='AMB':r['edgeState']='AMBIGUOUS';hold='HOLD-AMB'
   elif stage=='NA':r['abstention']={'declarations':[{'code':'UNKNOWN-CODE','mechanismPropositionId':'M0','componentId':'c2'}]};hold='HOLD-NA'
   elif stage=='EV':r['sourceQualityState']='CONTENT_INACCESSIBLE';expected='INDETERMINATE'
   elif stage=='DE4':r['evidenceForm']='DE-4';expected='NON_DISCRIMINATING'
   else:r['relation']='NEGATES_LEAF';r['absenceEvidenceState']='COMPETENT_AFFIRMATIVE_ABSENCE';expected='DIRECT_CONTRADICTION'
   made.append(c8_expect(a,f'C8-STAGE-{stage}-{k}','STAGE',expected,hold))
 a=copy.deepcopy(next(x for x in made if x['id']=='C8-STAGE-ND-W3'));made.append(c8_expect(a,'C8-FH4','FH4','HELD','HOLD-ND'))
 for rel in ('COUNTER_M','NEGATES_LEAF'):
  a=c8_fresh(scratch,rel);r=a['records'][a['subject']];r['edgeState']='NOT_DETERMINABLE';r['absenceEvidenceState']='COMPETENT_AFFIRMATIVE_ABSENCE';made.append(c8_expect(a,'C8-FO3' if rel=='COUNTER_M' else 'C8-FO3-NEGATES','FO3','HELD','HOLD-ND'))
 for first in (True,False):
  for other in ('H','N'):
   a=c8_break(c8_fresh(scratch,nt=2),'W3');r=a['records'][a['subject']];ts=sorted(r['treeTargetIds']);tbad=ts[0 if first else 1];tu=ts[1 if first else 0]
   for j in a['context']['traces'][(r['edgeId'],tbad)]['components'].values():j['MD3']={} if other=='H' else {m:'UNRESOLVED' for m in j['MD3']}
   r['treeTargetIds']=ts if first else list(reversed(ts));made.append(c8_expect(a,'C8-FH6' if first and other=='H' else f'C8-FH6-{first}-{other}','FH6',{tbad:'HELD' if other=='H' else 'NON_DISCRIMINATING',tu:'HELD'},{tbad:'HOLD-T' if other=='H' else None,tu:'HOLD-U'}))
 for field,value in [('packageFactCount',43.0),('packageSideCount',2.0),('packageSideCount',True),('packageFactCount','43')]:
  a=copy.deepcopy(byid['PI3-POSITIVE-A01-verbatim']);f=a['records'][a['subject']]['factIds'][0];a['context']['witness'][f]['factualPackageIdentity'][field]=value;made.append(c8_expect(a,'C8-FP4' if field=='packageFactCount' and isinstance(value,float) else 'C8-FP4-'+field+'-'+repr(value),'FP4','HELD','HOLD-U'))
 # Comparison-law witnesses for types outside lawful physical package count shape.
 for left,right in [(1,True),(0,False),(2,2.0),(43,43.0),('2',2)]:
  a=copy.deepcopy(byid['BASE']);ident={k:copy.deepcopy(a['records'][a['subject']][k]) for k in K.IDENTITY};a['w2Pair']=(dict(ident,factualPackageIdentity={'member':left}),dict(ident,factualPackageIdentity={'member':right}));made.append(c8_expect(a,'C8-W2-LAW-'+repr(left)+'-'+repr(right),'FP4','DIRECT_SUPPORT'))
 for relevance in ('NON_ANALYTICAL','UNMAPPED_OBSERVATION'):
  a=c8_fresh(scratch,nf=2);r=a['records'][a['subject']];r['factIds']=['F1'];r['componentSupply'][0]['factIds']=['F1'];c8_entry(a,'F2','M0',[]);c8_retrace(a);hidden={k:copy.deepcopy(r[k]) for k in ('caseId','side','factualPackageIdentity','contractIdentity','vocabularyVersion','coderIdentity')};hidden.update(edgeId='C8-SUPPLY-ONLY-HIDDEN',factIds=['F2'],relevanceState=relevance,mechanismPropositionIds=None,treeTargetIds=None,relation=None,evidenceForm=None,sourceQualityState=None,edgeState=None,ambiguity=None,abstention=None,componentSupply=[dict(r['componentSupply'][0],factIds=['F2'])]);a['context']['coderOutput']['hidden']=[hidden];refresh(a);made.append(c8_expect(a,'C8-FO4' if relevance=='NON_ANALYTICAL' else 'C8-FO4-UNMAPPED','FO4','HELD','HOLD-U'))
 made.append(c8_expect(c8_fresh(scratch,d='N'),'C8-FX6','FX6','NON_DISCRIMINATING'))
 a=c8_fresh(scratch,nf=2);a['context']['witness'].pop('F2');made.append(c8_expect(a,'C8-FM12-SUBJECT-W-ABSENT','W2','HELD','HOLD-U'))
 # More than one alternative / multiple subject facts crossed with a W failure.
 for cid in ('ALT-D-H','SECOND-FACT-ALTERNATIVE'):
  a=copy.deepcopy(byid[cid]);c8_break(a,'W2');made.append(c8_expect(a,'C8-CROSS-'+cid,'ALT','HELD','HOLD-U'))
 # Independent edges sharing one world: W on F1 cannot taint F2's TT outcome.
 for mode in ('D','N','CONTRA'):
  a=c8_fresh(scratch,nf=2,nt=2);r=a['records'][a['subject']];r['factIds']=['F1'];r['componentSupply'][0]['factIds']=['F1'];r['treeTargetIds']=['T0_0'];c8_entry(a,'F2','M0',[])
  companion=copy.deepcopy(r);companion.update(edgeId='C8-COMPANION',factIds=['F2'],treeTargetIds=['T0_1']);companion['componentSupply'][0]['factIds']=['F2']
  if mode=='CONTRA':
   companion.update(relation='COUNTER_M',mechanismPropositionIds=['M1']);companion['componentSupply'][0]['mechanismPropositionId']='M1';a['contract'].counter_of['M1']=['M0']
  else:
   c8_entry(a,'F2','M0',['c1']);material=copy.deepcopy(companion);material.update(edgeId='C8-COMPANION-MATERIAL',treeTargetIds=['T0_0']);a['context']['coderOutput']['companion-material']=[material]
  a['context']['coderOutput']['companion']=[companion];c8_retrace(a,{('C8-COMPANION','T0_1'):'N' if mode=='N' else 'D'});c8_break(a,'W3','F1');a['companionChecks']={'subject':'C8-COMPANION','categorical':{'T0_1':'DIRECT_CONTRADICTION' if mode=='CONTRA' else 'DIRECT_SUPPORT' if mode=='D' else 'NON_DISCRIMINATING'}};made.append(c8_expect(a,'C8-ISOLATION-'+mode,'FH6','HELD','HOLD-U'))

 # Alternative S4/S6 status cross-product with unrelated other-fact W failure.
 base=copy.deepcopy(next(x for x in made if x.get('iv1LeakID')=='ALTG-W3'))
 for direction in ('closed','N','H','I'):
  a=copy.deepcopy(base);a.pop('iv1LeakID',None);a['useFrozenRegistry']=True
  if direction=='closed':
   mid=a['records']['E1']['mechanismPropositionIds'][0]
   for entry in a['context']['witness']['F2']['entries']:
    if entry['mechanismPropositionId']!=mid:c8_entry(a,'F2',entry['mechanismPropositionId'],[])
  elif direction=='I':a['records']['E1']['sourceQualityState']='CONTENT_INACCESSIBLE'
  c8_retrace(a,{('E1',t):direction if direction in ('N','H') else 'D' for t in a['records']['E1']['treeTargetIds']})
  wanted={'closed':'SHARED_NON_UNIQUE','N':'DIRECT_SUPPORT','H':'HELD','I':'UNIQUENESS_UNRESOLVED'}[direction];made.append(c8_expect(a,'C8-ALT-OTHER-W-'+direction,'ALT',wanted,'HOLD-U' if direction=='H' else None))
 for direction in ('N','H'):
  a=copy.deepcopy(base);a.pop('iv1LeakID',None);third=copy.deepcopy(a['records']['E1']);mid='M-ADJ-ARGUMENT-QUALITY';third.update(edgeId='C8-SECOND-ALTERNATIVE',mechanismPropositionIds=[mid],treeTargetIds=sorted(a['contract'].mechanisms[mid].consumers));third['componentSupply'][0]['mechanismPropositionId']=mid;third['missingComponents']=sorted(a['contract'].mechanisms[mid].components-{'c1'});a['context']['coderOutput']['second-alternative']=[third]
  for f in third['factIds']:c8_entry(a,f,mid,['c1'])
  c8_retrace(a,{(third['edgeId'],t):direction for t in third['treeTargetIds']});made.append(c8_expect(a,'C8-TWO-ALT-'+direction,'ALT','HELD' if direction=='H' else 'SHARED_NON_UNIQUE','HOLD-U' if direction=='H' else None))
 # Genuine supply-order changes: two supplied components, three suppliers, two TTs.
 for rel,d in [('SUPPORTS_LEAF','D'),('SUPPORTS_LEAF','N'),('COUNTER_M','D'),('COUNTER_M','N')]:
  ident,raw=package(scratch);c=small_contract(3,2);w,s=world(c,ident,raw,3,2,subject='M0',supply_mode='joint');a=raw_case('C8',c,w,s,scratch);r=a['records'][a['subject']];r['relation']=rel
  if rel=='COUNTER_M':
   mat=copy.deepcopy(r);mat.update(edgeId='C8-MULTI-COMPONENT-MATERIAL',relation='SUPPORTS_LEAF');a['context']['coderOutput']['material']=[mat];c.counter_of['M0']=['M1'];r['treeTargetIds']=sorted(c.mechanisms['M1'].consumers)
  c8_retrace(a,{(r['edgeId'],t):d for t in r['treeTargetIds']});c8_break(a,'W2','F3');wanted='NON_DISCRIMINATING' if d=='N' else 'DIRECT_CONTRADICTION' if rel=='COUNTER_M' else 'HELD';made.append(c8_expect(a,'C8-SUPPLY-ORDER-'+rel+'-'+d,'GENERAL',wanted,'HOLD-U' if wanted=='HELD' else None))
 for f in ('F2','F3'):
  for d in ('D','N'):
   a=c8_fresh(scratch,d=d,nf=3);r=a['records'][a['subject']];r['factIds']=[f];r['componentSupply'][0]['factIds']=[f];c8_retrace(a,{(r['edgeId'],t):d for t in r['treeTargetIds']})
   if d=='N':c8_break(a,'W3',f)
   made.append(c8_expect(a,'C8-SUBJECT-FACT-'+f+'-'+d,'GENERAL','DIRECT_SUPPORT' if d=='D' else 'NON_DISCRIMINATING'))
 # Both reciprocal registry counters of top-down authority; binding unchanged.
 for mid in ('M-ADJ-ARGUMENT-QUALITY','M-ADJ-TEST-RESULT'):
  for d in ('D','N'):
   ident,raw=package(scratch);c=copy.deepcopy(CONTRACT);w,s=world(c,ident,raw,1,1,subject=mid);a=raw_case('C8',c,w,s,scratch);r=a['records'][a['subject']];mat=copy.deepcopy(r);mat.update(edgeId='C8-RECIPROCAL-MATERIAL');a['context']['coderOutput']['material']=[mat];r.update(relation='COUNTER_M',treeTargetIds=['TT-STJSTP-PW']);c8_retrace(a,{(r['edgeId'],'TT-STJSTP-PW'):d});c8_break(a,'W2');a['useFrozenRegistry']=True;made.append(c8_expect(a,'C8-COUNTER-MECHANISM-'+mid+'-'+d,'GENERAL','DIRECT_CONTRADICTION' if d=='D' else 'NON_DISCRIMINATING'))

 originals=list(made)
 for a in originals:
  b=copy.deepcopy(a);b['id']=a['id']+'-PERM';b.pop('iv1LeakID',None);b['permutationOf']=a['id']
  for r in rows(b):
   for key in ('factIds','treeTargetIds','componentSupply'):
    if isinstance(r.get(key),list):r[key].reverse()
   for sp in r.get('componentSupply') or []:sp['factIds'].reverse()
  b['context']['coderOutput']={k:list(reversed(v)) for k,v in reversed(list(b['context']['coderOutput'].items()))};b['context']['witness']={f:dict(w,entries=list(reversed(w['entries']))) for f,w in reversed(list(b['context']['witness'].items()))};refresh(b);made.append(b)
 return made
_retained_corr7_cases=cases
def cases(scratch):
 retained=_retained_corr7_cases(scratch);assert len(retained)==566
 return retained+corr8_cases(scratch,retained)
_corr7_bearing_check=check_case
def check_case(builder,case):
 row=_corr7_bearing_check(builder,case);w,e=canonical(case);_,outputs=execute(builder,case);exact={};mismatch=False
 for tt,out in outputs.items():
  wanted=K.HoldOrderOracle(case['contract']).expected(w,e,tt);categorical=case.get('expectedHoldCodes',{}).get(tt,wanted);mismatch |= out.get('holdCode')!=wanted or categorical!=wanted;exact[tt]={'reference':wanted,'categorical':categorical,'actual':out.get('holdCode')}
 if 'w2Pair' in case:
  actual,expected=case['w2Pair'];equal=not builder._identity_errors(actual,expected);ref=K.typed_equal(actual,expected);mismatch |= equal!=ref or ref;row['w2ComparisonLaw']={'actual':actual,'expected':expected,'builderEqual':equal,'referenceEqual':ref,'physicalCertificationClaim':False}
 if case.get('companionChecks'):
  partner=copy.deepcopy(case);partner['subject']=case['companionChecks']['subject'];wanted=case['companionChecks']['categorical'];observations=[]
  for first in (True,False):
   if first:execute(builder,case)
   got,out=execute(builder,partner)
   if not first:execute(builder,case)
   rw,re=canonical(partner);bref=reference(partner);dh={tt:K.HoldOrderOracle(partner['contract']).expected(rw,re,tt) for tt in got};observations.append({'subjectFirst':first,'expected':wanted,'actual':got,'holdCodes':{t:v.get('holdCode') for t,v in out.items()},'layerD':dh});mismatch |= got!=wanted or {t:v.state for t,v in bref.items()}!=wanted or any(v.get('holdCode')!=dh[t] for t,v in out.items())
  row['companionIsolation']=observations
 for tt,out in outputs.items():
  mismatch |= reference(case)[tt].hold!=out.get('holdCode')
 row['holdCodeComparison']=exact;row['mismatchAxes']['holdCodeMismatch'] |= mismatch
 for key in ('c8Family','iv1LeakID','permutationOf'):row[key]=case.get(key)
 if mismatch:row['result']='FAIL'
 return row
_corr7_run=run
def run(builder,scratch):
 result=_corr7_run(builder,scratch);result.update(NEW_PROPERTY_CASE_COUNT=result['PROPERTY_CASE_COUNT']-566,RETAINED_CORR7_CASE_COUNT=566,holdOracleCaseCount=len(result['caseLedger']));result['leakLedger']=[r for r in result['caseLedger'] if r.get('iv1LeakID')];result['permutationLedger']=[{'case':r['id'],'base':r['permutationOf'],'result':r['result']} for r in result['caseLedger'] if r.get('permutationOf')];return result

def main():
    global ACTIVE_SCRATCH
    ap=argparse.ArgumentParser();ap.add_argument('--scratch',required=True);ap.add_argument('--regression-only',action='store_true');ap.add_argument('--probe-pi3',action='store_true');ap.add_argument('--output');args=ap.parse_args();ACTIVE_SCRATCH=Path(args.scratch).resolve()
    if not ACTIVE_SCRATCH.is_relative_to(Path('/private/tmp')):raise ValueError('scratch only')
    ACTIVE_SCRATCH.mkdir(parents=True,exist_ok=True);builder=module(HERE/(PREFIX+'_SUCCESSOR_VIEW_BUILDER.py'),'corr7_builder')
    if args.probe_pi3:
        case=next(c for c in cases(ACTIVE_SCRATCH) if c['id']=='PI3-LAWFUL');labels,outputs=execute(builder,case)
        row=case['records'][case['subject']];fact=builder.ProductionPackageAuthority(ROOT).certify(row['factualPackageIdentity'],row['factIds'][0],row['caseId'],row['side'])
        result={'labels':labels,'semanticOutput':outputs,'certifiedProposition':fact.proposition if fact else None,'failures':int(any(x!='DIRECT_SUPPORT' for x in labels.values()))}
    else:
        result=regression_replay(builder,ACTIVE_SCRATCH) if args.regression_only else run(builder,ACTIVE_SCRATCH)
    if args.output:
        p=Path(args.output).resolve()
        if not p.is_relative_to(Path('/private/tmp')):raise ValueError('scratch evidence only')
        p.write_text(json.dumps(result,indent=1,sort_keys=True)+'\n')
    print(json.dumps({k:v for k,v in result.items() if k not in ('caseLedger','coverageLedger','metamorphicLedger','thirdOracleParserChecks','rows')},sort_keys=True))
    return int(result['failures']!=0)

# CORR9 validation-only grammar. Builder and Layers A/B/D stay byte-identical.
C9_INVARIANTS = {
    'B1': 'CORR1 §12 / §9.4 B3-1: COUNTER_M S6 Sel_other is declared, not W-closed',
    'B4': 'CORR1 §6.6 T-1 / §9.4 B3-1: union declarations over all record facts',
    'C2': 'accepted §6.3 / §7.1 U-X; CORR1 §9.5: S2-held alternative is HELD',
    'C3': 'accepted §14 Decision 3; CORR1 §9.5 / §13.2: capped alternative is non-directional',
    'C5': 'CORR1 §9.5: COUNTER_M records are excluded from SUPPORTS_LEAF alternatives',
    'D4': 'accepted §10; CORR1 §13.2 (1)-(2): EV precedes the DE-4 cap',
    'F2': 'registry §E/H-2.1; SEP-I-1/I-11; Owner CORR9 §15: no hidden TT in non-mapped rows; no exact K hold rule',
    'G1': 'CORR1 §6.6 T-3 / §9.4 B3-6: any UNRESOLVED is a non-distinguishing witness',
}


def c9_permutation(case, label):
    a = copy.deepcopy(case)
    a['id'] += '-' + label
    a['permutationOf'] = case['id']
    a['c9Role'] = 'NEIGHBOR'
    for r in rows(a):
        for key in ('factIds', 'treeTargetIds', 'componentSupply'):
            if isinstance(r.get(key), list):
                r[key].reverse()
        for supply in r.get('componentSupply') or []:
            supply['factIds'].reverse()
    a['context']['coderOutput'] = {k: list(reversed(v)) for k, v in reversed(list(a['context']['coderOutput'].items()))}
    a['context']['witness'] = {f: dict(w, entries=list(reversed(w['entries']))) for f, w in reversed(list(a['context']['witness'].items()))}
    for tr in a['context']['traces'].values():
        tr['factIds'].reverse()
        tr['universe'].reverse()
        tr['components'] = dict(reversed(list(tr['components'].items())))
        for j in tr['components'].values():
            j['basis']['factIds'].reverse()
            j['MD3'] = dict(reversed(list(j['MD3'].items())))
    return refresh(a)


def c9_add_support(a, mid, eid, facts=('F1',), components=('c1',)):
    r = copy.deepcopy(a['records'][a['subject']])
    r.update(edgeId=eid, relation='SUPPORTS_LEAF', mechanismPropositionIds=[mid],
             treeTargetIds=sorted(a['contract'].mechanisms[mid].consumers), factIds=list(facts))
    r['componentSupply'] = [dict(r['componentSupply'][0], mechanismPropositionId=mid, componentId=c, factIds=list(facts)) for c in components]
    r['missingComponents'] = sorted(a['contract'].mechanisms[mid].components-set(components))
    a['context']['coderOutput'][eid] = [r]
    for fact in facts:
        c8_entry(a, fact, mid, components)
    return refresh(a)


def c9_counter(scratch, nf, selected_fact, broken=False, incomplete=False):
    a = c8_fresh(scratch, 'COUNTER_M', nf=nf)
    c = a['contract']; m = c.mechanisms['M0']
    c.mechanisms['M0'] = K.Mechanism(m.name, m.components, m.environment, frozenset({'M1'}), m.consumers, m.negative)
    c9_add_support(a, 'M2', 'C9-DECLARATION-MATERIAL', (selected_fact,))
    c8_retrace(a)
    if incomplete:
        for (eid, tt), tr in a['context']['traces'].items():
            if eid == a['subject']:
                tr['universe'].remove('M2')
                for j in tr['components'].values():
                    j['MD3'].pop('M2')
    if broken:
        a['context']['witness'][selected_fact]['vocabularyVersion'] = 'C9-broken-W2-with-selection-retained'
    return a


def corr9_cases(scratch):
    made = []
    def add(a, family, role, name, state, hold=None, local=None, components=None, layer_d=False):
        a.update(id='C9-'+family+'-'+name, c9Family=family, c9Role=role,
                 frozenInvariant=C9_INVARIANTS[family], properties=['P01','P02','P04','P06','P08','P09','P12','P13','P15'],
                 axes={'family':family, 'role':role, 'shape':name}, c9LayerD=layer_d)
        a['categorical'] = {t:state for t in a['records'][a['subject']]['treeTargetIds']}
        # Only explicitly contracted hold expectations are fixed by the grammar.
        if layer_d:
            a['expectedHoldCodes'] = {t:hold for t in a['categorical']}
        if local:
            a['c9LocalExpectations'] = local
        if components:
            a['c9ComponentExpectations'] = components
        made.append(a)
        return a
    def perm(a):
        made.append(c9_permutation(a, 'ORDER'))
    def alternative(nf=1, nt=1):
        ident, raw = package(scratch); c = small_contract(3, nt)
        w, s = world(c, ident, raw, nf, 1, alternatives=('M1',), altstates=('N',), supply_mode='joint')
        return raw_case('C9', c, w, s, scratch)
    # B1: retain an out-of-Cmp declaration despite broken W, including second fact.
    add(c9_counter(scratch,1,'F1',True),'B1','DIRECT','BROKEN-W','DIRECT_CONTRADICTION',layer_d=True)
    a=add(c9_counter(scratch,2,'F2',True),'B1','NEIGHBOR','SECOND-FACT','DIRECT_CONTRADICTION',layer_d=True);perm(a)
    add(c9_counter(scratch,2,'F2'),'B1','CONTROL','CLOSED-W','DIRECT_CONTRADICTION',layer_d=True)
    # B4: complete vs truncated trace universes, plus declaration/fact-order controls.
    a=add(c9_counter(scratch,2,'F2'),'B4','DIRECT','SECOND-FACT-FULL','DIRECT_CONTRADICTION',layer_d=True);perm(a)
    a=add(c9_counter(scratch,2,'F2',incomplete=True),'B4','NEIGHBOR','SECOND-FACT-LOST','HELD','HOLD-T',layer_d=True);perm(a)
    add(c9_counter(scratch,2,'F1'),'B4','CONTROL','FIRST-FACT-FULL','DIRECT_CONTRADICTION',layer_d=True)
    # C2: all three S2 holds, with multi-fact/multi-TT alternative and order variant.
    for code,nf,nt,role in [('ND',1,1,'DIRECT'),('AMB',2,2,'NEIGHBOR'),('NA',1,1,'NEIGHBOR')]:
        a=alternative(nf,nt);r=a['records']['E1']
        if nf==2:
            r['factIds']=['F1','F2'];r['componentSupply'][0]['factIds']=['F1','F2'];c8_entry(a,'F2','M1',['c1'])
        c8_retrace(a)
        if code=='ND':r['edgeState']='NOT_DETERMINABLE'
        if code=='AMB':r.update(edgeState='AMBIGUOUS',ambiguity=None)
        if code=='NA':r['abstention']={'declarations':[{'code':'C9-INVALID','mechanismPropositionId':'M1','componentId':'c2'}]}
        x=add(a,'C2',role,'S2-'+code,'HELD','HOLD-U',{'E1':{'state':'HELD','hold':'HOLD-'+code}},layer_d=True)
        if nf==2:perm(x)
    a=alternative();add(a,'C2','CONTROL','LAWFUL-ND','DIRECT_SUPPORT',local={'E1':{'state':'NON_DIRECTIONAL'}},layer_d=True)
    # C3: cap before alternative uniqueness; DE-1 twin and held/directional second M.
    a=alternative();c8_retrace(a);a['records']['E1']['evidenceForm']='DE-4'
    add(a,'C3','DIRECT','DE4-ALTERNATIVE','DIRECT_SUPPORT',local={'E1':{'state':'NON_DIRECTIONAL'}})
    a=alternative();c8_retrace(a)
    add(a,'C3','CONTROL','DE1-TWIN','SHARED_NON_UNIQUE',local={'E1':{'state':'DIRECTIONAL'}})
    for status,wanted,hold in [('H','HELD','HOLD-U'),('D','SHARED_NON_UNIQUE',None)]:
        a=alternative();c9_add_support(a,'M2','C9-OTHER-ALT');c8_retrace(a,{('C9-OTHER-ALT','T2_0'):status});a['records']['E1']['evidenceForm']='DE-4'
        add(a,'C3','NEIGHBOR','SECOND-ALT-'+status,wanted,hold,{'E1':{'state':'NON_DIRECTIONAL'},'C9-OTHER-ALT':{'state':'HELD' if status=='H' else 'DIRECTIONAL'}},layer_d=True)
    # C5 A: unselected, supply-free COUNTER_M is lawful metadata, never Alt.
    # M1 is a genuine non-directional alternative so the direct case exercises U-1.
    a=alternative();ctr=copy.deepcopy(a['records']['E1']);ctr.update(edgeId='C9-COUNTER-ONLY',relation='COUNTER_M',mechanismPropositionIds=['M2'],treeTargetIds=['T0_0'],componentSupply=[],missingComponents=['c1','c2','c3'])
    a['contract'].counter_of['M2']=['M0'];a['context']['coderOutput']['counter-only']=[ctr];refresh(a)
    x=add(a,'C5','DIRECT','COUNTER-ONLY','DIRECT_SUPPORT',layer_d=True);x['c9ExcludedAlternative']='M2'
    # B: the same topology now selects M2 with a genuine held SUPPORTS_LEAF row.
    # Its independently directional counter must never outrank its held support.
    a=copy.deepcopy(x);c9_add_support(a,'M2','C9-HELD-SUPPORT');ctr=a['records']['C9-COUNTER-ONLY'];ctr['componentSupply']=[dict(a['records']['C9-HELD-SUPPORT']['componentSupply'][0])];ctr['missingComponents']=['c2','c3']
    c8_retrace(a,{('E1','T1_0'):'N',('C9-HELD-SUPPORT','T2_0'):'H'})
    a.pop('c9ExcludedAlternative',None)
    x=add(a,'C5','NEIGHBOR','HELD-SUPPORT-PLUS-COUNTER','HELD','HOLD-U',{'C9-HELD-SUPPORT':{'state':'HELD','hold':'HOLD-T'},'C9-COUNTER-ONLY':{'state':'DIRECTIONAL'}},layer_d=True);perm(x)
    a=copy.deepcopy(x);a.pop('permutationOf',None);c8_retrace(a,{('E1','T1_0'):'N'})
    add(a,'C5','CONTROL','GENUINE-D-SUPPORT','SHARED_NON_UNIQUE',local={'C9-HELD-SUPPORT':{'state':'DIRECTIONAL'}},layer_d=True)
    # D4: source inaccessible under DE-4, accessible twin, DE-1 failure twin.
    for form,source,role,name,state in [('DE-4','CONTENT_INACCESSIBLE','DIRECT','EV-BEFORE-CAP','INDETERMINATE'),('DE-1','CONTENT_INACCESSIBLE','NEIGHBOR','DE1-SAME-EV','INDETERMINATE'),('DE-4','COMPETENT','CONTROL','EV-SATISFIED','NON_DISCRIMINATING')]:
        a=c8_fresh(scratch);a['records'][a['subject']].update(evidenceForm=form,sourceQualityState=source)
        add(a,'D4',role,name,state)
    # F2: exactly TT populated, other analytical fields null; another-fact neighbor.
    for kind,fid,role in [('NON_ANALYTICAL','F1','DIRECT'),('UNMAPPED_OBSERVATION','F1','NEIGHBOR'),('NON_ANALYTICAL','F2','NEIGHBOR'),('UNMAPPED_OBSERVATION','F2','NEIGHBOR')]:
        a=c8_fresh(scratch,nf=2);r=a['records'][a['subject']];r['factIds']=['F1'];r['componentSupply'][0]['factIds']=['F1'];c8_entry(a,'F2','M0',[]);c8_retrace(a)
        hidden={k:copy.deepcopy(r[k]) for k in K.IDENTITY};hidden.update(edgeId='C9-TT-ONLY',factIds=[fid],relevanceState=kind,mechanismPropositionIds=None,treeTargetIds=['T0_0'],componentSupply=None,relation=None,evidenceForm=None,sourceQualityState=None,edgeState=None,ambiguity=None,abstention=None)
        a['context']['coderOutput']['tt-only']=[hidden];refresh(a)
        x=add(a,'F2',role,kind+'-'+fid,'HELD');x['c9HiddenRow']='C9-TT-ONLY'
        if fid=='F2' and kind=='NON_ANALYTICAL':perm(x)
    for kind in ('NON_ANALYTICAL','UNMAPPED_OBSERVATION'):
        a=copy.deepcopy(next(x for x in made if x['id']=='C9-F2-'+kind+'-F2'));a['records']['C9-TT-ONLY']['treeTargetIds']=None;a.pop('c9HiddenRow',None);a['c9NeutralRow']='C9-TT-ONLY'
        add(a,'F2','CONTROL','NEUTRAL-'+kind,'DIRECT_SUPPORT')
    # G1: mixed Cmp, mixed Sel_other outside Cmp, two components, all-NO control.
    a=c8_fresh(scratch);tr=next(iter(a['context']['traces'].values()));tr['components']['c1']['MD3']['M1']='UNRESOLVED'
    add(a,'G1','DIRECT','MIXED-CMP','NON_DISCRIMINATING',components={'c1':'NON_DISTINGUISHING'})
    a=c8_fresh(scratch);m=a['contract'].mechanisms['M0'];a['contract'].mechanisms['M0']=K.Mechanism(m.name,m.components,m.environment,frozenset({'M1'}),m.consumers,m.negative)
    c9_add_support(a,'M2','C9-SEL-OTHER');c8_retrace(a,{('C9-SEL-OTHER','T2_0'):'N'});a['context']['traces'][('E0','T0_0')]['components']['c1']['MD3']['M2']='UNRESOLVED'
    add(a,'G1','NEIGHBOR','MIXED-SEL-OTHER','NON_DISCRIMINATING',components={'c1':'NON_DISTINGUISHING'})
    ident,raw=package(scratch);c=small_contract(3,2);w,s=world(c,ident,raw,2,2,supply_mode='joint');a=raw_case('C9',c,w,s,scratch)
    for (eid,tt),tr in a['context']['traces'].items():tr['components']['c1']['MD3']['M1']='UNRESOLVED'
    a=add(a,'G1','NEIGHBOR','MULTI-COMPONENT','DIRECT_SUPPORT',components={'c1':'NON_DISTINGUISHING','c2':'DISTINGUISHING'});perm(a)
    add(c8_fresh(scratch),'G1','CONTROL','ALL-NO-CO','DIRECT_SUPPORT',components={'c1':'DISTINGUISHING'})
    return made


_retained_corr8_cases = cases
_retained_corr8_check = check_case
_retained_corr8_run = run


def cases(scratch):
    retained = _retained_corr8_cases(scratch)
    assert len(retained)==896
    return retained+corr9_cases(scratch)


def check_case(builder,case):
    if not case.get('c9Family'):
        return _retained_corr8_check(builder,case)
    # Retain Layer A/B triple checks; use Layer D only on its hold-routing contract.
    row=_corr7_bearing_check(builder,case)
    w,e=canonical(case);k=K.Kernel(case['contract']);refs=reference(case);_,outputs=execute(builder,case)
    row.update(c9Family=case['c9Family'],c9Role=case['c9Role'],frozenInvariant=case['frozenInvariant'],permutationOf=case.get('permutationOf'))
    row['layerBAssertions']={t:{'state':v.state,'evaluability':v.evaluability,'bearing':v.bearing,'categorical':case['categorical'][t]} for t,v in refs.items()}
    local_checks=[]
    for eid,wanted in case.get('c9LocalExpectations',{}).items():
        alt=next(r for r in w.edges if r.name==eid)
        for tt in alt.targets:
            value=k.local(w,alt,tt)
            status='DIRECTIONAL' if value.state=='DIRECT_CONTRADICTION' else 'NON_DIRECTIONAL' if value.state=='NON_DISCRIMINATING' else value.state
            ok=status==wanted['state'] and ('hold' not in wanted or value.hold==wanted['hold'])
            local_checks.append({'record':eid,'tt':tt,'expected':wanted,'layerBState':status,'layerBHold':value.hold,'pass':ok})
    row['alternativeLocalChecks']=local_checks
    comp_checks=[]
    for component,wanted in case.get('c9ComponentExpectations',{}).items():
        for tt in e.targets:
            # Restrict only the component direction calculation, never W/uniqueness.
            one=copy.deepcopy(e);one.supplies=tuple(s for s in e.supplies if s.component==component)
            restricted=copy.deepcopy(w);tr=restricted.traces[(e.name,tt)];tr.judgments={component:tr.judgments[component]}
            direction,_=k.direction(restricted,one,tt)
            bvalue='DISTINGUISHING' if direction=='DIRECTIONAL' else 'NON_DISTINGUISHING' if direction=='NON_DIRECTIONAL' else direction
            actual=outputs[tt].get('b3ComponentVerdicts',{}).get(component)
            comp_checks.append({'tt':tt,'component':component,'expected':wanted,'layerB':bvalue,'production':actual,'pass':bvalue==actual==wanted})
    row['componentChecks']=comp_checks
    exact={}
    if case['c9LayerD']:
        for tt,out in outputs.items():
            d=K.HoldOrderOracle(case['contract']).expected(w,e,tt);wanted=case['expectedHoldCodes'][tt]
            exact[tt]={'reference':d,'categorical':wanted,'actual':out.get('holdCode')}
            row['mismatchAxes']['holdCodeMismatch'] |= d!=wanted or out.get('holdCode')!=wanted or refs[tt].hold!=wanted
    row['holdCodeComparison']=exact
    row['layerDApplicability']='EXACT_HOLD_ROUTING' if case['c9LayerD'] else 'OUTSIDE_DISCRIMINATING_HOLD_CONTRACT'
    boundary=[]
    if case.get('c9HiddenRow'):
        hidden=case['records'][case['c9HiddenRow']]
        reg=native_registry(case['contract']);ctx=with_authority(builder,case)
        material=builder.evaluate(hidden,reg,ctx,case['contract'].registry_identity)
        problems=K.BoundaryOracle(MODEL,ROOT,synthetic=case['authority']).variant(hidden)
        boundary.append({'property':'TT_ONLY_FAIL_CLOSED','layerABRejected':bool(problems),'productionHeld':material.get('admission')=='HELD','nullBearing':material.get('supportBearing') is None,'pass':bool(problems) and material.get('admission')=='HELD' and material.get('supportBearing') is None,'exactHoldCodeAsserted':False})
    if case.get('c9NeutralRow'):
        neutral=case['records'][case['c9NeutralRow']];material=builder._evaluate_at(neutral,native_registry(case['contract']),with_authority(builder,case),case['contract'].registry_identity)
        problems=K.BoundaryOracle(MODEL,ROOT,synthetic=case['authority']).variant(neutral)
        boundary.append({'property':'NEUTRAL_NONMAPPED_CONTROL','layerABErrors':problems,'production':material,'pass':not problems and material.get('ev0Applicable') is False and material.get('supportBearing') is None and material.get('admission') is None})
    if case.get('c9ExcludedAlternative'):
        absent=case['c9ExcludedAlternative']
        boundary.append({'property':'COUNTER_NOT_ALTERNATIVE','mechanism':absent,'pass':all(a['M']!=absent for out in outputs.values() for a in out.get('alternatives',[]))})
    row['boundaryChecks']=boundary
    row['mismatchAxes']['boundaryMismatch'] |= any(not x['pass'] for x in boundary)
    if any(not x['pass'] for x in local_checks+comp_checks+boundary) or any(row['mismatchAxes'].values()):row['result']='FAIL'
    return row


def run(builder,scratch):
    result=_retained_corr8_run(builder,scratch)
    ledger=result['caseLedger'];new=[r for r in ledger if r.get('c9Family')];old=[r for r in ledger if not r.get('c9Family')]
    assert len(old)==896
    perms=[{'case':r['id'],'base':r['permutationOf'],'result':r['result'],'equalToBase':{k:v for k,v in r.items() if k in ('actual','expected','triples')}=={k:v for k,v in next(x for x in ledger if x['id']==r['permutationOf']).items() if k in ('actual','expected','triples')}} for r in ledger if r.get('permutationOf')]
    result.update(RETAINED_CORR8_CASES=len(old),NEW_CORR9_CASES=len(new),NEW_PROPERTY_CASE_COUNT=len(new),
                  layerBNewAssertionCount=sum(len(r['layerBAssertions']) for r in new),
                  layerDApplicableNewAssertionCount=sum(len(r['holdCodeComparison']) for r in new),
                  layerDTotalAssertionCount=sum(len(r['holdCodeComparison']) for r in ledger),
                  holdOracleCaseCount=sum(bool(r['holdCodeComparison']) for r in ledger),
                  newCaseLedger=new,permutationLedger=perms,
                  permutationFailures=sum(r['result']!='PASS' or not r['equalToBase'] for r in perms))
    result['eightSurvivorClosureLedger']={f:{role:[r['id'] for r in new if r['c9Family']==f and r['c9Role']==role] for role in ('DIRECT','NEIGHBOR','CONTROL')} for f in C9_INVARIANTS}
    result['retainedExpectationDigest']=hashlib.sha256(json.dumps(old,sort_keys=True).encode()).hexdigest()
    return result



# CORR10: five frozen grammar cells; all checks use the unchanged CORR9 route.
C10_FAMILIES = ('B1', 'B4', 'C5', 'D4', 'G1')

def c10_four_fact_authority(a, scratch):
    """Extend only this new synthetic world, never the retained package grammar."""
    facts = [{'factId': f, 'side': 'A', 'certifiedText': e['certifiedText']}
             for f, e in sorted(a['context']['factualEvidence'].items())]
    raw = json.dumps({'caseId': 'SYN-CORR4', 'facts': facts}, sort_keys=True).encode()
    identity = {'syntheticAuthority': 'CORR10-FOUR-FACT-AUTHOR-ONLY',
                'recordFileSha256': hashlib.sha256(raw).hexdigest()}
    a['authority'] = synthetic_spec(identity, raw, scratch)
    replace_package(a, identity)
    return a

def c10_counter(scratch, nf, declaring_fact, incomplete=False):
    a = c9_counter(scratch, nf, declaring_fact, incomplete=incomplete)
    return c10_four_fact_authority(a, scratch) if nf == 4 else a

def c10_vector_contract(size):
    c = small_contract(3, 2)
    for i in range(3, size):
        mid, tt = 'M'+str(i), 'T'+str(i)+'_0'
        c.mechanisms[mid] = K.Mechanism(mid, frozenset({'c1','c2','c3'}),
                                       'E'+str(i), frozenset(), frozenset({tt}),
                                       'Not '+mid+' mere inventory.')
        c.targets[tt] = K.Target(tt, frozenset({mid}), True)
    m = c.mechanisms['M0']
    c.mechanisms['M0'] = K.Mechanism(m.name, m.components, m.environment,
                                    frozenset(set(c.mechanisms)-{'M0'}), m.consumers, m.negative)
    return c

def corr10_cases(scratch):
    made = []
    def add(a, family, role, shape, state, hold=None, local=None, components=None, layer_d=False):
        # CORR9 check_case is intentionally reused without any semantic edits.
        a.update(id='C10-'+family+'-'+shape, c10Family=family, c10Role=role,
                 c9Family=family, c9Role=role, c9LayerD=layer_d,
                 frozenInvariant=C9_INVARIANTS[family],
                 properties=['P01','P02','P04','P08','P09','P10','P12','P13','P15'],
                 axes={'family':family, 'role':role, 'shape':shape})
        a['categorical'] = {t:state for t in a['records'][a['subject']]['treeTargetIds']}
        if layer_d:
            a['expectedHoldCodes'] = {t:hold for t in a['categorical']}
        if local:
            a['c9LocalExpectations'] = local
        if components:
            a['c9ComponentExpectations'] = components
        made.append(a)
        return a
    def perm(a):
        b = c9_permutation(a, 'ORDER')
        b['c10Role'] = b['c9Role'] = 'NEIGHBOR'
        made.append(b)

    # B1: decisive declaration lies outside Cmp; W break belongs to its fact.
    for kind in ('W1', 'W3', 'W4'):
        for incomplete in (False, True):
            a = c10_counter(scratch, 2, 'F2', incomplete)
            if kind == 'W1':
                entries = a['context']['witness']['F2']['entries']
                entries.remove(next(e for e in entries if e['mechanismPropositionId']=='M1'))
            elif kind == 'W3':
                a['context']['coderOutput'].pop('C9-DECLARATION-MATERIAL')
                refresh(a)  # M2 declaration remains SELECTED; materialization missing.
            else:
                extra = copy.deepcopy(a['records']['C9-DECLARATION-MATERIAL'])
                extra.update(edgeId='C10-INCONSISTENT-SUPPLY', relation='NEGATES_LEAF')
                extra['componentSupply'][0]['componentId'] = 'c2'
                extra['missingComponents'] = ['c1','c3']
                a['context']['coderOutput']['inconsistent-supply'] = [extra]
                refresh(a)
            x = add(a, 'B1', 'DIRECT' if kind=='W1' and not incomplete else 'NEIGHBOR',
                    kind+('-LOST' if incomplete else '-FULL'),
                    'HELD' if incomplete else 'DIRECT_CONTRADICTION',
                    'HOLD-T' if incomplete else None, layer_d=True)
            if kind=='W1' and not incomplete:
                perm(x)
    a = c10_counter(scratch, 2, 'F2')
    a['context']['witness']['F2']['entries'].remove(next(e for e in a['context']['witness']['F2']['entries'] if e['mechanismPropositionId']=='M1'))
    for (eid, tt), tr in a['context']['traces'].items():
        if eid == a['subject']:
            for j in tr['components'].values():
                j['MD3']['M2'] = 'UNRESOLVED'
    add(a, 'B1', 'NEIGHBOR', 'W1-NONDIRECTIONAL', 'NON_DISCRIMINATING', layer_d=True)
    add(c10_counter(scratch,2,'F2'), 'B1', 'CONTROL', 'CLOSED-W',
        'DIRECT_CONTRADICTION', layer_d=True)

    # B4: the declaration belongs to fact 3/4, with complete/incomplete twins.
    for nf in (3,4):
        for incomplete in (False,True):
            x = add(c10_counter(scratch,nf,'F'+str(nf),incomplete), 'B4',
                    'DIRECT' if nf==3 and not incomplete else 'NEIGHBOR',
                    str(nf)+'-FACT'+('-LOST' if incomplete else '-FULL'),
                    'HELD' if incomplete else 'DIRECT_CONTRADICTION',
                    'HOLD-T' if incomplete else None, layer_d=True)
            if nf==3:
                perm(x)
    add(c10_counter(scratch,3,'F1'), 'B4', 'CONTROL', 'FIRST-FACT',
        'DIRECT_CONTRADICTION', layer_d=True)

    # C5: one SELECTED M has distinct support and directional counter records.
    for support_state, subject_state, role in [
            ('N','DIRECT_SUPPORT','DIRECT'), ('I','UNIQUENESS_UNRESOLVED','NEIGHBOR'),
            ('H','HELD','CONTROL'), ('D','SHARED_NON_UNIQUE','CONTROL')]:
        a = c8_fresh(scratch, nt=2)
        c9_add_support(a, 'M1', 'C10-ALTERNATIVE-SUPPORT')
        ctr = copy.deepcopy(a['records']['C10-ALTERNATIVE-SUPPORT'])
        ctr.update(edgeId='C10-ALTERNATIVE-COUNTER',relation='COUNTER_M',treeTargetIds=['T0_0','T0_1'])
        a['contract'].counter_of['M1'] = ['M0']
        a['context']['coderOutput']['counter'] = [ctr]
        c8_retrace(a, {('C10-ALTERNATIVE-SUPPORT',t):support_state if support_state in ('N','H') else 'D' for t in ('T1_0','T1_1')})
        if support_state=='I':
            a['records']['C10-ALTERNATIVE-SUPPORT']['sourceQualityState'] = 'CONTENT_INACCESSIBLE'
        local_status = {'N':'NON_DIRECTIONAL','I':'INDETERMINATE','H':'HELD','D':'DIRECTIONAL'}[support_state]
        support_expected = {'state':local_status}
        if support_state=='H':
            support_expected['hold']='HOLD-T'
        x = add(a, 'C5', role, 'SUPPORT-'+support_state+'-COUNTER-D', subject_state,
                'HOLD-U' if support_state=='H' else None,
                local={'C10-ALTERNATIVE-SUPPORT':support_expected,
                       'C10-ALTERNATIVE-COUNTER':{'state':'DIRECTIONAL'}}, layer_d=True)
        if support_state in ('N','I'):
            perm(x)

    # D4: each frozen EV gate precedes DE-4; no Layer D bearing adjudication.
    a = c8_fresh(scratch)
    a['records'][a['subject']].update(evidenceForm='DE-4',edgeState='AMBIGUOUS',
                                    ambiguity={'competingMechanismIds':['M1'],'resolutionState':'UNRESOLVED'})
    add(a, 'D4', 'DIRECT', 'EV2-AMBIGUOUS', 'INDETERMINATE')
    ident, raw = package(scratch)
    c = copy.deepcopy(CONTRACT)
    w, s = world(c,ident,raw,1,1,subject='M-RES-ASYMMETRIC-RETENTION')
    a = raw_case('C10',c,w,s,scratch);a['useFrozenRegistry']=True
    a['records'][a['subject']].update(evidenceForm='DE-4',abstention={'declarations':[
        {'code':'NACR-1','mechanismPropositionId':s.mechanism,'componentId':'c3'}]})
    add(a, 'D4', 'NEIGHBOR', 'EV3-NACR', 'INDETERMINATE')
    control = copy.deepcopy(a)
    control['records'][control['subject']]['abstention']['declarations'][0]['code']='NACR-1:CONDITION_NOT_MET'
    add(control, 'D4', 'CONTROL', 'EV3-CONDITION-NOT-MET', 'NON_DISCRIMINATING')
    a = c8_fresh(scratch)
    a['records'][a['subject']]['evidenceForm']='DE-4'
    t = a['contract'].targets['T0_0']
    a['contract'].targets['T0_0']=K.Target(t.name,t.leaves,False)
    add(a, 'D4', 'NEIGHBOR', 'EV4-REGISTRY-UNRESOLVED', 'INDETERMINATE')
    a = c8_fresh(scratch,'COUNTER_M')
    a['records'][a['subject']].update(evidenceForm='DE-4',treeTargetIds=['T2_0'])
    add(a, 'D4', 'NEIGHBOR', 'EV4-COUNTER-UNBOUND', 'INDETERMINATE')
    a = c8_fresh(scratch,'COUNTER_M');a['records'][a['subject']]['evidenceForm']='DE-4'
    add(a, 'D4', 'CONTROL', 'COUNTER-BOUND-CAP', 'NON_DISCRIMINATING')
    a = c8_fresh(scratch);a['records'][a['subject']]['evidenceForm']='DE-4'
    add(a, 'D4', 'CONTROL', 'EV-FULLY-SATISFIED', 'NON_DISCRIMINATING')

    # G1: count-defined vectors, not an unbounded Cartesian product.
    def vector(unresolved, no_co, sel_other=False, ncomp=1):
        c = c10_vector_contract(unresolved+no_co+1)
        if sel_other:
            m=c.mechanisms['M0']
            c.mechanisms['M0']=K.Mechanism(m.name,m.components,m.environment,
                                          m.comparators-{'M3'},m.consumers,m.negative)
        ident, raw=package(scratch);w,s=world(c,ident,raw,2,ncomp,supply_mode='joint')
        a=raw_case('C10',c,w,s,scratch)
        if sel_other:
            c9_add_support(a,'M3','C10-SEL-OTHER',('F2',))
            c8_retrace(a,{('C10-SEL-OTHER','T3_0'):'N'})
        ordered = ['M3']+sorted(set(c.mechanisms)-{'M0','M3'}) if sel_other else sorted(set(c.mechanisms)-{'M0'})
        us = set(ordered[:unresolved])
        for (eid,tt),tr in a['context']['traces'].items():
            if eid==a['subject']:
                tr['components']['c1']['MD3']={m:'UNRESOLVED' if m in us else 'NO_CO_ENTAILMENT' for m in tr['universe']}
        return a
    for u,n in ((1,2),(1,3),(1,4),(2,3)):
        add(vector(u,n), 'G1', 'DIRECT' if (u,n)==(1,2) else 'NEIGHBOR',
            str(u)+'U-'+str(n)+'N-CMP', 'NON_DISCRIMINATING',
            components={'c1':'NON_DISTINGUISHING'})
    add(vector(1,3,sel_other=True), 'G1', 'NEIGHBOR', '1U-3N-SEL-OTHER',
        'NON_DISCRIMINATING', components={'c1':'NON_DISTINGUISHING'})
    x=add(vector(1,4,ncomp=2), 'G1', 'NEIGHBOR', 'MULTI-COMPONENT-1U-4N',
          'DIRECT_SUPPORT', components={'c1':'NON_DISTINGUISHING','c2':'DISTINGUISHING'})
    perm(x)
    a=vector(1,4)
    for (eid,tt),tr in a['context']['traces'].items():
        if eid==a['subject']:
            tr['components']['c1']['MD3']={m:'NO_CO_ENTAILMENT' for m in tr['universe']}
    add(a,'G1','CONTROL','ALL-5-NO-CO','DIRECT_SUPPORT',components={'c1':'DISTINGUISHING'})
    # Frozen Cmp(TEST-RESULT) has five comparators; use actual frozen parser.
    for unresolved,role in ((1,'NEIGHBOR'),(2,'NEIGHBOR'),(0,'CONTROL')):
        ident,raw=package(scratch);c=copy.deepcopy(CONTRACT)
        w,s=world(c,ident,raw,1,1,subject='M-ADJ-TEST-RESULT')
        a=raw_case('C10',c,w,s,scratch);a['useFrozenRegistry']=True
        r=a['records'][a['subject']];r['treeTargetIds']=['TT-NTSTP-ES']
        r['componentSupply'][0]['componentId']='c2'
        r['missingComponents']=sorted(c.mechanisms[s.mechanism].components-{'c2'})
        c8_entry(a,'F1',s.mechanism,['c2']);c8_retrace(a)
        tr=a['context']['traces'][(a['subject'],'TT-NTSTP-ES')]
        assert len(tr['universe'])==5
        chosen=['M-ADJ-ARGUMENT-QUALITY']+sorted(set(tr['universe'])-{'M-ADJ-ARGUMENT-QUALITY'})
        tr['components']['c2']['MD3']={m:'UNRESOLVED' if m in chosen[:unresolved] else 'NO_CO_ENTAILMENT' for m in tr['universe']}
        add(a,'G1',role,'FROZEN-'+str(unresolved)+'U-'+str(5-unresolved)+'N',
            'NON_DISCRIMINATING' if unresolved else 'DIRECT_SUPPORT',
            components={'c2':'NON_DISTINGUISHING' if unresolved else 'DISTINGUISHING'})
    assert set(a['c10Family'] for a in made)==set(C10_FAMILIES)
    return made

_retained_corr9_cases = cases
_retained_corr9_run = run

def cases(scratch):
    retained = _retained_corr9_cases(scratch)
    assert len(retained)==933
    return retained+corr10_cases(scratch)

def run(builder,scratch):
    result=_retained_corr9_run(builder,scratch)
    ledger=result['caseLedger']
    retained=[r for r in ledger if not r['id'].startswith('C10-')]
    new=[r for r in ledger if r['id'].startswith('C10-')]
    assert len(retained)==933
    result.update(RETAINED_CORR9_CASES=933, NEW_CORR10_CASES=len(new),
                  NEW_CORR9_CASES=37, NEW_PROPERTY_CASE_COUNT=len(new),
                  corr10CaseLedger=new,
                  layerBCorr10Assertions=sum(len(r['layerBAssertions']) for r in new),
                  layerDCorr10Assertions=sum(len(r['holdCodeComparison']) for r in new),
                  layerDCorr10Worlds=sum(bool(r['holdCodeComparison']) for r in new),
                  retainedCORR9ExpectationDigest=hashlib.sha256(json.dumps(retained,sort_keys=True).encode()).hexdigest())
    result['fiveFinalClosureMatrix']={f:{role:[r['id'] for r in new if r['c9Family']==f and r['c9Role']==role]
                                       for role in ('DIRECT','NEIGHBOR','CONTROL')} for f in C10_FAMILIES}
    return result

if __name__=='__main__':sys.exit(main())
