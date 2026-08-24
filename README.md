# らくがきウォール

QRコードを読み込んでスマホから参加する、お絵かき投稿Webアプリです。
参加者が指で描いた絵を送信すると、投影用のギャラリー画面にリアルタイムで並びます。

- フレームワーク・npm不要のプレーンHTML/JS(GitHub Pagesでそのまま公開可能)
- バックエンドはFirestoreのみ(Cloud Storageは使わず、画像はbase64文字列としてFirestoreドキュメントに保存)
- ホスティングはGitHub Pages

## ファイル構成

```
kaken.phone.oekaki/
├── draw.html            参加者用お絵かき画面
├── gallery.html          投影・集計用のギャラリー画面
├── config.js             Firebase接続設定(実際の値をコミットする)
├── firebase.json         firebase CLI用の設定(ルールのデプロイ先など)
├── firestore.rules       Firestoreセキュリティルール
├── firestore.indexes.json Firestoreインデックス定義(現状は空)
├── css/
│   ├── style.css         全画面共通スタイル
│   ├── draw.css          draw.html専用スタイル
│   └── gallery.css       gallery.html専用スタイル
├── js/
│   ├── firebase-init.js  Firebase App / Firestoreの初期化
│   ├── canvas-draw.js    canvas描画処理(ペン・消しゴム・色選択)
│   ├── submit.js         Firestoreへの送信・クールダウン処理
│   ├── gallery.js         ギャラリーのリアルタイム表示処理
│   └── qr-display.js      QRコード描画処理
├── CLAUDE.md              プロジェクトの文脈まとめ(別PCで開いたとき用)
└── README.md              このファイル
```

---

## セットアップ手順(初回のみ・Windows環境)

このプロジェクトを初めて使うPCで行う手順です。1つずつ確認しながら進めてください。

### 1. Node.jsのインストール確認・インストール

1. コマンドプロンプト(またはPowerShell)を開き、以下を実行してバージョンを確認します。
   ```
   node -v
   npm -v
   ```
