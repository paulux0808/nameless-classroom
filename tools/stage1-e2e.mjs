#!/usr/bin/env node
/* 스테이지 1 종단 검증 — 진짜 브라우저(Chromium)로 게임을 8챕터 끝까지 플레이한다.
   실제 마우스 클릭으로 물건을 조사하고, 실제 키 입력으로 단말기에 답을 넣고, 조립·엔딩·뒷문·저장 이어하기까지 확인한다.
   사용법: node tools/stage1-e2e.mjs [--shots 폴더] [--headed]
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
/* 소프트웨어 렌더링은 프레임이 느려서, 시점을 바꾼 직후에는 카메라 행렬이 아직 옛 값이다.
   두 프레임을 기다려 컨트롤러가 새 시선을 적용하게 한 뒤 행렬을 갱신하고 화면 좌표를 잰다. */
const screenOf = (id) => ev(async (id) => {
  await new Promise((ok) => requestAnimationFrame(() => requestAnimationFrame(ok)));
  __n1.camera.updateMatrixWorld(true);
  const h = __n1.L.hotById[id], v = new THREE.Vector3(); h.getWorldPosition(v); v.project(__n1.camera);
  return { x: (v.x + 1) / 2 * innerWidth, y: (1 - v.y) / 2 * innerHeight };
}, id);

try {
  await page.goto(`${base}/stage1/index.html?debug=1`, { waitUntil: "load" });
  await page.waitForFunction(() => window.__ready === true, null, { timeout: 180000 });
  check(errors.length === 0, "부팅 중 오류 없음 " + errors.join(" | "));
  await shot("01-intro");
  await page.click("#go-new"); await page.waitForTimeout(500);

  /* 0) 시선 드래그: HUD 띠(화면 맨 위) 한가운데서 시작해도 끌린다 */
  const yaw0 = await ev(() => __n1.C.yaw);
  await page.mouse.move(640, 22); await page.mouse.down(); await page.mouse.move(700, 40, { steps: 4 }); await page.mouse.up(); await page.waitForTimeout(200);
  check(Math.abs((await ev(() => __n1.C.yaw)) - yaw0) > 0.05, "HUD 띠 위에서 시작한 드래그도 시선을 돌린다");
  await ev(() => __n1.C.setView(0, 3.1, Math.PI, -0.13));

  /* 1) 첫 일기: 진짜 클릭 */
  await ev(() => __n1.C.setView(-0.1, 2.3, Math.PI, -0.35)); await page.waitForTimeout(300);
  let p = await screenOf("diary1obj"); await page.mouse.move(p.x, p.y); await page.mouse.click(p.x, p.y); await page.waitForTimeout(600);
  check(await ev(() => __n1.M.S.tookD1), "첫 일기를 클릭으로 집었다");
  await page.keyboard.press("Escape"); await page.waitForTimeout(400);
  check(await ev(() => !__n1.UI.sheetOpen()), "Esc 로 패널이 닫히고 메뉴가 따라 열리지 않는다");

  /* 2) 챕터 1~8 */
  for (let n = 1; n <= 8; n++) {
    const [spot, x, z, yaw, pitch, crouch] = STAND[n - 1];
    await ev(() => { __n1.C.crouch = false; __n1.C.eye = 1.6; __n1.C.setView(0.3, -1.6, Math.PI, -0.2); }); await page.waitForTimeout(250);
    await ev(() => __n1.I.interact("computer")); await page.waitForTimeout(500);
    const numeric = n === 1 || n === 8, ans = answerOf(n);
    /* 틀린 답 먼저, 그다음 정답 — 둘 다 물리 키보드로 */
    await page.keyboard.type(numeric ? "9999" : "ZZZZ"); await page.keyboard.press("Enter"); await page.waitForTimeout(250);
    check(await ev(() => __n1.M.S.phase) === "read", `챕터 ${n}: 틀린 답은 통과하지 못한다`);
    for (const ch of ans) await page.keyboard.press((/\d/.test(ch) ? "Digit" : "Key") + ch.toUpperCase());
    await page.keyboard.press("Enter"); await page.waitForTimeout(400);
    check(await ev(() => __n1.M.S.phase) === "search", `챕터 ${n}: 정답으로 탐색 단계`);
    await page.keyboard.press("Escape"); await page.waitForTimeout(300);
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

  /* 3) 조립 → 이름 → 엔딩 */
  await ev(() => __n1.I.interact("computer")); await page.waitForTimeout(600);
  const order = await ev(() => stackOrder());
  for (let i = 0; i < 8; i++) {
    const cur = await ev(() => __n1.M.S.stack.slice()); const j = cur.indexOf(order[i]);
    for (let k = j; k > i; k--) { await page.click(`.srow:nth-child(${k + 1}) .mv button:first-child`); await page.waitForTimeout(40); }
  }
  check(await ev(() => __n1.M.stackSolved()), "▲▼ 버튼으로 기억 조각을 맞췄다");
  await shot("09-assembly");
  const name = await ev(() => finalName());
  for (const ch of name.replace(/[^a-zA-Z]/g, "")) await page.keyboard.press("Key" + ch.toUpperCase());
  await page.keyboard.press("Enter"); await page.waitForTimeout(1500);
  check(await ev(() => __n1.M.S.exitReady), "이름을 맞히면 뒷문이 열릴 준비가 된다");
  check(await page.$("#ending") !== null, "엔딩 화면");
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
