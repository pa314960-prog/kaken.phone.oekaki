// ============================================================
// submit.js
// draw.html の送信処理を担当。
// - Firestoreへの書き込み
// - 連投防止(送信ボタンの一時無効化 + localStorageによるクールダウン)
// - 送信完了画面 / エラー表示の切り替え
// ============================================================

const COOLDOWN_MS = 10 * 1000; // 連続投稿を防ぐ間隔(10秒)
const LAST_SUBMIT_KEY = "rakugaki_last_submit_at";

const submitBtn = document.getElementById("submitBtn");
const errorBox = document.getElementById("errorBox");
const doneOverlay = document.getElementById("doneOverlay");
const drawAgainBtn = document.getElementById("drawAgainBtn");
const cooldownSecEl = document.getElementById("cooldownSec");

let cooldownTimer = null;

function showError(message) {
  errorBox.textContent = message;
  errorBox.classList.add("show");
}

function hideError() {
  errorBox.classList.remove("show");
}

function remainingCooldownMs() {
  const last = Number(localStorage.getItem(LAST_SUBMIT_KEY) || 0);
  return Math.max(0, COOLDOWN_MS - (Date.now() - last));
}

function startCooldownCountdown() {
  clearInterval(cooldownTimer);
  const update = () => {
    const remainMs = remainingCooldownMs();
    if (remainMs <= 0) {
      clearInterval(cooldownTimer);
      cooldownSecEl.textContent = "0";
      drawAgainBtn.disabled = false;
      drawAgainBtn.textContent = "もう一枚かく";
      return;
    }
    const sec = Math.ceil(remainMs / 1000);
    cooldownSecEl.textContent = String(sec);
    drawAgainBtn.disabled = true;
    drawAgainBtn.textContent = `もう一枚かく (${sec}秒後)`;
  };
  update();
  cooldownTimer = setInterval(update, 250);
}

function showDoneScreen() {
  doneOverlay.classList.add("show");
  startCooldownCountdown();
}

function backToDrawScreen() {
  doneOverlay.classList.remove("show");
  clearCanvas();
  hideError();
  submitBtn.disabled = remainingCooldownMs() > 0;
  submitBtn.textContent = "送信する";
}

drawAgainBtn.addEventListener("click", () => {
  if (remainingCooldownMs() > 0) return;
  backToDrawScreen();
});

submitBtn.addEventListener("click", async () => {
  hideError();

  const remainMs = remainingCooldownMs();
  if (remainMs > 0) {
    showError(`連続投稿はできません。あと${Math.ceil(remainMs / 1000)}秒お待ちください。`);
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = "送信中...";

  try {
    const imageData = canvas.toDataURL("image/png");

    await db.collection(POSTS_COLLECTION).add({
      image: imageData,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    });

    localStorage.setItem(LAST_SUBMIT_KEY, String(Date.now()));
    showDoneScreen();
  } catch (err) {
    console.error("送信に失敗しました:", err);
    showError("送信に失敗しました。通信状態を確認してもう一度お試しください。");
    submitBtn.disabled = false;
    submitBtn.textContent = "送信する";
  }
});

// ページを開いた直後にクールダウン中であれば送信ボタンを無効化しておく
if (remainingCooldownMs() > 0) {
  submitBtn.disabled = true;
  submitBtn.textContent = "送信する";
}
