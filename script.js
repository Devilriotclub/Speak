
const editor = document.getElementById("editor");
let currentLang = "de-DE";

function showTab(id) {
  document.querySelectorAll('.tab-content').forEach(el => el.style.display = 'none');
  document.getElementById("tab-" + id).style.display = 'flex';
}

window.addEventListener("DOMContentLoaded", () => {
  const saved = localStorage.getItem("autosaveContent");
  if (saved) {
    editor.innerHTML = saved;
    updateWordCount();
  }
});
editor.addEventListener("input", () => {
  localStorage.setItem("autosaveContent", editor.innerHTML);
  updateWordCount();
});

function toggleDarkMode() {
  document.body.classList.toggle("dark");
  editor.classList.toggle("dark");
}
function format(cmd) {
  document.execCommand(cmd, false, null);
}
function setColor(color) {
  document.execCommand("foreColor", false, color);
}
function setHighlight(color) {
  document.execCommand("hiliteColor", false, color);
}
function speakText() {
  const text = editor.innerText;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = currentLang;
  window.speechSynthesis.speak(utterance);
}
function setLanguage(lang) {
  currentLang = lang;
}
function highlightSearch(term) {
  const text = editor.innerHTML.replace(/<mark>|<\/mark>/g, "");
  if (term.length > 1) {
    const regex = new RegExp(`(${term})`, 'gi');
    editor.innerHTML = text.replace(regex, "<mark>$1</mark>");
  } else {
    editor.innerHTML = text;
  }
}
function handleFileUpload(files) {
  for (const file of files) {
    const reader = new FileReader();
    reader.onload = function(e) {
      if (file.type.startsWith("image/")) {
        const img = `<img src="${e.target.result}" style="max-width:100%;"/>`;
        document.execCommand("insertHTML", false, img);
      } else {
        const linkTag = `<a href="${e.target.result}" download="${file.name}">${file.name}</a>`;
        document.execCommand("insertHTML", false, linkTag);
      }
    };
    reader.readAsDataURL(file);
  }
}
function shareLink() {
  const shareUrl = window.location.href;
  if (navigator.share) {
    navigator.share({
      title: "Mein Dokument",
      text: "Hier ist mein Text",
      url: shareUrl
    }).catch((err) => console.log("Teilen abgebrochen:", err));
  } else {
    prompt("Link kopieren:", shareUrl);
  }
}
function addTodo() {
  const html = '<input type="checkbox" onclick="this.nextSibling.style.textDecoration = this.checked ? \'line-through\' : \'none\';"><span contenteditable="true"> To-Do</span><br>';
  document.execCommand("insertHTML", false, html);
}
function updateWordCount() {
  const text = editor.innerText.trim();
  const count = text ? text.split(/\s+/).length : 0;
  document.getElementById("wordCount").textContent = "Wörter: " + count;
}
document.getElementById("fontSize").addEventListener("change", function () {
  document.execCommand("fontSize", false, "7");
  let fonts = editor.getElementsByTagName("font");
  for (let i = 0; i < fonts.length; i++) {
    if (fonts[i].size === "7") {
      fonts[i].removeAttribute("size");
      fonts[i].style.fontSize = this.value;
    }
  }
});
document.getElementById("fontFamily").addEventListener("change", function () {
  document.execCommand("fontName", false, this.value);
});

function insertLink() {
  const url = prompt("Link-URL eingeben:");
  const text = prompt("Anzeigetext:");
  if (url && text) {
    const html = `<a href="${url}" target="_blank">${text}</a>`;
    document.execCommand("insertHTML", false, html);
  }
}

function setSpacing(mode) {
  editor.style.lineHeight = mode === 'double' ? '2' : '1.4';
}
function setMargin(size) {
  editor.style.padding = size === 'large' ? '60px' : '20px';
}

function addComment() {
  const selection = window.getSelection();
  if (!selection.rangeCount) return;
  const range = selection.getRangeAt(0);
  const comment = prompt("Kommentar eingeben:");
  if (!comment) return;
  const span = document.createElement("span");
  span.className = "comment";
  span.setAttribute("title", comment);
  span.style.borderBottom = "2px dotted orange";
  span.style.cursor = "help";
  span.textContent = range.toString();
  range.deleteContents();
  range.insertNode(span);
}

function removeComments() {
  const comments = document.querySelectorAll(".comment");
  comments.forEach(c => {
    const textNode = document.createTextNode(c.textContent);
    c.parentNode.replaceChild(textNode, c);
  });
}

function addComment() {
  const selection = window.getSelection();
  if (!selection.rangeCount) return;
  const range = selection.getRangeAt(0);
  const commentText = prompt("Was möchtest du kommentieren?");
  const author = prompt("Name (optional):") || "Anonym";

  if (!commentText) return;

  const span = document.createElement("span");
  span.className = "comment";
  span.setAttribute("data-id", Date.now());
  span.style.borderBottom = "2px dotted orange";
  span.style.cursor = "pointer";
  span.textContent = range.toString();
  range.deleteContents();
  range.insertNode(span);

  const box = document.getElementById("commentBox");
  const entry = document.createElement("div");
  entry.className = "comment-entry";
  entry.innerHTML = `<strong>${author}</strong>${commentText}`;
  entry.setAttribute("data-id", span.getAttribute("data-id"));
  box.appendChild(entry);
}

function removeComments() {
  const comments = document.querySelectorAll(".comment");
  const commentBox = document.getElementById("commentBox");
  comments.forEach(c => {
    const id = c.getAttribute("data-id");
    const matching = commentBox.querySelector(`[data-id="${id}"]`);
    if (matching) matching.remove();
    const textNode = document.createTextNode(c.textContent);
    c.parentNode.replaceChild(textNode, c);
  });
}

document.getElementById("commentBox").addEventListener("click", function(e) {
  const entry = e.target.closest(".comment-entry");
  if (!entry || entry.querySelector("textarea")) return;

  const originalText = entry.innerText.replace(/^[^\n]+\n/, "").trim();
  const author = entry.querySelector("strong").innerText;

  const textarea = document.createElement("textarea");
  textarea.value = originalText;

  const saveBtn = document.createElement("button");
  saveBtn.textContent = "Speichern";
  saveBtn.onclick = function() {
    entry.innerHTML = `<strong>${author}</strong>` + textarea.value;
  };

  const cancelBtn = document.createElement("button");
  cancelBtn.textContent = "Abbrechen";
  cancelBtn.onclick = function() {
    entry.innerHTML = `<strong>${author}</strong>` + originalText;
  };

  entry.innerHTML = "";
  entry.appendChild(textarea);
  entry.appendChild(saveBtn);
  entry.appendChild(cancelBtn);
});
