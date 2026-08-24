# CLAUDE.md

このファイルは、別のPCでこのプロジェクトを開いたときに文脈をすぐ把握できるようにするためのものです。
Claude Code Desktopでこのフォルダを開くと自動的に読み込まれます。

## プロジェクト概要

「らくがきウォール」- QRコードでスマホから参加する、お絵かき投稿Webアプリ。

- 参加者はQRコードを読み込んでスマホのブラウザで絵を描き、送信する
- 送信された絵はリアルタイムでギャラリー画面(プロジェクター投影用)に並ぶ
- イベント等での利用を想定(みんなで一枚の壁を作る体験)

## 使用技術

- フレームワークなしのプレーンHTML/CSS/JavaScript(npm不要、ビルド不要)
- Firebase Firestore(データベース。**Cloud Storageは使わない**)
  - 画像はcanvasから `toDataURL()` で取得したbase64文字列として、Firestoreドキュメントに直接保存する
  - 理由: Cloud Storageの利用にはBlazeプラン(クレジットカード登録)が必要なため、カード登録なしで完結させるためこの構成を選んでいる
  - Firestore SDKはCDN経由の compat版(`firebase-app-compat.js` / `firebase-firestore-compat.js`)を使用
- QRコード描画: `qrcodejs`(CDN経由、npm不要)
- ホスティング: GitHub Pages(リポジトリ管理と公開を一元化するため)

## ディレクトリ構成

```
kaken.phone.oekaki/
├── draw.html              参加者用お絵かき画面
├── gallery.html            投影・集計用のギャラリー画面
├── config.js               Firebase接続設定(実際の値をコミットする方針。詳細はconfig.js内コメント参照)
├── firebase.json           firebase CLI設定
├── firestore.rules         Firestoreセキュリティルール
├── firestore.indexes.json  Firestoreインデックス定義
├── css/
│   ├── style.css           全画面共通スタイル(ダークテーマ、見出しなど)
│   ├── draw.css            draw.html専用スタイル
│   └── gallery.css         gallery.html専用スタイル
├── js/
│   ├── firebase-init.js    Firebase App / Firestoreの初期化のみ
│   ├── canvas-draw.js      canvas描画処理(ペン・消しゴム・色選択・クリア)
│   ├── submit.js           Firestoreへの送信・連投防止(クールダウン)・完了/エラー画面切り替え
│   ├── gallery.js          ギャラリーのonSnapshotリアルタイム表示・件数カウント・新着ハイライト
│   └── qr-display.js       QRコード描画(qrcodejsを使ってdraw.htmlのURLを描画)
├── README.md                セットアップ手順・動作確認方法など
└── CLAUDE.md                 このファイル
```

機能ごとにファイルを分割しているので、修正したい機能に対応するファイルだけを見れば良い設計にしている。

## Firestoreのデータ構造

コレクション: `posts`

| フィールド | 型 | 説明 |
|---|---|---|
| `image` | string | `data:image/png;base64,...` 形式の画像データ |
| `createdAt` | timestamp | `firebase.firestore.FieldValue.serverTimestamp()` で記録されるサーバー時刻 |

## 現在の進捗

- [x] `draw.html` / `gallery.html` のUI実装(指定されたUI仕様に準拠したダークテーマ)
- [x] canvas描画処理(タッチ・マウス両対応、ペン6色+消しゴム)
- [x] Firestoreへの送信処理(連投防止のボタン無効化+10秒クールダウン、エラー時の再送信対応)
- [x] ギャラリーのリアルタイム表示(onSnapshot、新着ハイライトアニメーション、件数カウント)
- [x] QRコード表示(qrcodejs、CDN経由、npm不要)
- [x] Firestoreセキュリティルール案(`firestore.rules`)
- [x] README.mdへのセットアップ手順(Windows初回セットアップ、別PCでの再開手順)まとめ
- [x] GitHubリポジトリへのpush、GitHub Pagesの有効化(公開URL: `https://pa314960-prog.github.io/kaken.phone.oekaki/`。`config.js` の `DRAW_PAGE_URL` も更新済み)
- [x] 実際のFirebaseプロジェクトの作成・`config.js` への実値反映(プロジェクトID: `kaken-phone-oekaki`)
- [ ] **未実施: Firestoreセキュリティルールのデプロイ**(`firebase login` → `firebase init firestore` → `firebase deploy --only firestore:rules` が必要。Firestore Database自体の作成が済んでいない場合はFirebaseコンソールでの作成も先に必要)
- [ ] **未実施: 実機(スマホ)での動作確認**

## 次にやること

1. Firebaseコンソールで「Firestore Database」を作成する(まだの場合。ロケーションはasia-northeast1推奨)
2. ローカル(自分のPC)で `firebase login` → `firebase init firestore` → `firebase deploy --only firestore:rules` を実行し、`firestore.rules` の内容を適用する
3. スマホの実機で `gallery.html`(`https://pa314960-prog.github.io/kaken.phone.oekaki/gallery.html`)のQRコードを読み込み、`draw.html` から投稿 → `gallery.html` にリアルタイムで反映されることを確認する

## 設計上の注意点(変更時に踏まえること)

- `config.js` の値(apiKeyなど)は公開前提のクライアント設定であり、秘匿する必要はない。アクセス制御は `firestore.rules` で行っている
- canvasの解像度は400×400pxに固定(通信量とFirestoreの1ドキュメント1MB制限を考慮)。解像度を上げる場合はドキュメントサイズが1MBを超えないか要確認(`firestore.rules` 内の900KB制限も合わせて見直すこと)
- 投稿の連投防止はクライアント側のlocalStorageによる簡易的なものであり、悪意のあるユーザーへの完全な対策ではない(詳細はREADME.md・firestore.rules内コメント参照)
- Cloud Storage / Firebase Hosting / Cloud Functionsは意図的に使用していない(Blazeプラン=クレジットカード登録が不要な構成にするため)
