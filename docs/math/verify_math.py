#!/usr/bin/env python3
"""
MERGEVUE — PREDICTIVE MATH FOUNDATION v0.1
Re-runnable verification of every numerical claim in
MERGEVUE_PREDICTIVE_MATH_FOUNDATION_v0.1.md

Run:  python3 verify_math.py
Deps: numpy, scipy   (tested with numpy 1.21.6, scipy 1.7.1)

Every printed block is tagged [C-nn] and is referenced by the same tag in the
markdown document. A verifying agent should re-run this file and diff the
output against the numbers quoted in the document.
"""
from math import comb, log, lgamma
from fractions import Fraction
import numpy as np
from scipy.stats import beta, binom
from scipy.special import betaln

TARGET = 7.0 / 9.0            # retained calculation convention, NOT literal 77.77%
ALPHA = 0.05                  # confidence level for all interval claims
N_CORPUS = 10                 # frozen calibration corpus cardinality
N_ENV = 9                     # postulated number of interaction environments


def rule(tag, title):
    print("\n" + "=" * 72)
    print(f"[{tag}] {title}")
    print("=" * 72)


# ----------------------------------------------------------------------------
def clopper_pearson(k, n, alpha=ALPHA, sided="one-lower"):
    """Exact binomial confidence bounds.

    one-lower : one-sided 100(1-alpha)% lower bound
    two       : two-sided 100(1-alpha)% interval
    """
    if sided == "one-lower":
        lo = 0.0 if k == 0 else beta.ppf(alpha, k, n - k + 1)
        return lo, 1.0
    lo = 0.0 if k == 0 else beta.ppf(alpha / 2, k, n - k + 1)
    hi = 1.0 if k == n else beta.ppf(1 - alpha / 2, k + 1, n - k)
    return lo, hi


def min_n_for_perfect(target=TARGET, alpha=ALPHA):
    """Smallest n such that k=n gives one-sided lower bound > target.

    For k = n the exact lower bound solves theta^n = alpha, i.e. theta = alpha^(1/n).
    """
    n = 1
    while alpha ** (1.0 / n) <= target:
        n += 1
    return n


def min_k_for_n(n, target=TARGET, alpha=ALPHA):
    """Smallest k such that CP one-sided lower bound(k,n) > target. None if impossible.

    The CP lower bound is strictly increasing in k for fixed n, so binary search is exact.
    """
    hi_lo, _ = clopper_pearson(n, n, alpha, "one-lower")
    if hi_lo <= target:
        return None, None
    lo_k, hi_k = 0, n
    while lo_k < hi_k:
        mid = (lo_k + hi_k) // 2
        b, _ = clopper_pearson(mid, n, alpha, "one-lower")
        if b > target:
            hi_k = mid
        else:
            lo_k = mid + 1
    b, _ = clopper_pearson(lo_k, n, alpha, "one-lower")
    return lo_k, b


def power_for_n(n, theta_true, target=TARGET, alpha=ALPHA):
    """P(certify theta > target) when the true accuracy is theta_true."""
    k_req, _ = min_k_for_n(n, target, alpha)
    if k_req is None:
        return 0.0, None
    return float(binom.sf(k_req - 1, n, theta_true)), k_req


# ----------------------------------------------------------------------------
rule("C-01", "Attainability of the exact figure 77.77% on a finite unit count")
print(f"target 7/9                       = {TARGET:.10f}")
print("Exact 7/9 (not literal 77.77%=0.7777) is attainable only when n satisfies")
print("n = 0 (mod 9), since 7/9 in lowest terms has denominator 9.\n")
for n in (9, 10, 18, 20, 27, 90, 180):
    ok = "YES" if n % 9 == 0 else "NO "
    ks = [k for k in range(n + 1) if abs(k / n - TARGET) < 1e-12]
    print(f"  n={n:4d}  exact 7/9 attainable: {ok}   k giving exactly 7/9: {ks}")
