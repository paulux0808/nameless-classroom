#!/usr/bin/env node
/* 스테이지 1 종단 검증 — 진짜 브라우저(Chromium)로 게임을 8챕터 끝까지 플레이한다.
   실제 마우스 클릭으로 물건을 조사하고, 실제 키 입력으로 단말기에 답을 넣고, 조립·엔딩·뒷문·저장 이어하기까지 확인한다.
   사용법: node tools/stage1-e2e.mjs [--shots 폴더] [--headed] [--style toon|real]   (기본은 카툰. 사실적 렌더도 같은 길로 끝까지 통과해야 한다)
   WebGL 이 없는 환경에서는 SwiftShader 로 돌린다(느리지만 된다). npm test 에는 넣지 않았다(브라우저 필요). */
import http from "node:http";
import { readFileSync, existsSync, mkdirSync } from "node:fs";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const ROOT = fileURLToPath(new URL("../", import.meta.url));
const args = process.argv.slice(2);
const shotsDir = args.includes("--shots") ? args[args.indexOf("--shots") + 1] : null;
const STYLE = args.includes("--style") ? args[args.indexOf("--style") + 1] : "toon";
if (shotsDir) mkdirSync(shotsDir, { recursive: true });

const { chromium } = require("playwright");
const L = require("../stage1/logic.js");
/* 정답은 게임과 같은 수준(U 난독화)으로만 보관한다 — tests/answers.mjs 와 같은 표 */
const SEALED = [[[92, 70, 77, 189, 161], 101], [[16, 235, 225, 239, 221, 211, 170, 190], 117], [[230, 253, 231, 223, 206, 167, 186, 142], 133], [[247, 203, 200, 222, 168, 184, 132], 149],
  [[211, 211, 203, 165, 186, 135, 157], 165], [[221, 171, 188, 168, 134, 132, 122, 127, 123, 94, 94, 41, 52], 181], [[183, 183, 175, 153, 155, 106, 122, 67, 66, 92, 44, 59, 19, 11, 26], 197], [[228, 212, 220], 213]];
const answerOf = (n) => L.U(SEALED[n - 1][0], SEALED[n - 1][1]);

/* 챕터별 서 있을 곳과 조사 지점: [지점 id, x, z, yaw, pitch, 숙이기] */
const STAND = [["calendar", 0.5, -1.7, Math.PI, -0.22, 0], ["doll", -2.6, 2.3, 0, -0.12, 0], ["postit", -2.3, 0.55, 0, 0.3, 1], ["teacher", 2.5, -1.3, Math.PI, -0.1, 0],
  ["extinguisher", 4.1, 2.4, 0, -0.5, 0], ["clock", 0.5, -1.4, Math.PI, 0.32, 0], ["mathbook", 0.2, 2.6, Math.PI, -0.3, 0], ["curtain", -3.2, 2.5, -Math.PI / 2, -0.05, 0]];

const MIME = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".mp4": "video/mp4", ".json": "application/json" };
const server = http.createServer((req, res) => {
  const p = normalize(decodeURIComponent(req.url.split("?")[0])).replace(/^(\.\.[/\\])+/, "");
  let f = join(ROOT, p); if (f.endsWith("/") || (existsSync(f) && !extname(f))) f = join(f, "index.html");
  if (!existsSync(f)) { res.writeHead(404); res.end("not found"); return; }
  res.writeHead(200, { "content-type": MIME[extname(f)] || "application/octet-stream" }); res.end(readFileSync(f));
});
await new Promise((ok) => server.listen(0, "127.0.0.1", ok));
const base = `http://127.0.0.1:${server.address().port}`;

