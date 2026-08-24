// ============================================================
// canvas-draw.js
// draw.html の描画処理(ペン/消しゴム/色選択/クリア)のみを担当。
// Firestoreへの送信は submit.js が行う。
// ============================================================

const canvas = document.getElementById("drawCanvas");
const ctx = canvas.getContext("2d");

const PEN_SIZE = 6;
const ERASER_SIZE = 24;

let currentColor = "#ffffff";
let isErasing = false;
let isDrawing = false;
let lastX = 0;
let lastY = 0;

function fillBackground() {
  ctx.fillStyle = "#faf8f0";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function clearCanvas() {
  fillBackground();
}

fillBackground();
ctx.lineCap = "round";
ctx.lineJoin = "round";

function getCanvasPos(clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  return {
    x: (clientX - rect.left) * scaleX,
    y: (clientY - rect.top) * scaleY,
  };
}

function startDrawing(x, y) {
  isDrawing = true;
  lastX = x;
  lastY = y;
  drawDot(x, y);
}

function drawDot(x, y) {
  ctx.beginPath();
  ctx.fillStyle = isErasing ? "#faf8f0" : currentColor;
  ctx.arc(x, y, (isErasing ? ERASER_SIZE : PEN_SIZE) / 2, 0, Math.PI * 2);
  ctx.fill();
}

function drawLine(x, y) {
  ctx.beginPath();
  ctx.strokeStyle = isErasing ? "#faf8f0" : currentColor;
  ctx.lineWidth = isErasing ? ERASER_SIZE : PEN_SIZE;
  ctx.moveTo(lastX, lastY);
  ctx.lineTo(x, y);
  ctx.stroke();
  lastX = x;
  lastY = y;
}

function stopDrawing() {
  isDrawing = false;
}

// ---- タッチ操作 ----
canvas.addEventListener(
  "touchstart",
  (e) => {
    e.preventDefault();
    const t = e.touches[0];
    const pos = getCanvasPos(t.clientX, t.clientY);
    startDrawing(pos.x, pos.y);
  },
  { passive: false }
);

canvas.addEventListener(
  "touchmove",
  (e) => {
    e.preventDefault();
    if (!isDrawing) return;
    const t = e.touches[0];
    const pos = getCanvasPos(t.clientX, t.clientY);
    drawLine(pos.x, pos.y);
  },
  { passive: false }
);

canvas.addEventListener("touchend", (e) => {
  e.preventDefault();
  stopDrawing();
});
canvas.addEventListener("touchcancel", (e) => {
  e.preventDefault();
  stopDrawing();
});

// ---- マウス操作(PCでの動作確認用) ----
canvas.addEventListener("mousedown", (e) => {
  const pos = getCanvasPos(e.clientX, e.clientY);
  startDrawing(pos.x, pos.y);
});
canvas.addEventListener("mousemove", (e) => {
  if (!isDrawing) return;
  const pos = getCanvasPos(e.clientX, e.clientY);
  drawLine(pos.x, pos.y);
});
window.addEventListener("mouseup", stopDrawing);

// ---- 色/消しゴム選択 ----
const colorRow = document.getElementById("colorRow");
const eraserBtn = document.getElementById("eraserBtn");

colorRow.querySelectorAll(".color-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    currentColor = btn.dataset.color;
    isErasing = false;
    colorRow.querySelectorAll(".color-btn").forEach((b) => b.classList.remove("selected"));
    eraserBtn.classList.remove("selected");
    btn.classList.add("selected");
  });
});

eraserBtn.addEventListener("click", () => {
  isErasing = true;
  colorRow.querySelectorAll(".color-btn").forEach((b) => b.classList.remove("selected"));
  eraserBtn.classList.add("selected");
});

// ---- クリアボタン ----
document.getElementById("clearBtn").addEventListener("click", () => {
  clearCanvas();
});