print("\nAttainable accuracies at n=10 nearest the target:")
for k in (7, 8):
    print(f"  k={k}/10 = {k/10:.4f}  (delta from target = {k/10 - TARGET:+.4f})")


# ----------------------------------------------------------------------------
rule("C-02", "THEOREM 1 — non-demonstrability of >=77.77% on the frozen corpus n=10")
lo_perfect, _ = clopper_pearson(N_CORPUS, N_CORPUS, ALPHA, "one-lower")
print(f"Best possible case: k = n = {N_CORPUS} (a perfect score).")
print(f"Exact one-sided {100*(1-ALPHA):.0f}% lower bound = alpha^(1/n) = {ALPHA}^(1/{N_CORPUS})")
print(f"                                         = {lo_perfect:.6f}")
print(f"Target                                    = {TARGET:.6f}")
print(f"lower bound > target ?                     {lo_perfect > TARGET}")
print("\nMonotonicity: the CP lower bound is strictly increasing in k, so k<n is worse.")
for k in range(6, N_CORPUS + 1):
    lo, _ = clopper_pearson(k, N_CORPUS, ALPHA, "one-lower")
    lo2, hi2 = clopper_pearson(k, N_CORPUS, ALPHA, "two")
    print(f"  k={k:2d}/10  point={k/N_CORPUS:.3f}  one-sided95% LCB={lo:.4f}"
          f"   two-sided95% CI=[{lo2:.4f}, {hi2:.4f}]")
print("\nCONCLUSION: on n=10 deal-level units the claim 'accuracy >= 77.77%' cannot be")
print("established by this exact one-sided binomial procedure, even at k=n.")
print("This assumes independent Bernoulli correctness with a common theta; it is not")
print("an impossibility theorem for Bayesian claims or different estimands.")


# ----------------------------------------------------------------------------
rule("C-03", "Minimum unit count n for the claim to be establishable at all")
n_min = min_n_for_perfect()
print(f"Smallest n with a perfect score certifying theta > {TARGET:.4f} at one-sided 95%:")
print(f"  n_min = {n_min}   (alpha^(1/n) = {ALPHA ** (1.0/n_min):.6f} > {TARGET:.6f})")
print(f"  check n={n_min-1}: {ALPHA ** (1.0/(n_min-1)):.6f} <= {TARGET:.6f}  -> insufficient")
print("\nRequired successes k for a range of n (one-sided 95%):")
for n in (12, 18, 20, 27, 30, 40, 50, 60, 90, 120, 180):
    k, lo = min_k_for_n(n)
    if k is None:
        print(f"  n={n:4d}  impossible")
    else:
        print(f"  n={n:4d}  k_req={k:4d}  ({k/n:.4f} of units)  LCB={lo:.4f}")


# ----------------------------------------------------------------------------
rule("C-04", "Power: n needed to have a real chance of certifying the target")
print("Probability of certifying theta > 77.77% at one-sided 95%, by true accuracy:\n")
header = "   n  " + "".join(f"  theta={t:.2f}" for t in (0.80, 0.85, 0.90, 0.95))
print(header)
for n in (12, 18, 20, 27, 30, 40, 50, 60, 80, 100, 150, 180):
    row = f" {n:4d} "
    for th in (0.80, 0.85, 0.90, 0.95):
        p, _ = power_for_n(n, th)
        row += f"     {p:6.3f}"
    print(row)
print("\nSmallest n reaching 80% power (power is not monotone in n for exact tests;")
print("reported n is the smallest n from which power stays >= 0.80 for all larger n")
print("up to the scan cap N_CAP):")
N_CAP = 1200
for th in (0.80, 0.85, 0.90, 0.95):
    powers = []
    for n in range(2, N_CAP + 1):
        p, _ = power_for_n(n, th)
        powers.append((n, p))
    stable = None
    for i in range(len(powers)):
        if all(p >= 0.80 for _, p in powers[i:]):
            stable = powers[i][0]
            break
    first = next((n for n, p in powers if p >= 0.80), None)
    print(f"  true accuracy {th:.2f} -> first n with power>=0.80: {first};"
          f"  stably >=0.80 from n = {stable}")


