# 37. Контракт identity, authentication и session security MergeVue

**Файл:** `37_MERGEVUE_IDENTITY_AUTHENTICATION_AND_SESSION_SECURITY_CONTRACT.md`  
**Версия:** 1.0  
**Дата:** 2026-09-16  
**Язык документа:** русский  
**Язык клиентского интерфейса:** только American English  
**Рынок первой версии:** США  
**Статус:** **OWNER-ACCEPTED / CONTROLLING IDENTITY, AUTHENTICATION AND SESSION SECURITY DESIGN CONTRACT; НЕ УТВЕРЖДАЕТ, ЧТО CUSTOMER AUTH, ACCOUNT SESSIONS, PASSKEY, MFA ИЛИ ENTERPRISE SSO УЖЕ РЕАЛИЗОВАНЫ В PRODUCTION**  
**Owner acceptance:** **2026-09-16**  
**Аудитная база `main`:** `92c2e0df199d017082b653e72b5a6bfbf5bf6a31`  
**Связанные controlling contracts:** `21`, `34`, `35`, `36`  
**Связанные restricted-data contracts:** `24`, `29`, `31`  
**Главный принцип:** authentication establishes identity; authorization decides access. Ни email address, ни session ID, ни invitation token, ни technical capability token сами по себе не дают доступа к Deal без server-side authorization.  
**Ключевые инварианты:** `AUTHENTICATION ≠ AUTHORIZATION`, `EMAIL ≠ ACCOUNT AUTHORITY`, `ACCOUNT ≠ DEAL ACCESS`, `SESSION ≠ PERMISSION`, `INVITE ≠ SESSION`, `TECHNICAL CAPABILITY ≠ CLIENT ROLE`, `SERVER-AUTHORITATIVE SESSION`, `NO AUTH TOKENS IN BROWSER STORAGE`, `ROTATE ON PRIVILEGE CHANGE`, `REAUTH FOR HIGH-SENSITIVITY ACTIONS`, `RECOVERY MUST NOT BE WEAKER THAN LOGIN`, `NO USER ENUMERATION`, `NO FAKE SSO`, `RETURN TO INTENT`, `FAIL CLOSED`

---

## 0. Назначение

Этот документ определяет target identity/authentication/session layer:

```text
User intent
→ identity entry
→ authentication
→ server session
→ authorization
→ protected Deal/action
→ re-authentication where required
→ session termination / recovery
→ audit
```

Он отвечает на вопросы:

1. что такое account identity в MergeVue;
2. когда account вообще нужен;
3. чем email capture отличается от account;
4. что происходит при `Save this deal`;
5. как anonymous analysis безопасно attach к account;
6. как разделяются authentication и Deal authorization;
7. как должна жить authenticated session;
8. что запрещено хранить в browser storage;
9. когда нужна re-authentication;
10. как защищать role/permission changes;
11. как работает logout;
12. как должен выглядеть recovery;
13. как работать с collaborator/share invitations;
14. что делать с respondent token flows;
15. как не переиспользовать assessment capability tokens как customer auth;
16. какие security details нельзя придумывать дизайнером.

---

## 1. Authority hierarchy

При конфликте применяется:

1. явная Owner-инструкция;
2. accepted security/privacy/legal policy;
3. `34` collaboration/access permissions;
4. `35` recipient sharing/access;
5. `31` person-level restrictions;
6. `29` data-rights governance;
7. `21` account/save intent;
8. current mechanical truth;
9. настоящий target contract;
10. UI convenience.

Authentication layer не может ослабить authorization/data-rights layer.

---

## 2. External professional precedent

Не controlling authority, а проверка зрелого класса решения.

### 2.1. OWASP authentication/session guidance

Профессиональная практика рекомендует:

- server-side session management;
- protected transport;
- secure session identifiers;
- session renewal after authentication/privilege changes;
- re-authentication after risk events and for sensitive actions;
- login throttling;
- strong MFA where appropriate.

### 2.2. Browser token storage

OWASP explicitly advises against storing authentication/session/refresh tokens in `localStorage` or `sessionStorage` because page JavaScript can access them.

Target implication:

> browser storage is not credential authority.

### 2.3. Session cookies

If cookie-based session is selected:

- `Secure`;
- `HttpOnly`;
- appropriate `SameSite`;
- server-side validity;
- rotation after privilege change.

Exact cookie architecture remains implementation/security act.

### 2.4. NIST framing

Phishing-resistant authenticators are preferred where assurance requirements justify them.

This document does not claim a formal NIST AAL certification.

---

## 3. Current implementation reality

### 3.1. Customer account auth is not established in current `main`

Repository search does not establish real customer:

```text
/login
/signup
account session service
password reset
passkey enrollment
OAuth callback
enterprise SSO
```

Therefore:

> target authenticated workspace must not be represented as current production fact.

### 3.2. Current `session` terminology is overloaded

Current code uses assessment/session objects for Deal-analysis workflow.

These are not customer login sessions.

---

## 4. Assessment session ≠ authenticated user session

Never reuse the same semantic object.

### Assessment session

Carries:

- Deal/questionnaire state;
- respondent workflow;
- report authority inputs;
- technical mutation capabilities.

### Authenticated account session

Carries:

- account identity;
- authentication assurance;
- session lifecycle;
- server authorization context.

They may reference each other through explicit IDs, but cannot be one object by convenience.

---

## 5. Current mutation capabilities

Current `_sessionLedger` contains technical capabilities for roles such as:

```text
OWNER
R2
TARGET
```

and authorized save actions.

These are technical workflow capabilities.

---

## 6. Technical `OWNER` ≠ client `Owner`

Accepted `34` prohibits client role `Owner`.

Therefore:

> current `MutationCapabilityRole = "OWNER"` must remain namespaced legacy/technical vocabulary and must never be surfaced as Deal membership authority.

---

## 7. Technical token ≠ account credential

Current mutation capability token can authorize bounded workflow mutation.

It must not become:

- login token;
- account session;
- collaborator membership;
- password substitute;
- global API bearer token.

---

## 8. Current respondent invitation ≠ account auth

Respondent flow may remain:

- purpose-bound;
- token/code based;
- accountless.

This does not define customer authentication.

---

## 9. Current storage strength

Current assessment session infrastructure already uses:

- cryptographic random bytes;
- hashes;
- timing-safe comparison;
- expiry;
- persistent-storage path;
- lockout concepts in respondent code verification.

These are reusable security patterns.

Not reusable identity semantics.

---

## 10. Current browser-storage posture

Current validation includes:

> no browser storage APIs in production bundle.

Preserve this as strong default for credentials/sensitive auth state.

---

## 11. Identity object

Target conceptual account identity:

```text
accountId
primaryVerifiedEmail
displayName?
status
createdAt
identityVersion
```

