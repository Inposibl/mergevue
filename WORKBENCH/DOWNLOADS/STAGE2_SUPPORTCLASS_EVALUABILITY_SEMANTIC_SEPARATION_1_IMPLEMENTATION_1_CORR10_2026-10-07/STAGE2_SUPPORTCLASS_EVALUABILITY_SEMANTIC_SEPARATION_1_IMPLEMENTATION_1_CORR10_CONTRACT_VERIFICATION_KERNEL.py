#!/usr/bin/env python3
"""CORR7 declarative relational reference model. SELF_VALIDATION ONLY.
No builder, validator, or prior IV code is imported. Data is contract normal form,
not implementation objects. Entailment/MD2/MD3 are recorded judgments, not inferred.
All predicate citations resolve through CONTRACT_MODEL.sources and properties.
"""
from __future__ import annotations
from dataclasses import dataclass, field
from collections import Counter
import hashlib
import json
import re
from pathlib import Path
import copy

@dataclass(frozen=True)
class Mechanism:
    name: str
    components: frozenset
    environment: str
    comparators: frozenset
    consumers: frozenset
    negative: str

@dataclass(frozen=True)
class Target:
    name: str
    leaves: frozenset
    exact: bool

@dataclass
class Fact:
    name: str
    asserted_text: object
    evidence_identity: object
    package_bytes: bytes | None
    certified_proposition: str | None = None
    certified_authority: str | None = None

@dataclass
class Supply:
    mechanism: str
    component: str
    suppliers: tuple

@dataclass
class Edge:
    name: str
    facts: tuple
    mechanism: str
    targets: tuple
    supplies: tuple
    missing: tuple
    relation: object
    form: object
    identity: dict
    source: object = 'COMPETENT'
    ambiguity: bool = False
    edge_state: str = 'SUPPORTED'
    declarations: tuple = ()
    analytical: bool = True
    prohibited_only: bool = False
    absence: object = None
    relevance: str = "ANALYTICAL_MAPPED"

@dataclass
class Entry:
    mechanism: str
    disposition: object
    entailed: tuple = ()
    missing: tuple = ()
    bases: object = None

@dataclass
class Witness:
    fact: str
    identity: dict
    registry: object
    entries: tuple

@dataclass
class Judgment:
    suppliers: tuple
    spans: object
    negative: object
    clause: object
    co: object

@dataclass
class Trace:
    edge: object
    target: object
    mechanism: object
    facts: tuple
    registry: object
    coder: object
    universe: tuple
    judgments: dict
    provenance: bool

@dataclass(frozen=True)
class Outcome:
    state: str
    evaluability: str | None
    bearing: str | None
    direction: str | None = None
    uniqueness: str | None = None
    reasons: tuple = ()
    why: tuple = ()
    hold: str | None = None

@dataclass
class World:
    edges: tuple
    facts: dict
    witnesses: dict
    traces: dict
    enumerable: bool = True
    registry_identity: object = None
    boundary_errors: tuple = ()

@dataclass
class Contract:
    mechanisms: dict
    targets: dict
    registry_identity: str
    nacr: dict
    relations: frozenset
    forms: frozenset
    codes: frozenset
    predicate_sources: dict
    output_prohibited: frozenset
    counter_of: dict = field(default_factory=dict)
    domains: dict = field(default_factory=dict)

    @classmethod
    def load(cls, model):
        ms={m:Mechanism(m,frozenset(v['components']),v['environment'],frozenset(v['comparators']),frozenset(v['consumers']),v['negative_cell']) for m,v in model['mechanisms'].items()}
        ts={t:Target(t,frozenset(v['leaves']),v['verdict']=='EXACT' and v['documentary']=='DOCUMENTARY_COMPLETE_CANDIDATE') for t,v in model['targets'].items()}
        return cls(ms,ts,model['sources']['registry']['sha256'],model['nacr'],frozenset(model['domains']['relation']),frozenset(model['domains']['evidenceForm']),frozenset(model['domains']['abstention']),{p['PROPERTY_ID']:p for p in model['properties']},frozenset(model['domains']['prohibitedOutputFields']),model['counterOf'],model['domains'])

IDENTITY=('side','caseId','factualPackageIdentity','contractIdentity','vocabularyVersion','coderIdentity')

def typed_equal(a,b):
    """W-2/P09: JSON-type equality, including nested number/bool distinctions."""
    if type(a) is not type(b): return False
    if isinstance(a,dict): return a.keys()==b.keys() and all(typed_equal(a[k],b[k]) for k in a)
    if isinstance(a,(list,tuple)): return len(a)==len(b) and all(typed_equal(x,y) for x,y in zip(a,b))
    return a==b

def identity_agrees(a,b):
    return all(k in a and k in b and a[k] not in (None,'',{}) and b[k] not in (None,'',{}) and typed_equal(a[k],b[k]) for k in IDENTITY)