# ----------------------------------------------------------------------------
rule("C-05", "Clustering: sides are not independent units")
print("If the scored unit is the SIDE (2 per deal) then n_nominal = 20 but the two")
print("sides of one deal share the deal-level environment collision.")
print("Design effect for clusters of size m with intracluster correlation rho:")
print("  DEFF = 1 + (m-1)*rho ;  n_eff = n_nominal / DEFF\n")
for m, n_nom, label in ((2, 20, "side-level, 10 deals x 2 sides"),
                        (18, 180, "side x environment, 10 deals x 18")):
    print(f"  {label}:")
    for rho in (0.0, 0.1, 0.2, 0.3, 0.5, 0.8):
        deff = 1 + (m - 1) * rho
        print(f"    rho={rho:.1f}  DEFF={deff:6.2f}  n_eff={n_nom/deff:8.2f}")
    print()
print("NOTE: the 9 environment rows per side are NOT 9 independent binary decisions.")
print("They form ONE 9-class choice. The honest nominal unit count is therefore 20,")
print("not 180. DEFF is a variance adjustment under the specified assumptions;")
print("it does not license exact CP with an effective trial count.")


# ----------------------------------------------------------------------------
rule("C-06", "Chance baselines the target must be compared against")
print("Accuracy alone is meaningless without the baseline it must beat.\n")
print("  9-class environment identification, uniform guess : "
      f"{1/N_ENV:.4f}  (1/9)")
print("  9-class, majority-class guess (unknown prior)     : NOT DETERMINABLE from corpus")
print("  binary outcome, coin flip                         : 0.5000")
print("  binary outcome, majority-class guess at base rate p: max(p, 1-p)\n")
print("If the binary base rate is p, a 'predict the majority always' rule scores max(p,1-p).")
for p in (0.5, 0.6, 0.7, 0.7777, 0.8):
    print(f"  base rate p={p:.4f} -> trivial baseline {max(p,1-p):.4f}"
          f"   target beats it: {TARGET > max(p,1-p)}")
print("\nCRITICAL: if the true failure base rate is ~70-90% (the figure quoted in the")
print("MergeVue reports), then a constant 'this deal will have integration failure'")
print("predictor already scores 70-90% accuracy with zero model. The 77.77% target is")
print("not necessarily above that baseline. The base rate of the specified Y is unknown;")
print("a broad M&A failure statistic cannot supply it. Metric choice remains unsealed.")


# ----------------------------------------------------------------------------
rule("C-07", "Selective prediction: accuracy is conditional on coverage")
print("Historical source-analyst report about CASE-3.5 prediction seal (not re-read here):")
print("  fullMaterialPredictiveClaims   = 0")
print("  conditionalPredictiveClaims    = 1  (WEAK, antecedent UNRESOLVED)")
print("  explicitNonPredictions         = 20")
print("  pairLevelPredictiveClaimAvailable = false\n")
print("Let c = coverage = fraction of units on which a prediction is emitted,")
print("    a = conditional accuracy among emitted predictions.")
print("Effective scored n is c*N, so the certifiable lower bound degrades with c.\n")
print("  With N=10 deals, one-sided 95% LCB assuming a PERFECT score on emitted units:")
for c in (1.0, 0.9, 0.8, 0.5, 0.3, 0.2, 0.1):
    n_eff = int(round(c * N_CORPUS))
    if n_eff == 0:
        print(f"    coverage={c:.1f}  n_eff=0   LCB undefined (no denominator)")
        continue
    lo, _ = clopper_pearson(n_eff, n_eff, ALPHA, "one-lower")
    print(f"    coverage={c:.1f}  n_eff={n_eff:2d}  LCB={lo:.4f}"
          f"   beats target: {lo > TARGET}")
print("\nAt the coverage actually observed on CASE-3.5 (0 material claims of ~7 possible")
print("prediction elements), the accuracy denominator is zero and no accuracy figure")
print("of any value -- including 77.77% -- is definable.")


