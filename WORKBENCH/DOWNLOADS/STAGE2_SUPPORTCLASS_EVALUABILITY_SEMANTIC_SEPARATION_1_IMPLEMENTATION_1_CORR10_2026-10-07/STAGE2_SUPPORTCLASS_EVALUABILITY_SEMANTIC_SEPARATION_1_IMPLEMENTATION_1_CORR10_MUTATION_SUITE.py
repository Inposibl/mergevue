#!/usr/bin/env python3
"""CORR7 semantic mutation adequacy, author self-validation only.
Defect classes reconstructed from frozen rules and published findings. No IV
harness import. Source mutants execute in memory; no repository write/import cache.
Every kill must be a semantic disagreement, never a compile/runtime exception.
"""
import argparse,copy,hashlib,json,sys,types
from pathlib import Path
sys.dont_write_bytecode=True
PREFIX='STAGE2_SUPPORTCLASS_EVALUABILITY_SEMANTIC_SEPARATION_1_IMPLEMENTATION_1_CORR10'
HERE=Path(__file__).resolve().parent
import importlib.util
spec=importlib.util.spec_from_file_location('corr8_property',HERE/(PREFIX+'_PROPERTY_SUITE.py'));P=importlib.util.module_from_spec(spec);sys.modules[spec.name]=P;spec.loader.exec_module(P)

def edit(source,old,new):
    if source.count(old)!=1:raise ValueError('mutation site must be unique: '+repr(old))
    return source.replace(old,new)

def mutant_defs(source):
    ds=[]
    def add(mid,invariant,prop,witness,old,new):ds.append((mid,invariant,prop,witness,edit(source,old,new)))
    add('FM01','SEP-U: every alternative own TT','P01','ALT-SECOND-TT-D','for tt in (r.get("treeTargetIds") or []):\n            statuses.append','for tt in (r.get("treeTargetIds") or [])[:1]:\n            statuses.append')
    add('FM02','T1: every closed fact contributes comparator universe','P02','SECOND-FACT-ALTERNATIVE','    for fact in facts:\n        fact_records = records_of(fact, ctx.get("coderOutput"))','    for fact in facts[:1]:\n        fact_records = records_of(fact, ctx.get("coderOutput"))')
    add('FM03','D > I > H > N alternative priority','P13','ALT-N-H','for s in ("DIRECTIONAL", "INDETERMINATE", "HELD"):', 'for s in ("DIRECTIONAL", "INDETERMINATE", "NON_DIRECTIONAL", "HELD"):')
    add('FM04','I outranks H within alternative','P13','ALT-H-I','for s in ("DIRECTIONAL", "INDETERMINATE", "HELD"):', 'for s in ("DIRECTIONAL", "HELD", "INDETERMINATE"):')
    add('FM05','H-1 package side membership','P09','PI3-WRONG-SIDE','if _canon(actual_case) != _canon(case_id) or _canon(actual_side) != _canon(side):','if _canon(actual_case) != _canon(case_id):')
    add('FM06','H-1 package case membership','P09','PI3-WRONG-CASE','if _canon(actual_case) != _canon(case_id) or _canon(actual_side) != _canon(side):','if _canon(actual_side) != _canon(side):')
    add('FM07','MD2 clause must belong to same M','P07','CLAUSE-OTHER-M','md2_clauses = _md2_clause_set(registry["m"].get(mid, {}).get("explicitNonMeaning"))','md2_clauses = set().union(*(_md2_clause_set(v.get("explicitNonMeaning")) for v in registry["m"].values()))')
    add('FM08','NACR registry mechanism binding','P08','NACR-WRONG-M','if d.get("mechanismPropositionId") != clause["mechanismPropositionId"]:','if False:')
    add('FM09','Frozen DE4 constitutive exception unavailable','P12','DE4-True','return record.get("evidenceForm") == "DE-4" and not constitutive_exception_available()','return record.get("evidenceForm") == "DE-4" and not record.get("constitutiveExceptionAvailable", False)')
    hidden=edit(source,'errors.extend(problems)','errors.extend(problems if _kind == "ANALYTICAL_MAPPED" else [])')
    hidden=edit(hidden,'if fact_id in r["factIds"] and id(r) not in seen:', 'if r.get("relevanceState") == "ANALYTICAL_MAPPED" and fact_id in r["factIds"] and id(r) not in seen:')
    ds.append(('FM10','W3 nonmapped cannot conceal SUPPORTS','P06','HIDDEN-SUPPORT',hidden))
    old='if not _present(expected_v) or not _present(actual_v) or _canon(actual_v) != _canon(expected_v):'
    new='if not _present(expected_v) or not _present(actual_v) or (_canon(actual.get(k, {}).get("recordFileSha256")) != _canon(expected.get(k, {}).get("recordFileSha256")) if k == "factualPackageIdentity" and isinstance(actual.get(k),dict) and isinstance(expected.get(k),dict) else _canon(actual.get(k)) != _canon(expected.get(k))):'
    add('FM11','W2 structured type-exact package identity','P09','W2-PACKAGE-NONDIGEST',old,new)
    add('FM12','T1 closed W for every supplying fact','P02','ALT-SECOND-W-ABSENT','raise error_type("T-1: W(%s) is not CLOSED: %s" % (fact, "; ".join(details["reasons"])))','continue')
    add('FM13','W4 coentails component bound to supplying witness','P10','COENTAIL-WRONG','if disp == "CO_ENTAILS" and (m2 not in selected or c2 not in entry_by_m[m2].get("entailedComponents", [])):','if False:')
    fold=edit(source,'quote.strip().rstrip(".").strip() not in md2_clauses','quote.strip().rstrip(".").strip().casefold() not in {c.casefold() for c in md2_clauses}')
    ds.append(('FM14','MD2 exact case clause','P07','CLAUSE-CASE',fold))
    cwd=edit(source,'path = Path(entry["recordFile"])','path = Path.cwd() / Path(entry["recordFile"]).relative_to(self.repository_root)')
    ds.append(('FM15-CWD','Explicit trusted root, no ambient CWD','M-CWD','PI3-LAWFUL',cwd))
    locator=edit(source,'("recordListKey", "factTextKey", "factTextLocator")','("factTextLocator",)')
    locator=edit(locator,'if any(k in identity and _canon(identity[k]) != _canon(entry.get(k)) for k in LOCATOR_KEYS):','if any(k in identity and _canon(identity[k]) != _canon(entry.get(k)) for k in LOCATOR_KEYS if k != "factTextKey"):')
    locator=edit(locator,'entry = matches[0]','entry = dict(matches[0]); entry["factTextKey"] = identity.get("factTextKey", entry["factTextKey"])')
    ds.append(('FM16-TEXT-LOCATOR','Map supplies certified proposition locator','M-LOCATOR','PI3-INJECT-scope',locator))
    caller=edit(source,'all(_canon(identity[k]) == _canon(entry[k]) for k in PI3_MEMBERS)','all(_canon(identity[k]) == _canon(entry[k]) for k in PI3_MEMBERS if k not in ("recordFile", "packageDir"))')
    caller=edit(caller,'path = Path(entry["recordFile"])','path = Path(identity["recordFile"])')
    caller=edit(caller,'if not path.is_relative_to(self.trusted_base):','if False:')
    caller=edit(caller,'if path.parent != Path(entry["packageDir"]).resolve():','if False:')
    ds.append(('FM17-CALLER-PATH','Map supplies package path','P09','PI3-COPIED-REAL-PATH',caller))
    add('FM18-CONTAINMENT','Trusted-root physical containment','P09','PI3-CONTAINMENT','if not path.is_relative_to(self.trusted_base):','if False:')
    # Reintroduce CORR4 class confusion while preserving exact enum checks.
    add('FM19-ALL-ANALYTICAL','Variant-specific grammar','M-NONMAPPED','NON_ANALYTICAL-NULL','if kind == "ANALYTICAL_MAPPED":\n        for field in','if True:\n        for field in')
    own=edit(source,'if not countered_leaves(record, registry["tt"].get(tree_target_id, {}), registry):','if False:')
    own=edit(own,'lawful = status == "DIRECTIONAL" and bool(countered_leaves(record, registry["tt"].get(tree_target_id, {}), registry))','lawful = status == "DIRECTIONAL"')
    ds.append(('FM20-OWN-COUNTER','B2(ii) own leaf is not counter','P15','COUNTER-own',own))
    unbound=edit(source,'return set(registry.get("counterOf", {}).get(mids[0], ())) & set(tt.get("mechExpr", ()))','return set(tt.get("mechExpr", ()))')
    ds.append(('FM21-SKIP-REGISTRY','Registry-listed incompatible counter only','P15','COUNTER-own',unbound))
    for mid,op in [('FM22-ENUM-STRIP','strip'),('FM23-ENUM-CASEFOLD','casefold')]:
        # Both raw variant and admission corrupted, no unrelated barrier masks it.
        wrapped=source+'''\n_original_classify = classify_row
_original_admit = admit
def _repair(row):
    out=dict(row)
    for field,domain in SEMANTIC_DOMAINS.items():
        value=out.get(field)
        if isinstance(value,str):
            for allowed in domain:
                if value.OP() == allowed.OP():out[field]=allowed;break
    return out
def classify_row(row):
    return _original_classify(_repair(row)) if isinstance(row,dict) else _original_classify(row)
def admit(record,m_row,nacr,sha):
    return _original_admit(_repair(record),m_row,nacr,sha)
'''.replace('OP',op)
        witness='ENUM:sourceQualityState:'+repr('COMPETENT ' if op=='strip' else 'competent')
        ds.append((mid,'Exact frozen semantic domains','M-ENUM',witness,wrapped))
    return ds


