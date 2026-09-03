/* ============================================================================
   스포일러 감사 — 플레이어가 닿는 파일에 CH1~8 에서 금지된 표현이 있는지 본다.

   큐시트 §2.1 이 규정한 목록을 stage2/logic.js 가 들고 있고, 이 스크립트는
   그걸 그대로 쓴다. 목록을 늘리면 감사도 같이 강해진다.

     npm run audit:spoiler
   ========================================================================== */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const L = require("../logic.js");
const ROOT = fileURLToPath(new URL("../..", import.meta.url));

/* 감사에서 빼는 것과 그 이유 */
const EXEMPT = [
  ["stage2/logic.js",   "차단 목록 자체. 코드일 뿐 화면에 나가지 않는다"],
  ["stage2/spec/",      "설계 스펙. 개발자용이고 실제 역사를 다룬다"],
  ["stage2/tools/",     "감사 도구 자신"],
  ["stage2/tests/",     "차단을 검증하려면 그 표현을 써야 한다"],
  ["docs/",             "개발 문서"],
  ["README.md",         "저장소 설명"],
  ["backup/",           "실행되지 않는 스냅샷"]
];

const EXT = /\.(html|js|mjs|css|json|md)$/;

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (name === "node_modules" || name === ".git") continue;
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (EXT.test(name)) out.push(full);
  }
  return out;
}

function exemptReason(rel) {
  const hit = EXEMPT.find(([p]) => rel === p || rel.startsWith(p));
  return hit ? hit[1] : null;
}

const files = walk(ROOT);
let checked = 0, failed = 0;

for (const full of files) {
  const rel = relative(ROOT, full).split("\\").join("/");
  if (exemptReason(rel)) continue;
  checked++;
  const leaks = L.findLeaks(readFileSync(full, "utf8"), L.SPOILER.CHAPTERS);
  if (leaks.length) {
    failed++;
    console.error(`  ✗ ${rel}\n      → ${leaks.join(", ")}`);
  }
}

console.log(`\n검사한 파일 ${checked}개 · 누출 ${failed}건`);
if (failed) {
  console.error("\nCH1~8 동안 노출되면 안 되는 표현이 있습니다.");
  console.error("큐시트 §2.1 을 보고, 표시 이름(RICHARD 등)으로 바꾸십시오.");
  process.exit(1);
}
console.log("플레이어가 닿는 파일에 누출 없음.");
