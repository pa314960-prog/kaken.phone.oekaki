// ============================================================
// submit.js
// draw.html の送信処理を担当。
// - Firestoreへの書き込み
// - 連投防止(送信中は送信ボタンを無効化)
// - 送信完了画面 / エラー表示の切り替え
// ============================================================

const submitBtn = document.getElementById("submitBtn");
const errorBox = document.getElementById("errorBox");
const doneOverlay = document.getElementById("doneOverlay");
const drawAgainBtn = document.getElementById("drawAgainBtn");

function showError(message) {
  errorBox.textContent = message;
  errorBox.classList.add("show");
}

function hideError() {
  errorBox.classList.remove("show");
}

function showDoneScreen() {
  doneOverlay.classList.add("show");
}

function backToDrawScreen() {
  doneOverlay.classList.remove("show");
  clearCanvas();
  hideError();
  submitBtn.disabled = false;
  submitBtn.textContent = "送信する";
}

drawAgainBtn.addEventListener("click", () => {
  backToDrawScreen();
});

submitBtn.addEventListener("click", async () => {
  hideError();

  submitBtn.disabled = true;
  submitBtn.textContent = "送信中...";

  try {
    const imageData = canvas.toDataURL("image/png");

    await db.collection(POSTS_COLLECTION).add({
      image: imageData,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    });

    showDoneScreen();
  } catch (err) {
    console.error("送信に失敗しました:", err);
    showError("送信に失敗しました。通信状態を確認してもう一度お試しください。");
    submitBtn.disabled = false;
    submitBtn.textContent = "送信する";
  }
});