# ----------------------------------------------------------------------------
rule("C-08", "Split conformal: finite order statistic versus full outcome space")
print("Assume exchangeable calibration/test scores and a predictor fixed without")
print("using calibration outcomes. Rank k = ceil((n+1)*(1-alpha)).")
print("If k>n, qhat=+infinity: C(X) is the full outcome space, coverage=1.")
print("Thus 1/(n+1) is the alpha floor for a FINITE empirical threshold, not validity.")
for n in (5, 9, 10, 12, 19, 20, 39, 49, 99):
    print(f"  n={n:3d} finite-threshold alpha floor={1/(n+1):.4f}")
print("At n_cal=10 the largest finite rank is 10 and its marginal coverage floor")
print("is 10/11=0.9091. Smaller alpha yields the full set, not INFEASIBLE.")
print("These are set-coverage guarantees, not point accuracy or conditional coverage.")


rule("C-09", "Haken static model: parameter counts do not prove sample-size bounds")
print("Polynomial coefficient counts (assuming unrestricted distinct monomials):")
for nq in (4, 5, 6, 9, 10, 14, 18):
    print(f"  N_q={nq:2d} order4={comb(nq+4,4)-1:5d} order2={nq+nq*(nq+1)//2:4d}")
print("An observation is a VECTOR, not one scalar parameter constraint.")
print("Population identifiability, existence of an estimator, and precision differ.")
print("Counterexample: a 9D Gaussian has 54 mean/covariance parameters; its MLE")
print("exists for 20 independent vectors in general position (n>d suffices).")
x_gaussian = np.random.default_rng(99).normal(size=(20, 9))
cov_gaussian = np.cov(x_gaussian, rowvar=False, bias=True)
print(f"  sample covariance rank={np.linalg.matrix_rank(cov_gaussian)}; "
      f"minimum eigenvalue={np.linalg.eigvalsh(cov_gaussian).min():.6f}")
print("A normalizable quadratic density on R^d has negative definite quadratic")
print("part; positive unstable modes need stabilizing higher terms/domain constraints.")


rule("C-10", "Haken Ch.9 dynamic model: what panel depth is required")
print("Ch.9 eqs (9.21)-(9.31): drift K_i[q] and diffusion G_kl[q] are fixed by the")
print("FIRST and SECOND conditional moments of q(t+tau) given q(t).")
print("Per state dimension N_q, at each conditioning point:")
for nq in (3, 5, 9):
    k_par = nq
    g_par = nq * (nq + 1) // 2
    print(f"  N_q={nq:2d}:  K has {k_par} components, G has {g_par} independent components"
          f"  -> {k_par+g_par} functions of q to estimate")
print("\nMinimum observation structure: >=2 time points per deal for K,")
print(">=3 for any check on the Markov/stationarity assumption Ch.9 requires (eq 9.3).")
print("A static T0-only snapshot does not identify dynamic K and G; no panel is read here.")


# ----------------------------------------------------------------------------
rule("C-11", "Chernavsky value-of-information as an admissible feature weight")
print("V = log2(P/p); V_Korogodin = (P-p)/(1-p), in [0,1] only if 0<=p<=P<=1, p<1.")
print("p = P(correct identification BEFORE the fact); P = AFTER.\n")
print("For a 9-class environment identification with a uniform prior, p = 1/9:")
p0 = 1.0 / N_ENV
for P1 in (1/9, 0.2, 1/3, 0.5, 0.7777, 0.9, 1.0):
    v = log(P1 / p0, 2)
    vk = (P1 - p0) / (1 - p0)
    print(f"  P={P1:.4f}  V=log2(P/p)={v:+.4f} bits   V_Korogodin={vk:.4f}")
print(f"\nV_max = log2(9) = {log(N_ENV,2):.4f} bits  (Chernavsky: V_max = log2 n)")
print("V<=0 means no gain or counterevidence relative to a specified goal and prior.")
print("It does not justify deleting counterevidence. P and p are not estimated here;")
print("the formula alone does not define operational evidence weights.")