No client permission fields embedded directly as global truth.

---

## 12. Stable account ID

Internal account identity must use stable opaque ID.

Not email as primary foreign key.

---

## 13. Why email is not primary identity key

Email can:

- change;
- be mistyped;
- be reassigned by organization;
- have aliases;
- belong to multiple workflow identities.

---

## 14. Verified email

Email can be authentication/contact identifier only after verification.

---

## 15. Email capture ≠ verified account email

Public `screen-12-email-capture` remains distribution action.

Do not convert silently.

---

## 16. Account creation must be explicit

Per `21`:

primary trigger:

`Save this deal`

Other valid triggers:

- add internal evidence;
- invite respondents;
- private evidence;
- collaborate;
- track Deal;
- save report history.

---

## 17. No forced account before value

Public analysis remains available without account.

---

## 18. Sign in / Create account

Target entry surface must support both concepts:

`Sign in`

`Create account`

Do not assume email means new account.

---

## 19. Minimum identity collection

V1 asks only identity fields needed for authentication.

Potential:

- email;
- authentication mechanism;
- optional first name.

Do not require CRM profile.

---

## 20. No signup CRM form

Do not require by default:

- organization;
- job title;
- phone;
- budget;
- Deal value;
- country;
- procurement stage.

Specific later workflow may request.

---

## 21. Authentication mechanism policy

This contract deliberately separates **security requirements** from **vendor choice**.

Any chosen primary mechanism must satisfy:

- verified account identity;
- replay-resistant implementation appropriate to mechanism;
- no secret exposed to application logs;
- no permanent bearer credential in browser storage;
- secure recovery;
- session rotation after authentication;
- server-side revocation.

---

## 22. Acceptable mechanism classes

Implementation may select one or more:

- passkey/WebAuthn;
- email magic link;
- email OTP;
- password + strong storage + MFA;
- OAuth/OIDC identity provider;
- enterprise SSO.

But no option appears in UI until implemented and security-reviewed.

---

## 23. Preferred assurance direction

For sensitive paid M&A workspace:

> phishing-resistant authentication should be preferred where product usability and deployment architecture allow.

Passkey/WebAuthn is a strong candidate.

This is direction, not claim of implementation.

---

## 24. Passwordless ≠ automatically secure

Magic link/email OTP depends on email-account security.

Do not market as phishing-resistant unless mechanism actually is.

---

## 25. SMS OTP

Not preferred default.

No phone collection is justified merely for login.

---

## 26. Password architecture if selected

If passwords are implemented later:

- modern adaptive password hashing;
- salted storage;
- no plaintext/reversible password storage;
- breach/password-blocklist policy;
- secure reset;
- rate limiting;
- MFA/step-up policy.

Exact algorithm/cost belongs to security implementation review.

---

## 27. No security questions

Do not use:

- mother's maiden name;
- first school;
- birth city.

Weak recovery pattern.

---

## 28. Authentication vendor

Not selected by this contract.

Could be managed provider or internal service.

Selection requires:

- security review;
- privacy/DPA review;
- availability;
- auditability;
- enterprise roadmap fit;
- migration/portability consideration.

---

## 29. No fake OAuth buttons

Do not render:

`Continue with Google`

`Continue with Microsoft`

unless integration exists.

---

## 30. No fake SSO

Same.

---

## 31. Enterprise SSO

Future likely need for institutional buyers.

But not prerequisite for first saved Deal.

---

## 32. SSO does not replace Deal authorization

Even authenticated enterprise user needs Deal membership.

---

## 33. Domain login ≠ organization access

Corporate domain cannot auto-grant Deals.

---

## 34. Anonymous-to-account transition

Canonical:

```text
public analysis
→ Save this deal
→ auth
→ account identity
→ server validates anonymous analysis handoff
→ persisted Deal
→ creator membership
→ return to Deal
```

---

## 35. Return-to-intent

After auth return to:

- same Deal;
- same report version;
- same Decision Gap;
- same intended action.

Not generic Home.

---

## 36. Anonymous handoff is bounded

Need server-verifiable reference to:

- anonymous analysis/session;
- Deal identity;
- report version/evidence cutoff;
- selected next action where relevant.

---

## 37. Do not trust browser text

No parsing UI headings to create Deal ownership.

---

## 38. Handoff tampering

User cannot change:

- Deal ID;
- report ID;
- result payload

in browser and attach arbitrary analysis to account.

Server revalidates canonical identity.

---

## 39. Save operation atomicity

From user perspective:

```text
authenticate
+ attach analysis
+ create Deal
+ create creator membership
```

must succeed coherently or fail without orphaned ownership.

---

## 40. Duplicate Deal handling

Do not create duplicate inaccessible Deal due to repeated auth callback.

Need idempotency.

---

## 41. Authentication success ≠ Deal creation success

Distinct internal states.

UI can show save failure while account remains valid.

---

## 42. Account exists but save failed

Preserve anonymous/public analysis and retry path.

---

## 43. Authenticated session object

Conceptual:

```text
authSessionId
accountId
createdAt
lastAuthenticatedAt
authenticationMethod
assuranceContext
expiresAt
revokedAt?
sessionVersion
```

No raw authenticator secret.

---

## 44. Server authority

Protected request:

```text
session valid
AND
account active
AND
Deal authorization passes
AND
data-class permission passes
```

---

## 45. Session ID is not authorization

Session only identifies authenticated account context.

---

## 46. Session storage

Preferred:

server-managed session referenced by secure browser cookie or equivalent secure architecture.

Not JWT pasted into localStorage by default.

---

## 47. No auth token in localStorage

Absolute target rule.

---

## 48. No auth token in sessionStorage

Absolute target rule.

---

## 49. No refresh token in browser storage

Absolute target rule.

---

## 50. Browser memory

Transient non-secret UI state can exist.

Credentials/session authority should not depend on JS-readable persistence.

---

## 51. Cookie properties if cookie sessions used

Target:

- Secure;
- HttpOnly;
- appropriate SameSite;
- bounded scope;
- HTTPS only.

---

## 52. HTTPS

All authenticated product traffic requires HTTPS.

---

## 53. HSTS

Production security hardening should support.

Exact deployment config later.

---

## 54. Session fixation

After authentication:

rotate/regenerate authenticated session identifier.

---

## 55. Privilege change

Rotate/revalidate session after:

- role elevation;
- sensitive identity change;
- high-risk recovery;
- administrator transfer where assurance changes.

---

## 56. Deal role change

Authorization changes immediately.

Session need not encode stale role snapshot as authority.

---

## 57. Role stored in token anti-pattern

Do not rely on long-lived client token claim:

`role=Administrator`

without server revalidation.

---

## 58. Authorization freshness

For sensitive actions:

