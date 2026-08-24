// ============================================================
// qr-display.js
// gallery.html 右側のQRコード描画のみを担当。
// config.js の DRAW_PAGE_URL を、qrcode.js(CDN)でその場に描画する。
// 外部のQR生成サイトには依存しない。
// ============================================================

new QRCode(document.getElementById("qrcode"), {
  text: DRAW_PAGE_URL,
  width: 176,
  height: 176,
  colorDark: "#1a1a1f",
  colorLight: "#ffffff",
  correctLevel: QRCode.CorrectLevel.M,
});