def corr6_mutant_defs(source):
    ds=[]
    def add(mid,witness,old,new):
        prop,inv=P.FX_INVARIANTS[mid];ds.append((mid,inv,prop,witness,edit(source,old,new)))
    add('FX01','FX01-2','        for f in basis_facts:\n            ev = evidence.get(f) if isinstance(evidence, dict) else None','        for f in record_facts:\n            ev = evidence.get(f) if isinstance(evidence, dict) else None')
    start=source.index('    w1 = (');end=source.index('    if not w1:',start)
    dup=source[:start]+'''    w1 = (all(isinstance(m,str) for m in got) and set(got)==reg_ids
          and all(isinstance(e.get("disposition"),str) and e["disposition"] in W_DISPOSITION_DOMAIN for e in entries))
'''+source[end:]
    ds.append(('FX02',P.FX_INVARIANTS['FX02'][1],'P02','FX02-first',dup))
    add('FX03','FX03-TT-NTSTP-RS','return set(registry.get("counterOf", {}).get(mids[0], ())) & set(tt.get("mechExpr", ()))','return set(registry.get("counterOf", {}).get(mids[0], ())) & {m for t in record.get("treeTargetIds", []) for m in registry["tt"].get(t, {}).get("mechExpr", [])}')
    start=source.index('def _evaluate_at(');site=source.index('    ok, hold, reasons = admit(',start)
    cap=source[:site]+'''    if b1a_cap_fires(record):
        out.update(admission="ADMITTED",bearingEvaluability="EVALUABLE",supportBearing="NON_DISCRIMINATING",capFired="B-1a (SEP-DE4)")
        return out
'''+source[site:]
    ds.append(('FX05',P.FX_INVARIANTS['FX05'][1],'P12','FX05-ND-1',cap))
    add('FX06','FX06-same-env-contractIdentity','    for r in fact_records:\n        id_errors.extend(_identity_errors(r, record))','    for r in []:\n        id_errors.extend(_identity_errors(r, record))')
    add('FX09','FX09-1','if na and sup:\n            partition[c] = "SUPPLIED_AND_NON_ASSESSABLE_CONTRADICTION"','if na and sup:\n            partition[c] = "SUPPLIED"')
    absence=source.replace('record.get("absenceEvidenceState") == "COMPETENT_AFFIRMATIVE_ABSENCE"','str(record.get("absenceEvidenceState")).strip().upper() == "COMPETENT_AFFIRMATIVE_ABSENCE"')
    ds.append(('FX11',P.FX_INVARIANTS['FX11'][1],'P11',"FX11-"+repr('COMPETENT_AFFIRMATIVE_ABSENCE '),absence))
    add('FX12','FX12-lower','_canon(row.get(entry["factIdKey"])) == _canon(fact_id)','_canon(row.get(entry["factIdKey"])).casefold() == _canon(fact_id).casefold()')
    add('FX13','FX13-subject','if not recs or not need or covered != need:','if not recs or not need or not covered or not covered <= need:')
    start=source.index('    if any(st == "HELD" for st in all_status.values()):');mid=source.index('    if any(st == "DIRECTIONAL" for st in all_status.values()):',start);end=source.index('    unresolved = sorted(',mid)
    swapped=source[:start]+source[mid:end]+source[start:mid]+source[end:]
    ds.append(('FX14',P.FX_INVARIANTS['FX14'][1],'P13','FX14-1',swapped))
    add('FX15','FX15-2','if set(comps) != set(supplied_ids):','if not set(comps) <= set(supplied_ids):')
    w4=edit(source,'    for r in fact_records:\n        for s in r.get("componentSupply") or []:', '    for r in fact_records:\n        if r.get("relation") != "SUPPORTS_LEAF":continue\n        for s in r.get("componentSupply") or []:')
    ds.append(('C6-W4','cor1 §6.5 W-4 all records; accepted §7.1','P10','B25-NOT_SELECTABLE',w4))
    pi=edit(source,'allowed = set(PI3_MEMBERS) | set(LOCATOR_KEYS) | set(assertions)','allowed = set(PI3_MEMBERS) | set(LOCATOR_KEYS)')
    ds.append(('C6-PI3','field_source_matrix PI-3 full physical identity','P09','PI3-POSITIVE-A01-verbatim',pi))
    return ds


