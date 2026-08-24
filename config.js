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
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
};

// 参加者用ページ(draw.html)のURL。
// gallery.html がQRコードを描画する際にこの値を使う。
// GitHub Pagesで公開したあとの実際のURLに書き換えること。
// 例: "https://your-account.github.io/kaken.phone.oekaki/draw.html"
const DRAW_PAGE_URL = "https://pa314960-prog.github.io/kaken.phone.oekaki/draw.html";