2. コマンドが見つからない場合は、[Node.js公式サイト](https://nodejs.org/)からLTS版のインストーラーをダウンロードして実行し、インストーラーの指示に従ってインストールします。
3. インストール後、コマンドプロンプトを開き直して再度 `node -v` で確認します。

### 2. Gitのインストール確認・インストール

1. コマンドプロンプトで以下を実行します。
   ```
   git --version
   ```
2. コマンドが見つからない場合は、[Git公式サイト](https://git-scm.com/download/win)からインストーラーをダウンロードし、基本的にはデフォルト設定のままインストールします。
3. インストール後、コマンドプロンプトを開き直して `git --version` で確認します。

### 3. Firebase CLIのインストール

```
npm install -g firebase-tools
```

インストール後、以下でログインします(ブラウザが開くのでGoogleアカウントでログインしてください)。

```
firebase login
```

### 4. Firebaseプロジェクトの作成(ブラウザでの手動操作が必要です)

> ⚠️ ここはブラウザでの手作業が必要です。以下の手順通りに操作してください。

1. [Firebaseコンソール](https://console.firebase.google.com/)にアクセスし、Googleアカウントでログインします。
2. 「プロジェクトを追加」をクリックし、プロジェクト名(例: `rakugaki-wall`)を入力します。
3. Googleアナリティクスの設定は「無効にする」で問題ありません。「プロジェクトを作成」をクリックします。
4. プロジェクトが作成されたら、左メニューの「構築(Build)」→「Firestore Database」を開きます。
5. 「データベースの作成」をクリックし、ロケーションを選択(例: `asia-northeast1`)して次へ進みます。
6. セキュリティルールの初期設定は「テストモードで開始」でも「本番環境モードで開始」でもどちらでも構いません(あとで `firestore.rules` の内容をデプロイして上書きします)。
7. 作成が完了したら、画面左上の歯車アイコン→「プロジェクトの設定」を開きます。
8. 「マイアプリ」セクションで「ウェブアプリを追加」(`</>` アイコン)をクリックし、アプリのニックネームを入力して登録します(Firebase Hostingの設定は不要なのでチェックを入れなくてOKです)。
9. 表示される `firebaseConfig` の内容(apiKey, authDomain, projectId など)をコピーし、このリポジトリの `config.js` の該当箇所に貼り付けます。
10. `config.js` の `DRAW_PAGE_URL` は、後述のGitHub Pages公開後の `draw.html` の実際のURLに書き換えます(例: `https://<GitHubユーザー名>.github.io/kaken.phone.oekaki/draw.html`)。

補足: Cloud StorageやFirebase Hosting、Cloud Functionsは**使用しません**。これらはBlazeプラン(クレジットカード登録)が必要になる場合がありますが、このプロジェクトではFirestore(無料のSparkプランで利用可)のみを使うため、カード登録なしで完結します。

### 5. Firestoreセキュリティルールの適用(firebase init)

プロジェクトフォルダ内でコマンドプロンプトを開き、以下を実行します。

```
cd <このリポジトリのフォルダ>
firebase init firestore
```

対話形式の質問には以下のように答えます。

- 「Please select an option」→ 既存プロジェクトを使う場合は `Use an existing project` を選び、手順4で作成したプロジェクトを選択
- 「What file should be used for Firestore Rules?」→ そのままEnter(`firestore.rules` を使う。既存ファイルを上書きするか聞かれたら **上書きしない(N)** を選んでください。このリポジトリの `firestore.rules` を使うため)
- 「What file should be used for Firestore indexes?」→ そのままEnter(`firestore.indexes.json`。こちらも上書きしないでください)

これにより `.firebaserc` が生成されます(使用するFirebaseプロジェクトIDが記録されます)。

ルールを実際にFirebaseへデプロイするには以下を実行します。

```
firebase deploy --only firestore:rules
```

### 6. GitHubリポジトリの作成とpush手順

1. [GitHub](https://github.com/)にログインし、右上の「+」→「New repository」から新しいリポジトリを作成します(例: `kaken.phone.oekaki`)。Public/Privateはどちらでも構いませんが、**GitHub Pagesを使うにはPublicにする必要があります**(Pro等の有料プランを使わない場合)。
2. 作成したら、コマンドプロンプトで以下を実行します(すでにgit管理されている場合はcloneやremote addのみでOKです)。
   ```
   cd <このリポジトリのフォルダ>
   git init
   git add .
   git commit -m "Initial commit: らくがきウォール"
   git branch -M main
   git remote add origin https://github.com/<あなたのユーザー名>/kaken.phone.oekaki.git
   git push -u origin main
   ```

### 7. GitHub PagesでのHosting有効化(ブラウザでの手動操作が必要です)

> ⚠️ ここはブラウザでの手作業が必要です。

1. GitHub上の該当リポジトリのページを開き、「Settings」タブをクリックします。
2. 左メニューの「Pages」を開きます。
3. 「Build and deployment」の「Source」で `Deploy from a branch` を選択します。
4. 「Branch」で `main` を選び、フォルダは `/ (root)` のまま「Save」をクリックします。
5. 数分待つと、ページ上部に公開URL(例: `https://<ユーザー名>.github.io/kaken.phone.oekaki/`)が表示されます。
6. このURLを使って `config.js` の `DRAW_PAGE_URL` を `https://<ユーザー名>.github.io/kaken.phone.oekaki/draw.html` に更新し、再度コミット・pushしてください。

### 8. Claude Code Desktop(Windows版)のインストール

1. [Claude Codeのダウンロードページ](https://claude.com/product/claude-code)にアクセスし、Windows版のインストーラーをダウンロードします。
2. インストーラーを実行し、指示に従ってインストールします。
3. 起動後、Anthropicアカウントでログインします。

---

## 次回以降にこのプロジェクトを開く方法(このPC)

1. Claude Code Desktopを起動する
2. 「Open Folder」からこのプロジェクトのフォルダを開く
3. `CLAUDE.md` の内容が自動的に文脈として読み込まれるので、それを見ながら作業を再開する

---

## 別のPCで作業を再開する場合の手順

1. Gitをインストールする(上記手順2を参照)
2. コマンドプロンプトで以下を実行してこのプロジェクトを取得する
   ```
   git clone https://github.com/<あなたのユーザー名>/kaken.phone.oekaki.git
   ```
3. Claude Code Desktopをインストールする(上記手順8を参照)
4. Claude Code Desktopでcloneしたフォルダを開く(自動的に `CLAUDE.md` が読み込まれる想定)
5. `config.js` はコミット済みのため、そのまま使える(値の再設定は不要)
6. 動作確認をする(下記「動作確認方法」を参照)

---

## 動作確認方法

このアプリはビルド不要のプレーンHTML/JS/CSSなので、ローカルの簡易サーバーで確認できます。

```
cd <このリポジトリのフォルダ>
npx serve .
```

表示されたURL(例: `http://localhost:3000`)にPCのブラウザでアクセスし、`/gallery.html` を開いてQRコードが表示されることを確認します。
スマホから参加確認する場合は、GitHub Pagesで公開した後の実際のURLでQRコードを読み込むか、同一Wi-Fi内であれば `npx serve .` が表示するネットワークアドレス(例: `http://192.168.x.x:3000/draw.html`)にスマホでアクセスして確認してください。

1. `draw.html` を開き、canvas上で指(またはマウス)で絵を描く
2. 「送信する」を押す → 初回はFirestoreへの書き込み許可の確認(ブラウザやFirebaseの設定によってはポップアップなどが出る場合があります)
3. 「送信しました!」画面に切り替わることを確認
4. `gallery.html` を開き、投稿がグリッドに表示されることを確認(複数タブで開いて同時に確認するとリアルタイム反映が分かりやすいです)

---

## Firestoreセキュリティルールについて

`firestore.rules` を参照してください。方針は以下の通りです。

- **読み取り**: 誰でも可(ギャラリーを不特定多数に見せるため)
- **書き込み**: 新規作成(create)のみ許可し、以下を検証する
  - フィールドは `image` と `createdAt` のみ
  - `image` は `data:image/png;base64,...` または `data:image/jpeg;base64,...` 形式の文字列
  - `image` のサイズが約900KB未満(Firestoreの1ドキュメント上限1MB対策)
  - `createdAt` はサーバー時刻(`request.time`)と一致すること
  - 更新・削除は禁止

投稿頻度の制限については、認証なしの匿名投稿という構成上、Firestoreルールだけでは厳密なレート制限はできません。`js/submit.js` でブラウザのlocalStorageを使った10秒間のクールダウンを実装していますが、これはあくまで善意のユーザー向けの連投防止であり、悪意のある利用者への完全な対策ではない点にご注意ください。より強固な対策が必要な場合は、Firebase App CheckやCloud Functions(要Blazeプラン)の導入を検討してください。