# ----------------------------------------------------------------------------
rule("C-15", "Split conformal on the OBSERVABLE outcome Y (resolution of P4)")
print("The environment E(u) is LATENT: no ground truth exists for any deal, so no")
print("calibration set (x_i, E_i) can be formed and conformal prediction cannot be")
print("run on E at all. It CAN be run on the observable outcome Y.")
print("Question: does it degenerate on a BINARY Y at n=10?\n")
print("Simulation: classifier emits p_hat(true class); nonconformity s = 1 - p_hat.")
print("A set of size 2 = {0,1} = no information = abstention.\n")


def split_conformal_binary(n_cal, alpha, theta, seed, n_test=20000, reps=200):
    r = np.random.default_rng(seed)
    k = int(np.ceil((n_cal + 1) * (1 - alpha)))
    if k > n_cal:
        return 1.0, 0.0, k

    def draw(m):
        correct = r.random(m) < theta
        return np.where(correct,
                        r.beta(5, 2, m) * 0.5 + 0.5,
                        r.beta(2, 5, m) * 0.5)
    cov, sing = [], []
    for _ in range(reps):
        s_cal = 1 - draw(n_cal)
        qhat = np.sort(s_cal)[k - 1]
        te = draw(n_test)
        s_true, s_other = 1 - te, te
        size = (s_true <= qhat).astype(int) + (s_other <= qhat).astype(int)
        cov.append(float((s_true <= qhat).mean()))
        sing.append(float((size == 1).mean()))
    return float(np.mean(cov)), float(np.mean(sing)), k


print(f"{'n_cal':>6} {'alpha':>8} {'k idx':>6} {'coverage':>9} {'singleton (decisive)':>21}")
SEED0 = 20260908
for i, n_cal in enumerate((10, 20, 36, 50, 100, 200)):
    for j, alpha in enumerate((1.0 / (n_cal + 1), 0.10, 0.20, 0.30)):
        c, s, k = split_conformal_binary(n_cal, alpha, 0.90, SEED0 + 100 * i + j)
        print(f"{n_cal:6d} {alpha:8.4f} {k:6d} {c:9.4f} {s:21.4f}")
    print()
print("At n=10, alpha=1/11 the theoretical marginal coverage floor is 10/11.")
print("This synthetic simulation gives about 56% singletons; this is not corpus evidence.")
print("This is a synthetic illustration, not a corpus estimate or guarantee of utility.")
print("Each row averages 200 independent calibrations with 20000 test draws each.")
print("A binomial CI treating 0.564 as a proportion from 10 trials is not justified.")
print("For alpha<1/(n+1), the implementation returns the full binary set.")


rule("C-16", "Repeated fixed-n testing: exact crossing probability")


def crossing_probability(theta, nmax, rejects):
    """Exact finite-state recursion for iid Bernoulli correctness, absorbing rejection."""
    alive = np.array([1.0])
    rejected = 0.0
    for n in range(1, nmax + 1):
        nxt = np.zeros(n + 1)
        nxt[:-1] += alive * (1 - theta)
        nxt[1:] += alive * theta
        mask = np.array([rejects(k, n) for k in range(n + 1)])
        rejected += float(nxt[mask].sum())
        nxt[mask] = 0.0
        alive = nxt
    return rejected


for looks in ([10], [5, 10], [5, 10, 15, 20],
              list(range(5, 41, 5)), list(range(5, 81, 5))):
    thresholds = {n: min_k_for_n(n)[0] for n in looks}
    def naive_reject(k, n):
        kr = thresholds.get(n)
        return kr is not None and k >= kr
    prob = crossing_probability(TARGET, max(looks), naive_reject)
    print(f"  checkpoints={len(looks):2d} up to n={max(looks):2d} "
          f"exact false-positive probability={prob:.6f}")


rule("C-17", "One-sided anytime-valid mixture; correction of the two-sided null error")
LOG_THR = log(1.0 / ALPHA)