server loads current membership/permission.

---

## 59. Revoked member

Existing browser session remains account session but loses Deal access immediately.

---

## 60. Account suspension

All protected Deal access blocked.

---

## 61. Logout

Authenticated product must provide explicit logout.

---

## 62. Logout semantics

Logout:

- invalidates server session;
- removes/invalidates browser session reference;
- does not delete account;
- does not delete Deal;
- does not remove membership.

---

## 63. Logout all sessions

Strong future capability.

Important after compromise/recovery.

Could be required before broad production launch.

---

## 64. Session list

Future account-security feature.

Not required initial UX.

---

## 65. Concurrent sessions

Allowed only according to security policy.

No assumption of one device.

---

## 66. Session timeout

Must exist.

Exact idle/absolute timeout not invented here.

---

## 67. Why timeout remains separate

Depends on:

- authenticator strength;
- data sensitivity;
- enterprise requirements;
- session architecture.

---

## 68. No infinite session

Absolute.

---

## 69. Remember me

Do not add until persistent-session policy exists.

---

## 70. Persistent browser session

Must remain revocable server-side.

---

## 71. Session renewal

Cannot silently extend forever merely because browser open.

---

## 72. Re-authentication

Required for high-sensitivity actions.

---

## 73. Candidate high-sensitivity actions

- change primary email;
- change/recover authenticator;
- add/remove strong authentication factor;
- transfer Deal Administrator authority;
- grant/revoke highly restricted evidence access;
- external share of sensitive artifact;
- named-leader restricted disclosure;
- deletion/destructive lifecycle action;
- billing/payment identity changes where implemented.

---

## 74. Re-authentication ≠ full logout

Step-up can preserve workflow.

---

## 75. Re-auth return-to-intent

After successful step-up return to requested action.

---

## 76. Re-auth freshness

Need server-known recent authentication event.

Exact minutes not invented.

---

## 77. Risk events

Security policy may require re-authentication after:

- suspicious account activity;
- account recovery;
- credential change;
- unusual sign-in;
- security incident.

---

## 78. IP change

Signal only.

Do not auto-lock solely due to common mobile/VPN IP changes unless risk policy supports.

---

## 79. Device fingerprinting

Not required v1.

Privacy-sensitive.

---

## 80. Geolocation

Not required as auth factor.

---

## 81. Adaptive auth

Future.

Must avoid opaque discrimination/false positives.

---

## 82. MFA

Strongly recommended for high-sensitivity paid workspace.

Exact mandatory scope requires security decision.

---

## 83. Administrator MFA

Candidate future requirement.

Not claimed until mechanism implemented.

---

## 84. Named-leader restricted access

Higher assurance may be required.

`31` remains controlling.

---

## 85. Share recipient authentication

`35` requires verified recipient access for sensitive artifacts.

Can use same account auth service where appropriate.

---

## 86. Share recipient ≠ Deal member

Authentication identity can authenticate both contexts.

Authorization object differs.

---

## 87. Lightweight recipient account

Possible.

Must not auto-create Deal membership.

---

## 88. Collaborator invite acceptance

Correct flow:

```text
invite
→ recipient authentication
→ server verifies invite binding
→ membership activation
→ Deal access
```

---

## 89. Forwarded collaborator invite

Wrong authenticated identity fails.

---

## 90. Invite token in URL

Bootstrap capability only.

After acceptance, normal authenticated session.

---

## 91. Invite secret logging

Prohibited.

---

## 92. Referrer leakage

Sensitive invite/auth tokens require appropriate controls.

---

## 93. Link preview bots

Invitation URL should not activate membership merely by GET/open.

---

## 94. State-changing auth callback

Must prevent CSRF/replay per selected mechanism.

---

## 95. Respondent invite exception

Respondent can remain accountless because purpose is bounded evidence contribution.

---

## 96. Respondent code protection

Current:

- expiry;
- attempt limit;
- lockout;
- timing-safe verification concepts.

Preserve as respondent security, not account model.

---

## 97. Respondent completion

Does not mint account session.

---

## 98. Respondent-to-collaborator conversion

Requires explicit separate account invite/auth.

---

## 99. Account recovery

Recovery is authentication.

Not customer support discretion alone.

---

## 100. Recovery principle

> recovery must not be materially weaker than normal authentication.

---

## 101. Recovery cannot rely on knowledge questions

Already prohibited.

---

## 102. Email recovery

If email is recovery channel:

must verify control securely.

For highly sensitive accounts, email-only recovery may need additional safeguards.

---

## 103. Recovery codes

Possible future strong mechanism.

Not required here.

---

## 104. Passkey recovery

Needs multi-device/secondary authenticator/recovery design.

Do not deploy passkey-only without recovery plan.

---

## 105. Support-assisted recovery

High-risk.

Requires:

- separate identity verification procedure;
- dual-control or strong operator policy where needed;
- audit;
- no analyst discretion.

---

## 106. Support cannot reveal Deal data during recovery

---

## 107. Recovery event notification

Per accepted `36`, security notification may be essential.

---

## 108. Credential change notification

Recommended.

---

## 109. Primary email change

High sensitivity.

Needs re-authentication + verify new address + security notification.

---

## 110. Email change does not rewrite audit identity

Historical account ID remains same.

---

## 111. Email recycling risk

Organization may later reassign an address.

Stable account ID + revalidation policies required.

---

## 112. Disabled email inbox

Account should have recovery/update path.

---

## 113. Account deletion

Identity lifecycle separate from Deal/evidence deletion.

---

## 114. Account deletion cannot silently delete Deals

May require ownership transfer / lifecycle policy.

---

## 115. Last Deal Administrator

Accepted `34` protects last administrator.

Account deletion must respect.

---

## 116. Orphan prevention

Cannot delete/deactivate account if it would leave governed Deal without required administrator, unless controlled transfer/closure.

---

## 117. Identity merge

Two accounts should not be merged automatically because emails match historically.

---

## 118. Duplicate account

Needs secure resolution.

No silent data merge.

---

## 119. Email alias

Do not infer same human.

---

## 120. Enterprise identity linkage

Future SSO migration must map stable account IDs carefully.

---

## 121. SSO account takeover boundary

IdP authentication success still requires correct local account/membership mapping.

---

## 122. IdP role claims

Do not auto-map directly to Deal roles without accepted policy.

---

## 123. SCIM

Future.

Not authentication itself.

---

## 124. Domain verification

Future enterprise governance.

Does not create Deal access.

---

## 125. Account status model

Conceptual:

```text
ACTIVE
RECOVERY_REQUIRED
SUSPENDED
DISABLED
DELETION_PENDING
```

Exact enum later.

---

## 126. Unknown status

Fail closed for protected access.

---

## 127. Session status model

Conceptual:

```text
ACTIVE
EXPIRED
REVOKED
TERMINATED
REAUTH_REQUIRED
```

---

## 128. Authentication audit

Minimum events:

```text
account_created
email_verified
sign_in_succeeded
sign_in_failed
session_created
session_rotated
session_terminated
logout_all
reauth_succeeded
reauth_failed
recovery_started
recovery_completed
primary_email_changed
authenticator_added
authenticator_removed
```

Only events for implemented mechanisms.

---

## 129. Audit sensitive data

Do not store:

- password;
- OTP;
- magic-link secret;
- passkey private data;
- raw session token;
- recovery secret.

---

## 130. Passkey data

Public credential metadata only as protocol requires.

No private key ever reaches server.

---

## 131. Login failure logs

Need:

- account-independent anti-abuse data;
- privacy minimization;
- no secret.

---

## 132. User enumeration

Sign-in/recovery UI should not reveal whether arbitrary email has account where avoidable.

---

## 133. Signup duplicate handling

Can securely guide existing user without making account enumeration trivial.

---

## 134. Recovery enumeration

Generic response:

`If an account is eligible, we'll send instructions.`

Exact copy later.

---

## 135. Rate limiting

Required for:

- sign-in attempts;
- OTP/magic-link requests;
- recovery;
- invite validation;
- sensitive re-auth.

Exact thresholds security act.

---

## 136. Lockout

Avoid permanent easy DoS.

Selected mechanism determines strategy.

---

## 137. CAPTCHA

Not default.

Can be risk/abuse control later.

---

## 138. Bot protection

Implementation layer.

---

## 139. Credential stuffing

If passwords exist, protections needed.

---

## 140. Breached password detection

If passwords exist.

---

## 141. Passkey phishing resistance

Can be claimed only for actual WebAuthn/passkey mechanism.

---

## 142. Magic-link security

If used:

- single-use or tightly bounded;
- expiration;
- purpose;
- replay protection;
- HTTPS;
- no logging secret;
- callback state validation.

---

## 143. OTP security

If used:

- short-lived;
- attempt-limited;
- single-purpose;
- invalidate on use/new issue.

Exact digits/TTL not invented.

---

## 144. OAuth/OIDC

If used:

- state/nonce;
- PKCE where applicable;
- redirect URI allowlist;
- issuer/audience validation;
- no identity by unverified email claim.

---

## 145. Enterprise SAML/OIDC

Future security review.

---

## 146. Account linking to OAuth

High risk.

Requires authenticated existing session or secure verification.

---

## 147. Session cookie vs JWT

Architecture decision.

This contract defines security outcomes, not fashionable token type.

---

## 148. JWT anti-pattern

Do not use long-lived self-contained JWT as irrevocable Deal permission authority.

---

## 149. Authorization with JWT

Even if token carries account ID, Deal authorization remains server-side/current.

---

## 150. Refresh-token rotation

If token-based architecture selected.

Not applicable by default.

---

## 151. CSRF

If cookie-auth selected, protected mutations need CSRF defenses appropriate to architecture.

---

## 152. SameSite is defense-in-depth

Do not treat as sole CSRF policy.

---

## 153. XSS

HttpOnly protects token confidentiality but not all authenticated actions.

Content/XSS security remains critical.

---

## 154. CSP

Security hardening, separate implementation.

---

## 155. CORS

Do not use permissive `*` for authenticated APIs.

Exact origin list deployment-specific.

---

## 156. Session-bound authorization

Every protected API derives account from authenticated session.

Do not trust `accountId` submitted by browser.

---

## 157. Deal ID

Browser may submit Deal ID as locator.

Server verifies membership/permission.

---

## 158. Object-level authorization

Every protected object:

- Deal;
- report;
- evidence;
- member;
- share;
- named-leader artifact;

requires authorization.

---

## 159. IDOR prevention

Opaque IDs are not enough.

Authorization required.

---

## 160. Report PDF endpoint

Must require same rights as report.

---

## 161. Private evidence download

Must require current rights.

---

## 162. Share creation

Must require current share permission + re-auth where sensitive.

---

## 163. Member role change

Must require current Administrator + re-auth if policy says.

---

## 164. Internal operational access

Customer auth system must not expose internal analyst/admin backend roles to public sign-in.

---

## 165. Internal service credentials

Never accepted at customer frontend.

---

## 166. Service-to-service identity

Separate architecture.

---

## 167. API keys

Not customer browser authentication.

Future enterprise API separate.

---

## 168. Personal access tokens

Not v1.

---

## 169. Support/admin console

Separate host/auth policy preferred.

Not ordinary customer UI role.

---

## 170. Break-glass

Not authorized here.

Separate security policy.

---

## 171. Session termination on permission revocation

At minimum authorization recheck denies immediately.

Full session termination optional if only one Deal revoked.

---

## 172. Session termination on account compromise

All sessions revoked.

---

## 173. Session termination on password/authenticator reset

Risk policy should revoke/rotate appropriately.

---

## 174. Session termination on email change

Re-auth/rotation required.

---

## 175. Session theft response

Need:

- revoke sessions;
- notify user;
- recovery;
- audit.

---

## 176. Device/session management

Future UI:

`Your sessions`

not required first release.

---

## 177. Sign-in history

Could be useful for high-sensitivity account.

Not required v1.

---

## 178. Suspicious sign-in notice

Requires risk signal.

Do not invent `new device` detection if not implemented.

---

## 179. Browser fingerprint

Not security authority.

---

## 180. VPN/proxy

Not automatic fraud signal.

---

## 181. Geographic impossible-travel

Future risk engine only.

---

## 182. MFA recovery fatigue

Do not spam challenges.

---

## 183. Accessibility

Authentication UI:

- keyboard complete;
- clear labels;
- visible focus;
- accessible error messages;
- no captcha-only inaccessible path;
- passkey flow with fallback;
- no color-only state.

Target WCAG 2.2 AA.

---

## 184. Error copy

Do not expose internal security reason unnecessarily.

---

## 185. Sign-in generic error

Candidate:

`We couldn't sign you in. Check your details or try again.`

Mechanism-specific copy later.

---

## 186. Expired link

Candidate:

`This sign-in link is no longer valid.`

---

## 187. Session expired

Candidate:

`Your session has expired. Sign in again to continue.`

Preserve return intent.

---

## 188. Access denied vs sign-in required

Different.

- unauthenticated → sign in;
- authenticated unauthorized → no access.

---

## 189. No redirect loop

Auth middleware must preserve state safely.

---

## 190. No Deal leak before auth

Login page should not expose confidential Deal identity via query/header if not necessary.

---

## 191. Return-state security

Return URL must be allowlisted/internal.

No open redirect.

---

## 192. External redirect