def clauses(cell):
    """Independent regex lexer. A full token stream, not the builder state machine.
    Third-oracle vectors in PROPERTY_SUITE cover escaped, curly, unbalanced quotes.
    """
    if not isinstance(cell, str): return frozenset()
    token = re.compile(r'"(?:\\.|[^"\\])*"|“(?:\\.|[^”\\])*”|‘(?:\\.|[^’\\])*’|[^;"“‘]+|;')
    found = list(token.finditer(cell))
    if ''.join(x.group() for x in found) != cell: return frozenset()
    chunks = ['']
    for hit in found:
        value = hit.group()
        if value == ';': chunks.append('')
        else: chunks[-1] += value
    return frozenset(x.strip().removesuffix('.').strip() for x in chunks if x.strip())


def certified(fact, edge):
    # Layer B only consumes an authoritative CertifiedFact projection. It never
    # interprets caller paths, inline locator metadata or self-declared digests.
    return (isinstance(fact.certified_authority,str) and bool(fact.certified_authority)
            and isinstance(fact.certified_proposition,str)
            and typed_equal(fact.asserted_text,fact.certified_proposition)
            and typed_equal(fact.evidence_identity,edge.identity.get('factualPackageIdentity')))


class BoundaryOracle:
    """Layer A: deliberately small raw-to-canonical oracle, no semantic rules.
    The production map is hash-bound. Synthetic records are a runner-provided
    lookup distinct from production, not inline identity locator authority.
    """
    MAP_SHA='665aac81c2e0127d08f0406186891959255391cb99ec34611a972209565f4a7f'
    KEYS=('caseSlug','stage1Generation','packageDir','recordFile','recordFormat','recordFileBytes','recordFileSha256')
    def __init__(self, model, root, trusted_base=None, synthetic=None):
        self.domains=model['domains'];self.root=Path(root).resolve()
        self.base=Path(trusted_base).resolve() if trusted_base else self.root.parent
        raw=(self.root/'WORKBENCH/DOWNLOADS/STAGE2_CORR4_PILOT_STAGE1_SOURCE_MAP.json').read_bytes()
        if hashlib.sha256(raw).hexdigest()!=self.MAP_SHA:raise ValueError('unbound source map')
        self.map=json.loads(raw)['cases'];self.synthetic=synthetic
        matrix_source=model['sources']['field_source_matrix']
        matrix_raw=(self.root/matrix_source['path']).read_bytes()
        if hashlib.sha256(matrix_raw).hexdigest()!=matrix_source['sha256']:raise ValueError('unbound PI-3 matrix')
        slot=next(x for x in json.loads(matrix_raw)['fields'] if x['FIELD']=='factualPackageIdentity')['NOTE']
        # Matrix enumerates nine physical members before the locator phrase.
        names=re.findall(r'\b[a-z0-9]+[A-Z][A-Za-z0-9]*\b',slot.split(' and the exact ')[0])
        self.slot_members=frozenset(names)
        self.identity_labels=frozenset(k for row in self.map for k in row
                                      if re.fullmatch(r'(caseId|factId|sideId)(Key|Locator)',k))
        self.authority_label=Path(model['sources']['package_locators']['path']).name
        self.minimum=self.slot_members-{'packageFactCount','packageSideCount'}
        self.identity_shape=self.slot_members|self.identity_labels|{'identityAuthority','identityAuthoritySha256'}

    def proposition(self, package, fid, case, side):
        if self.synthetic is not None and typed_equal(package,self.synthetic['identity']):
            path=Path(self.synthetic['path']).resolve()
            if not path.is_relative_to(Path('/private/tmp')):return None,None
            raw=path.read_bytes()
            if hashlib.sha256(raw).hexdigest()!=self.synthetic['digest']:return None,None
            doc=json.loads(raw);records=[r for r in doc['facts'] if r['factId']==fid]
            if len(records)==1 and doc['caseId']==case and records[0]['side']==side:
                return records[0]['certifiedText'],self.synthetic['identity']['syntheticAuthority']
            return None,None
        if not isinstance(package,dict):return None,None
        if not self.minimum <= package.keys() <= self.identity_shape:return None,None
        # Expected identity is a relation over frozen rows, with count aliases
        # and authority-object labels derived independently of production.
        candidates=[]
        for source in self.map:
            assertions={k:source[k] for k in self.slot_members|self.identity_labels if k in source}
            assertions.update(packageFactCount=source['factCount'],packageSideCount=source['sideCount'],
                              identityAuthority=self.authority_label,identityAuthoritySha256=self.MAP_SHA)
            if all(k in assertions and typed_equal(v,assertions[k]) for k,v in package.items()):candidates.append(source)
        if len(candidates)!=1:return None,None
        row=candidates[0]
        file=Path(row['recordFile'])
        file=(self.base/file).resolve()
        if self.base!=file and self.base not in file.parents:return None,None
        if file.parent!=Path(row['packageDir']).resolve():return None,None
        try:
            raw=file.read_bytes()
            if len(raw)!=row['recordFileBytes'] or hashlib.sha256(raw).hexdigest()!=row['recordFileSha256']:return None,None
            doc=json.loads(raw) if row['recordFormat']=='json' else None
            records=(doc if isinstance(doc,list) else doc[row['recordListKey']]) if doc is not None else [json.loads(x) for x in raw.splitlines() if x.strip()]
            hits=[r for r in records if typed_equal(r.get(row['factIdKey']),fid)]
            if len(hits)!=1:return None,None
            obj=hits[0]
            actual_case=doc.get(row['caseIdKey']) if row['caseIdLocator'].startswith('package-level') else obj.get(row['caseIdKey'])
            if not typed_equal(actual_case,case) or not typed_equal(obj.get(row['sideIdKey']),side):return None,None
            text=obj.get(row['factTextKey'])
            return (text,'FROZEN_STAGE1_SOURCE_MAP:'+self.MAP_SHA) if isinstance(text,str) and text else (None,None)
        except (OSError,ValueError,KeyError,TypeError,AttributeError):return None,None

    def variant(self,row):
        if not isinstance(row,dict):return ('unreadable row',)
        kind=row.get('relevanceState');issues=[]
        if kind not in self.domains['relevanceState']:return ('relevance outside domain',)
        facts=row.get('factIds')
        if not isinstance(facts,list) or not facts or any(type(f)!=str or not f for f in facts) or len(set(facts))!=len(facts):issues.append('fact membership unknown')
        analytical=kind=='ANALYTICAL_MAPPED'
        for key in ('relation','evidenceForm','sourceQualityState','edgeState'):
            val=row.get(key)
            if val is None and not analytical:continue
            if type(val)!=str or val not in self.domains[key]:issues.append('domain '+key)
        if analytical:
            for key in ('mechanismPropositionIds','treeTargetIds'):
                items=row.get(key)
                if not isinstance(items,list) or not items or any(type(x)!=str or not x for x in items) or len(set(items))!=len(items):issues.append('analytical list '+key)
            if isinstance(row.get('mechanismPropositionIds'),list) and len(row['mechanismPropositionIds'])!=1:issues.append('single M')
            sup=row.get('componentSupply')
            if not isinstance(sup,list):issues.append('supply list')
            else:
                for s in sup:
                    ids=s.get('factIds') if isinstance(s,dict) else None
                    expected={'mechanismPropositionId','componentId','factIds','relationInstanceId','organizationalObjectRef','linkageEvidence'}
                    if not isinstance(s,dict) or set(s)!=expected:issues.append('six supply members')
                    elif s['mechanismPropositionId'] not in (row.get('mechanismPropositionIds') or []) or type(s['componentId'])!=str or not s['componentId'] or not isinstance(s['linkageEvidence'],dict):issues.append('supply shape binding')
                    if not isinstance(ids,list) or not ids or any(type(x)!=str or not x for x in ids) or len(set(ids))!=len(ids) or (isinstance(facts,list) and not set(ids)<=set(facts)):issues.append('supply membership')
        elif any(row.get(k) not in (None,[]) for k in ('mechanismPropositionIds','treeTargetIds','componentSupply')):issues.append('concealed analytical content')
        return tuple(issues)

    def canonicalize(self, raw_records, ctx, registry_identity):
        problems=[];rows=[];groups=ctx.get('coderOutput')
        if not isinstance(groups,dict):problems.append('unreadable coderOutput')
        else:
            for group in groups.values():
                if not isinstance(group,list):problems.append('unreadable group');continue
                for row in group:
                    problems.extend(self.variant(row))
                    if isinstance(row,dict) and row not in rows:rows.append(row)
        edges=[];facts={};witnesses={};traces={}
        for row in rows:
            ids=row.get('factIds') if isinstance(row.get('factIds'),list) else []
            mids=row.get('mechanismPropositionIds') or [];targets=row.get('treeTargetIds') or []
            identity={k:copy.deepcopy(row.get(k)) for k in IDENTITY}
            supplies=tuple(Supply(s.get('mechanismPropositionId'),s.get('componentId'),tuple(s.get('factIds') or ())) for s in (row.get('componentSupply') or []) if isinstance(s,dict))
            a=row.get('ambiguity') or {};amb=bool(isinstance(a,dict) and a.get('competingMechanismIds') and a.get('resolutionState')!='RESOLVED')
            declarations=tuple((d.get('code'),d.get('mechanismPropositionId'),d.get('componentId')) for d in ((row.get('abstention') or {}).get('declarations') or []) if isinstance(d,dict))
            edge=Edge(row.get('edgeId'),tuple(ids),mids[0] if mids else None,tuple(targets),supplies,tuple(row.get('missingComponents') or ()),row.get('relation'),row.get('evidenceForm'),identity,row.get('sourceQualityState'),amb,row.get('edgeState'),declarations,row.get('relevanceState')=='ANALYTICAL_MAPPED',bool(row.get('prOnlyBasis')),row.get('absenceEvidenceState'),row.get('relevanceState'))
            edges.append(edge)
            for fid in ids:
                evidence=(ctx.get('factualEvidence') or {}).get(fid) or {}
                text,authority=self.proposition(identity['factualPackageIdentity'],fid,identity['caseId'],identity['side'])
                facts[fid]=Fact(fid,evidence.get('certifiedText'),evidence.get('factualPackageIdentity'),None,text,authority)
        for fid,w in (ctx.get('witness') or {}).items():
            if not isinstance(w,dict):continue
            entries=tuple(Entry(e.get('mechanismPropositionId'),e.get('disposition'),tuple(e.get('entailedComponents') or ()),tuple(e.get('missingComponents') or ()),e.get('bases')) for e in (w.get('entries') or []) if isinstance(e,dict))
            witnesses[fid]=Witness(w.get('factId'),{k:copy.deepcopy(w.get(k)) for k in IDENTITY},w.get('registryIdentity'),entries)
        for key,tr in (ctx.get('traces') or {}).items():
            if not isinstance(tr,dict):continue
            js={}
            for comp,j in (tr.get('components') or {}).items():
                if not isinstance(j,dict):continue
                basis=j.get('basis') or {};js[comp]=Judgment(tuple(basis.get('factIds') or ()),basis.get('entailmentBasis'),j.get('MD2'),j.get('explicitNonMeaningClause'),j.get('MD3'))
            flags=tr.get('judgmentFlags');prov=isinstance(flags,dict) and {'MD1','MD2','MD3'}<=set(flags)
            traces[key]=Trace(tr.get('record'),tr.get('treeTargetId'),tr.get('mechanismPropositionId'),tuple(tr.get('factIds') or ()),tr.get('registryIdentity'),tr.get('coderIdentity'),tuple(tr.get('universe') or ()),js,prov)
        return World(tuple(edges),facts,witnesses,traces,not problems,registry_identity,tuple(problems))


