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
