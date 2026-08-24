// ============================================================
// config.js
// Firebaseプロジェクトの接続設定。
//
// ここに書く値(apiKeyなど)はサーバーの秘密鍵とは違い、
// クライアントに公開される前提の値です。
// アクセス制御はこの値の秘匿性ではなく、Firestoreの
// セキュリティルール(firestore.rules)で行います。
// そのためこのファイルはそのままGitにコミットして構いません。
//
// ★ 使い方 ★
// Firebaseコンソールでプロジェクトを作成したら、
// 「プロジェクトの設定 → 全般 → マイアプリ → SDKの設定と構成」
// に表示される値を下記にそのまま貼り付けてください。
// (詳しい手順はREADME.mdの「Firebaseプロジェクトの作成」を参照)
// ============================================================

const firebaseConfig = {
  apiKey: "AIzaSyAdTIjxc4SlbS0jSpiwDtpLUVpIYbPmP4I",
  authDomain: "kaken-phone-oekaki.firebaseapp.com",
  projectId: "kaken-phone-oekaki",
  storageBucket: "kaken-phone-oekaki.firebasestorage.app",
  messagingSenderId: "102844988031",
  appId: "1:102844988031:web:e32d00ef589dd600bd9d4a",
  measurementId: "G-6Y6TSN6F32",
};

// 参加者用ページ(draw.html)のURL。
// gallery.html がQRコードを描画する際にこの値を使う。
// GitHub Pagesで公開したあとの実際のURLに書き換えること。
// 例: "https://your-account.github.io/kaken.phone.oekaki/draw.html"
const DRAW_PAGE_URL = "https://pa314960-prog.github.io/kaken.phone.oekaki/draw.html";
