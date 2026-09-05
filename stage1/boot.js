"use strict";
try {
  if (!window.THREE) throw new Error("3D engine unavailable");
  boot();
} catch (error) {
  console.error("Stage 1 boot failed", error);
  var loading = document.getElementById("loading");
  loading.textContent = "교실을 열지 못했습니다. 새로고침해 다시 시도해 주세요.";
  var retry = document.createElement("button");
  retry.className = "btn btn-p"; retry.textContent = "다시 시도";
  retry.onclick = function () { location.reload(); }; loading.appendChild(retry);
}
