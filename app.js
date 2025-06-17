const form = document.getElementById("shortcutForm");
const list = document.getElementById("shortcutList");
const searchInput = document.getElementById("search");
const catFilter = document.getElementById("categoryFilter");
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const title = document.getElementById("title").value.trim();
  const url = document.getElementById("url").value.trim();
  const category = document.getElementById("category").value.trim();
  const tags = document.getElementById("tags").value.trim();
  const desc = document.getElementById("desc").value.trim();
  const thumb = document.getElementById("thumb").value.trim();
  const newShortcut = { title, url, category, tags, desc, thumb, favorite: false };

  const data = JSON.parse(localStorage.getItem("shortcuts") || "[]");
  data.push(newShortcut);
  localStorage.setItem("shortcuts", JSON.stringify(data));
  form.reset();
  loadShortcuts();
});

function deleteShortcut(index) {
  const data = JSON.parse(localStorage.getItem("shortcuts") || "[]");
  data.splice(index, 1);
  localStorage.setItem("shortcuts", JSON.stringify(data));
  loadShortcuts();
}

function getCategoryMeta(category) {
  const map = {
    "oyun": { color: "#e74c3c", icon: "🎮" },
    "kod": { color: "#3498db", icon: "💻" },
    "video": { color: "#9b59b6", icon: "🎥" },
    "eğitim": { color: "#2ecc71", icon: "📘" },
    "genel": { color: "#7f8c8d", icon: "📁" }
  };
  return map[category] || { color: "#bdc3c7", icon: "📄" };
}


function loadShortcuts() {
  const rawData = JSON.parse(localStorage.getItem("shortcuts") || "[]");
  const query = searchInput?.value.toLowerCase() || "";
  const selectedCategory = catFilter?.value || "";

  const filtered = rawData.filter(item => {
    const matchQuery =
      item.title.toLowerCase().includes(query) ||
      (item.category || "").toLowerCase().includes(query) ||
      (item.tags || "").toLowerCase().includes(query);
    const matchCategory = !selectedCategory || (item.category === selectedCategory);
    return matchQuery && matchCategory;
  });

  // Kategori filtrelerini güncelle
  const categories = [...new Set(rawData.map(i => i.category).filter(Boolean))];
  catFilter.innerHTML = '<option value="">Tüm Kategoriler</option>' +
    categories.map(c => `<option value="${c}">${c}</option>`).join("");

  list.innerHTML = "";
  filtered.forEach((item, index) => {
const div = document.createElement("div");
div.className = "shortcut";
div.setAttribute("draggable", "true");
div.setAttribute("data-index", index);
div.addEventListener("dragstart", handleDragStart);
div.addEventListener("dragover", handleDragOver);
div.addEventListener("drop", handleDrop);
div.addEventListener("dragend", handleDragEnd);
div.innerHTML = `
  ${item.thumb ? `<img src="${item.thumb}" class="thumb-icon" alt="thumb">` : ""}
  <div style="flex: 1;">
    <a href="${item.url}" target="_blank"><strong>${item.title}</strong></a>
    <p>${item.desc || ""}</p>
    <div>
      ${(item.tags || "").split(",").map(t =>
        `<span class="tag" data-tag="${t.trim()}">${t.trim()}</span>`).join(" ")}
    </div>
${item.category ? (() => {
  const meta = getCategoryMeta(item.category);
  return `<div class="category-badge" style="background:${meta.color};">
    ${meta.icon} ${item.category}
  </div>`;
})() : ""}
  </div>
  <div>

    <button onclick="deleteShortcut(${index})">Sil</button>
  </div>
`;
    (item.favorite ? favList : list).appendChild(div);
  });
}

let draggedIndex = null;

function handleDragStart(e) {
  draggedIndex = parseInt(this.getAttribute("data-index"));
  this.style.opacity = "0.5";
}

function handleDragOver(e) {
  e.preventDefault();
  this.style.border = "2px dashed #007bff";
}

function handleDrop(e) {
  e.preventDefault();
  const droppedIndex = parseInt(this.getAttribute("data-index"));
  if (draggedIndex !== null && draggedIndex !== droppedIndex) {
    const data = JSON.parse(localStorage.getItem("shortcuts") || "[]");
    const [moved] = data.splice(draggedIndex, 1);
    data.splice(droppedIndex, 0, moved);
    localStorage.setItem("shortcuts", JSON.stringify(data));
    loadShortcuts();
  }
}

function handleDragEnd() {
  this.style.opacity = "1";
  this.style.border = "none";
}


// Etiket tıklama → filtreleme
document.addEventListener("click", e => {
  if (e.target.classList.contains("tag")) {
    searchInput.value = e.target.dataset.tag;
    loadShortcuts();
  }
});

function toggleFavorite(id) {
  const data = JSON.parse(localStorage.getItem("shortcuts") || "[]");
  const index = data.findIndex(x => x.id === id);
  if (index !== -1) {
    data[index].favorite = !data[index].favorite;
    localStorage.setItem("shortcuts", JSON.stringify(data));
    loadShortcuts();
  }
}


// Arama ve kategori değişimi
searchInput.addEventListener("input", loadShortcuts);
catFilter.addEventListener("change", loadShortcuts);

// İlk yükleme
loadShortcuts();