def logE(k, n, t0=TARGET):
    """Uniform mixture of Bernoulli likelihood ratios over q in (t0,1).

    Nonnegative supermartingale under E[X_t|past]<=t0. The unrestricted
    Beta(1,1) mixture is NOT valid for that composite one-sided null.
    """
    if not (isinstance(n, int) and isinstance(k, int) and 0 <= k <= n):
        raise ValueError("require integer 0<=k<=n")
    if not 0 < t0 < 1:
        raise ValueError("require 0<t0<1")
    return (betaln(k + 1, n - k + 1) + beta.logsf(t0, k + 1, n - k + 1)
            - log(1 - t0) - k * log(t0) - (n - k) * log(1 - t0))


print("E_n = integral[t0,1] q^k(1-q)^(n-k)dq /")
print("      [(1-t0)*t0^k*(1-t0)^(n-k)]. Reject only if E_n>=20.")
print("For fixed q>=t0 the expected next likelihood-ratio factor is <=1")
print("under E[X_t|past]<=t0. Integrating preserves this; Ville applies.")
print("This conditional null is stronger than a bound on a retrospective average.")
old_zero3 = np.exp(betaln(1, 4) - 3 * log(1 - TARGET))
print(f"  discarded unrestricted mixture E(0,3)={old_zero3:.6f} (false direction)")
print(f"  corrected one-sided mixture E(0,3)={np.exp(logE(0,3)):.6f}")
n_ville = next(n for n in range(1, 500) if logE(n,n) >= LOG_THR)
print(f"  perfect run: corrected uniform one-sided mixture n={n_ville}")
print(f"  pre-specified point alternative q=1: n={min_n_for_perfect()}; "
      "E becomes zero after the first failure")
print("No universal 25-trial price exists: threshold depends on the chosen mixture.")
print(f"  {'n':>5} {'k_fixed':>8} {'k_anytime':>10}")
for N in (12, 18, 20, 25, 30, 36, 50, 80, 120):
    kf, _ = min_k_for_n(N)
    ka = next((k for k in range(N+1) if logE(k,N)>=LOG_THR), None)
    print(f"  {N:5d} {str(kf):>8} {str(ka):>10}")


rule("C-18", "Exact power of the corrected one-sided sequential test")
LOGE = {(n,k): logE(k,n) for n in range(1,121) for k in range(n+1)}
print("P(ever reject by n), iid alternatives only; no Monte Carlo error:")
print(f"  {'n_max':>6}" + "".join(f"  theta={t:.2f}" for t in (0.85,0.90,0.95)))
for nmax in (25,36,50,80,120):
    vals = [crossing_probability(th,nmax,lambda k,n: LOGE[n,k]>=LOG_THR)
            for th in (0.85,0.90,0.95)]
    print(f"  {nmax:6d}" + "".join(f"     {v:6.3f}" for v in vals))
for n in (36,40):
    print(f"  fixed n={n}, theta=.90 power={power_for_n(n,.90)[0]:.6f}")
print("Refitting can preserve predictability, but does not establish a constant iid")
print("accuracy or prove E[X_t|past]<=t0; the estimand/null must be specified.")


rule("C-13", "THEOREM 2 corrected: dimension bound only")
print("For a symmetric N_q x N_q matrix, the positive eigenspace dimension N_u<=N_q.")
print("This does not identify a discrete environment label with a coordinate/mode.")
print("The 20-vector Gaussian counterexample [C-09] refutes the proposed N_q<=4.")
print("No requirement of 55 sides or 28/36 deals follows from parameter counting.")
print("Whether nine environments exist or are testable here remains unestablished.")


rule("C-14", "No joint corpus-size certificate from the present premises")
print("Fixed-n binomial sample sizes concern independent correctness trials, not")
print("automatically sides, people, weighted units, or latent environment parameters.")
print("Do not divide by two to infer required deals, or combine with discarded T2.")
for n in (36,40,68):
    print(f"  iid scored units n={n}: power at theta=.90={power_for_n(n,.90)[0]:.6f}")
