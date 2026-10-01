#!/usr/bin/env node
/* 스테이지 1 재설계 종단 검증 — 현장 퍼즐(날짜 도장·액자 표식·명단·VHS)과 5~8장 연필 도구,
   감독교사의 대사·힌트·표정, 기억 소품을 진짜 브라우저(Chromium)로 확인한다.
   (8챕터 전체 흐름과 정답 경로는 tools/stage1-e2e.mjs 가 맡는다. 여기서는 새로 생긴 조작 하나하나를 짚는다.)
   사용법: node tools/stage1-e2e-puzzles.mjs [--shots 폴더] [--headed] [--style toon|real] [--mobile-only]
   정답은 게임과 같은 수준(U 난독화)으로만 보관한다. npm test 에는 넣지 않았다(브라우저 필요). */
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
const MOBILE_ONLY = args.includes("--mobile-only");                 /* 모바일 가로 화면 검사만 (빠르게 다시 볼 때) */
if (shotsDir) mkdirSync(shotsDir, { recursive: true });

const { chromium } = require("playwright");
const L = require("../stage1/logic.js");
const SEALED = [[[92, 70, 77, 189, 161], 101], [[16, 235, 225, 239, 221, 211, 170, 190], 117], [[230, 253, 231, 223, 206, 167, 186, 142], 133], [[247, 203, 200, 222, 168, 184, 132], 149],
  [[211, 211, 203, 165, 186, 135, 157], 165], [[221, 171, 188, 168, 134, 132, 122, 127, 123, 94, 94, 41, 52], 181], [[183, 183, 175, 153, 155, 106, 122, 67, 66, 92, 44, 59, 19, 11, 26], 197], [[228, 212, 220], 213]];
const answerOf = (n) => L.U(SEALED[n - 1][0], SEALED[n - 1][1]);

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
const errors = [];

async function open(viewport, touch) {
  const ctx = await browser.newContext({ viewport, hasTouch: !!touch, isMobile: !!touch });
  const page = await ctx.newPage();
  page.on("pageerror", (e) => errors.push("pageerror: " + e.message));
  page.on("console", (m) => { if (m.type() === "error") errors.push("console: " + m.text().slice(0, 200)); });
  await page.goto(`${base}/stage1/index.html?debug=1&style=${STYLE}`, { waitUntil: "load", timeout: 180000 });
  await page.waitForFunction(() => window.__ready === true, null, { timeout: 180000 });
  return page;
}
const helpers = (page, prefix) => {
  const ev = (f, a) => page.evaluate(f, a);
  const shot = async (name) => { if (shotsDir) { await page.waitForTimeout(300); await page.screenshot({ path: join(shotsDir, prefix + name + ".png") }); } };
  const until = (f, a, ms = 20000) => page.waitForFunction(f, a, { timeout: ms }).then(() => true, () => false);
  /* 소프트웨어 렌더링은 프레임이 느려서 시점을 바꾼 직후엔 카메라 행렬이 옛 값이다. 두 프레임 기다린 뒤 화면 좌표를 잰다 */
  const screenOf = (id) => ev(async (id) => {
    await new Promise((ok) => requestAnimationFrame(() => requestAnimationFrame(ok)));
    __n1.camera.updateMatrixWorld(true);
    const h = __n1.L.hotById[id] || __n1.W.active.find((m) => m.userData.hot && m.userData.hot.id === id), v = new THREE.Vector3();   /* 칠판 종이의 조사 상자는 배치표가 아니라 활성 목록에 있다 */
    h.getWorldPosition(v); v.project(__n1.camera);
    return { x: (v.x + 1) / 2 * innerWidth, y: (1 - v.y) / 2 * innerHeight };
  }, id);
  /* 진짜 클릭: 시점을 잡고, 물건 위로 마우스를 옮겨 누른다 */
  const clickHot = async (id, view) => {
    await ev((v) => { __n1.C.crouch = false; __n1.C.eye = 1.6; __n1.C.setView(v[0], v[1], v[2], v[3]); }, view); await page.waitForTimeout(350);
    const p = await screenOf(id); await page.mouse.move(p.x - 5, p.y + 2); await page.mouse.move(p.x, p.y); await page.waitForTimeout(150); await page.mouse.click(p.x, p.y);
    return p;
  };
  const sheetOpen = () => ev(() => __n1.UI.sheetOpen());
  const setState = (ch, phase, pieces) => ev(([ch, phase, pieces]) => {
    const M = __n1.M; M.takeDiary1(); M.S.ch = ch; M.S.phase = phase; M.S.pieces = pieces; M.S.revealed = 0;
    __n1.W.setDiaryOnDesk(false); __n1.W.applyState(M.S, true); __n1.UI.sayClear(); __n1.UI.renderHUD();
  }, [ch, phase, pieces]);
  return { ev, shot, until, screenOf, clickHot, sheetOpen, setState };
};