def run(scratch):
    scratch=Path(scratch).resolve();scratch.mkdir(parents=True,exist_ok=True);P.ACTIVE_SCRATCH=scratch
    source=(HERE/(PREFIX+'_SUCCESSOR_VIEW_BUILDER.py')).read_text();cases=P.cases(scratch);byid={c['id']:c for c in cases};ledger=[]
    for mid,invariant,prop,witness,code in mutant_defs(source)+corr6_mutant_defs(source):
        case=byid[witness];module=types.ModuleType('mutant_'+mid.replace('-','_'));module.__file__=str(HERE/(PREFIX+'_SUCCESSOR_VIEW_BUILDER.py'));sys.modules[module.__name__]=module
        expected={t:o.state for t,o in P.reference(case).items()};exc=None;actual={};outputs={};compiled=False;executed=False
        try:
            binary=compile(code,module.__file__,'exec');compiled=True;exec(binary,module.__dict__)
            actual,outputs=P.execute(module,case);executed=True
        except Exception as e:exc=type(e).__name__+': '+str(e)
        # Exceptions do not count as semantic evidence. FM15 changes package
        # resolution at non-root CWD and must be observed there explicitly.
        if mid=='FM15-CWD' and exc is None and actual==expected:
            oldcwd=Path.cwd()
            try:
                import os
                os.chdir(scratch);actual,outputs=P.execute(module,case)
            finally:os.chdir(oldcwd)
        family=mid if mid.startswith('FX') else ('W4:' if mid=='C6-W4' else ('PI3-POSITIVE-' if mid=='C6-PI3' else None))
        neighboring=[]
        for other in cases:
            if family is None or not other['id'].startswith(family) or other['id']==witness:continue
            stable={t:o.state for t,o in P.reference(other).items()}
            try:
                observed,_=P.execute(module,other)
                neighboring.append({'witnessID':other['id'],'reference':stable,'actual':observed,'semanticDisagreement':stable!=observed,'exception':None})
            except Exception as error:
                neighboring.append({'witnessID':other['id'],'reference':stable,'actual':{},'semanticDisagreement':False,'exception':type(error).__name__+': '+str(error)})
        after={t:o.state for t,o in P.reference(case).items()}
        killed=compiled and executed and exc is None and actual!=expected and after==expected
        ledger.append({'mutantID':mid,'frozenInvariant':invariant,'propertyExpectedToKill':prop,'witnessID':witness,'sourceMutantSha256':hashlib.sha256(code.encode()).hexdigest(),'minimalCounterexample':P.evidence_case(case),'compiled':compiled,'executed':executed,'expected':expected,'actualResult':actual,'outcomes':outputs,'exception':exc,'referenceStable':after==expected,'generalizedWitnesses':neighboring,'result':'KILLED' if killed else 'SURVIVED','referenceDisagreementDetected':killed})
    return {'label':'AUTHOR_SELF_VALIDATION / semantic mutation evidence','MUTANT_COUNT':len(ledger),'MUTANTS_KILLED':sum(x['result']=='KILLED' for x in ledger),'MUTANTS_SURVIVED':sum(x['result']=='SURVIVED' for x in ledger),'ledger':ledger,'noExceptionKills':True,'EXCEPTION_KILLS':0,'executionExceptions':sum(r['exception'] is not None or any(n['exception'] is not None for n in r['generalizedWitnesses']) for r in ledger)}