print("A corpus requirement needs a defined estimand, dependence model, and design.")


rule("C-19", "Observation level: variance equivalents are not exact trial counts")
print("DEFF=1+(m-1)*rho assumes equal-size independent clusters and common")
print("Bernoulli marginal variance/correlation of CORRECTNESS, not just of Y.")
print("n_eff is a variance equivalent; no CP k_req or feasibility flag is justified.")
for m in (1,2,5,8,12):
    for rho in ([0.0] if m==1 else [0.2,0.3,0.5]):
        neff = 10*m/(1+(m-1)*rho)
        print(f"  deals=10 cohort={m:2d} rho={rho:.1f} nominal={10*m:3d} n_eff={neff:6.2f}")
print("Changing from deal to person/commitment changes the estimand; it is not")
print("the same outcome replicated. Predefine weights, eligibility, and missingness.")
print("Unknown outcomes reduce observable coverage and may select the scored sample.")


rule("C-20", "Deal-type conditioning, composition, and metric boundaries")
print("TEAM/MARKET/KPI/ABSORB can require different observation rules.")
print("A counterexample to executive departure as universal failure does not prove")
print("that every common outcome is impossible. Type-aware Y is the current proposal.")
print("If correctness is defined against the same true endpoint:")
print("  a_retro = p_type*a_correct + (1-p_type)*a_wrong.")
print("User declaration alone does not prove p_type=1 in production.")
print("Transport requires comparable distributions and a_correct>=a_wrong;")
print("p_type<1 alone implies neither a product advantage nor a lower bound.")
print(f"{'p_type':>8}" + "".join(f"   a_wrong={w:.2f}" for w in (.30,.50,.60)))
for pt in (1.0,.95,.90,.85,.80,.70):
    print(f"{pt:8.2f}" + "".join(f"        {(TARGET-(1-pt)*aw)/pt:.4f}"
                                for aw in (.30,.50,.60)))
lo3, _ = clopper_pearson(3,3)
print(f"At three iid deal-level trials, perfect-score LCB={lo3:.6f}.")
print("10/4=2.5 is an average, not the observed allocation or an upper bound.")
print("Pooling is optional and needs a target population and predeclared weights.")
print("Raw, weighted, and balanced accuracy have different uncertainty procedures.")
print("For unequal clusters and common variance/rho:")
print("  n_eff = M^2 / [M + rho*sum_d m_d*(m_d-1)] (variance only).")


rule("C-21", "Rater agreement is not correctness or an upper bound on it")
print("No numeric p_type is identified by the available evidence.")
print("Values .85-.95 in [C-20] are sensitivity scenarios, not an adopted range.")
for n,k in ((10,10),(10,9),(10,8),(30,30),(30,28),(30,26),(50,47)):
    lo,hi=clopper_pearson(k,n,sided="two")
    print(f"  illustrative agreement {k}/{n}: CI=[{lo:.3f},{hi:.3f}]")
print("These binomial intervals require independent agreements with a common rate.")
print("Counterexample: two raters each make one error on different items out of 10:")
print("  accuracy_A=accuracy_B=.90, agreement=.80; agreement is not an upper bound.")
print("Conversely raters can agree perfectly and both be wrong. A shadow set measures")
print("reproducibility only, unless an independent valid correctness reference exists.")
print("Post-T0 conduct may be evidence, but is not automatically ground truth of T0 intent.")
print("Outcome access remains quarantined; no shadow-set work is performed here.")


rule("C-22", "Jurisdiction, observation validity, and a clustered counterexample")
print("7 clean / 2 coarse / 1 without source is an UNVERIFIED documentary hypothesis.")
print("No jurisdictional blocker is closed by that profile or by n_eff.")
print("Item 5.02 became effective on 2004-08-23; historical rules must match the window.")
print("NEO lists concern executive compensation; absence does not prove lost authority.")
print("For an illustrative seven independent clusters only:")
for m in (5,8,12):
    for rho in (.3,.5):
        print(f"  g=7 m={m:2d} rho={rho:.1f} n_eff={7*m/(1+(m-1)*rho):.4f} (variance only)")