try {
  if (!MOBILE_ONLY) {
  /* ══════ 데스크톱 ══════ */
  const page = await open({ width: 1280, height: 720 });
  const { ev, shot, until, clickHot, sheetOpen, setState, screenOf } = helpers(page, "");
  check(errors.length === 0, "부팅 중 오류 없음 " + errors.join(" | "));
  const D = await ev(() => ({ sci: N1Data.SCI.map((s) => ({ id: s.id, sym: s.sym || null })), symOf: N1Data.SYM_OF, order: N1Puz.sheetOrder(N1Data), rowing: N1Data.SPORTS.findIndex((s) => s.roles && s.roles.length === 9), sports: N1Data.SPORTS.length, cipher: N1Data.CIPHER.length, rows: N1Data.MAP_ROWS, cols: N1Data.MAP_COLS, routes: N1Data.MAP_ROUTES.length }));

  /* A) 시작: 감독교사가 말을 건다 */
  await page.click("#go-new"); await page.waitForTimeout(500);
  check(await until(() => __n1.UI.saying(), null, 30000), "A. 시작하면 감독교사가 말을 건다");
  check(await until(() => document.querySelector("#say.show .say-txt").textContent.length > 2, null, 30000), "A. 말풍선에 글자가 한 글자씩 나타난다");
  check((await ev(() => document.querySelector("#say .say-who").textContent)) === "감독교사", "A. 말하는 이는 ‘감독교사’");
  check(await until(() => __n1.L.obj.teacher.userData.talking(), null, 30000), "A. 말하는 동안 감독교사의 입이 움직이는 상태다");
  const talkOpen = await ev(async () => { let mx = 0; for (let i = 0; i < 18; i++) { mx = Math.max(mx, __n1.L.obj.teacher.userData.face.open); await new Promise((ok) => requestAnimationFrame(ok)); } return mx; });
  check(talkOpen > 0.05, "A. 말하는 동안 입이 실제로 벌어진다 (최대 " + talkOpen.toFixed(2) + ")");
  check((await ev(() => getComputedStyle(document.getElementById("say")).pointerEvents)) === "none", "A. 말풍선은 클릭을 가로채지 않는다");
  await shot("01-enter");
  await ev(() => __n1.UI.sayClear());
  check(await until(() => !__n1.L.obj.teacher.userData.talking(), null, 10000), "A. 말이 끝나면 입이 멈춘다");

  /* B) 첫 일기 → 도장을 가리키는 화살표 */
  await clickHot("diary1obj", [-0.1, 2.3, Math.PI, -0.35]); await page.waitForTimeout(600);
  check(await ev(() => __n1.M.S.tookD1), "B. 첫 일기를 클릭으로 집었다");
  await page.keyboard.press("Escape"); await page.waitForTimeout(500);
  check(await until(() => __n1.M.S.said && __n1.M.S.said.diary1 && __n1.UI.saying(), null, 30000), "B. 일기를 덮으면 감독교사가 빈칸과 도장을 알려 준다");
  const arrow = await ev(() => { const a = __n1.W.arrow, s = __n1.L.stampSpot; return { vis: a.visible, d: Math.hypot(a.position.x - s[0], a.position.z - s[2]) }; });
  check(arrow.vis && arrow.d < 0.05, "B. 안내 화살표가 교탁의 날짜 도장을 가리킨다");
  await ev(() => __n1.UI.sayClear());

  /* C) 1장 날짜 도장 */
  await clickHot("stamp", [-0.2, -1.4, Math.PI, -0.32]); await page.waitForTimeout(700);
  check(await sheetOpen(), "C. 도장을 클릭하면 도장 패널이 열린다");
  check((await page.$$(".wheel")).length === 5, "C. 숫자 바퀴가 다섯 개");
  const goal0 = await ev(() => __n1.M.hud().objective.main);
  await page.click(".stamp-btn"); await page.waitForTimeout(1800);
  check(await ev(() => __n1.M.S.phase) === "read", "C. 틀린 날짜(0 0 0 0 0)로는 통과하지 못한다");
  check((await page.$$(".stamp-prints .print")).length >= 1, "C. 틀린 도장은 종이에 자국으로 남는다");
  check(await until(() => __n1.UI.saying(), null, 30000), "C. 틀리면 감독교사가 한마디 한다");
  await shot("02-stamp-wrong");
  const ans1 = answerOf(1), wheels = await page.$$(".wheel");
  for (let i = 0; i < 5; i++) for (let k = 0; k < +ans1[i]; k++) await (await wheels[i].$(".w-up")).click();
  const shown = await page.$$eval(".wheel .w-d", (els) => els.map((e) => e.textContent).join(""));
  check(shown === ans1, "C. 바퀴를 눌러 일기 빈칸의 날짜를 맞췄다");
  await page.click(".stamp-btn");
  check(await until(() => __n1.M.S.phase === "search", null, 30000), "C. 맞는 날짜를 찍으면 탐색 단계로 넘어간다");
  check((await ev(() => __n1.M.solvedAnswer(1))) === ans1, "C. 낸 답이 저장돼 일기 빈칸 복원에 쓰인다");
  check((await ev(() => __n1.M.hud().objective.main)) !== goal0, "C. 정답 뒤 목표 안내가 바뀐다");
  await shot("03-stamp-ok");
  await page.waitForTimeout(1500);
  await page.click(".sheet-foot .btn.primary"); await page.waitForTimeout(600);
  check(await ev(() => __n1.M.S.hints && Object.keys(__n1.M.S.hints).length === 0), "C. 힌트를 청하지 않았으니 힌트 기록이 비어 있다");

  /* D) 조사 → 편지 → 칠판에 붙이기 → 기억 소품 */
  await ev(() => __n1.UI.sayClear());
  await clickHot("calendar", [0.5, -1.7, Math.PI, -0.22]); await page.waitForTimeout(3600);
  check(await ev(() => __n1.M.S.revealed) === 1, "D. 달력을 클릭해 편지가 드러난다");
  await ev(() => __n1.I.interact("reward:1")); await page.waitForTimeout(500);
  await page.click(".sheet-foot .btn.primary"); await page.waitForTimeout(2200);
  check(await ev(() => __n1.M.S.ch) === 2, "D. 편지를 읽고 붙이면 2장으로 넘어간다");
  await until(() => __n1.L.mem[1].visible, null, 90000);            /* 붙는 연출(약 1초)이 끝나야 소품이 나타난다. 느린 화면에서는 프레임 수로 센다 */
  const mem1 = await ev(() => ({ vis: __n1.L.mem[1].visible, hot: __n1.W.active.indexOf(__n1.L.hotById["decoy:mem1"]) >= 0, others: [2, 3, 4, 5, 6, 7, 8].filter((n) => __n1.L.mem[n].visible).length }));
  check(mem1.vis && mem1.hot && mem1.others === 0, "D. 첫 조각을 붙이자 기억 소품 1(별 모빌)만 생기고 조사할 수 있다");
  await shot("04-memory-1");

  /* E) 2장 액자 뒷면 + 종이 한 장 + 힌트 단추 */
  const FRAME_AT = [3.0, -1.2, Math.atan2(1.95, -1.3), 0.1];
  await clickHot("frame:newton", FRAME_AT); await page.waitForTimeout(900);
  check(await sheetOpen() && (await page.$(".frameback-sheet, .fb-back")) !== null, "E. 액자를 클릭하면 뒷면 패널이 열린다(액자는 돌지 않는다)");
  const chunkOf = async () => page.$eval(".fb-chunk", (e) => e.textContent.trim());
  check((await chunkOf()) === (await ev(() => N1Puz.frameBack(N1Data, "newton"))), "E. 뒷판에 붙은 쪽지의 글자가 보인다");
  check((await ev(() => __n1.L.frames.newton.userData.lift || 0)) > 0, "E. 액자를 보는 동안 벽에서 살짝 들린다");
  check((await page.$$(".stk, .stk-tray")).length === 0, "E. 옛 표식 카드 패널은 없다");
  await shot("05-frame-back");
  await page.keyboard.press("Escape"); await page.waitForTimeout(600);
  check(await until(() => (__n1.L.frames.newton.userData.lift || 0) < 0.2, null, 60000), "E. 창을 닫으면 액자가 제자리로 돌아간다");
  check((await ev(() => (__n1.M.pz("c2") || {}).placed)) == null, "E. 액자를 보는 것은 아무것도 확정하지 않는다(기록도 판정도 없다)");
  /* 여섯 액자의 쪽지를 모두 읽는다: 종이의 순서대로 주인 액자의 쪽지를 이어 읽으면 정답, 기호 없는 액자의 쪽지는 끼지 않는다 */
  const chunks = {};
  for (const sc of D.sci) { await ev((id) => __n1.I.interact("frame:" + id), sc.id); await page.waitForTimeout(500); chunks[sc.id] = await chunkOf(); await page.keyboard.press("Escape"); await page.waitForTimeout(350); }
  const own = Object.fromEntries(Object.entries(D.symOf).map(([id, sym]) => [sym, id]));
  const read = D.order.map((sym) => chunks[own[sym]]).join("").toLowerCase();
  check(read === answerOf(2), "E. 종이의 기호 순서대로 주인 액자의 뒷면을 이어 읽으면 정답이 된다 (" + read.length + "자)");
  const spareId = D.sci.find((x) => !x.sym).id;
  check(chunks[spareId].length > 0 && !read.includes(chunks[spareId].toLowerCase().repeat(2)), "E. 기호 없는 액자에도 쪽지가 있어 그것만으로는 들통나지 않는다");
  /* 종이 한 장: 기호가 위에서 아래로 번호 순서대로 */
  await clickHot("sheet", [-1.1, -1.6, Math.atan2(-1.77 + 1.1, -3.97 + 1.6), 0.02]); await page.waitForTimeout(800);
  check(await sheetOpen() && (await page.$$(".symlist li")).length === 5, "E. 칠판의 ‘종이 한 장’을 클릭하면 기호 다섯 개가 순서대로 나온다");
  const symShown = await page.$$eval(".symlist li", (els) => els.map((e) => e.getAttribute("aria-label"))), expectKo = await ev(() => N1Puz.sheetOrder(N1Data).map((s) => N1Data.SYM_KO[s]));
  check(symShown.join("|") === expectKo.join("|"), "E. 종이에 보이는 기호의 차례가 풀이의 기호 순서와 같다 (" + symShown.join("→") + ")");
  await shot("06-sheet");
  await page.keyboard.press("Escape"); await page.waitForTimeout(400);
  /* 힌트 단추: 세 번까지 점점 구체적으로, 그 뒤엔 더 없다 */
  const tiers = [];
  for (let i = 0; i < 4; i++) { await page.click("#t-hint"); await page.waitForTimeout(700); tiers.push(await ev(() => (__n1.M.S.hints || {}).c2 || 0)); }
  check(tiers.join(",") === "1,2,3,3", "E. 힌트 단추: 1→2→3단계, 넷째부터는 더 주지 않는다 (" + tiers.join(",") + ")");
  check((await ev(() => document.querySelectorAll("#t-hint .pips i.on").length)) === 3, "E. 힌트 단추의 점 세 개가 모두 켜진다");
  check(await until(() => __n1.UI.saying(), null, 30000), "E. 힌트를 청하면 감독교사가 말해 준다");
  await ev(() => __n1.UI.sayClear());
  /* 컴퓨터: 2장부터 읽기 단계 동안 켜져 있고, 탭에 설명판과 종이 한 장이 있다. 답은 여기서 한 번만 낸다 */
  check((await ev(() => __n1.W.computerMode())) === "input", "E. 2장은 답을 넣을 컴퓨터가 켜져 있다");
  await clickHot("computer", [0.15, -1.15, Math.PI, -0.42]); await page.waitForTimeout(800);
  check(await sheetOpen() && (await page.$$(".tab")).length === 3, "E. 컴퓨터 패널에 ‘일기·설명판·종이 한 장’ 탭이 있다");
  await page.keyboard.type("ZZZZ"); await page.keyboard.press("Enter"); await page.waitForTimeout(300);
  check(await ev(() => __n1.M.S.phase) === "read", "E. 틀린 답은 통과하지 못한다");
  for (const ch of answerOf(2).toUpperCase()) await page.click(`.key:text-is("${ch}")`);
  await page.click(".key.enter");
  check(await until(() => __n1.M.S.phase === "search", null, 30000), "E. 뒷면을 이어 읽은 낱말을 컴퓨터에 답하면 탐색 단계로 넘어간다");
  await page.waitForTimeout(1200); await page.click(".sheet-foot .btn.primary, .term-right .btn.primary"); await page.waitForTimeout(500);

  /* F) 3장 명단 클립보드: 읽기만 한다. 종목은 포지션을 세어 스스로 가리고 답은 컴퓨터에 낸다 */
  await setState(3, "read", [1, 2]);
  await clickHot("roster", [-2.9, -2.3, Math.atan2(-3.75 + 2.9, -3.93 + 2.3), 0.0]); await page.waitForTimeout(800);
  check(await sheetOpen(), "F. 스포츠 코너의 명단 클립보드를 클릭하면 패널이 열린다");
  check((await page.$$(".roster-paper li")).length === 9 && (await page.$(".roster-paper li.me")) !== null, "F. 명단에는 아홉 이름이 있고 마지막 ‘나’가 표시된다");
  check((await page.$$(".tabs .tab, .verdict, .seats")).length === 0 && (await page.$$(".key")).length === 0, "F. 이름을 앉혀 주는 탭·판정·정답 키패드가 없다");
  await page.click(".fold > summary"); await page.waitForTimeout(300);
  check((await page.$$(".fold .item")).length >= D.sports, `F. 접힌 ‘운동경기 자료’에 종목 ${D.sports}개가 있다`);
  await shot("07-roster");
  await page.keyboard.press("Escape"); await page.waitForTimeout(400);
  check((await ev(() => __n1.W.computerMode())) === "input", "F. 3장도 답을 넣을 컴퓨터가 켜져 있다");
  await clickHot("computer", [0.15, -1.15, Math.PI, -0.42]); await page.waitForTimeout(800);
  for (const ch of answerOf(3).toUpperCase()) await page.click(`.key:text-is("${ch}")`);
  await page.click(".key.enter");
  check(await until(() => __n1.M.S.phase === "search", null, 30000), "F. 포지션을 세어 가린 종목의 아홉 번째 자리를 컴퓨터에 답하면 탐색 단계");
  await page.waitForTimeout(1200); await page.click(".sheet-foot .btn.primary, .term-right .btn.primary"); await page.waitForTimeout(500);

  /* G) 4장 AV 카트 VHS: 별의 깜빡임(모스 부호)을 되감으며 기록장에 적고, 벽의 해독표로 읽어 컴퓨터에 답한다 */
  await setState(4, "read", [1, 2, 3]);
  check(await ev(() => __n1.L.obj.morseCard.visible && __n1.W.active.includes(__n1.L.hotMorse)), "G. 4장이 시작되면 카트 옆 벽에 해독표가 붙는다");
  check((await ev(() => __n1.W.computerMode())) === "input" && (await ev(() => __n1.W.tvOn())), "G. 4장은 TV 가 켜지고 답을 넣을 컴퓨터도 켜져 있다");
  await setState(3, "read", [1, 2]);
  check(await ev(() => !__n1.L.obj.morseCard.visible && !__n1.W.active.includes(__n1.L.hotMorse)), "G. 3장까지는 해독표가 없다");
  await setState(4, "read", [1, 2, 3]);
  await clickHot("tv", [-3.0, 0.0, Math.atan2(-4.45 + 3.0, -1.85 - 0.0), -0.1]); await page.waitForTimeout(800);
  check(await sheetOpen() && (await page.$$(".vb")).length === 5 && (await page.$$(".pad-keys .key")).length === 5, "G. AV 카트를 클릭하면 VCR 패널(되감기·재생·정지·속도·소리)과 기록장이 열린다");
  check((await page.$$(".term-right .crt")).length === 0, "G. 테이프 패널에는 정답 키패드가 없다(기록만 한다)");
  const pos0 = await page.$eval(".jog", (e) => +e.value);
  await page.$eval(".jog", (e) => { e.value = 700; e.dispatchEvent(new Event("input", { bubbles: true })); }); await page.waitForTimeout(500);
  check(pos0 === 0 && (await page.$eval(".jog", (e) => +e.value)) === 700, "G. 테이프는 끝(0)에서 시작하고 조그 바로 위치를 옮길 수 있다");
  await page.$eval(".jog", (e) => { e.value = 0; e.dispatchEvent(new Event("input", { bubbles: true })); });
  await page.click('.vb:has-text("속도")'); await page.waitForTimeout(150);
  check((await page.$eval(".vb:nth-child(4)", (e) => e.textContent)).includes("½"), "G. 속도 단추로 느리게(½) 볼 수 있다");
  await page.click('.vb:has-text("속도")'); await page.click('.vb:has-text("속도")');
  await page.click('.vb:has-text("되감기")'); await page.waitForTimeout(2500);
  check((await page.$eval(".jog", (e) => +e.value)) > 0, "G. ‘되감기’를 누르면 테이프가 처음 쪽으로 감기며 화면이 흐른다");
  /* 별빛: 깜빡임이 켜진 위치에서는 한 점이 환해지고, 꺼진 위치에서는 어둡다 */
  await page.click('.vb:has-text("정지")'); await page.waitForTimeout(200);
  const spotOn = await ev(() => { const sg = N1Puz.tapeSignal(), x = sg.segs[0]; return Math.round(((x.a + x.b) / 2 / sg.len) * 1000); });
  const bright = async (v) => { await page.$eval(".jog", (e, v) => { e.value = v; e.dispatchEvent(new Event("input", { bubbles: true })); }, v); await page.waitForTimeout(700); return page.evaluate(() => { const c = document.querySelector(".tv canvas"), d = c.getContext("2d").getImageData(306, 142, 4, 4).data; return (d[0] + d[1] + d[2]) / 3; }); };
  const bOn = await bright(spotOn), bOff = await bright(0);
  check(bOn > 200 && bOff < 170 && bOn > bOff + 40, `G. 별빛은 깜빡임이 켜진 위치(${spotOn})에서 환하고 꺼진 위치에서 어둡다 (${bOn.toFixed(0)} / ${bOff.toFixed(0)})`);
  await shot("08-tape");
  /* 기록장: 이상적인 관찰자가 되감기로 본 부호를 그대로 키보드로 적는다. 맞는지는 알려 주지 않는다 */
  const seen = await ev(() => N1Puz.observe("rewind")), seenBack = await ev(() => N1Puz.observe("play"));
  const typed = seen.split(" ").map((t) => (t === "//" ? "//" : t === "/" ? "/" : t)).join("");
  for (const ch of typed) await page.keyboard.press(ch === "." ? "Period" : ch === "-" ? "Minus" : "Slash");
  await page.waitForTimeout(500);
  const padSaved = await ev(() => (__n1.M.pz("c4") || {}).pad || "");
  check(padSaved === typed, "G. 키보드(. - /)로 적은 부호가 기록장에 저장된다 (" + padSaved.length + "자)");
  check((await page.$$(".pad-out .mz.dot, .pad-out .mz.dash")).length === typed.replace(/\//g, "").length && (await page.$$(".pad-out .mz.gap")).length === (typed.match(/\//g) || []).length, "G. 기록장에 점·선·쉼이 그려진다");
  check(await ev(() => __n1.M.S.phase) === "read" && (await page.$$(".crt-cue, .term-right .btn.primary")).length === 0, "G. 기록장은 맞는지 알려 주지 않는다(판정은 컴퓨터에서만)");
  check(typed.length > 20 && seen !== seenBack, "G. 되감기로 본 부호와 재생으로 본 부호가 다르다");
  await page.keyboard.press("Escape"); await page.waitForTimeout(500);
  check((await ev(() => (__n1.M.pz("c4") || {}).pad)) === typed, "G. 패널을 닫아도 기록이 남는다");
  /* 해독표(벽) → 컴퓨터: 기록한 신호를 보며 답한다 */
  await clickHot("refP:morseChart", [-3.0, -1.0, Math.atan2(-1.99, -1.95), -0.4]); await page.waitForTimeout(800);
  check(await sheetOpen() && (await page.$$(".mc-cell")).length === 26, "G. 벽의 해독표를 누르면 모스 부호표(26글자)가 열린다");
  await shot("08-morse-chart");
  await page.keyboard.press("Escape"); await page.waitForTimeout(400);
  await clickHot("computer", [0.15, -1.15, Math.PI, -0.42]); await page.waitForTimeout(800);
  check(await sheetOpen() && (await page.$$(".tab")).length === 2, "G. 컴퓨터 패널에 ‘일기’와 ‘신호 기록’ 탭이 있다");
  await page.click(".tab:nth-child(2)"); await page.waitForTimeout(300);
  check((await page.$$(".tabpane:not([hidden]) .pad-out .mz")).length > 10, "G. ‘신호 기록’ 탭에서 적어 둔 부호를 보며 답한다");
  await page.keyboard.type("ZZZZ"); await page.keyboard.press("Enter"); await page.waitForTimeout(300);
  check(await ev(() => __n1.M.S.phase) === "read", "G. 틀린 낱말은 통과하지 못한다");
  for (const ch of answerOf(4).toUpperCase()) await page.click(`.key:text-is("${ch}")`);
  await page.click(".key.enter");
  check(await until(() => __n1.M.S.phase === "search", null, 30000), "G. 해독한 낱말을 컴퓨터에 답하면 탐색 단계");
  await page.waitForTimeout(1500); await page.click(".sheet-foot .btn.primary, .term-right .btn.primary"); await page.waitForTimeout(500);

  /* H) 5장 지도 메모 */
  await setState(5, "read", [1, 2, 3, 4]);
  await ev(() => __n1.I.interact("refP:map")); await page.waitForTimeout(700);
  const blanks = await page.$$(".mnote");
  check(blanks.length > 0 && (await page.$$(".mc")).length === D.rows * D.cols, `H. 지도에 적을 수 있는 빈 칸이 ${blanks.length}개 있다`);
  await blanks[0].fill("Q"); await page.waitForTimeout(700);
  check((await ev(() => ((__n1.M.pz("c5") || {}).cells || {}))) && Object.values(await ev(() => (__n1.M.pz("c5") || {}).cells || {})).includes("Q"), "H. 적은 글자가 저장된다");
  /* 경로를 대신 걸어 주는 ‘따라가기’는 없다. 안내 문장은 그대로 읽고, 칸에는 연필로 표시만 한다 */
  check((await page.$$(".trace, .mapmsg")).length === 0, "H. 경로를 대신 걸어 주는 ‘따라가기’가 없다");
  check((await page.$$(".maproutes li")).length === D.routes, `H. 안내 문장 ${D.routes}개는 그대로 읽는다`);
  await page.click('.mapbar .btn:has-text("칸에 표시")'); await page.waitForTimeout(150);
  const gridCells = await page.$$(".mapgrid .mc:not(.void)");
  await gridCells[3].click(); await gridCells[8].click(); await page.waitForTimeout(700);
  check((await page.$$(".mapgrid .mc.pen")).length === 2, "H. ‘칸에 표시’로 바꾸면 칸을 눌러 연필로 표시할 수 있다");
  check((await ev(() => Object.keys((__n1.M.pz("c5") || {}).marks || {}).length)) === 2, "H. 표시가 저장된다");
  await gridCells[3].click(); await page.waitForTimeout(300);
  check((await page.$$(".mapgrid .mc.pen")).length === 1, "H. 표시한 칸을 다시 누르면 지워진다");
  await page.click('.mapbar .btn:has-text("표시 지우기")'); await page.waitForTimeout(700);
  check((await page.$$(".mapgrid .mc.pen")).length === 0 && (await ev(() => Object.keys((__n1.M.pz("c5") || {}).marks || {}).length)) === 0, "H. ‘표시 지우기’로 모두 지운다");
  check((await ev(() => Object.values((__n1.M.pz("c5") || {}).cells || {}).includes("Q"))), "H. 표시를 지워도 적은 글자는 남는다");
  await shot("09-map");
  await page.keyboard.press("Escape"); await page.waitForTimeout(400);

  /* I) 6장 영상 + 암호 글자 지우기 */
  await setState(6, "read", [1, 2, 3, 4, 5]);
  await clickHot("tv", [-3.0, 0.0, Math.atan2(-4.45 + 3.0, -1.85 - 0.0), -0.1]); await page.waitForTimeout(800);
  check(await sheetOpen() && (await page.$$(".cipherbox .ct")).length === D.cipher, `I. 6장에 AV 카트의 TV 를 누르면 영상과 암호 글자 ${D.cipher}개가 나온다`);
  check((await page.$$("video")).length >= 1, "I. 영상 요소가 있다");
  const before = await page.$eval(".cout", (e) => e.textContent);
  await (await page.$$(".ct"))[0].click(); await page.waitForTimeout(150);
  check((await page.$eval(".cout", (e) => e.textContent)) !== before, "I. 암호 글자를 누르면 지워져 ‘남은 글자’가 줄어든다");
  await page.fill(".cfield", "xyz"); await page.waitForTimeout(700);
  check((await page.$eval(".cfield", (e) => e.value)) === "XYZ" && (await page.$$(".ct.struck")).length >= 2, "I. 칸에 적은 글자(대문자로 바뀜)가 한꺼번에 지워진다");
  check((await ev(() => (__n1.M.pz("c6") || {}).f)) === "XYZ", "I. 적은 글자가 저장된다");
  await shot("10-video-tool");
  await page.keyboard.press("Escape"); await page.waitForTimeout(400);

  /* J) 7장 쪽지 낱말 메모 (단말기 옆 탭) */
  await setState(7, "read", [1, 2, 3, 4, 5, 6]);
  await ev(() => __n1.I.interact("computer")); await page.waitForTimeout(800);
  await page.click("text=쪽지 메모"); await page.waitForTimeout(500);
  const wn = await page.$$(".wnote");
  check(wn.length >= 5, `J. 붉은 낱말마다 적을 칸이 있다 (${wn.length}개)`);
  await wn[0].fill("apple"); await wn[1].fill("Zebra"); await page.waitForTimeout(700);
  check((await page.$$(".wstrip, .ini, .dict-link")).length === 0, "J. 머리글자를 대신 모아 주지도, 밖의 사전으로 보내지도 않는다");
  check((await ev(() => ((__n1.M.pz("c7") || {}).w || []).slice(0, 2).join("|"))) === "apple|Zebra", "J. 적은 낱말이 저장된다");
  await shot("11-words");
  await page.keyboard.press("Escape"); await page.waitForTimeout(400);
  /* 교탁 위 한영사전: 쪽지의 낱말을 하나씩 찾아 첫 뜻의 머리글자를 이으면 정답이다 */
  await clickHot("dict", [0.15, -1.15, Math.PI, -0.42]); await page.waitForTimeout(800);
  const nDict = await ev(() => N1Dict.count);
  check(await sheetOpen() && (await page.$$(".dlist li")).length === nDict, `J. 교탁 위 한영사전을 누르면 낱말 ${nDict}개가 가나다순으로 열린다`);
  await page.fill(".dsearch", "평화"); await page.waitForTimeout(200);
  check((await page.$$(".dlist li:not([hidden])")).length === 1, "J. 낱말을 치면 그 낱말만 남는다");
  await page.fill(".dsearch", "없는낱말"); await page.waitForTimeout(200);
  check(await page.$eval(".dnone", (e) => !e.hidden), "J. 없는 낱말이면 ‘이 사전에 없는 낱말’이 나온다");
  const reds = await ev(() => [...N1Data.DIARY_HTML.diary7.matchAll(/<span class="red">(.*?)<\/span>/g)].map((m) => m[1]));
  let ini = "";
  for (const w of reds) { await page.fill(".dsearch", w); await page.waitForTimeout(60); const first = await page.$eval(".dlist li:not([hidden]) .dmean span:first-child", (e) => e.textContent.replace(/^\d+/, "")); ini += first[0]; }
  check(reds.length === 15 && ini.toLowerCase() === answerOf(7), "J. 사전에서 쪽지의 열다섯 낱말을 하나씩 찾아 첫 뜻의 머리글자를 이으면 정답이 된다");
  await shot("11-dictionary");
  await page.keyboard.press("Escape"); await page.waitForTimeout(400);

  /* K) 8장 설명서: 글자별 움직임 횟수표 */
  await setState(8, "read", [1, 2, 3, 4, 5, 6, 7]);
  await ev(() => __n1.I.interact("refP:keyb")); await page.waitForTimeout(700);
  check((await page.$$(".kc .k")).length === 27, "K. 알파벳 26자와 마침표의 근육 움직임 횟수표가 있다");
  check((await page.$eval(".kc .k:nth-child(1)", (e) => e.textContent.replace(/\s/g, ""))) === "A1" && (await page.$eval(".kc .k.dot", (e) => e.textContent.replace(/\s/g, ""))) === ".28", "K. A=1 … 마침표=28");
  await shot("12-keyb");
  await page.keyboard.press("Escape"); await page.waitForTimeout(400);

  /* L) 저장: 도구에 적은 것과 힌트, 기억 소품은 새로고침 뒤에도 남는다 */
  const saved = JSON.parse(JSON.parse(await ev(() => { __n1.M.save(); return localStorage.getItem("nameless-classroom-v2") || "{}"; })).payload || "{}");   /* 저장은 { payload: "<상태 JSON>", checksum } 모양 */
  /* 2장은 액자를 보기만 해서 남기는 메모가 없다. 기록장·메모가 있는 4·5·6·7장만 저장된다 */
  check(["c4", "c5", "c6", "c7"].every((k) => saved.pz && saved.pz[k]) && !(saved.pz && saved.pz.c2) && saved.hints && saved.hints.c2 === 3, "L. 진행 저장(localStorage)에 퍼즐 메모(pz: 4~7장)와 힌트 기록이 함께 들어 있다");

  /* M) 기억 소품: 조각 수만큼 소품이 생긴다 */
  await setState(9, "read", [1, 2, 3, 4, 5, 6, 7, 8]);
  const mems = await ev(() => [1, 2, 3, 4, 5, 6, 7, 8].map((n) => __n1.L.mem[n].visible));
  check(mems.every(Boolean), "M. 조각 8개를 모으면 기억 소품 8개가 모두 나타난다");
  const dark = await ev(() => __n1.L.lampLight.intensity);
  check(dark > 0.3, "M. 8번째 소품(스탠드)의 불빛이 켜진다 (" + dark.toFixed(2) + ")");
  await ev(() => __n1.I.interact("decoy:mem3")); await page.waitForTimeout(300);
  check((await page.$eval("#toast", (e) => e.textContent)).includes("지팡이"), "M. 소품을 조사하면 한 줄 감상이 나온다");
  await ev(() => { __n1.C.setView(2.2, -0.4, Math.atan2(3.9 - 2.2, -3.9 + 0.4), 0.02); __n1.UI.showHud(false); }); await page.waitForTimeout(500);
  await shot("13-memories");
  /* N) 장치 전원: 교탁 컴퓨터와 TV 는 쓸 때만 켜진다 */
  const range = (k) => Array.from({ length: k }, (_, i) => i + 1);
  const powerAt = async (ch, phase) => { await setState(ch, phase, range(ch - 1)); return ev(() => ({ pc: __n1.W.computerMode(), tv: __n1.W.tvOn(), dormant: !!__n1.L.hotById.computer.userData.dormant, name: __n1.L.hotById.computer.userData.hot.name })); };
  const pcOn = [], tvOnList = [];
  for (let ch = 1; ch <= 8; ch++) for (const phase of ["read", "search"]) { const r = await powerAt(ch, phase); if (r.pc === "input") pcOn.push(`${ch}${phase}`); if (r.tv) tvOnList.push(`${ch}${phase}`); }
  check(pcOn.join(",") === "2read,3read,4read,5read,6read,7read,8read", "N. 컴퓨터는 2~8장의 답을 넣는 동안에만 켜진다 (" + pcOn.join(",") + ")");
  check(tvOnList.join(",") === "4read,6read", "N. TV 는 4장(테이프)·6장(영상)을 푸는 동안에만 켜진다 (" + tvOnList.join(",") + ")");
  await ev(() => { __n1.M.S.tower = []; __n1.M.S.stack = null; });
  await setState(9, "read", range(8));
  check((await ev(() => __n1.W.computerMode())) === "off", "N. 조각 8개를 모아도 탑을 완성하기 전에는 컴퓨터가 꺼져 있다");
  await ev(() => { __n1.M.S.tower = stackOrder().slice(); __n1.M.towerSubmit(); __n1.W.refreshTower(__n1.M.S, false); __n1.W.syncDevices(__n1.M.S, false); });
  check((await ev(() => __n1.W.computerMode())) === "input", "N. 탑을 완성하면 컴퓨터가 켜진다(이름 입력)");
  await ev(() => { __n1.M.S.exitReady = true; __n1.W.syncDevices(__n1.M.S, false); });
  check((await ev(() => __n1.W.computerMode())) === "done", "N. 이름을 맞힌 뒤에는 ‘마침’ 화면이 된다");
  await ev(() => { __n1.M.S.exitReady = false; });
  /* 꺼진 컴퓨터: 이름표에 ‘꺼짐’, 후광·조준점 반응 없음, 눌러도 안 열리고 감독교사가 이유를 말해 준다 */
  await powerAt(1, "read");
  await ev(() => __n1.UI.sayClear());
  const pc = await clickHot("computer", [0.15, -1.15, Math.PI, -0.42]); await page.waitForTimeout(600);
  const dorm = await ev(() => ({ label: document.getElementById("label").textContent, hot: document.getElementById("reticle").classList.contains("hot"), halo: !!(__n1.L.obj.crt.userData.hullSets || []).some((h) => h.halo && h.halo.visible), sheet: __n1.UI.sheetOpen(), toast: document.getElementById("toast").textContent }));
  check(dorm.label.includes("꺼짐") && !dorm.hot && (STYLE !== "toon" || !dorm.halo), "N. 꺼진 컴퓨터는 이름표에 ‘꺼짐’이 붙고 조준점·후광이 켜지지 않는다");
  check(!dorm.sheet && dorm.toast.includes("꺼져"), "N. 꺼진 컴퓨터를 눌러도 열리지 않고 안내가 나온다");
  check(await until(() => __n1.UI.saying(), null, 30000), "N. 꺼진 컴퓨터를 누르면 감독교사가 이유와 지금 할 일을 말해 준다");
  await shot("14-computer-off");
  await ev(() => __n1.UI.sayClear());
  await powerAt(5, "read");
  await clickHot("computer", [0.15, -1.15, Math.PI, -0.42]); await page.waitForTimeout(800);
  check(await sheetOpen(), "N. 5장(답을 넣는 장)에서는 컴퓨터를 눌러 답 패널이 열린다");
  await shot("15-computer-on");
  await page.keyboard.press("Escape"); await page.waitForTimeout(400);
  check(errors.length === 0, "화면 오류 없음 " + errors.join(" | "));

  /* ══════ 모바일 가로(568×320) ══════ */
  await page.context().close();                                   /* 데스크톱 창을 닫아 소프트웨어 렌더링 부담을 덜어 준다 */
  }
  const mp = await open({ width: 568, height: 320 }, true);
  const mh = helpers(mp, "m-");
  await mp.tap("#go-new").catch(() => mp.click("#go-new")); await mp.waitForTimeout(600);
  check(await mh.until(() => __n1.UI.saying(), null, 30000), "모바일: 시작하면 감독교사가 말한다");
  await mp.waitForTimeout(800);
  const box = await mp.evaluate(() => { const r = document.getElementById("say").getBoundingClientRect(); return { l: r.left, t: r.top, r: r.right, b: r.bottom, w: innerWidth, h: innerHeight }; });
  check(box.l >= 0 && box.r <= box.w + 1 && box.b <= box.h + 1 && box.t >= 0, `모바일: 말풍선이 화면 안에 들어온다 (${Math.round(box.l)},${Math.round(box.t)} → ${Math.round(box.r)},${Math.round(box.b)} / ${box.w}×${box.h})`);
  await mh.shot("01-say");
  for (const [name, fn, sel] of [["stamp", () => { __n1.M.takeDiary1(); __n1.I.interact("stamp"); }, ".stamp-btn"], ["frame", () => { __n1.M.S.ch = 2; __n1.I.interact("frame:newton"); }, ".fb-chunk"], ["roster", () => { __n1.M.S.ch = 3; __n1.I.interact("roster"); }, ".roster-paper li"], ["tv", () => { __n1.M.S.ch = 4; __n1.I.interact("tv"); }, ".vb"], ["morse", () => { __n1.M.S.ch = 4; __n1.I.interact("refP:morseChart"); }, ".mc-cell"], ["tower", () => { __n1.M.S.ch = 9; __n1.M.S.pieces = [1, 2, 3, 4, 5, 6, 7, 8]; __n1.M.S.tower = []; __n1.I.interact("tower"); }, ".tw-block"], ["dict", () => { __n1.M.S.ch = 7; __n1.I.interact("dict"); }, ".dsearch"], ["name", () => { __n1.M.S.ch = 9; __n1.SC.showName(); }, ".name-engrave"]]) {
    await mp.evaluate(() => { __n1.UI.sayClear(); if (__n1.UI.sheetOpen()) __n1.UI.closeSheet && __n1.UI.closeSheet(); });
    await mp.waitForTimeout(400);
    await mp.evaluate(fn); await mp.waitForTimeout(900);
    const ok = await mp.evaluate((sel) => { const e = document.querySelector(sel), sh = document.getElementById("sheet"); if (!e || !sh) return { has: !!e }; const r = e.getBoundingClientRect(), s = sh.getBoundingClientRect(); return { has: true, inW: s.left >= -1 && s.right <= innerWidth + 1, scrollX: document.documentElement.scrollWidth <= innerWidth + 1, visible: r.width > 0 && r.height > 0 }; }, sel);
    check(ok.has && ok.inW && ok.scrollX && ok.visible, `모바일: ${name} 패널이 화면 폭 안에서 열리고 핵심 조작(${sel})이 있다`);
    await mh.shot("02-" + name);
  }
  /* 작은 화면에서도 해독표의 부호는 칸 안에 들어가고, 탑은 일기와 블록이 나란히 보여 블록을 옮기는 동안 일기를 계속 볼 수 있다 */
  const closeAll = async () => { await mp.evaluate(() => { __n1.UI.sayClear(); if (__n1.UI.sheetOpen()) __n1.UI.closeSheet && __n1.UI.closeSheet(true); }); await mp.waitForTimeout(400); };
  await closeAll();
  await mp.evaluate(() => { __n1.M.S.ch = 4; __n1.I.interact("refP:morseChart"); }); await mp.waitForTimeout(900);
  const over = await mp.evaluate(() => [...document.querySelectorAll(".mc-cell")].filter((c) => c.querySelector(".mc-code").getBoundingClientRect().right > c.getBoundingClientRect().right - 1).map((c) => c.firstChild.textContent));
  check(over.length === 0, "모바일: 해독표의 부호가 칸 밖으로 넘치지 않는다" + (over.length ? " (넘침: " + over.join(",") + ")" : ""));
  await closeAll();
  await mp.evaluate(() => { __n1.M.S.ch = 9; __n1.M.S.pieces = [1, 2, 3, 4, 5, 6, 7, 8]; __n1.M.S.tower = []; __n1.I.interact("tower"); }); await mp.waitForTimeout(900);
  await mh.until(() => { const c = document.querySelector(".sheet-card"), t = c && getComputedStyle(c).transform; return !t || t === "none" || t === "matrix(1, 0, 0, 1, 0, 0)"; }, null, 30000);   /* 열리는 동안에는 카드가 옆으로 밀려 있어 재지 않는다 */
  const twBox = await mp.evaluate(() => { const n = document.querySelector(".tw-note").getBoundingClientRect(), c = document.querySelector(".tw-col").getBoundingClientRect(), t = document.querySelector(".tw-block .tw-title"); return { sideBySide: n.right <= c.left + 1 && n.width > 120, inW: c.right <= innerWidth + 1 && n.left >= -1, titleLines: t ? Math.round(t.getBoundingClientRect().height / parseFloat(getComputedStyle(t).lineHeight || 14)) : 0 }; });
  check(twBox.sideBySide && twBox.inW, "모바일: 탑 패널에서 일기(왼쪽)와 블록(오른쪽)이 나란히 보인다");
  await mh.shot("03-tower-side");
  check(errors.length === 0, "모바일 포함 화면 오류 없음 " + errors.join(" | "));
} catch (e) {
  failures++; console.log("FAIL 예외: " + (e && e.stack || e));
} finally {
  await browser.close(); server.close();
}
console.log(failures ? `\n${failures}개 실패` : "\n모두 통과");
process.exit(failures ? 1 : 0);
