import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolveRoutePath } from "../src/routes/routeModel.js";

const root = new URL("..", import.meta.url);
const read = (relativePath) => readFile(new URL(relativePath, root), "utf8");

const appSource = await read("src/App.jsx");
const processSource = await read("src/screens/public/HowItWorksProcess.jsx");
const cssSource = await read("src/styles/public-methodology.css");
const routeModelSource = await read("src/routes/routeModel.js");
const navigationSource = await read("src/routes/navigation.js");
const dispatchSource = await read("src/screens/screenDispatch.js");
const routeShellSource = await read("src/shell/routeShell.js");
const registrySource = await read("src/screenRegistry.js");

const STEP_TITLES = [
  "Start with a real deal",
  "See what the public evidence supports",
  "Add internal observations only where they matter",
  "Use private evidence for deeper analysis",
  "Add individual data only when needed",
  "Lock the forecast",
  "Verify what happened",
];

const VERIFICATION = [
  "Confirmed",
  "Partially confirmed",
  "Not determinable",
  "Missed",
  "Falsified",
];

const FORBIDDEN_42Q = [
  /critical risk detected/i,
  /deep analysis[\s\S]{0,40}42Q/i,
  /leader looks risky/i,
  /42Q optional enrichment/i,
];

const FORBIDDEN_GLOBAL_SELECTORS = [
  /^\s*body\b/m,
  /^\s*h1\b/m,
  /^\s*h2\b/m,
  /^\s*p\b/m,
  /^\s*button\b/m,
  /^\s*a\b/m,
  /^\s*\.card\b/m,
  /^\s*\.screen\b/m,
];

assert.equal(resolveRoutePath("/about-methodology").id, "about-methodology");
assert.equal(resolveRoutePath("/about-methodology").route, "/about-methodology");
assert.equal(resolveRoutePath("/how-it-works").isFallback, true, "/how-it-works must remain inactive");
assert.equal(resolveRoutePath("/analyze").isFallback, true, "/analyze must remain inactive");
assert.doesNotMatch(routeModelSource, /\/how-it-works/);
assert.doesNotMatch(navigationSource, /\/how-it-works/);
assert.doesNotMatch(dispatchSource, /HowItWorksProcess/);
assert.doesNotMatch(routeShellSource, /HowItWorksProcess/);
assert.doesNotMatch(registrySource, /\/how-it-works/);

assert.match(appSource, /import \{ HowItWorksProcess \} from "\.\/screens\/public\/HowItWorksProcess\.jsx"/);
assert.match(appSource, /<HowItWorksProcess \/>/);
assert.match(appSource, /The Post-Deal Behavior Forecast Methodology/);
assert.match(appSource, /The Environment Compatibility Score \(ECS\)/);
assert.match(appSource, /17 behavioural resources/);
assert.match(appSource, /The 9 Interaction Environments/);
assert.match(appSource, /Read the methodology paper/);
assert.match(appSource, /methodology-note/);
assert.match(appSource, /environment-card-grid/);

const processStart = appSource.indexOf("<HowItWorksProcess />");
const ecsStart = appSource.indexOf("<h2>The Environment Compatibility Score (ECS)</h2>");
const heroStart = appSource.indexOf("<h1>The Post-Deal Behavior Forecast Methodology</h1>");
assert.ok(heroStart >= 0 && processStart > heroStart && ecsStart > processStart, "process must sit after the hero and before ECS");

for (const title of STEP_TITLES) {
  const matches = processSource.split(title).length - 1;
  assert.equal(matches, 1, `step title must appear exactly once: ${title}`);
}

let lastIndex = -1;
for (const title of STEP_TITLES) {
  const index = processSource.indexOf(title);
  assert.ok(index > lastIndex, `step order broken at ${title}`);
  lastIndex = index;
}

assert.match(processSource, /Use private evidence for deeper analysis/);
assert.match(processSource, /Paid engagement/);
assert.match(processSource, /specific-leader forecast requested → 42Q required/);
assert.match(processSource, /A specific-leader forecast is requested\./);
assert.match(processSource, /public-source research is not yet the live entry/);
assert.match(processSource, /This is the full MergeVue workflow/);
assert.match(processSource, /PRIMARY_CTA_HREF = "\/start-diagnostic\/deal-context"/);
assert.match(processSource, /METHODOLOGY_HREF = "\/about-methodology\/overview"/);
assert.match(processSource, /CASES_HREF = "\/case-studies"/);
assert.match(processSource, /Analyze a deal/);
assert.match(processSource, /Read the methodology/);
assert.match(processSource, /Historical cases/);
assert.doesNotMatch(processSource, /\/analyze"/);
assert.doesNotMatch(processSource, /\/how-it-works/);
assert.doesNotMatch(processSource, /accuracy report/i);
assert.doesNotMatch(processSource, /AI analyzes your deal/i);

for (const word of VERIFICATION) {
  assert.match(processSource, new RegExp(word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
}

for (const pattern of FORBIDDEN_42Q) {
  assert.doesNotMatch(processSource, pattern);
}

assert.match(cssSource, /\.mv-how-/);
assert.doesNotMatch(cssSource, /\.mv-public-page/);
for (const pattern of FORBIDDEN_GLOBAL_SELECTORS) {
  assert.doesNotMatch(cssSource, pattern, `public-methodology.css must not restyle ${pattern}`);
}

console.log("UI-FROG-02 how-it-works validation: seven steps on /about-methodology, no /how-it-works, disclosure and 42Q trigger present");