print("Exact counterexample to CP(floor(n_eff)) even with known rho:")
cluster_counts = (2,3,8)
cluster_weights = (Fraction(100,1215),Fraction(312,1215),Fraction(803,1215))
mean_count = sum(k*w for k,w in zip(cluster_counts,cluster_weights))
p_marg = mean_count/8
pair_moment = sum(k*(k-1)*w for k,w in zip(cluster_counts,cluster_weights))/56
rho_exact = (pair_moment-p_marg*p_marg)/(p_marg*(1-p_marg))
false_certificate = float(cluster_weights[-1]**7)
print("  iid clusters; S=2,3,8 with probabilities (100,312,803)/1215;")
print("  choose the S correct persons uniformly inside each eight-person cluster.")
print(f"  marginal correctness={p_marg}, ICC={rho_exact}")
print(f"  floor(n_eff)=12; CP(12,12) LCB={clopper_pearson(12,12)[0]:.6f}")
print(f"  P(56/56 correct)={false_certificate:.8f} > .05 under theta=7/9.")
print("Hence the advertised 95% certification is invalid, independently of ICC estimation.")
lo,hi=clopper_pearson(2,2,sided="two")
print(f"Illustrative iid international 2/2: one-sided LCB={ALPHA**.5:.6f}; "
      f"two-sided CI=[{lo:.6f},{hi:.6f}].")
print("This is limited information, not zero information or proof of international validity.")


rule("C-12", "Corrected boundaries and executable self-checks")
# Negative controls reproduce discarded proofs; they must remain false certificates.
assert p_marg == Fraction(7,9) and rho_exact == Fraction(1,2)
assert sum(cluster_weights) == 1 and false_certificate > ALPHA
assert clopper_pearson(12,12)[0] > TARGET
assert np.linalg.matrix_rank(cov_gaussian) == 9
assert old_zero3 > 20 and np.exp(logE(0,3)) < 1
assert np.isclose(logE(0,0),0)
assert n_ville == 18 and min_n_for_perfect() == 12
assert split_conformal_binary(10,.01,.9,1,n_test=1,reps=1) == (1.0,0.0,11)
assert all(logE(0,n)<LOG_THR for n in range(1,121))
# Check the supermartingale recursion against conditional means in the null.
for n in range(21):
    for k in range(n+1):
        en=np.exp(logE(k,n))
        for conditional_p in (0,.2,.5,TARGET):
            expectation=(conditional_p*np.exp(logE(k+1,n+1))
                         +(1-conditional_p)*np.exp(logE(k,n+1)))
            assert expectation <= en*(1+1e-10)
for th in (0,.2,.5,TARGET):
    assert crossing_probability(th,120,lambda k,n: LOGE[n,k]>=LOG_THR)<=ALPHA+1e-12
# CP inversion checked using a separate direct binomial-tail oracle.
for n in range(1,81):
    direct=next((k for k in range(n+1) if binom.sf(k-1,n,TARGET)<ALPHA),None)
    assert min_k_for_n(n)[0] == direct
assert power_for_n(2200,.80)[0] > .8
print("SELF_CHECKS: PASS (author self-validation; not independent verification)")
print(f"  n=10 best binomial LCB={clopper_pearson(10,10)[0]:.6f}")
print(f"  theta=.80, n=2200 fixed power={power_for_n(2200,.80)[0]:.6f}")
print("  no exact clustered, weighted, balanced-accuracy, or transport guarantee established")
print("  no environments identified; no corpus outcomes read; no product behavior claimed")
print("  P8 illustration, iid Bernoulli likelihood and hypothetical 10/10:")
print(f"    Beta(1,1) posterior P(theta>7/9)={1-TARGET**11:.6f}")
print(f"    Beta(2,1) posterior P(theta>7/9)={1-TARGET**12:.6f}")
print("    prior must be justified before outcomes; these are not frequentist certificates")
print("END OF VERIFICATION RUN")