Do not trust arbitrary `returnTo=https://evil.example`.

---

## 193. OAuth callback return state

Signed/server-bound.

---

## 194. Invite return state

Bound to invite object.

---

## 195. Share return state

Bound to share object.

---

## 196. Account creation confirmation

After successful account creation + Deal save:

`Deal saved`

not generic:

`Welcome!`

as primary completion.

---

## 197. Sign-in completion

Return directly to intended action.

---

## 198. First-run profile

Do not force unrelated profile onboarding.

---

## 199. Terms/privacy

If required:

explicit accepted versions stored.

Legal copy separate.

---

## 200. Marketing consent

Never part of auth necessity.

---

## 201. Cookies consent

Legal/privacy implementation decision.

Do not confuse essential auth cookie with marketing tracking.

---

## 202. Tracking during auth

Minimize third-party scripts.

---

## 203. Analytics on login

No email/credential/token in analytics.

---

## 204. Error monitoring

Scrub auth secrets.

---

## 205. Logs

Never log:

- password;
- OTP;
- magic token;
- session secret;
- reset token;
- OAuth authorization code;
- private evidence.

---

## 206. URL query logs

Avoid secrets in long-lived URL where possible.

---

## 207. Magic-link token in URL

May be unavoidable bootstrap but should be consumed quickly and removed from post-auth navigation/history.

---

## 208. Referrer policy

Protect sensitive callback/invite routes.

---

## 209. Browser cache

Authenticated sensitive pages should use appropriate caching headers.

---

## 210. Back button after logout

Must not restore sensitive content from cache as usable session.

---

## 211. Server response after logout

Protected fetch denied.

---

## 212. Multi-tab logout

Other tabs should fail on next protected request.

---

## 213. Session expiry during edit

Preserve non-sensitive draft where lawful, but re-auth before server mutation.

Do not lose user work unnecessarily.

---

## 214. Private evidence upload during expiry

Fail safely; do not partial-attach unauthorized upload.

---

## 215. Long-running analysis

Backend job can continue under job authority after user session ends if request was lawfully initiated.

Session expiry does not corrupt job.

---

## 216. Job result access

Requires new valid session/authorization.

---

## 217. Email-delivered public report

No auth requirement by existing public flow.

---

## 218. Saved paid report

Auth required.

---

## 219. External secure share

Recipient verification required per `35`.

---

## 220. Public historical case

No auth required.

---

## 221. Methodology pages

No auth required.

---

## 222. 42Q participant

Separate restricted participant session.

Not client account session by default.

---

## 223. Participant session

Must remain purpose-bound and not expose Deal workspace.

---

## 224. Participant account creation

Not required.

---

## 225. Participant completion

Session closes/restricts according to `31`.

---

## 226. Named-leader recipient

Client account/secure recipient auth depending distribution path.

---

## 227. High-sensitivity reauth gate

Recommended before exporting/sharing named-leader artifact.

Exact mechanism implementation policy.

---

## 228. Economic report

Normal paid Deal auth.

---

## 229. Billing portal

Future separate payment/provider auth context.

Do not expose via Deal session without provider/security design.

---

## 230. Procurement artifact

Can use recipient sharing identity without Deal membership.

---

## 231. Account support

Support may help route user but not impersonate without break-glass policy.

---

## 232. Identity proofing

MergeVue account authentication proves control of authenticator.

It does not automatically prove legal corporate authority.

---

## 233. Corporate authority

Deal requester/admin authority is separate from login.

---

## 234. Billing authority

Separate.

---

## 235. Signer authority

Separate legal/commercial process.

---

## 236. `CEO` title

Not authentication/authorization evidence.

---

## 237. Verified domain

Not signing authority.

---

## 238. Authentication assurance display

Do not show confusing security scores.

---

## 239. Security badge

No decorative:

`Military-grade security`.

---

## 240. Passkey label

Only if implemented.

---

## 241. MFA label

Only if actual two-factor requirement.

---

## 242. SSO label

Only if real.

---

## 243. Enterprise-ready security claims

Need actual capabilities/certifications.

---

## 244. Privacy claims

No `zero knowledge` unless technically true.

---

## 245. Encryption claims

Only precise current implementation.

---

## 246. Account creation audit vs Deal audit

Separate but linkable through accountId/Deal membership event.

---

## 247. Authentication event does not expose report contents

---

## 248. Security event notifications

Use accepted `36`.

---

## 249. Communication recipient

Primary verified email or other verified channel.

---

## 250. Email change transition

Old email may receive security notice where policy permits.

---

## 251. Recovery abuse

Rate-limit and audit.

---

## 252. Recovery operator access

No Deal browsing merely to verify user identity.

---

## 253. Legal identity documentation

Do not request passport/ID unless separate high-assurance enterprise/legal need exists.

---

## 254. KYC

Not ordinary MergeVue account requirement.

---

## 255. Age gate

Professional B2B product; not defined as consumer identity flow.

---

## 256. Account invitation from collaboration

If email has no account:

```text
invite
→ authenticate/create account
→ verify invite
→ activate Deal role
```

---

## 257. Existing account invite

```text
invite
→ sign in
→ verify account identity matches invitation
→ accept
```

---

## 258. Wrong existing account

Do not silently accept invite.

---

## 259. Account switching

Provide safe way to sign out/sign in as intended recipient.

---

## 260. Shared workstation

Logout/security especially important.

No persistent secret exposed.

---

## 261. Browser autofill

If password path selected, support secure password managers.

Do not disable paste.

---

## 262. OTP paste

Allow.

---

## 263. Passkey UX

Use browser/platform standard flows.

Do not simulate biometrics in MergeVue UI.

---

## 264. Biometrics

MergeVue never receives fingerprint/face data from passkey platform authenticator.

Do not claim storage.

---

## 265. Authentication ceremony

Keep simple.

Security complexity belongs backend, not confusing user jargon.

---

## 266. Step-up copy

Candidate:

`Confirm it's you to continue.`

Not:

`Your account is under attack`

unless true.

---

## 267. Session-expiry warning

Optional if long forms.

Do not promise extension without policy.

---

## 268. Respondent long-form expiry

Separate participant-session UX.

---

## 269. Account email verification

No protected persisted Deal ownership before identity verification, unless auth provider semantics already verify.

---

## 270. Unverified account

May hold temporary registration state.

No Deal access.

---

## 271. Verification token

Purpose-bound.

Not reusable as login forever.

---

## 272. Verification resend

Rate-limited; old token invalidation policy.

---

## 273. Account creation race

Two simultaneous callbacks should not create duplicate accounts.

---

## 274. Case normalization

Email normalization carefully implemented.

Do not merge distinct provider semantics blindly.

---

## 275. Unicode email

Provider/library standards.

Do not invent custom parser.