class Kernel:
    def __init__(self,contract): self.c=contract

    def contained(self,payload):
        """P14 / Owner §17, cor1 §16, accepted §15, registry §I.
        Check output keys independently of the implementation's recursive guard.
        This proves key containment only; it does not certify hidden computation.
        """
        banned={name.casefold() for name in self.c.output_prohibited}
        pending=[payload]
        while pending:
            obj=pending.pop()
            if isinstance(obj,dict):
                if any(isinstance(name,str) and name.strip().casefold() in banned for name in obj): return False
                pending.extend(obj.values())
            elif isinstance(obj,(list,tuple)): pending.extend(obj)
        return True

    def closed(self,world,fact):
        """P02/P05/P06/P10, cor1 §6.5 W-1..W-4 + H-5."""
        errors=[]; w=world.witnesses.get(fact)
        if not world.enumerable: return False,('P05: supplied coder output cannot be enumerated',)
        if not isinstance(w,Witness): return False,('P02: required W(f) absent',)
        entries=w.entries; counts=Counter(e.mechanism for e in entries)
        if counts!=Counter(self.c.mechanisms.keys()) or any(e.disposition not in {'SELECTED','NOT_SELECTABLE'} for e in entries): errors.append('P02/W-1: non-exact census')
        rows=[r for r in world.edges if fact in r.facts]; lookup={e.mechanism:e for e in entries}
        if not rows or w.fact!=fact or not typed_equal(w.registry,self.c.registry_identity): errors.append('P02/W-2: unbound fact/registry')
        for r in rows:
            if not identity_agrees(w.identity,r.identity): errors.append('P02/W-2: identity mismatch')
        for mid,m in self.c.mechanisms.items():
            e=lookup.get(mid); material=[r for r in rows if r.relation=='SUPPORTS_LEAF' and r.mechanism==mid]
            if e is None: continue
            if e.disposition=='NOT_SELECTABLE':
                if material: errors.append('P06/W-3: unselected materialization')
                continue
            coverage={t for r in material for t in r.targets}
            if not material or coverage!=m.consumers or any(not r.analytical for r in material): errors.append('P02/W-3: selected materialization/TT coverage')
            wanted=set(e.entailed)
            if not wanted or len(wanted)!=len(e.entailed) or not wanted<=m.components or set(e.missing)!=m.components-wanted or not isinstance(e.bases,dict) or set(e.bases)!=wanted: errors.append('P10/W-4: witness component partition')
            supplied={s.component for r in rows for s in r.supplies if s.mechanism==mid and fact in s.suppliers}
            if supplied!=wanted: errors.append('P10/W-4: per-fact supply mismatch')
        # W-4: relational anti-join. Every supply of every row of f must have
        # a matching SELECTED witness entry and entailed component for its supplier.
        inconsistent=[(r.name,s.mechanism,s.component) for r in rows for s in r.supplies
                      if fact in s.suppliers and
                      (s.mechanism not in lookup or lookup[s.mechanism].disposition!='SELECTED'
                       or s.component not in lookup[s.mechanism].entailed)]
        if inconsistent:errors.append('P10/W-4: supply without matching witness '+repr(inconsistent))
        # Co-entailment belongs to the basis's supplying fact, not to every fact
        # carried on a multi-fact record (H-5/P10).
        for r in rows:
            for t in r.targets:
                tr=world.traces.get((r.name,t))
                if tr is None: continue
                for j in tr.judgments.values():
                    if fact not in j.suppliers or not isinstance(j.co,dict): continue
                    for mid,token in j.co.items():
                        hit=re.fullmatch(r'CO_ENTAILS (c\d+)',token) if isinstance(token,str) else None
                        if hit:
                            e=lookup.get(mid)
                            if e is None or e.disposition!='SELECTED' or hit[1] not in e.entailed: errors.append('P10/W-4: co-entailment outside supplying witness')
        return not errors,tuple(errors)

    def universe(self,world,edge):
        """CORR1 T-1 / accepted §10 S6: use declared Sel_other, not closed(W).
        W-1..W-4 remain mandatory only on the S7 DIRECTIONAL SL path.
        """
        selected={entry.mechanism for fact in edge.facts
                  for entry in (world.witnesses[fact].entries if fact in world.witnesses else ())
                  if entry.disposition=='SELECTED' and entry.mechanism in self.c.mechanisms}
        m=self.c.mechanisms[edge.mechanism]
        errors=() if edge.facts else ('P02: empty fact basis',)
        return m.comparators|{n for n in selected if self.c.mechanisms[n].environment!=m.environment},errors

    def direction(self,world,edge,target):
        """cor1 §6.6 T-1..T-5, §9.4 MD-1..MD-3; P01/P02/P07/P09."""
        universe,errors=self.universe(world,edge)
        if errors: return 'HELD',errors
        tr=world.traces.get((edge.name,target)); m=self.c.mechanisms[edge.mechanism]
        if tr is None: return 'HELD',('P02/T-1: trace absent',)
        if not (tr.edge==edge.name and tr.target==target and tr.mechanism==m.name and set(tr.facts)==set(edge.facts) and len(tr.facts)==len(edge.facts) and typed_equal(tr.registry,self.c.registry_identity) and typed_equal(tr.coder,edge.identity.get('coderIdentity')) and tr.provenance): return 'HELD',('P02/T-1/T-5: trace key or provenance',)
        if len(tr.universe)!=len(set(tr.universe)) or set(tr.universe)!=universe: return 'HELD',('P02/T-1: incomplete comparator universe',)
        supply={s.component:s for s in edge.supplies if s.mechanism==m.name}
        if len(supply)!=len(edge.supplies) or set(tr.judgments)!=set(supply) or not supply: return 'HELD',('P09/T-2: component binding',)
        distinguishing=[]; errors=[]
        for comp,j in tr.judgments.items():
            s=supply[comp]
            if comp not in m.components or not j.suppliers or not set(j.suppliers)<=set(s.suppliers)<=set(edge.facts) or not isinstance(j.spans,dict) or not j.spans: errors.append('P09/T-2: supply/basis relation');continue
            if any(f not in world.facts or not certified(world.facts[f],edge) for f in j.suppliers): errors.append('P09/T-2: unverified factual package');continue
            if any(not isinstance(span,str) or not span or not any(span in world.facts[f].asserted_text for f in j.suppliers) for span in j.spans.values()): errors.append('P09/T-2: uncertified content');continue
            if j.negative not in {'TRIGGERED','NOT_TRIGGERED'}: errors.append('P07/T-2: unknown MD2');continue
            if j.negative=='TRIGGERED' and (not isinstance(j.clause,str) or j.clause.strip().removesuffix('.').strip() not in clauses(m.negative)): errors.append('P07/T-2: incomplete clause');continue
            if not isinstance(j.co,dict) or not set(j.co)<=universe: errors.append('P02/T-3: comparator domain');continue
            tokens=[]
            for other,token in j.co.items():
                valid=token in ('NO_CO_ENTAILMENT','UNRESOLVED') if isinstance(token,str) else False
                if isinstance(token,str) and token.startswith('CO_ENTAILS '): valid=token[11:] in self.c.mechanisms[other].components
                if not valid: errors.append('P02/T-3: unknown judgment')
                tokens.append(token)
            neg=j.negative=='TRIGGERED' or any(t!='NO_CO_ENTAILMENT' for t in tokens)
            full=set(j.co)==universe and all(t=='NO_CO_ENTAILMENT' for t in tokens)
            if not neg and not full: errors.append('P02/T-3: missing judgment')
            distinguishing.append(not neg and full)
        if errors: return 'HELD',tuple(errors)
        return ('DIRECTIONAL' if any(distinguishing) else 'NON_DIRECTIONAL'),()

    def local(self,world,edge,target):
        """P01; closed admission then EV then ordered B-1..B-3; no uniqueness."""
        def held(*why):
            # Layer B records its own stage-specific hold, independent of D.
            text=' '.join(why)
            if edge.relevance!='ANALYTICAL_MAPPED':code='HOLD-NA'
            elif 'AV-1:' in text:code='HOLD-ND'
            elif 'AV-2:' in text:code='HOLD-AMB'
            elif any(v in text for v in ('P08:','AV-3:','AV-6:','enum admission')):code='HOLD-NA'
            elif 'Layer A:' in text or 'P05:' in text:code='HOLD-U'
            else:code='HOLD-T'
            return Outcome('HELD',None,None,why=why,hold=code)
        if not world.enumerable: return held('Layer A: raw boundary rejected')
        if not edge.analytical or target not in edge.targets: return Outcome('NOT_APPLICABLE',None,None)
        if not isinstance(edge.relation,str) or not isinstance(edge.form,str) or edge.relation not in self.c.relations or edge.form not in self.c.forms: return held('P11: closed enum admission')
        if not world.enumerable: return held('P05: non-enumerable supplied output')
        m=self.c.mechanisms.get(edge.mechanism)
        if m is None: return held('P02: unknown mechanism')
        if not typed_equal(world.registry_identity,self.c.registry_identity): return held('P08: unbound registry')
        explained=any(code in self.c.nacr and mid==self.c.nacr[code]['mechanism'] and comp==self.c.nacr[code]['component'] for code,mid,comp in edge.declarations)
        if edge.edge_state=='NOT_DETERMINABLE' and edge.source!='CONTENT_INACCESSIBLE' and not explained:return held('AV-1: unexplained NOT_DETERMINABLE')
        if (edge.edge_state=='AMBIGUOUS')!=edge.ambiguity:return held('AV-2: ambiguity mismatch')
        supplied={s.component for s in edge.supplies if s.mechanism==m.name}; nonassessable=set(); disposed=set()
        for code,mid,comp in edge.declarations:
            if not isinstance(code,str) or code not in self.c.codes: return held('P08: non-domain abstention')
            if code.startswith('NACR-'):
                clause=self.c.nacr[code.split(':')[0]]
                if mid!=clause['mechanism'] or comp!=clause['component']: return held('P08: foreign NACR component')
                disposed.add((mid,comp))
                if ':' not in code and mid==m.name: nonassessable.add(comp)
            if code=='SRC-INACCESSIBLE' and edge.source!='CONTENT_INACCESSIBLE': return held('AV-3: inconsistent source declaration')
        for clause in self.c.nacr.values():
            if clause['mechanism']==m.name and clause['component'] not in supplied and (m.name,clause['component']) not in disposed: return held('AV-3: missing NACR disposition')
        if supplied&nonassessable: return held('AV-6: supplied/non-assessable contradiction')
        if edge.edge_state=='NOT_DETERMINABLE' and edge.source!='CONTENT_INACCESSIBLE' and not nonassessable: return held('AV-1: unexplained NOT_DETERMINABLE')
        if (edge.edge_state=='AMBIGUOUS')!=edge.ambiguity: return held('AV-2: ambiguity mismatch')
        ev=[]
        if edge.source=='CONTENT_INACCESSIBLE': ev.append('SOURCE_CONTENT_INACCESSIBLE')
        if edge.ambiguity: ev.append('MECHANISM_READING_AMBIGUOUS')
        if nonassessable: ev.append('COMPONENT_NOT_ASSESSABLE')
        tt=self.c.targets.get(target)
        if tt is None or not tt.exact or (m.name not in tt.leaves and not (edge.relation=='COUNTER_M' and set(self.c.counter_of.get(m.name,())) & tt.leaves)): ev.append('TARGET_BINDING_UNRESOLVED')
        if ev: return Outcome('INDETERMINATE','INDETERMINATE',None,reasons=tuple(ev),why=('EV-1..EV-4 closed signature',))
        if edge.form=='DE-4' or edge.prohibited_only: return Outcome('NON_DISCRIMINATING','EVALUABLE','NON_DISCRIMINATING','NON_DIRECTIONAL',why=('P12: frozen DE-4/prohibited ceiling',))
        if edge.relation=='NEGATES_LEAF':
            bearing='DIRECT_CONTRADICTION' if edge.absence=='COMPETENT_AFFIRMATIVE_ABSENCE' else 'NON_DISCRIMINATING'
            return Outcome(bearing,'EVALUABLE',bearing,why=('SEP-B-2/J-2',))
        counter_bound=bool(set(self.c.counter_of.get(m.name,())) & tt.leaves)
        if edge.relation=='COUNTER_M' and not counter_bound:return Outcome('NON_DISCRIMINATING','EVALUABLE','NON_DISCRIMINATING',why=('B-2(ii): no registry counter',))
        status,why=self.direction(world,edge,target)
        if status=='HELD': return held(*why)
        if edge.relation=='COUNTER_M':
            bearing='DIRECT_CONTRADICTION' if status=='DIRECTIONAL' else 'NON_DISCRIMINATING'
            return Outcome(bearing,'EVALUABLE',bearing,status,why=('SEP-B-2(ii)',))
        if status=='NON_DIRECTIONAL': return Outcome('NON_DISCRIMINATING','EVALUABLE','NON_DISCRIMINATING',status,why=('T-4: every supplied component witnessed non-distinguishing',))
        return Outcome('DIRECTIONAL','EVALUABLE',None,'DIRECTIONAL',why=('T-4: at least one lawful distinguishing component',))

    def evaluate(self,world,edge,target):
        local=self.local(world,edge,target)
        if local.state!='DIRECTIONAL': return local
        # cor1 §9.5 status priority is per selected alternative mechanism;
        # accepted §7 gives U-X before U-2 before U-3 before U-0/U-1.
        statuses=[]
        for fact in edge.facts:
            closed,why=self.closed(world,fact)
            if not closed: return Outcome('HELD',None,None,why=why,hold='HOLD-U')
            for entry in world.witnesses[fact].entries:
                other=self.c.mechanisms[entry.mechanism]
                if entry.disposition!='SELECTED' or other.environment==self.c.mechanisms[edge.mechanism].environment: continue
                rows=[r for r in world.edges if fact in r.facts and r.mechanism==other.name and r.relation=='SUPPORTS_LEAF']
                states=[self.local(world,r,t).state for r in rows for t in r.targets]
                status=min(states,key=ALT_PRIORITY.__getitem__) if states else 'HELD'
                statuses.append(status)
        facts = {'held': 'HELD' in statuses, 'shared': 'DIRECTIONAL' in statuses,
                 'unresolved': 'INDETERMINATE' in statuses, 'empty': not statuses}
        for predicate, state, bearing, rule in UNIQUENESS_TABLE:
            if predicate == 'otherwise' or facts[predicate]:
                return Outcome(state,None if state=='HELD' else 'EVALUABLE',bearing,'DIRECTIONAL',rule,why=('SEP-U table '+rule,),hold='HOLD-U' if state=='HELD' else None)


