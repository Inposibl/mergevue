import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolveRoutePath } from "../src/routes/routeModel.js";

const root = new URL("..", import.meta.url);
const read = (relativePath) => readFile(new URL(relativePath, root), "utf8");

const appSource = await read("src/App.jsx");
const homeSource = await read("src/screens/public/HomeScreen.jsx");
const cssSource = await read("src/styles/public-home.css");
const publicPageSource = await read("src/ui/public/PublicPage.jsx");
const shellSource = await read("src/shell/ApplicationShell.jsx");
const publicHeroSource = await read("src/ui/public/PublicHero.jsx");
const publicSectionSource = await read("src/ui/public/PublicSection.jsx");
const publicCardSource = await read("src/ui/public/PublicCard.jsx");
const publicButtonSource = await read("src/ui/public/PublicButton.jsx");
const publicTrustSource = await read("src/ui/public/PublicTrustItem.jsx");

const FORBIDDEN_GLOBAL_SELECTORS = [
  /^\s*body\b/m,
  /^\s*h1\b/m,
  /^\s*h2\b/m,
  /^\s*p\b/m,
  /^\s*button\b/m,
  /^\s*a\b/m,
  /^\s*input\b/m,
  /^\s*\.card\b/m,
  /^\s*\.screen\b/m,
];

const TARGET_ONLY_PATHS = [
  "/how-it-works",
  "/analyze",
  "/analyze/context",
  "/workspace",
  "/account",
  "/login",
  "/checkout",
  "/historical-replays",
];

const FORBIDDEN_CLAIM_PATTERNS = [
  /70%/,
  /thousands of public data points/i,
  /instant risk profile/i,
  /precise forecast/i,
  /proven accuracy/i,
  /AI predicts/i,
  /real-time deal score/i,
  /Start with two company names/,
  /MergeVue will research the public evidence/,
];

assert.match(appSource, /import \{ HomeScreen \} from "\.\/screens\/public\/HomeScreen\.jsx"/);
assert.doesNotMatch(appSource, /const HOME_COPY =/);
assert.doesNotMatch(appSource, /function HomeScreen\(/);
assert.match(appSource, /^\s*HomeScreen,/m);

assert.match(homeSource, /export function HomeScreen\(/);
assert.match(homeSource, /from "\.\.\/\.\.\/ui\/public\/PublicPage\.jsx"/);
assert.match(homeSource, /from "\.\.\/\.\.\/ui\/public\/PublicHero\.jsx"/);
assert.match(homeSource, /from "\.\.\/\.\.\/ui\/public\/PublicSection\.jsx"/);
assert.match(homeSource, /from "\.\.\/\.\.\/ui\/public\/PublicCard\.jsx"/);
assert.match(homeSource, /from "\.\.\/\.\.\/ui\/public\/PublicButton\.jsx"/);
assert.match(homeSource, /from "\.\.\/\.\.\/ui\/public\/PublicTrustItem\.jsx"/);
assert.match(homeSource, /Analyze a deal/);
assert.match(homeSource, /PRIMARY_CTA_HREF = "\/start-diagnostic\/deal-context"/);
assert.match(homeSource, /href: "\/about-methodology"/);
assert.match(homeSource, /href: "\/case-studies"/);
assert.match(homeSource, /href: "\/environments"/);
assert.doesNotMatch(homeSource, /Start Diagnostic/);
assert.doesNotMatch(homeSource, /70%/);

for (const path of TARGET_ONLY_PATHS) {
  assert.equal(homeSource.includes(`"${path}"`) || homeSource.includes(`'${path}'`), false, `Home must not activate ${path}`);
  assert.equal(resolveRoutePath(path).isFallback, true, `${path} must remain inactive`);
}

assert.equal(resolveRoutePath("/").id, "home");
assert.equal(resolveRoutePath("/home").id, "home");
assert.equal(resolveRoutePath("/").rendererId, "HomeScreen");
assert.equal(resolveRoutePath("/home").rendererId, "HomeScreen");
assert.equal(resolveRoutePath("/start-diagnostic/deal-context").id, "deal-context-acquisition-motive");
assert.equal(resolveRoutePath("/about-methodology").id, "about-methodology");
assert.equal(resolveRoutePath("/case-studies").id, "case-studies");
assert.equal(resolveRoutePath("/environments").id, "interaction-environments");

for (const pattern of FORBIDDEN_CLAIM_PATTERNS) {
  assert.doesNotMatch(homeSource, pattern);
}

for (const pattern of FORBIDDEN_GLOBAL_SELECTORS) {
  assert.doesNotMatch(cssSource, pattern, `public-home.css must not restyle ${pattern}`);
}

assert.match(cssSource, /\.mv-public-/);
assert.match(cssSource, /\.mv-home-/);
assert.match(cssSource, /@media \(max-width: 768px\)/);
assert.match(cssSource, /@media \(max-width: 390px\)/);
assert.match(cssSource, /:focus-visible/);
assert.match(cssSource, /min-height: 44px/);

assert.match(publicPageSource, /HOME_MAIN_CONTENT_ID = "mv-home-main-content"/);
assert.doesNotMatch(publicPageSource, /Skip to main content/);
assert.match(publicPageSource, /id=\{contentId\}/);
assert.match(shellSource, /skipNavigation = null/);
assert.match(
  shellSource,
  /<>\s*\{skipNavigation\}\s*<LegacySiteSidebar/,
);
assert.match(appSource, /screen\?\.id === "home"/);
assert.match(appSource, /Skip to main content/);
assert.match(appSource, /href=\{`#\$\{HOME_MAIN_CONTENT_ID\}`\}/);
assert.doesNotMatch(cssSource, /translateY/);
assert.doesNotMatch(cssSource, /\.mv-public-skip[\s\S]{0,400}transform\s*:/);
assert.match(cssSource, /clip-path:\s*inset\(50%\)/);
assert.match(cssSource, /\.mv-home-start-note\s*\{[^}]*color:\s*var\(--mv-public-muted\)/s);
assert.doesNotMatch(cssSource, /\.mv-home-start-note\s*\{[^}]*--mv-public-tertiary/s);
assert.match(publicHeroSource, /mv-public-hero-title/);
assert.match(publicSectionSource, /mv-public-section/);
assert.match(publicCardSource, /mv-public-card/);
assert.match(publicButtonSource, /href/);
assert.match(publicTrustSource, /mv-public-trust-item/);

console.log("UI-FROG-01 home validation: extracted HomeScreen, scoped public primitives/CSS, lawful CTAs, no target-only routes");
