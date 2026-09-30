#!/usr/bin/env node
/* 봉인 도구 — 저장소를 열어 봐도 정답·힌트 끝단이 곧바로 읽히지 않도록 문장을 U() 배열로 바꾼다.
     node tools/seal.mjs seal "문장" [키]   → U([...], 키) 코드를 출력한다(키를 생략하면 1~255 중 무작위)
     node tools/seal.mjs dump [파일]        → 파일(기본 stage1/lines.js) 안의 봉인 문장을 풀어서 줄 번호와 함께 보여 준다
   U 는 stage1/logic.js 의 것과 같다. 난독화일 뿐 보안이 아니다(교실 게임에서 학생이 무심코 읽는 것을 막는 정도). */
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const L = require("../stage1/logic.js");
const [, , cmd, ...rest] = process.argv;

function seal(text, key) {
  const k = key == null ? 1 + Math.floor(Math.random() * 255) : Number(key);
  const arr = [...text].map((ch, i) => ch.charCodeAt(0) ^ ((k + i * 13) & 255));
  return `U([${arr.join(",")}],${k})`;
}

if (cmd === "seal") {
  const [text, key] = rest;
  if (!text) { console.error('사용법: node tools/seal.mjs seal "문장" [키]'); process.exit(1); }
  const out = seal(text, key);
  const back = new Function("U", `return ${out}`)(L.U);
  if (back !== text) { console.error("되돌리기 검사 실패 — 문장에 BMP 밖 문자가 있나요?"); process.exit(1); }
  console.log(out);
} else if (cmd === "dump") {
  const file = rest[0] || fileURLToPath(new URL("../stage1/lines.js", import.meta.url));
  const src = readFileSync(file, "utf8");
  src.split("\n").forEach((line, i) => {
    for (const m of line.matchAll(/U\(\[([0-9, ]+)\],\s*(\d+)\)/g)) {
      const arr = m[1].split(",").map((s) => Number(s.trim()));
      console.log(`${String(i + 1).padStart(4)}: ${L.U(arr, Number(m[2]))}`);
    }
  });
} else {
  console.error("사용법: node tools/seal.mjs seal|dump ...");
  process.exit(1);
}
