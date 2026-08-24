// ============================================================
// firebase-init.js
// Firebase App / Firestore の初期化のみを行う共通ファイル。
// config.js を先に読み込んでおくこと(firebaseConfigを使用する)。
// draw.html / gallery.html の両方から読み込む。
// ============================================================

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const POSTS_COLLECTION = "posts";