---

## 276. AccountId generation

Cryptographically unpredictable/opaque.

---

## 277. Sequential IDs

May exist internally but should not be authorization protection.

---

## 278. Password reset link

If passwords selected:

single-purpose, time-bound, replay-resistant.

---

## 279. Recovery completion

Rotate/revoke applicable sessions.

---

## 280. Authenticator removal

High sensitivity + reauth + notification.

---

## 281. Last strong factor removal

Policy may require prevention or recovery fallback.

---

## 282. MFA enrollment

No QR secret in logs.

---

## 283. TOTP

Possible fallback future.

Not selected here.

---

## 284. SMS MFA

Not preferred.

---

## 285. Hardware security key

Compatible with WebAuthn path if implemented.

---

## 286. Account compromise response

Target:

```text
suspend/revoke sessions
→ secure recovery
→ reverify
→ restore
→ audit
```

---

## 287. Deal access after recovery

Recompute current permissions.

Do not restore revoked Deal membership from cached token.

---

## 288. Authorization cache

May exist but must invalidate promptly on role/revocation changes.

---

## 289. Cache TTL

Security implementation.

---

## 290. Database consistency

Membership changes and access checks must use authoritative store.

---

## 291. Fail-open

Forbidden.

If auth/authorization backend uncertain:

deny sensitive action.

---

## 292. Auth provider outage

Do not bypass login.

Public product can remain accessible.

Protected Deal stays unavailable until auth recovers.

---

## 293. Session store outage

Fail closed for protected actions.

---

## 294. Redis/session assessment outage

Does not justify local browser auth fallback.

---

## 295. Offline mode

No authenticated sensitive offline mode v1.

---

## 296. Backup/recovery

Auth/account store must have operational resilience.

Exact RPO/RTO later.

---

## 297. Secrets management

Auth signing/encryption/client secrets never in repo/client bundle.

---

## 298. Environment variables

Server-side secrets only.

---

## 299. Rotation

Credentials/signing keys need rotation policy.

---

## 300. Key compromise

Incident response separate.

---

## 301. Production vs staging identity

Strong separation.

---

## 302. Staging user data

Do not copy production client data casually.

---

## 303. Test accounts

Clearly non-production.

---

## 304. Automated tests

Need at minimum:

- unauthenticated protected route;
- authenticated no Deal access;
- authenticated Viewer;
- Collaborator;
- Administrator;
- revoked member;
- role downgrade;
- session expiry;
- logout;
- duplicate callback;
- wrong invite identity;
- expired/revoked invite;
- return-to-intent;
- open redirect prevention;
- CSRF where relevant;
- stale authorization token;
- browser-storage scan;
- account recovery;
- re-auth protected action;
- user-enumeration behavior.

---

## 305. Security test: current technical capability

Ensure assessment mutation token cannot access future account endpoints.

---

## 306. Security test: client account

Ensure account session cannot directly invoke technical internal mutation outside authorized Deal workflow.

---

## 307. Security test: `OWNER` collision

Legacy technical `OWNER` string must not map to Deal Administrator by name coincidence.

---

## 308. Security test: IDOR

Change `dealId` in request → access denied unless membership.

---

## 309. Security test: report

Change `reportId` → same.

---

## 310. Security test: private evidence

Change `evidenceId` → same.

---

## 311. Security test: named leader

Change person artifact ID → same.

---

## 312. Security test: share

Share token/account binding enforced.

---

## 313. Security test: localStorage

Production bundle must continue to contain no auth/session credential storage.

---

## 314. Security test: logout cache

Back/forward does not restore usable confidential content.

---

## 315. Security test: reauth

Sensitive action cannot be performed with stale/insufficient session if policy requires step-up.

---

## 316. Security test: recovery

Recovery cannot be used to bypass membership revocation.

---

## 317. Security test: account email change

Old login identity invalidated/updated according to policy without creating duplicate ownership.

---

## 318. Security test: notifications

Recovery/security events route through `36` without secret leakage.

---

## 319. Security test: provider failure

No fallback to insecure auth.

---

## 320. Security test: invite preview bot

GET/open does not activate collaborator membership.

---

## 321. Security test: callback replay

Consumed one-time auth/recovery action cannot be replayed.

---

## 322. Accessibility test

All auth/recovery flows keyboard/screen-reader operable.

---

## 323. Reliability test

Session store/revocation behavior survives process restart/deployment if production claims durable sessions.

---

## 324. Observability

Need metrics:

- auth success/failure;
- recovery initiation/completion;
- session creation/revocation;
- rate-limit events;
- authorization denial rates.

No secrets.

---

## 325. Security alerts

Abnormal spikes can alert internal security operations.

Not user-facing severity automatically.

---

## 326. Privacy-safe telemetry

Account ID can be pseudonymous/internal.

Avoid raw email where not needed.

---

## 327. Audit immutability

Security-relevant events should be tamper-evident/controlled according to logging architecture.

---

## 328. No logs as authorization

Audit trail does not determine current access.

---

## 329. Session count

Not product KPI.

---

## 330. Conversion pressure

Do not weaken auth to increase signup conversion for sensitive paid workflow.

---

## 331. Friction proportionality

Public FREE remains low-friction.

Sensitive paid/private/individual actions justify stronger checks.

---

## 332. Security progressive disclosure

User should see security challenge at trust escalation, not before public value.

---

## 333. Trust ladder

Conceptual:

```text
Public anonymous
→ verified account
→ authenticated Deal member
→ sensitive action re-auth
→ restricted person-level action
```

Not a score.

---

## 334. No generic security questionnaire in signup

---

## 335. No “security theater”

Avoid:

- lock icons everywhere;
- fake encrypted badges;
- meaningless `256-bit secure` copy.

---

## 336. Product trust copy

Prefer factual:

`Sign in to access this saved deal.`

`Confirm it's you to change access.`

---

## 337. Session copy

`Your session has expired.`

---

## 338. Logout copy

`Signed out.`

---

## 339. Account recovery copy

Mechanism-specific, minimal.

---

## 340. No support promise

Do not claim 24/7 security support without operations.

---

## 341. Account settings

Can be minimal:

- primary email;
- authentication methods;
- sign out;
- security actions.

Not full profile portal.

---

## 342. Profile photo

Not needed.

---

## 343. Phone

Not needed by default.

---

## 344. Organization

Separate Deal/commercial context.

---

## 345. Delete account

Requires lifecycle contract before simple button.

---

## 346. Export personal data

Privacy/right process separate.

---

## 347. Security settings route

No route authorized by this document alone.

---

## 348. Login route

Route decision required.

Could be modal/route depending implementation.

---

## 349. Signup route

Same.

---

## 350. Callback routes

Mechanism-specific.

Do not document nonexistent URLs as product contract.