def corr7_mutant_defs(source):
    ds=[]
    def add(mid,family,witness,code):
        ds.append((mid,P.C7_INVARIANTS[family],'HOLD-CODE' if family=='HOLD' else family,witness,code))
    # Change per-entry ownership only. W-3, identities, T(r) stay intact.
    first=source.replace('fact_id in (s.get("factIds") or []) for r in recs','fact_id == (r.get("factIds") or [None])[0] for r in recs')
    first=first.replace('and fact_id in (s.get("factIds") or [])}', 'and fact_id == (r.get("factIds") or [None])[0]}',1)
    first=first.replace('and fact_id in (s.get("factIds") or [])}', 'and fact_id == (rr.get("factIds") or [None])[0]}',1)
    add('XW3','XW3','C7-XW3-2-2-COUNTER_M-False',first)
    union=edit(source,'not per_fact <= set(entail) or aggregate != set(entail)',
               'not per_fact <= set().union(*(set(v.get("entailedComponents") or []) for v in entry_by_m.values() if v.get("disposition") == "SELECTED")) or not set(entail) <= aggregate')
    add('XW4','XW4','C7-XW4-BORROW-c2-1',union)
    allfacts=source.replace('fact_id in (s.get("factIds") or []) for r in recs','fact_id in (r.get("factIds") or []) for r in recs')
    allfacts=allfacts.replace('and fact_id in (s.get("factIds") or [])}', 'and fact_id in (r.get("factIds") or [])}',1)
    allfacts=allfacts.replace('and fact_id in (s.get("factIds") or [])}', 'and fact_id in (rr.get("factIds") or [])}',1)
    add('XW5','XW5','C7-XW5-2-2-COUNTER_M-True',allfacts)
    ordinary=edit(source,'if any(k in identity and _canon(identity[k]) != _canon(v) for k, v in assertions.items()):','if any(k in identity and identity[k] != v for k, v in assertions.items()):')
    add('XP2','XP2','C7-XP2-packageSideCount-float',ordinary)
    numeric=edit(source,'return json.dumps(value, sort_keys=True, ensure_ascii=False)','return value if isinstance(value, (int, float, bool)) else json.dumps(value, sort_keys=True, ensure_ascii=False)')
    add('XP2-NUMERIC-EQUALITY','XP2','C7-XP2-COMPARISON-int-bool',numeric)
    cap=edit(source,'return record.get("evidenceForm") == "DE-4" and not constitutive_exception_available()',
             'return record.get("relation") == "SUPPORTS_LEAF" and record.get("evidenceForm") == "DE-4" and not constitutive_exception_available()')
    add('XO6','XO6','C7-XO6-lawful-D',cap)
    cnm=edit(source,'has_nacr = any(classify_declaration(d, registry_nacr)[0] == "NACR" for d in decls)',
             'has_nacr = any(classify_declaration(d, registry_nacr)[0] in ("NACR", "CONDITION_NOT_MET") for d in decls)')
    add('XO7','XO7','C7-XO7-1-NACR-1:CONDITION_NOT_MET-COMPETENT',cnm)
    hidden=source+'''
_c7_original_variant = classify_row
_c7_original_records = records_of
def classify_row(row):
    if isinstance(row,dict) and row.get("relevanceState") in ("NON_ANALYTICAL","UNMAPPED_OBSERVATION"):
        copyrow=dict(row);copyrow.update(mechanismPropositionIds=None,treeTargetIds=None,componentSupply=None)
        return _c7_original_variant(copyrow)
    return _c7_original_variant(row)
def records_of(fact_id,coder_output):
    return [r for r in _c7_original_records(fact_id,coder_output) if r.get("relevanceState")=="ANALYTICAL_MAPPED"]
'''
    add('XO9','XO9','C7-XO9-NON_ANALYTICAL-fully-identified-supply',hidden)
    for mid,old,new,witness in [('M-HOLD-T-AS-U','HOLD-T','HOLD-U','C7-HOLD-T-ONLY-1'),('M-HOLD-U-AS-T','HOLD-U','HOLD-T','C7-HOLD-W2-1')]:
        remap=source+'''
_c7_per_tt=evaluate_per_tt
def evaluate_per_tt(*args,**kwargs):
    outcomes=_c7_per_tt(*args,**kwargs)
    for o in outcomes.values():
        if o.get("holdCode")==OLD:o["holdCode"]=NEW
    return outcomes
'''.replace('OLD',repr(old)).replace('NEW',repr(new))
        add(mid,'HOLD',witness,remap)
    before=edit(source,'        witness_error = error\n        selected = set()',
                '        witness_error = error\n        if isinstance(error, WitnessConsistencyError):\n            out.update(admission="HELD", holdCode="HOLD-U", holdReasons=[str(error)])\n            return out\n        selected = set()')
    add('M-W4-BEFORE-T','HOLD','C7-HOLD-T-AND-W4-1',before)
    wmap=edit(source,'out.update(admission="HELD", holdCode="HOLD-U", holdReasons=[str(witness_error)])',
              'out.update(admission="HELD", holdCode="HOLD-U" if isinstance(witness_error, WitnessConsistencyError) else "HOLD-T", holdReasons=[str(witness_error)])')
    add('M-W1W3-AS-T','HOLD','C7-HOLD-W1-1',wmap)
    return ds

_inherited_run=run
def run(scratch):
    result=_inherited_run(scratch)
    scratch=Path(scratch).resolve();P.ACTIVE_SCRATCH=scratch
    allcases=P.cases(scratch);byid={c['id']:c for c in allcases}
    source=(HERE/(PREFIX+'_SUCCESSOR_VIEW_BUILDER.py')).read_text()
    for mid,invariant,prop,witness,code in corr7_mutant_defs(source):
        case=byid[witness];module=types.ModuleType('c7_mutant_'+mid.replace('-','_'));module.__file__=str(HERE/(PREFIX+'_SUCCESSOR_VIEW_BUILDER.py'));sys.modules[module.__name__]=module
        compiled=False;exc=None;checks=[];refbefore={t:o.state for t,o in P.reference(case).items()}
        world,edge=P.canonical(case);holdbefore={tt:P.K.HoldOrderOracle(case['contract']).expected(world,edge,tt) for tt in refbefore} if case.get('holdOracle') else {}
        try:
            binary=compile(code,module.__file__,'exec');compiled=True;exec(binary,module.__dict__)
            # A direct witness and generalized neighbors all use unchanged A/B/D.
            family='HOLD' if mid.startswith('M-') else mid.split('-')[0]
            neighbors=[c for c in allcases if c.get('c7Family')==family and c['id']!=witness]
            for item in [case]+neighbors:
                check=P.check_case(module,item)
                checks.append({'witnessID':item['id'],'result':check['result'],'mismatchAxes':check['mismatchAxes'],'holdCodeComparison':check['holdCodeComparison'],'reference':check['expected'],'actual':check['actual'],'exception':None})
        except Exception as error:exc=type(error).__name__+': '+str(error)
        refafter={t:o.state for t,o in P.reference(case).items()}
        world,edge=P.canonical(case);holdafter={tt:P.K.HoldOrderOracle(case['contract']).expected(world,edge,tt) for tt in refafter} if case.get('holdOracle') else {}
        stable=refbefore==refafter and holdbefore==holdafter
        killed=compiled and exc is None and checks and checks[0]['result']=='FAIL' and stable
        result['ledger'].append({'mutantID':mid,'frozenInvariant':invariant,'propertyExpectedToKill':prop,'witnessID':witness,'sourceMutantSha256':hashlib.sha256(code.encode()).hexdigest(),'minimalCounterexample':P.evidence_case(case),'compiled':compiled,'executed':bool(checks),'exception':exc,'referenceStable':stable,'holdReferenceBefore':holdbefore,'holdReferenceAfter':holdafter,'comparisonLawWitness':case.get('typePair'),'expected':refbefore,'actualResult':checks[0]['actual'] if checks else {},'generalizedWitnesses':checks[1:],'directCheck':checks[0] if checks else None,'result':'KILLED' if killed else 'SURVIVED','referenceDisagreementDetected':killed})
    result.update(MUTANT_COUNT=len(result['ledger']),MUTANTS_KILLED=sum(x['result']=='KILLED' for x in result['ledger']),MUTANTS_SURVIVED=sum(x['result']=='SURVIVED' for x in result['ledger']),EXCEPTION_KILLS=0)
    result['executionExceptions']=sum(r['exception'] is not None or any(n.get('exception') is not None for n in r['generalizedWitnesses']) for r in result['ledger'])
    result['allLoadBearingMutantsKilled']=result['MUTANTS_SURVIVED']==0 and result['executionExceptions']==0
    return result


