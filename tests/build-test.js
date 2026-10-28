// tests/build-test.js - Verifies the static site build output.
const assert = require("assert");
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const SITE_DIR = path.join(ROOT, "site");

const EXPECTED_PAGES = [
  "index.html",
  "what-is-kdp.html",
  "manuscript-prep.html",
  "trim-size.html",
  "cover-basics.html",
  "isbn.html",
  "pricing.html",
  "categories.html",
  "keywords.html",
  "upload-steps.html",
  "proofing.html",
  "checklist.html",
  "glossary.html",
];

function read(file) {
  return fs.readFileSync(path.join(SITE_DIR, file), "utf8");
}

let failures = 0;

function check(name, condition) {
  if (!condition) {
    console.error("FAIL: " + name);
    failures++;
  } else {
    console.log("ok: " + name);
  }
}

// 1. Build first
const { build } = require(path.join(ROOT, "build.js"));
let results = build();
console.log("Build produced " + results.length + " pages.");

// 2. Every expected page exists
EXPECTED_PAGES.forEach(function (page) {
  check("site contains " + page, fs.existsSync(path.join(SITE_DIR, page)));
});

// 3. style.css exists
check("site contains style.css", fs.existsSync(path.join(SITE_DIR, "style.css")));

// 4. Content spot checks
let index = read("index.html");
check("index has site title", index.includes("KDP First Book Guide"));
check("index credits Asdale Dynamics", index.includes("Asdale Dynamics, LLC"));
check("index links to manuscript prep page", index.includes('href="manuscript-prep.html"'));
check("index has no dangling .md links", !index.includes(".md"));

// 5. Each page has the credit footer and title
EXPECTED_PAGES.forEach(function (page) {
  let html = read(page);
  check(page + " credits Asdale Dynamics", html.includes("Asdale Dynamics, LLC"));
  check(page + " has copyright line", html.includes("Copyright (c) 2026 Asdale Dynamics, LLC"));
  check(page + " has no dangling .md links", !html.includes(".md"));
  check(page + " has nav", html.includes('<nav class="top-nav">'));
});

// 6. Specific content
check("Manuscript prep page mentions manuscript", read("manuscript-prep.html").toLowerCase().includes("manuscript"));
check("Trim size page mentions trim", read("trim-size.html").toLowerCase().includes("trim"));
check("Cover page mentions cover", read("cover-basics.html").toLowerCase().includes("cover"));
check("ISBN page mentions ISBN", read("isbn.html").includes("ISBN"));
check("Pricing page mentions royalty", read("pricing.html").toLowerCase().includes("royalt"));
check("Categories page mentions categories", read("categories.html").toLowerCase().includes("categor"));
check("Keywords page mentions keywords", read("keywords.html").toLowerCase().includes("keyword"));
check("Upload steps page mentions upload", read("upload-steps.html").toLowerCase().includes("upload"));
check("Proofing page mentions proof", read("proofing.html").toLowerCase().includes("proof"));
check("Checklist page has master checklist", read("checklist.html").includes("Master checklist"));
check("Glossary page defines KDP", read("glossary.html").includes("Kindle Direct Publishing"));

if (failures > 0) {
  console.error("\n" + failures + " test(s) failed.");
  process.exit(1);
}
console.log("\nAll tests passed.");