---

## 351. Уровень доверия

### 351.1. Current customer account auth

**Не подтверждено / отсутствует как полноценная production capability в audited `main`.**

### 351.2. Current assessment/respondent security primitives

**Высокое доверие к existence of:**

- cryptographic random capability generation;
- hashed verifier storage;
- timing-safe compare;
- expiry;
- bounded roles/actions;
- respondent lockout concepts;
- persistent server storage path.

### 351.3. Browser storage posture

**Высокое доверие** к current validation rule:

production bundle должен иметь zero matches for `localStorage`, `sessionStorage`, `indexedDB`.

### 351.4. Account UX intent

**Высокая design authority** из `21`:

`Save this deal → Sign in / Create account → authenticate → persisted Deal → return`.

### 351.5. Client permissions

**OWNER-ACCEPTED** `34`.

Authentication must feed that authorization model.

### 351.6. Recipient sharing

**OWNER-ACCEPTED** `35`.

Sensitive external recipient access needs verified identity but not Deal membership.

### 351.7. Security communication

**OWNER-ACCEPTED** `36`.

Recovery/credential/security messages must follow its communication truth rules.

### 351.8. Target auth mechanism

**OWNER-ACCEPTED architecture boundary; конкретный provider/mechanism не выбран этим contract.**

Contract now controls the required security outcomes and prohibited weak patterns. Provider/mechanism selection remains a downstream engineering/security act and cannot change the accepted invariants without a superseding Owner decision.

---

## 352. Что мы сознательно НЕ меняем

1. Public analysis remains usable without account.
2. `Save this deal` remains canonical account trigger.
3. Email report delivery remains distinct from account.
4. Respondent invite remains distinct from account.
5. Deal membership remains controlled by `34`.
6. External recipient access remains controlled by `35`.
7. Notification/security messaging remains controlled by `36`.
8. Data rights remain controlled by `29`.
9. Person-level restrictions remain controlled by `31`.
10. Client role `Owner` remains prohibited.
11. Current technical `OWNER` capability remains legacy/technical only.
12. Authentication never becomes Deal authorization.
13. Account never creates organization-wide access automatically.
14. Email domain never creates Deal access.
15. No auth token in localStorage/sessionStorage.
16. No fake OAuth/SSO buttons.
17. No SMS requirement.
18. No security questions.
19. No public Deal indexing.
20. No support impersonation/break-glass introduced here.
21. No enterprise SSO claim.
22. No route created solely by this document.
23. No exact session timeout invented.
24. No exact MFA policy invented.
25. No auth vendor selected.

---

## 353. Acceptance criteria

Contract passes only if:

1. Authentication is distinct from authorization.
2. Account identity uses stable opaque account ID.
3. Email is not primary authorization key.
4. Public email capture is not account.
5. Account creation requires explicit user intent.
6. Public analysis remains accountless.
7. Save flow returns user to intended Deal/action.
8. Sign-in and create-account paths remain distinct.
9. Signup is not CRM intake.
10. Auth mechanism is never rendered before implemented.
11. No fake OAuth button.
12. No fake SSO.
13. Enterprise SSO does not auto-grant Deal.
14. Assessment session differs from account session.
15. Technical mutation capability differs from account credential.
16. Legacy technical `OWNER` differs from Deal Administrator.
17. Respondent invite differs from account auth.
18. Current respondent accountless path remains possible.
19. Anonymous handoff is server-validated.
20. Browser text cannot define saved Deal identity.
21. Save operation is idempotent/atomic enough to avoid orphaned Deal ownership.
22. Auth success is distinct from Deal-save success.
23. Server session identifies account, not permissions.
24. Every protected action checks current authorization.
25. No auth token in localStorage.
26. No auth token in sessionStorage.
27. No refresh token in browser storage.
28. HTTPS required.
29. Secure cookie properties required if cookie session selected.
30. Session rotates after authentication.
31. Session/assurance re-evaluated after privilege changes.
32. Long-lived client role claim is not sole authority.
33. Revoked Deal membership takes effect without requiring logout.
34. Account suspension blocks protected access.
35. Logout invalidates server session.
36. Logout does not delete data.
37. No infinite session.
38. Exact timeout requires later security decision.
39. `Remember me` not added without policy.
40. Persistent sessions remain revocable.
41. Re-auth exists for high-sensitivity actions.
42. Re-auth preserves return intent.
43. Primary email change requires strong confirmation.
44. Authenticator change is high sensitivity.
45. Recovery is not weaker than normal login.
46. Security questions prohibited.
47. Support-assisted recovery is governed/audited.
48. Recovery does not expose Deal evidence.
49. Recovery can revoke prior sessions.
50. Last Deal Administrator cannot disappear through account deletion.
51. Account deletion cannot silently delete Deals.
52. Duplicate accounts are not silently merged.
53. Email alias does not imply same identity.
54. SSO identity linkage preserves stable account identity.
55. IdP role claims do not directly become Deal roles.
56. Unknown account/session status fails closed.
57. Auth audit contains no secrets.
58. User enumeration minimized.
59. Sign-in/recovery rate limiting required.
60. CAPTCHA not default.
61. Password controls exist if password path selected.
62. Magic-link controls exist if magic-link path selected.
63. OTP controls exist if OTP path selected.
64. OAuth state/nonce/PKCE/issuer validation exists where applicable.
65. Long-lived JWT is not irrevocable permission authority.
66. CSRF protection exists where architecture requires.
67. Object-level authorization protects Deal/report/evidence/share/person objects.
68. Opaque IDs are not treated as permissions.
69. PDF endpoints enforce authorization.
70. Private evidence endpoints enforce authorization.
71. Share creation enforces rights/permission.
72. Client cannot assign internal operational roles.
73. Internal credentials cannot log in through customer UI.
74. API keys are not browser auth.
75. Support/admin console authority remains separate.
76. Account-compromise response can revoke sessions.
77. Session store outage fails closed.
78. Auth provider outage does not create bypass.
79. No local browser auth fallback.
80. Secrets remain server-side.
81. Production/staging identity separated.
82. Test accounts do not leak production data.
83. Wrong invite identity fails.
84. Forwarded invite does not grant membership.
85. Preview bot cannot activate invite.
86. Return URL cannot be open redirect.
87. Auth callback state is protected.
88. No confidential Deal leak before auth.
89. Successful signup returns to Deal, not generic onboarding.
90. Marketing consent remains separate.
91. Auth analytics exclude secrets/email where unnecessary.
92. Logs exclude passwords/OTP/magic/session/recovery secrets.
93. Sensitive query tokens removed/consumed promptly.
94. Browser cache does not restore usable protected session after logout.
95. Multi-tab session obeys server revocation.
96. Session expiry during user work fails safely.
97. Long-running backend analysis can continue independently of browser session once lawfully started.
98. Job result still requires auth.
99. Public Forecast Brief remains accountless distribution.
100. Saved paid report requires auth.
101. Secure external share uses verified recipient identity.
102. 42Q participant session remains separate.
103. Named-leader output can require stronger re-auth.
104. Corporate/legal authority remains separate from login.
105. Billing authority remains separate from login.
106. Job title/seniority is not authorization.
107. No misleading security badges/claims.
108. Account settings stay minimal.
109. No delete-account shortcut before lifecycle policy.
110. Authentication/recovery UI meets WCAG 2.2 AA.
111. Tests cover unauthenticated/unauthorized/revoked/expired states.
112. Tests cover privilege changes and re-auth.
113. Tests cover IDOR across Deal/report/evidence/person/share.
114. Tests prove assessment technical token cannot act as account credential.
115. Tests prove client account cannot bypass technical workflow controls.
116. Tests prove legacy `OWNER` name collision grants no client authority.
117. Production browser-storage scan remains.
118. Audit/revocation survives deployment if durability claimed.
119. External professional guidance is precedent, not project authority.
120. LIVE audit occurs before implementation because this file audits `main`, not deployed production.