# Retain FM12's missing-fact W closure class at its lawful S7 applicability.
# The old alternative-ND witness is preserved as a positive regression; it no
# longer owns a W-closure requirement under frozen §10.
_corr7_mutant_defs=mutant_defs
def mutant_defs(source):
 result=_corr7_mutant_defs(source);made=[]
 for mid,inv,prop,witness,code in result:
  if mid=='FM12':
   code=edit(source,'raise error_type("T-1: W(%s) is not CLOSED: %s" % (fact, "; ".join(details["reasons"])))','continue')
   start=code.index('def uniqueness(');end=code.index('\ndef ',start+5);part=code[start:end]
   part=edit(part,'    for fact in facts:\n        witness', '    for fact in facts:\n        if fact not in (ctx.get("witness") or {}):continue\n        witness')
   code=code[:start]+part+code[end:];witness='C8-FM12-SUBJECT-W-ABSENT';inv='Every DIRECTIONAL SL subject fact needs W closure at S7 (accepted §10/AV-5)'
  made.append((mid,inv,prop,witness,code))
 return made

def corr8_mutant_defs(source):
 ds=[]
 def add(mid,family,witness,patch):ds.append((mid,P.C8_AUTHORITY,family,witness,source+patch))
 add('FH4','FH4','C8-FH4','''
_c8_at=_evaluate_at
def _evaluate_at(record,registry,ctx,sha,tt):
 o=_c8_at(record,registry,ctx,sha,tt)
 if o.get('holdCode')=='HOLD-ND':
  try:_witness_selected(record,ctx,sha,registry)
  except ValueError:o['holdCode']='HOLD-U'
 return o
''')
 add('FH6','FH6','C8-FH6','''
_c8_tt=evaluate_per_tt
def evaluate_per_tt(*args,**kwargs):
 os=_c8_tt(*args,**kwargs)
 if any(o.get('holdCode')=='HOLD-U' for o in os.values()):
  for o in os.values():o['holdCode']='HOLD-U'
 return os
''')
 old='if not _present(expected_v) or not _present(actual_v) or _canon(actual_v) != _canon(expected_v):'
 ds.append(('FP4',P.C8_AUTHORITY,'FP4','C8-FP4',edit(source,old,'if not _present(expected_v) or not _present(actual_v) or actual_v != expected_v:')))
 add('FO3','FO3','C8-FO3','''
_c8_admit=admit
def admit(record,*args):
 if record.get('relation')!='SUPPORTS_LEAF' and record.get('edgeState')=='NOT_DETERMINABLE':
  record=dict(record,edgeState='PARTIAL')
 return _c8_admit(record,*args)
''')
 add('FO4','FO4','C8-FO4','''
_c8_variant=classify_row
def classify_row(row):
 if isinstance(row,dict) and row.get('relevanceState') in ('NON_ANALYTICAL','UNMAPPED_OBSERVATION'):
  row=dict(row,componentSupply=None)
 return _c8_variant(row)
''')
 add('FX6','FX6','C8-FX6','''
_c8_md=_md_disposition
def _md_disposition(value,*args):
 return _c8_md('NO_CO_ENTAILMENT' if value=='UNRESOLVED' else value,*args)
''')
 add('L1-W-ON-ND','L1','C8-L1-W1','''
_c8_dir=evaluate_for_direction
def evaluate_for_direction(record,registry,ctx,registry_sha=None,tree_target_id=None):
 o=_c8_dir(record,registry,ctx,registry_sha,tree_target_id)
 if record.get('relation')=='SUPPORTS_LEAF' and o.get('b3RecordVerdict')=='NON_DIRECTIONAL':
  try:_witness_selected(record,ctx,registry_sha,registry)
  except ValueError:o.update(admission='HELD',holdCode='HOLD-U',supportBearing=None)
 return o
''')
 for mid,fam,wit,condition in [('L2-COUNTER-W123','L2','C8-L2-D-W1','not isinstance(error,WitnessConsistencyError)'),('L3-COUNTER-W4','L3','C8-L3-D-W4','isinstance(error,WitnessConsistencyError)'),('L4-COUNTER-T-AS-U','L4','C8-L4-D-W4','isinstance(error,WitnessConsistencyError) and o.get("holdCode")=="HOLD-T"')]:
  add(mid,fam,wit,'''
_c8_dir=evaluate_for_direction
def evaluate_for_direction(record,registry,ctx,registry_sha=None,tree_target_id=None):
 o=_c8_dir(record,registry,ctx,registry_sha,tree_target_id)
 if record.get('relation')=='COUNTER_M':
  try:_witness_selected(record,ctx,registry_sha,registry)
  except ValueError as error:
   if CONDITION:o.update(admission='HELD',holdCode='HOLD-U',supportBearing=None)
 return o
'''.replace('CONDITION',condition))
 add('L5-ALT-W-GATE','L5','C8-L5-ALT-OTHER-FACT-W3','''
_c8_alt=_direction_status_at
def _direction_status_at(record,tt,registry,ctx,sha):
 status=_c8_alt(record,tt,registry,ctx,sha)
 try:_witness_selected(record,ctx,sha,registry)
 except ValueError:return 'HELD'
 return status
''')
 return ds