ALT_PRIORITY={'DIRECTIONAL':0,'INDETERMINATE':1,'HELD':2,'NON_DISCRIMINATING':3,'NON_DIRECTIONAL':3}
UNIQUENESS_TABLE=(('held','HELD',None,'U-X'),('shared','SHARED_NON_UNIQUE','SHARED_NON_UNIQUE','U-2'),('unresolved','UNIQUENESS_UNRESOLVED',None,'U-3'),('empty','DIRECT_SUPPORT','DIRECT_SUPPORT','U-0'),('otherwise','DIRECT_SUPPORT','DIRECT_SUPPORT','U-1'))


class HoldOrderOracle:
    """Layer D: separate S2→S4→S6→S7 projection from frozen §10.
    Imports no builder; never invokes Kernel.local/evaluate/direction/universe.
    Shares immutable canonical data and the preserved pure W-closure predicate.
    Alternatives are projected to S4/S6 with no W admission or S7 recursion.
    """
    def __init__(self, contract): self.c=contract

    def stage(self, w, r, target):
        if r.relevance!='ANALYTICAL_MAPPED':return 'HELD','HOLD-NA'
        if not w.enumerable:return 'HELD','HOLD-U'
        if not r.analytical or target not in r.targets:return 'NOT_APPLICABLE',None
        m=self.c.mechanisms.get(r.mechanism)
        if m is None:return 'HELD','HOLD-T'
        # AV-1/2 precede AV-3/6, even with broken W.
        explained=any(code in self.c.nacr and mid==self.c.nacr[code]['mechanism']
                      and comp==self.c.nacr[code]['component'] for code,mid,comp in r.declarations)
        if r.edge_state=='NOT_DETERMINABLE' and r.source!='CONTENT_INACCESSIBLE' and not explained:return 'HELD','HOLD-ND'
        if (r.edge_state=='AMBIGUOUS')!=r.ambiguity:return 'HELD','HOLD-AMB'
        if (r.relation not in self.c.relations or r.form not in self.c.forms
                or not typed_equal(w.registry_identity,self.c.registry_identity)):return 'HELD','HOLD-NA'
        supplied={s.component for s in r.supplies if s.mechanism==m.name}
        na=set(); disposed=set()
        for code,mid,comp in r.declarations:
            if code not in self.c.codes:return 'HELD','HOLD-NA'
            if code.startswith('NACR-'):
                item=self.c.nacr[code.split(':')[0]]
                if (mid,comp)!=(item['mechanism'],item['component']):return 'HELD','HOLD-NA'
                disposed.add((mid,comp))
                if ':' not in code and mid==m.name:na.add(comp)
            if code=='SRC-INACCESSIBLE' and r.source!='CONTENT_INACCESSIBLE':return 'HELD','HOLD-NA'
        if any(a['mechanism']==m.name and a['component'] not in supplied
               and (m.name,a['component']) not in disposed for a in self.c.nacr.values()):return 'HELD','HOLD-NA'
        if supplied & na:return 'HELD','HOLD-NA'
        tt=self.c.targets.get(target)
        bound=bool(tt and (m.name in tt.leaves or (r.relation=='COUNTER_M'
                  and set(self.c.counter_of.get(m.name,())) & tt.leaves)))
        if r.source=='CONTENT_INACCESSIBLE' or r.ambiguity or na or not tt or not tt.exact or not bound:return 'INDETERMINATE',None
        if r.form=='DE-4' or r.prohibited_only:return 'NON_DIRECTIONAL',None
        if r.relation=='NEGATES_LEAF':return ('CONTRADICTION' if r.absence=='COMPETENT_AFFIRMATIVE_ABSENCE' else 'NON_DIRECTIONAL'),None
        if r.relation=='COUNTER_M' and not (set(self.c.counter_of.get(m.name,())) & tt.leaves):return 'NON_DIRECTIONAL',None
        tr=w.traces.get((r.name,target))
        declared={e.mechanism for f in r.facts for e in (w.witnesses[f].entries if f in w.witnesses else ())
                  if e.disposition=='SELECTED' and e.mechanism in self.c.mechanisms}
        census=m.comparators | {n for n in declared if self.c.mechanisms[n].environment!=m.environment}
        valid=bool(r.facts and tr and tr.edge==r.name and tr.target==target and tr.mechanism==m.name
                   and len(tr.facts)==len(r.facts) and set(tr.facts)==set(r.facts)
                   and typed_equal(tr.registry,self.c.registry_identity)
                   and typed_equal(tr.coder,r.identity.get('coderIdentity')) and tr.provenance)
        if not valid:return 'HELD','HOLD-T'
        supply={s.component:s for s in r.supplies if s.mechanism==m.name}
        if (len(tr.universe)!=len(set(tr.universe)) or set(tr.universe)!=census
                or not supply or len(supply)!=len(r.supplies) or set(tr.judgments)!=set(supply)):return 'HELD','HOLD-T'
        directional=False
        for component,j in tr.judgments.items():
            s=supply[component]
            if (component not in m.components or not j.suppliers or not set(j.suppliers)<=set(s.suppliers)<=set(r.facts)
                    or not isinstance(j.spans,dict) or not j.spans):return 'HELD','HOLD-T'
            if any(f not in w.facts or not certified(w.facts[f],r) for f in j.suppliers):return 'HELD','HOLD-T'
            if any(not isinstance(span,str) or not span or not any(span in w.facts[f].asserted_text for f in j.suppliers)
                   for span in j.spans.values()):return 'HELD','HOLD-T'
            if j.negative not in ('TRIGGERED','NOT_TRIGGERED'):return 'HELD','HOLD-T'
            if j.negative=='TRIGGERED' and (not isinstance(j.clause,str) or j.clause.strip().removesuffix('.').strip() not in clauses(m.negative)):return 'HELD','HOLD-T'
            if not isinstance(j.co,dict) or not set(j.co)<=census:return 'HELD','HOLD-T'
            nondistinguishing=j.negative=='TRIGGERED'
            for other,token in j.co.items():
                if not isinstance(token,str):return 'HELD','HOLD-T'
                if token not in ('NO_CO_ENTAILMENT','UNRESOLVED') and not (token.startswith('CO_ENTAILS ') and token[11:] in self.c.mechanisms[other].components):return 'HELD','HOLD-T'
                nondistinguishing |= token!='NO_CO_ENTAILMENT'
            if not nondistinguishing and set(j.co)!=census:return 'HELD','HOLD-T'
            directional |= not nondistinguishing and set(j.co)==census
        state='DIRECTIONAL' if directional else 'NON_DIRECTIONAL'
        if r.relation=='COUNTER_M' and directional:state='CONTRADICTION'
        return state,None

    def expected(self, world, edge, target):
        status,hold=self.stage(world,edge,target)
        if hold or status!='DIRECTIONAL' or edge.relation!='SUPPORTS_LEAF':return hold
        # W(f) closure applies only to the subject's S7 path.
        closure=Kernel(self.c)
        if any(not closure.closed(world,f)[0] for f in edge.facts):return 'HOLD-U'
        priorities={'DIRECTIONAL':0,'INDETERMINATE':1,'HELD':2,'NON_DIRECTIONAL':3,'NOT_APPLICABLE':3,'CONTRADICTION':3}
        for fact in edge.facts:
            for entry in world.witnesses[fact].entries:
                if entry.disposition!='SELECTED' or self.c.mechanisms[entry.mechanism].environment==self.c.mechanisms[edge.mechanism].environment:continue
                rows=[r for r in world.edges if fact in r.facts and r.mechanism==entry.mechanism and r.relation=='SUPPORTS_LEAF']
                states=[self.stage(world,r,t)[0] for r in rows for t in r.targets]
                if not states or min(states,key=priorities.__getitem__)=='HELD':return 'HOLD-U'
        return None