---


## 353.1. Owner acceptance boundary

**Owner acceptance состоялся 2026-09-16.**

С этого момента `37 v1.0` является **controlling identity, authentication and session security design contract** для MergeVue.

Owner acceptance включает как controlling target policy:

- `AUTHENTICATION ≠ AUTHORIZATION`;
- stable opaque account identity rather than email-as-authority;
- public report email capture remains distinct from account identity;
- assessment/respondent sessions remain distinct from authenticated customer sessions;
- legacy technical `MutationCapabilityRole = "OWNER"` never maps to client `Deal Administrator`;
- technical mutation capabilities never become customer login credentials;
- server-authoritative, revocable authenticated sessions;
- no auth/session/refresh credentials in `localStorage` or `sessionStorage`;
- session rotation after authentication and material privilege/security changes;
- current server-side Deal/data authorization on protected requests;
- re-authentication/step-up for high-sensitivity actions;
- recovery must not be materially weaker than normal authentication;
- no security questions;
- no fake OAuth/SSO/passkey UI;
- explicit logout and fail-closed session/provider-outage behavior;
- collaborator/share recipient authentication remains separate from Deal authorization;
- object-level authorization for Deal/report/evidence/share/person-level artifacts;
- return-to-intent after authentication and re-authentication.

Owner acceptance **не означает автоматически**:

- implementation authorization;
- selection of an auth vendor;
- selection of passkey, magic link, OTP, password, OAuth/OIDC or SSO as launch mechanism;
- existence of `/login`, `/signup`, callback or account-security routes;
- existence of MFA;
- existence of enterprise SSO/SCIM;
- approval of exact idle/absolute session timeouts;
- approval of exact re-auth freshness window;
- approval of OTP/magic-link TTLs or rate limits;
- approval of support-assisted recovery;
- production completion of security/privacy review.

The downstream decisions listed in §355 remain external implementation/security acts. Until they are resolved, implementation must preserve the accepted invariants and fail closed rather than filling gaps with product or engineering defaults.


## 354. Implementation sequence

### Phase 0 — freeze terminology

Separate:

```text
assessmentSession
authSession
participantSession
shareAccess
mutationCapability
DealMembership
```

No overloaded `session`.

### Phase 1 — identity service

Implement:

- stable account ID;
- verified email;
- account status;
- audit;
- no Deal permission embedded as global role.

### Phase 2 — primary authentication

Select security-reviewed mechanism/provider.

Implement:

- sign in;
- create account;
- identity verification;
- server session;
- logout;
- return-to-intent.

### Phase 3 — saved Deal binding

Integrate `21`:

- anonymous handoff verification;
- atomic/idempotent save;
- creator → Deal Administrator under `34`.

### Phase 4 — session hardening

Implement:

- secure session transport;
- rotation;
- expiry;
- revocation;
- CSRF/XSS/session-fixation defenses as applicable;
- no browser-storage credentials.

### Phase 5 — collaboration/share identity

Integrate:

- `34` collaborator invite acceptance;
- `35` secure recipient identity;
- permission recheck.

### Phase 6 — re-authentication

Protect:

- access changes;
- sensitive sharing;
- person-level actions;
- credential/email changes;
- destructive actions.

### Phase 7 — recovery

Implement secure:

- authenticator recovery;
- email change;
- session revocation;
- security notification via `36`.

### Phase 8 — enterprise identity

Only when needed:

- OIDC/SAML SSO;
- domain governance;
- SCIM separately.

---

## 355. Downstream decisions still required

Deliberately not invented here:

1. exact auth provider;
2. exact primary mechanism for first launch;
3. passkey enrollment policy;
4. whether MFA is mandatory for all paid users or selected roles/actions;
5. exact session idle timeout;
6. exact session absolute timeout;
7. exact re-auth freshness window;
8. magic-link/OTP TTL if used;
9. login/recovery rate-limit thresholds;
10. logout-all initial launch requirement;
11. session/device management UI;
12. exact account-recovery fallback;
13. support-assisted recovery procedure;
14. OAuth providers if any;
15. enterprise SSO provider/protocol rollout;
16. domain-verification policy;
17. exact cookie/session implementation;
18. account lifecycle/deletion policy;
19. security-log retention;
20. account-security route/UI.

These require engineering/security/legal authority.

---

## 356. Non-authoritative professional reference note

This target contract is consistent with current OWASP authentication/session-management guidance:

- server-managed session state;
- session identifier rotation after authentication/privilege change;
- Secure/HttpOnly/SameSite protections when cookies are used;
- re-authentication for high-risk actions;
- no authentication tokens in browser Web Storage.

NIST digital-identity guidance is used only as professional precedent for preferring stronger/phishing-resistant authentication where appropriate.

No statement in this file claims MergeVue is NIST-certified, OWASP-certified, AAL-certified, SOC-certified or otherwise externally certified.

---

## 357. Финальная формула

> **Authentication answers “who is this account?” Authorization answers “what may this account do in this Deal?” MergeVue must never collapse those questions.**

> **The public product remains low-friction. Identity is requested when the user wants persistence, private evidence, collaboration, monitoring or another protected capability. After authentication, the user returns to the exact Deal and intent that caused the trust escalation.**

> **The safe target is a server-authoritative, revocable, bounded session with no browser-storage credentials, current permission checks on every protected object, session rotation after authentication/privilege changes, and stronger re-authentication for sensitive actions.**

> **Current assessment/respondent capability tokens are useful security primitives, but they are not customer accounts and they must never become a shortcut around the accepted `34`/`35` permission architecture.**
