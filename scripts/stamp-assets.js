/**
 * Stamps a version query (?v=…) onto local CSS/JS references in the homepage
 * and option pages so browsers fetch fresh files after every deploy (GitHub Pages caches
 * for 10 minutes). Run before committing: `node scripts/stamp-assets.js`
 */
const fs = require("node:fs");
const path = require("node:path");

const version = new Date().toISOString().replace(/[-:TZ.]/g, "").slice(0, 12); // yyyymmddhhmm
const pages = ["index.html", "option-a/index.html", "option-b/index.html"];

for (const page of pages) {
  const file = path.join(__dirname, "..", page);
  const html = fs.readFileSync(file, "utf8");
  const stamped = html.replace(
    /((?:href|src)=")((?:assets\/)?(?:css|js)\/[\w-]+\.(?:css|js))(?:\?v=\w+)?(")/g,
    `$1$2?v=${version}$3`,
  );
  fs.writeFileSync(file, stamped);
  console.log(`${page}: stamped v=${version}`);
}