_corr7_run=run
def run(scratch):
 result=_corr7_run(scratch);cs=P.cases(Path(scratch));byid={c['id']:c for c in cs};source=(HERE/(PREFIX+'_SUCCESSOR_VIEW_BUILDER.py')).read_text()
 for mid,inv,fam,witness,code in corr8_mutant_defs(source):
  c=byid[witness];module=types.ModuleType('c8_mutant_'+mid.replace('-','_'));module.__file__=str(HERE/(PREFIX+'_SUCCESSOR_VIEW_BUILDER.py'));sys.modules[module.__name__]=module;exc=None;compiled=False;checks=[]
  refs={t:o.state for t,o in P.reference(c).items()};w,e=P.canonical(c);holds={t:P.K.HoldOrderOracle(c['contract']).expected(w,e,t) for t in refs}
  try:
   binary=compile(code,module.__file__,'exec');compiled=True;exec(binary,module.__dict__)
   neighbors=[x for x in cs if x.get('c8Family')==fam and x['id']!=witness]
   for x in [c]+neighbors:
    row=P.check_case(module,x);checks.append({'witnessID':x['id'],'result':row['result'],'mismatchAxes':row['mismatchAxes'],'holdCodeComparison':row['holdCodeComparison'],'reference':row['expected'],'actual':row['actual'],'exception':None})
  except Exception as error:exc=type(error).__name__+': '+str(error)
  after={t:o.state for t,o in P.reference(c).items()};w,e=P.canonical(c);afterholds={t:P.K.HoldOrderOracle(c['contract']).expected(w,e,t) for t in refs};stable=refs==after and holds==afterholds;killed=compiled and exc is None and bool(checks) and checks[0]['result']=='FAIL' and stable
  result['ledger'].append({'mutantID':mid,'frozenInvariant':inv,'propertyExpectedToKill':fam,'witnessID':witness,'minimalCounterexample':P.evidence_case(c),'sourceMutantSha256':hashlib.sha256(code.encode()).hexdigest(),'compiled':compiled,'executed':bool(checks),'referenceStable':stable,'exception':exc,'expected':refs,'holdReferenceBefore':holds,'holdReferenceAfter':afterholds,'actualResult':checks[0]['actual'] if checks else {},'directCheck':checks[0] if checks else None,'generalizedWitnesses':checks[1:],'result':'KILLED' if killed else 'SURVIVED','referenceDisagreementDetected':bool(killed)})
 result.update(MUTANT_COUNT=len(result['ledger']),MUTANTS_KILLED=sum(x['result']=='KILLED' for x in result['ledger']),MUTANTS_SURVIVED=sum(x['result']=='SURVIVED' for x in result['ledger']),EXCEPTION_KILLS=0)
 result['executionExceptions']=sum(x['exception'] is not None or any(y.get('exception') is not None for y in x['generalizedWitnesses']) for x in result['ledger']);result['allLoadBearingMutantsKilled']=not result['MUTANTS_SURVIVED'] and not result['executionExceptions'];return result

def main():
    ap=argparse.ArgumentParser();ap.add_argument('--scratch',required=True);ap.add_argument('--output',required=True);args=ap.parse_args()
    output=Path(args.output).resolve()
    if not output.is_relative_to(Path('/private/tmp')):raise ValueError('scratch only')
    result=run(args.scratch);output.write_text(json.dumps(result,indent=1,sort_keys=True)+'\n');print(json.dumps({k:v for k,v in result.items() if k!='ledger'},sort_keys=True));return int(result['MUTANTS_SURVIVED']!=0)
# CORR9 author faults reconstructed from frozen invariants and textual IV1 findings.
# No verifier scratch patch, harness, module or executable evidence is imported.
def corr9_mutant_defs(source):
    ds=[]
    def add(family,patch):
        ds.append(('C9-'+family,P.C9_INVARIANTS[family],family,source+patch))
    add('B1','''
_c9_selection=_s6_declared_selection
def _s6_declared_selection(record,ctx,registry):
 if record.get('relation')!='COUNTER_M':return _c9_selection(record,ctx,registry)
 result=set()
 for fact in record.get('factIds') or []:
  witness=(ctx.get('witness') or {}).get(fact)
  rs=records_of(fact,ctx.get('coderOutput'))
  closed,_details=witness_closure(witness,fact,registry,ACCEPTED_REGISTRY_SHA,rs,_fact_traces(ctx,rs),record)
  if closed:result.update(_c9_selection(dict(record,factIds=[fact]),ctx,registry))
 return result
''')
    add('B4','''
_c9_selection=_s6_declared_selection
def _s6_declared_selection(record,ctx,registry):
 if record.get('relation')=='COUNTER_M':record=dict(record,factIds=(record.get('factIds') or [])[:1])
 return _c9_selection(record,ctx,registry)
''')
    add('C2','''
_c9_status=_direction_status_at
def _direction_status_at(record,tt,registry,ctx,sha):
 mids=record.get('mechanismPropositionIds') or []
 row=registry['m'].get(mids[0]) if mids else None
 if row is not None:
  admitted,_hold,_why=admit(record,row,registry['nacr'],sha)
  if not admitted:return 'NON_DIRECTIONAL'
 return _c9_status(record,tt,registry,ctx,sha)
''')
    add('C3','''
_c9_status=_direction_status_at
def _direction_status_at(record,tt,registry,ctx,sha):
 if record.get('evidenceForm')=='DE-4':record=dict(record,evidenceForm='DE-1')
 return _c9_status(record,tt,registry,ctx,sha)
''')
    # Counter-only enumeration and directional counters of held genuine supports
    # are the two causal effects of confusing relation membership with Alt.
    altered=edit(source,'r.get("relation") == "SUPPORTS_LEAF"\n            and m2 in', 'r.get("relation") in ("SUPPORTS_LEAF", "COUNTER_M")\n            and m2 in')
    altered=edit(altered,'        alt_ids = sorted(m2 for m2 in selected', '        selected |= {m for r in fact_records if r.get("relation")=="COUNTER_M" for m in (r.get("mechanismPropositionIds") or [])}\n        alt_ids = sorted(m2 for m2 in selected')
    ds.append(('C9-C5',P.C9_INVARIANTS['C5'],'C5',altered))
    add('D4','''
_c9_at=_evaluate_at
def _evaluate_at(record,registry,ctx,registry_sha=None,tree_target_id=None):
 o=_c9_at(record,registry,ctx,registry_sha,tree_target_id)
 if o.get('admission')=='ADMITTED' and record.get('evidenceForm')=='DE-4':
  o.update(bearingEvaluability='EVALUABLE',bearingIndeterminacyReasons=None,supportBearing='NON_DISCRIMINATING',failingGates=[],capFired='B-1a (SEP-DE4)')
 return o
''')
    # Remove only TT from the non-mapped concealment boundary; M and supply remain.
    start=source.index('def classify_row(');end=source.index('\ndef ',start+5)
    part=edit(source[start:end],'for field in ("mechanismPropositionIds", "treeTargetIds", "componentSupply"):', 'for field in ("mechanismPropositionIds", "componentSupply"):')
    ds.append(('C9-F2',P.C9_INVARIANTS['F2'],'F2',source[:start]+part+source[end:]))
    add('G1','''
_c9_trace=trace_closure
def trace_closure(trace,*args):
 trace=copy.deepcopy(trace)
 for component in (trace.get('components') or {}).values():
  md=component.get('MD3') or {}
  if all(isinstance(v,str) for v in md.values()) and set(md.values())=={'UNRESOLVED','NO_CO_ENTAILMENT'}:
   component['MD3']={m:'NO_CO_ENTAILMENT' for m in md}
 return _c9_trace(trace,*args)
''')
    return ds