let failures = 0;
const check = (cond, msg) => { console.log(`${cond ? "ok  " : "FAIL"} ${msg}`); if (!cond) failures++; };
const browser = await chromium.launch({ headless: !args.includes("--headed"), args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist", "--enable-webgl"] });
const page = await (await browser.newContext({ viewport: { width: 1280, height: 720 } })).newPage();
const errors = [];
page.on("pageerror", (e) => errors.push("pageerror: " + e.message));
page.on("console", (m) => { if (m.type() === "error") errors.push("console: " + m.text().slice(0, 200)); });
const shot = async (name) => { if (shotsDir) { await page.waitForTimeout(300); await page.screenshot({ path: join(shotsDir, name + ".png") }); } };
const ev = (f, a) => page.evaluate(f, a);
const until = (f, a, ms = 20000) => page.waitForFunction(f, a, { timeout: ms }).then(() => true, () => false);
/* 소프트웨어 렌더링은 프레임이 느려서, 시점을 바꾼 직후에는 카메라 행렬이 아직 옛 값이다.
   두 프레임을 기다려 컨트롤러가 새 시선을 적용하게 한 뒤 행렬을 갱신하고 화면 좌표를 잰다. */
const screenOf = (id) => ev(async (id) => {
  await new Promise((ok) => requestAnimationFrame(() => requestAnimationFrame(ok)));
  __n1.camera.updateMatrixWorld(true);
  const h = __n1.L.hotById[id], v = new THREE.Vector3(); h.getWorldPosition(v); v.project(__n1.camera);
  return { x: (v.x + 1) / 2 * innerWidth, y: (1 - v.y) / 2 * innerHeight };
}, id);

try {
  await page.goto(`${base}/stage1/index.html?debug=1&style=${STYLE}`, { waitUntil: "load" });
  await page.waitForFunction(() => window.__ready === true, null, { timeout: 180000 });
  check(errors.length === 0, "부팅 중 오류 없음 " + errors.join(" | "));
  check((await ev(() => N1K.style)) === STYLE, "화면 스타일: " + STYLE);
  if (STYLE === "toon") check(await ev(() => !!__n1.hull && __n1.hull.groups >= 1 && __n1.scene.getObjectByName("hullStatic") != null), "카툰: 붙박이 소품의 윤곽선 껍질이 만들어졌다");
  else check(await ev(() => !__n1.hull && __n1.scene.getObjectByName("hullStatic") == null), "사실적: 윤곽선 껍질이 없다");
  await shot("01-intro");
  await page.click("#go-new"); await page.waitForTimeout(500);

  /* 0) 시선 드래그: HUD 띠(화면 맨 위) 한가운데서 시작해도 끌린다 */
  const yaw0 = await ev(() => __n1.C.yaw);
  await page.mouse.move(640, 22); await page.mouse.down(); await page.mouse.move(700, 40, { steps: 4 }); await page.mouse.up(); await page.waitForTimeout(200);
  check(Math.abs((await ev(() => __n1.C.yaw)) - yaw0) > 0.05, "HUD 띠 위에서 시작한 드래그도 시선을 돌린다");
  await ev(() => __n1.C.setView(0, 3.1, Math.PI, -0.13));

  /* 1) 첫 일기: 진짜 클릭 */
  await ev(() => __n1.C.setView(-0.1, 2.3, Math.PI, -0.35)); await page.waitForTimeout(300);
  let p = await screenOf("diary1obj"); await page.mouse.move(p.x - 6, p.y + 2); await page.mouse.move(p.x, p.y); await page.waitForTimeout(250);
  if (STYLE === "toon") check(await ev(() => __n1.L.obj.diary1.userData.hullSets.some((h) => h.halo && h.halo.visible)), "카툰: 가리킨 일기에 노란 후광이 켜진다");
  await page.mouse.click(p.x, p.y); await page.waitForTimeout(600);
  if (STYLE === "toon") check(await ev(() => !__n1.L.obj.diary1.userData.hullSets.some((h) => h.halo && h.halo.visible)), "카툰: 창이 열리면 후광이 꺼진다");
  check(await ev(() => __n1.M.S.tookD1), "첫 일기를 클릭으로 집었다");
  await page.keyboard.press("Escape"); await page.waitForTimeout(400);
  check(await ev(() => !__n1.UI.sheetOpen()), "Esc 로 패널이 닫히고 메뉴가 따라 열리지 않는다");

  /* 2) 챕터 1~8 */
  for (let n = 1; n <= 8; n++) {
    const [spot, x, z, yaw, pitch, crouch] = STAND[n - 1];
    await ev(() => { __n1.C.crouch = false; __n1.C.eye = 1.6; __n1.C.setView(0.3, -1.6, Math.PI, -0.2); }); await page.waitForTimeout(250);
    const numeric = n === 1 || n === 8, ans = answerOf(n), atPC = n >= 2;
    if (atPC) {
      /* 2~8장: 답을 컴퓨터에 넣는다. 이때만 컴퓨터가 켜져 있다 */
      check((await ev(() => __n1.W.computerMode())) === "input" && !(await ev(() => __n1.L.hotById.computer.userData.dormant)), `챕터 ${n}: 답을 넣는 장이라 컴퓨터가 켜져 있다`);
      await ev(() => __n1.I.interact("computer")); await page.waitForTimeout(500);
      /* 틀린 답 먼저, 그다음 정답 — 둘 다 물리 키보드로 */
      await page.keyboard.type(numeric ? "9999" : "ZZZZ"); await page.keyboard.press("Enter"); await page.waitForTimeout(250);
      check(await ev(() => __n1.M.S.phase) === "read", `챕터 ${n}: 틀린 답은 통과하지 못한다`);
      for (const ch of ans) await page.keyboard.press((/\d/.test(ch) ? "Digit" : "Key") + ch.toUpperCase());
      await page.keyboard.press("Enter"); await page.waitForTimeout(400);
    } else {
      /* 1장: 날짜 도장(찍는 것이 곧 제출)으로 푼다. 컴퓨터는 꺼져 있고 눌러도 열리지 않는다.
         현장 조작 자체는 tools/stage1-e2e-puzzles.mjs 가 짚으니 여기서는 모델에 정규화된 답을 낸다 */
      check((await ev(() => __n1.W.computerMode())) === "off" && (await ev(() => __n1.L.hotById.computer.userData.dormant)), `챕터 ${n}: 현장 퍼즐 장이라 컴퓨터는 꺼져 있다`);
      await ev(() => __n1.I.interact("computer")); await page.waitForTimeout(400);
      check(!(await ev(() => __n1.UI.sheetOpen())), `챕터 ${n}: 꺼진 컴퓨터는 눌러도 열리지 않는다`);
      check(!(await ev((w) => __n1.M.answer(w).ok, numeric ? "9999" : "ZZZZ")), `챕터 ${n}: 틀린 답은 통과하지 못한다`);
      check(await ev((a) => __n1.M.answer(a).ok, ans), `챕터 ${n}: 정답을 내면 통과한다`);
      await page.waitForTimeout(300);
    }
    check(await ev(() => __n1.M.S.phase) === "search", `챕터 ${n}: 정답으로 탐색 단계`);
    check((await ev(() => __n1.W.computerMode())) === "off", `챕터 ${n}: 답을 낸 뒤 탐색하는 동안 컴퓨터는 다시 꺼진다`);
    if (atPC) { await page.keyboard.press("Escape"); await page.waitForTimeout(300); }
    await ev(([x, z, yaw, pitch, crouch]) => { __n1.C.crouch = !!crouch; if (crouch) __n1.C.eye = 0.45; __n1.C.setView(x, z, yaw, pitch); if (crouch) __n1.camera.position.y = 0.45; }, [x, z, yaw, pitch, crouch]);
    await page.waitForTimeout(450);
    p = await screenOf(spot); await page.mouse.move(p.x, p.y); await page.waitForTimeout(120); await page.mouse.click(p.x, p.y);
    await page.waitForTimeout(3400);
    const okReveal = (await ev(() => __n1.M.S.revealed)) === n;
    if (!okReveal) console.log("  진단:", JSON.stringify(await ev(() => ({ sheet: __n1.UI.sheetOpen(), flags: __n1.UI.flags, hover: __n1.C.hover && __n1.C.hover.userData.hot.id, pos: __n1.camera.position.toArray().map((v) => +v.toFixed(2)), yaw: +__n1.C.yaw.toFixed(2), lock: __n1.C.lock, phase: __n1.M.S.phase, active: __n1.W.active.length })), p));
    if (!okReveal) await shot(`fail-ch${n}`);
    check(okReveal, `챕터 ${n}: 실제 클릭으로 ${spot} 을(를) 조사해 편지가 드러남`);
    if (n === 1 || n === 4 || n === 8) await shot(`0${n}-reveal`);
    await ev((n) => __n1.I.interact("reward:" + n), n); await page.waitForTimeout(500);
    await page.click(".sheet-foot .btn.primary"); await page.waitForTimeout(1800);
    check(await ev(() => __n1.M.S.ch) === n + 1, `챕터 ${n}: 편지를 읽고 칠판에 붙여 다음 장으로`);
  }
  check(await ev(() => __n1.M.S.pieces.length) === 8, "조각 8개");

  /* 3) 기억의 탑 → 이름 → 엔딩 */
  check((await ev(() => __n1.W.computerMode())) === "off", "조각 8개를 모아도 탑을 완성하기 전에는 컴퓨터가 꺼져 있다");
  /* 마지막 블록은 칠판에 붙는 연출이 끝난 뒤 내려앉는다(소프트웨어 렌더링은 프레임이 느려 한참 걸린다) */
  check(await until(() => __n1.L.obj.tower.userData.count() === 8, null, 90000), "교단 위 기억의 탑에 같은 규격의 블록 8개가 쌓여 있다");
  await page.waitForTimeout(1500);
  /* 블록은 모두 같은 두께로 쌓인다(내려앉는 연출이 끝날 때까지 기다린다) */
  await until(() => { const t = __n1.L.obj.tower, ys = [1, 2, 3, 4, 5, 6, 7, 8].map((n) => { const p = t.userData.blockPos(n); return p ? p.y : null; }); if (ys.some((y) => y == null)) return false; ys.sort((a, b) => a - b); return ys.slice(1).every((y, i) => Math.abs(y - ys[i] - 0.103) < 0.0006); }, null, 120000);
  const sizes = await ev(() => { const t = __n1.L.obj.tower, ys = [1, 2, 3, 4, 5, 6, 7, 8].map((n) => t.userData.blockPos(n).y).sort((a, b) => a - b); return ys.slice(1).map((y, i) => +(y - ys[i]).toFixed(4)); });
  check(sizes.every((d) => Math.abs(d - sizes[0]) < 0.001), "탑의 블록은 모두 같은 두께로 쌓여 있다 (" + sizes.join(",") + ")");
  const TOWER_VIEW = [-1.1, -1.6, Math.atan2(-0.9, -1.7), -0.44];
  await ev((v) => __n1.C.setView(v[0], v[1], v[2], v[3]), TOWER_VIEW); await page.waitForTimeout(500);
  p = await screenOf("tower"); await page.mouse.move(p.x - 4, p.y + 2); await page.mouse.move(p.x, p.y); await page.waitForTimeout(250);
  if (STYLE === "toon") check(await ev(() => __n1.L.obj.tower.userData.hullSets.length >= 9 && __n1.L.obj.tower.userData.hullSets.some((h) => h.halo && h.halo.visible)), "카툰: 탑을 가리키면 받침대와 블록 모두에 노란 후광이 켜진다");
  await page.mouse.click(p.x, p.y); await page.waitForTimeout(700);
  check(await ev(() => __n1.UI.sheetOpen() && !!document.querySelector(".tower-sheet .tw-block")), "탑을 클릭하면 쌓기 패널이 열린다(컴퓨터가 필요 없다)");
  check((await page.$$(".tw-block")).length === 8, "패널에 블록 8개와 마지막 일기가 보인다");
  check(await page.$eval(".tw-note", (e) => e.textContent.includes("친구들에게 좋은 별명을 얻은 날")), "마지막 일기의 목록을 곁에 두고 쌓는다");
  check(await page.$eval(".tw-block .tw-title", (e) => e.textContent.length > 2), "블록마다 조각 제목이 적혀 있다");
  /* 틀린 순서(쌓인 순서 그대로)로 ‘완성’ → 무너진다. 어디가 틀렸는지는 알려 주지 않는다 */
  await page.click(".tw-go"); await page.waitForTimeout(1300);
  check(!(await ev(() => __n1.M.stackSolved())) && !(await ev(() => __n1.UI.sheetOpen())), "틀린 순서로 ‘완성’을 누르면 탑이 무너지고 패널이 닫힌다");
  check(await until(() => __n1.UI.saying(), null, 30000), "무너지면 감독교사가 한마디 한다");
  await page.waitForTimeout(3300); await shot("09-tower-collapse");
  check((await ev(() => __n1.L.obj.tower.userData.count())) === 8, "무너진 탑은 지금 순서대로 다시 쌓인다");
  /* 다시 연다: 키보드로 한 칸, 버튼으로 나머지를 맞춘다. 순서가 맞아도 ‘완성’을 누르기 전에는 아무 말도 없다 */
  await ev(() => __n1.I.interact("tower")); await page.waitForTimeout(600);
  const order = await ev(() => stackOrder());
  const drag0 = await ev(() => __n1.M.tower().slice());
  const r7 = await page.$eval('.tw-block[data-i="7"]', (e) => { const b = e.getBoundingClientRect(); return { x: b.x + b.width * 0.4, y: b.y + b.height / 2, h: b.height }; });
  await page.mouse.move(r7.x, r7.y); await page.mouse.down(); await page.mouse.move(r7.x, r7.y - r7.h * 0.9, { steps: 6 }); await page.mouse.up(); await page.waitForTimeout(300);
  const drag1 = await ev(() => __n1.M.tower().slice());
  check(drag1[6] === drag0[7] && drag1[7] === drag0[6], "블록을 끌어서 위로 옮길 수 있다 (" + drag0.join("") + "→" + drag1.join("") + ")");
  await page.focus('.tw-block[data-i="5"]'); await page.keyboard.press("Enter"); await page.keyboard.press("ArrowUp"); await page.waitForTimeout(250);
  check((await ev(() => __n1.M.tower()))[4] === drag1[5], "키보드(Enter 로 고르고 ↑)로도 옮길 수 있다");
  for (let i = 0; i < 8; i++) {
    const cur = await ev(() => __n1.M.tower()); const j = cur.indexOf(order[i]);
    for (let k = j; k > i; k--) { await page.click(`.tw-block[data-i="${k}"] .tw-mv button:first-child`); await page.waitForTimeout(40); }
  }
  check(!(await ev(() => __n1.M.stackSolved())) && (await ev(() => __n1.UI.sheetOpen())) && (await ev(() => __n1.W.computerMode())) === "off", "순서를 맞춰도 ‘완성’을 누르기 전에는 확정도 안내도 없다(중간에 맞는지 틀린지 알 수 없다)");
  check((await ev(() => __n1.M.tower().join(","))) === order.join(","), "▲▼ 버튼으로 일기 목록의 순서대로 쌓았다");
  await shot("09-tower-panel");
  await page.click(".tw-go"); await page.waitForTimeout(900);
  check(await ev(() => __n1.M.stackSolved()), "‘완성’을 누르면 맞는 순서로 확정된다");
  check((await ev(() => __n1.W.computerMode())) === "input", "탑이 완성되면 컴퓨터가 켜진다(이름 입력)");
  await ev((v) => __n1.C.setView(v[0], v[1], v[2], v[3]), TOWER_VIEW); await page.waitForTimeout(1500);
  await shot("09-tower-solved");
  await ev(() => __n1.I.interact("computer")); await page.waitForTimeout(600);
  check(await page.$eval(".name-engrave", (e) => e.getAttribute("aria-label").includes("STPHN")), "이름 화면에 모음이 지워진 글자가 새겨져 있다");
  await shot("09-name");
  /* 틀린 이름 → 성만 → (이름 전체는 마지막에) */
  await page.keyboard.type("NEWTON"); await page.keyboard.press("Enter"); await page.waitForTimeout(300);
  check(!(await ev(() => __n1.M.S.exitReady)), "틀린 이름은 통과하지 못한다");
  const name = await ev(() => finalName());
  for (const ch of name.replace(/[^a-zA-Z]/g, "")) await page.keyboard.press("Key" + ch.toUpperCase());
  await page.keyboard.press("Enter"); await page.waitForTimeout(1500);
  check(await ev(() => __n1.M.S.exitReady), "이름을 맞히면 뒷문이 열릴 준비가 된다");
  check((await ev(() => __n1.W.computerMode())) === "done", "이름을 맞힌 뒤 컴퓨터는 ‘마침’ 화면(엔딩 다시 보기)이 된다");
  check(await page.$("#ending") !== null, "엔딩 화면");
  check(await page.$eval(".ending-rec", (e) => /보낸 시간은 .*초입니다/.test(e.textContent)), "엔딩 크레딧에 걸린 시간과 도움 횟수가 조용히 나온다");
  await shot("10-ending");
  await page.click(".ending-close"); await page.waitForTimeout(500);

  /* 4) 뒷문: 잘못된 코드 → 올바른 코드 */
  await ev(() => __n1.C.setView(3.4, 2.1, 0, 0.05)); await page.waitForTimeout(300);
  await ev(() => __n1.I.interact("exitdoor")); await page.waitForTimeout(500);
  await page.keyboard.type("1234"); await page.keyboard.press("Enter"); await page.waitForTimeout(300);
  check(!(await ev(() => __n1.M.S.done)), "틀린 코드로는 열리지 않는다");
  await page.keyboard.type("0808"); await page.keyboard.press("Enter"); await page.waitForTimeout(500);
  check(await ev(() => __n1.M.S.done), "코드 0808 로 문이 열린다");
  /* 탈출 연출(문이 열리고 빛이 밀려든다)이 끝나면 완료 패널이 뜬다. 연출 시간은 프레임에 비례하므로 조건을 기다린다. */
  const cleared = await page.waitForSelector(".stamp", { timeout: 240000 }).then(() => true, () => false);
  check(cleared, "탈출 연출 뒤 스테이지 완료 패널");
  check(await page.$$eval(".record .rec tbody tr", (r) => r.length) === 9 || (await page.click(".record > summary").then(() => page.$$eval(".record .rec tbody tr", (r) => r.length === 9), () => false)), "스테이지 완료 화면의 ‘내 기록’에 장별 기록 아홉 줄이 있다");
  await shot("11-clear");

  /* 5) 저장 이어하기 */
  await page.reload({ waitUntil: "load" }); await page.waitForFunction(() => window.__ready === true, null, { timeout: 180000 });
  check(await ev(() => !document.getElementById("go-cont").disabled), "다시 열면 '이어서 하기'가 켜져 있다");
  await page.click("#go-cont"); await page.waitForTimeout(700);
  check(await ev(() => __n1.M.S.done && __n1.M.S.pieces.length === 8), "저장된 진행이 그대로 복원된다");
  check(errors.length === 0, "플레이 전체에서 스크립트 오류 없음 " + errors.join(" | "));
} catch (e) {
  failures++; console.log("FAIL 예외:", e.message);
} finally {
  await browser.close(); server.close();
}
console.log(failures ? `\n실패 ${failures}건` : "\n모두 통과");
process.exit(failures ? 1 : 0);
