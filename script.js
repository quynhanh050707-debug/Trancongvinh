"use strict";

const pages = [...document.querySelectorAll(".page")];
const navigationLinks = document.querySelectorAll(".main-nav a, .bottom-nav a");
const menu = document.getElementById("main-nav");
const menuButton = document.getElementById("menu-button");
const dialog = document.getElementById("search-dialog");
const searchInput = document.getElementById("search-input");
const resultsList = document.getElementById("search-results");
const searchMessage = document.getElementById("search-message");

// Mỗi mục trong menu mở một phần của index.html bằng địa chỉ có dấu #.
function showPage(moveFocus = false) {
  const target = document.getElementById(location.hash.slice(1));
  const selected = target?.closest(".page") || document.getElementById("kinh-nghiem");

  for (const page of pages) {
    page.hidden = page !== selected;
  }
  for (const link of navigationLinks) {
    if (link.hash === "#" + selected.id) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  }

  const brand = document.querySelector(".brand").lastElementChild.textContent;
  document.title = selected.dataset.title + " | " + brand;

  const entry = target?.closest("[data-entry]");
  if (entry) {
    entry.scrollIntoView({ block: "start" });
  } else if (moveFocus) {
    window.scrollTo(0, 0);
  }

  if (moveFocus) {
    const heading = entry ? entry.querySelector("h2") : selected.querySelector("h1");
    heading.tabIndex = -1;
    heading.focus({ preventScroll: true });
  }
}

function setMenu(open) {
  menu.classList.toggle("is-open", open);
  menuButton.setAttribute("aria-expanded", String(open));
  menuButton.setAttribute("aria-label", open ? "Đóng menu" : "Mở menu");
}

menuButton.addEventListener("click", () => {
  setMenu(menuButton.getAttribute("aria-expanded") !== "true");
});

document.addEventListener("click", (event) => {
  if (!menuButton.contains(event.target) && !menu.contains(event.target)) setMenu(false);

  const link = event.target.closest('a[href^="#"]');
  if (!link || link.classList.contains("skip-link")) return;
  setMenu(false);
  if (dialog.open) dialog.close();

  // Bấm lại mục đang mở vẫn đưa người đọc về đúng vị trí.
  if (link.hash === location.hash) {
    event.preventDefault();
    showPage(true);
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && menu.classList.contains("is-open")) {
    setMenu(false);
    menuButton.focus();
  }
});
window.matchMedia("(max-width: 52rem)").addEventListener("change", () => setMenu(false));
window.addEventListener("hashchange", () => {
  setMenu(false);
  showPage(true);
});
document.querySelector(".skip-link").addEventListener("click", (event) => {
  event.preventDefault();
  document.getElementById("noi-dung").focus();
});

// Tìm kiếm được cả khi người đọc nhập tiếng Việt không dấu.
function foldText(text) {
  return text.toLocaleLowerCase("vi").normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").trim();
}

const searchItems = [];
for (const link of menu.querySelectorAll("a")) {
  const page = document.getElementById(link.hash.slice(1));
  const text = page.querySelector("[data-entry]") ? page.querySelector("h1").textContent : page.textContent;
  searchItems.push({ id: page.id, title: page.dataset.title, text: foldText(text), isPage: true });
}
for (const entry of document.querySelectorAll("[data-entry]")) {
  const title = entry.querySelector("h2").textContent;
  searchItems.push({ id: entry.id, title, text: foldText(entry.textContent), isPage: false });
}

function updateSearch() {
  const words = foldText(searchInput.value).split(/\s+/).filter(Boolean);
  const matches = words.length
    ? searchItems.filter(item => words.every(word => item.text.includes(word)))
    : searchItems.filter(item => item.isPage);

  resultsList.replaceChildren();
  for (const item of matches) {
    const link = document.createElement("a");
    link.href = "#" + item.id;
    link.textContent = item.title;
    const row = document.createElement("li");
    row.append(link);
    resultsList.append(row);
  }

  searchMessage.textContent = words.length
    ? (matches.length ? matches.length + " kết quả" : "Chưa có kết quả. Hãy thử từ khóa khác.")
    : "Các trang trong portfolio";
}

document.getElementById("open-search").addEventListener("click", () => {
  setMenu(false);
  searchInput.value = "";
  updateSearch();
  dialog.showModal();
  searchInput.focus();
});
document.getElementById("close-search").addEventListener("click", () => dialog.close());
searchInput.addEventListener("input", updateSearch);

showPage();