_retained_corr8_mutation_run=run

def run(scratch):
    result=_retained_corr8_mutation_run(scratch)
    assert len(result['ledger'])==59
    cs=P.cases(Path(scratch));source=(HERE/(PREFIX+'_SUCCESSOR_VIEW_BUILDER.py')).read_text()
    for mid,invariant,family,code in corr9_mutant_defs(source):
        selected=[c for c in cs if c.get('c9Family')==family]
        direct=next(c for c in selected if c['c9Role']=='DIRECT')
        selected=[direct]+[c for c in selected if c is not direct]
        module=types.ModuleType('corr9_mutant_'+family);module.__file__=str(HERE/(PREFIX+'_SUCCESSOR_VIEW_BUILDER.py'));sys.modules[module.__name__]=module
        exc=None;compiled=False;checks=[]
        before={c['id']:{t:o.state for t,o in P.reference(c).items()} for c in selected}
        try:
            binary=compile(code,module.__file__,'exec');compiled=True;exec(binary,module.__dict__)
            for c in selected:
                r=P.check_case(module,c)
                checks.append({'witnessID':c['id'],'role':c['c9Role'],'result':r['result'],'mismatchAxes':r['mismatchAxes'],'reference':r['expected'],'actual':r['actual'],'triples':r['triples'],'holdCodeComparison':r['holdCodeComparison'],'componentChecks':r['componentChecks'],'boundaryChecks':r['boundaryChecks'],'exception':None})
        except Exception as error:exc=type(error).__name__+': '+str(error)
        after={c['id']:{t:o.state for t,o in P.reference(c).items()} for c in selected}
        stable=before==after
        killed=compiled and exc is None and len(checks)==len(selected) and checks[0]['result']=='FAIL' and stable
        controls=[c for c in checks if c['role']=='CONTROL']
        result['ledger'].append({'mutantID':mid,'family':family,'frozenInvariant':invariant,'propertyExpectedToKill':family,'witnessID':direct['id'],'minimalCounterexample':P.evidence_case(direct),'sourceMutantSha256':hashlib.sha256(code.encode()).hexdigest(),'compiled':compiled,'executed':bool(checks),'referenceStable':stable,'exception':exc,'expected':before[direct['id']],'actualResult':checks[0]['actual'] if checks else {},'directCheck':checks[0] if checks else None,'generalizedWitnesses':checks[1:],'controlChecksPass':bool(controls) and all(x['result']=='PASS' for x in controls),'result':'KILLED' if killed else 'SURVIVED','referenceDisagreementDetected':bool(killed)})
    result.update(RETAINED_CORR8_MUTANTS=59,NEW_CORR9_MUTANTS=len(result['ledger'])-59,MUTANT_COUNT=len(result['ledger']),MUTANTS_KILLED=sum(r['result']=='KILLED' for r in result['ledger']),MUTANTS_SURVIVED=sum(r['result']=='SURVIVED' for r in result['ledger']),EXCEPTION_KILLS=0)
    result['executionExceptions']=sum(r['exception'] is not None or any(n.get('exception') is not None for n in r['generalizedWitnesses']) for r in result['ledger'])
    result['allLoadBearingMutantsKilled']=not result['MUTANTS_SURVIVED'] and not result['executionExceptions']
    return result



