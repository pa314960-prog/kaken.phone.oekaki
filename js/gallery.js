// ============================================================
// gallery.js
// gallery.html のギャラリー表示のみを担当。
// Firestoreの posts コレクションを onSnapshot でリアルタイム購読し、
// 新着順にグリッド表示・件数カウント・新着ハイライトを行う。
// ============================================================

const MAX_POSTS = 200; // 表示件数の上限(過剰なDOM生成を防ぐ)

const galleryGrid = document.getElementById("galleryGrid");
const emptyState = document.getElementById("emptyState");
const postCountEl = document.getElementById("postCount");

let knownPostIds = new Set();
let isFirstSnapshot = true;

function renderEmptyState(count) {
  emptyState.style.display = count === 0 ? "flex" : "none";
  galleryGrid.style.display = count === 0 ? "none" : "grid";
}

function createPostElement(doc) {
  const data = doc.data();
  const item = document.createElement("div");
  item.className = "gallery-item";
  item.dataset.id = doc.id;

  const img = document.createElement("img");
  img.src = data.image;
  img.alt = "投稿されたらくがき";
  item.appendChild(img);

  const deleteBtn = document.createElement("button");
  deleteBtn.className = "delete-btn";
  deleteBtn.type = "button";
  deleteBtn.setAttribute("aria-label", "この投稿を削除");
  deleteBtn.textContent = "×";
  deleteBtn.addEventListener("click", () => {
    if (!confirm("この投稿を削除しますか?この操作は取り消せません。")) return;
    db.collection(POSTS_COLLECTION)
      .doc(doc.id)
      .delete()
      .catch((error) => {
        console.error("削除に失敗しました:", error);
        alert("削除に失敗しました。通信状態を確認してもう一度お試しください。");
      });
  });
  item.appendChild(deleteBtn);

  return item;
}

db.collection(POSTS_COLLECTION)
  .orderBy("createdAt", "desc")
  .limit(MAX_POSTS)
  .onSnapshot(
    (snapshot) => {
      const docs = snapshot.docs;
      postCountEl.textContent = String(docs.length);
      renderEmptyState(docs.length);

      galleryGrid.innerHTML = "";
      const currentIds = new Set();

      docs.forEach((doc) => {
        currentIds.add(doc.id);
        const el = createPostElement(doc);
        if (!isFirstSnapshot && !knownPostIds.has(doc.id)) {
          el.classList.add("new");
        }
        galleryGrid.appendChild(el);
      });

      knownPostIds = currentIds;
      isFirstSnapshot = false;
    },
    (error) => {
      console.error("ギャラリーの購読に失敗しました:", error);
    }
  );