# Six author-owned equivalents of the CORR9.IV1 known survivors, no new family.
def corr10_mutant_defs(source):
    ds=[]
    def append(mid,family,witness,patch):
        ds.append((mid,P.C9_INVARIANTS[family],family,witness,source+patch))
    append('C10-B1b','B1','C10-B1-W1-FULL','''
_c10_read=_s6_declared_selection
def _s6_declared_selection(record,ctx,registry):
 if record.get('relation')!='COUNTER_M':return _c10_read(record,ctx,registry)
 narrowed=dict(ctx,witness=dict(ctx.get('witness') or {}))
 for fid in record.get('factIds') or []:
  wi=narrowed['witness'].get(fid)
  es=wi.get('entries') if isinstance(wi,dict) else None
  ids=[e.get('mechanismPropositionId') for e in es if isinstance(e,dict)] if isinstance(es,list) else []
  if len(ids)!=len(registry['m']) or set(ids)!=set(registry['m']):
   narrowed['witness'].pop(fid,None)
 return _c10_read(record,narrowed,registry)
''')
    start=source.index('def _s6_declared_selection(');end=source.index('\ndef ',start+5)
    part=edit(source[start:end],
              '    for fact in (record.get("factIds") or []):',
              '    for position, fact in enumerate(record.get("factIds") or []):\n        if record.get("relation")=="COUNTER_M" and position>=2:\n            break')
    ds.append(('C10-B4b',P.C9_INVARIANTS['B4'],'B4','C10-B4-3-FACT-FULL',source[:start]+part+source[end:]))
    append('C10-C5b','C5','C10-C5-SUPPORT-N-COUNTER-D','''
_c10_alt=alternative_direction_status
def alternative_direction_status(m2,fact_id,registry,ctx,sha):
 status=_c10_alt(m2,fact_id,registry,ctx,sha)
 if status in ('NON_DIRECTIONAL','INDETERMINATE'):
  for row in records_of(fact_id,ctx.get('coderOutput')):
   if row.get('relation')=='COUNTER_M' and m2 in (row.get('mechanismPropositionIds') or []):
    if any(_direction_status_at(row,t,registry,ctx,sha)=='DIRECTIONAL' for t in row.get('treeTargetIds') or []):
     return 'DIRECTIONAL'
 return status
''')
    for suffix,reason,witness in [('D4a','MECHANISM_READING_AMBIGUOUS','C10-D4-EV2-AMBIGUOUS'),
                                   ('D4b','TARGET_BINDING_UNRESOLVED','C10-D4-EV4-REGISTRY-UNRESOLVED')]:
        append('C10-'+suffix,'D4',witness,'''
_c10_ev=ev_gates
def ev_gates(record,*args,**kwargs):
 gates=_c10_ev(record,*args,**kwargs)
 return [g for g in gates if g!=REASON] if record.get('evidenceForm')=='DE-4' else gates
'''.replace('REASON',repr(reason)))
    append('C10-G1b','G1','C10-G1-1U-2N-CMP','''
_c10_trace=trace_closure
def trace_closure(trace,*args):
 changed=copy.deepcopy(trace)
 for judgment in (changed.get('components') or {}).values():
  md=judgment.get('MD3') or {}
  vals=list(md.values())
  if set(vals)=={'UNRESOLVED','NO_CO_ENTAILMENT'} and vals.count('NO_CO_ENTAILMENT')>vals.count('UNRESOLVED'):
   judgment['MD3']={m:'NO_CO_ENTAILMENT' for m in md}
 return _c10_trace(changed,*args)
''')
    return ds

_retained_corr9_mutation_run=run

def run(scratch):
    # Replay the exact retained world set for every retained mutation.
    # New CORR10 witnesses are exercised only by the six final equivalents.
    expanded_cases=P.cases
    try:
        P.cases=lambda p:P._retained_corr9_cases(p)
        result=_retained_corr9_mutation_run(scratch)
    finally:
        P.cases=expanded_cases
    assert len(result['ledger'])==67
    cs=P.cases(Path(scratch));source=(HERE/(PREFIX+'_SUCCESSOR_VIEW_BUILDER.py')).read_text()
    byid={c['id']:c for c in cs}
    for mid,invariant,family,witness,code in corr10_mutant_defs(source):
        direct=byid[witness]
        selected=[direct]+[c for c in cs if c.get('c10Family')==family and c is not direct]
        mod=types.ModuleType('corr10_mutant_'+mid.replace('-','_'))
        mod.__file__=str(HERE/(PREFIX+'_SUCCESSOR_VIEW_BUILDER.py'));sys.modules[mod.__name__]=mod
        compiled=False;exception=None;checks=[]
        before={c['id']:{t:o.state for t,o in P.reference(c).items()} for c in selected}
        try:
            exec(compile(code,mod.__file__,'exec'),mod.__dict__);compiled=True
            for c in selected:
                row=P.check_case(mod,c)
                checks.append({'witnessID':c['id'],'role':c['c10Role'],
                               'result':row['result'],'reference':row['expected'],'actual':row['actual'],
                               'triples':row['triples'],'mismatchAxes':row['mismatchAxes'],
                               'holdCodeComparison':row['holdCodeComparison'],
                               'componentChecks':row['componentChecks'],
                               'alternativeLocalChecks':row['alternativeLocalChecks'],'exception':None})
        except Exception as error:
            exception=type(error).__name__+': '+str(error)
        after={c['id']:{t:o.state for t,o in P.reference(c).items()} for c in selected}
        stable=before==after
        killed=compiled and exception is None and len(checks)==len(selected) and checks[0]['result']=='FAIL' and stable
        controls=[r for r in checks if r['role']=='CONTROL']
        result['ledger'].append({'mutantID':mid,'family':family,'frozenInvariant':invariant,
            'propertyExpectedToKill':family,'witnessID':witness,
            'sourceMutantSha256':hashlib.sha256(code.encode()).hexdigest(),
            'minimalCounterexample':P.evidence_case(direct),'compiled':compiled,'executed':bool(checks),
            'exception':exception,'referenceStable':stable,'expected':before[witness],
            'actualResult':checks[0]['actual'] if checks else {},'directCheck':checks[0] if checks else None,
            'generalizedWitnesses':checks[1:],'controlChecksPass':bool(controls) and all(r['result']=='PASS' for r in controls),
            'result':'KILLED' if killed else 'SURVIVED','referenceDisagreementDetected':bool(killed)})
    result.update(RETAINED_CORR9_MUTANTS=67,NEW_CORR10_MUTANTS=6,MUTANT_COUNT=len(result['ledger']),
                  MUTANTS_KILLED=sum(r['result']=='KILLED' for r in result['ledger']),
                  MUTANTS_SURVIVED=sum(r['result']=='SURVIVED' for r in result['ledger']),EXCEPTION_KILLS=0)
    result['executionExceptions']=sum(r['exception'] is not None or any(n.get('exception') is not None for n in r['generalizedWitnesses']) for r in result['ledger'])
    result['allLoadBearingMutantsKilled']=not result['MUTANTS_SURVIVED'] and not result['executionExceptions']
    return result

if __name__=='__main__':sys.exit(main())
