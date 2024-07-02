let snippets = [];

function loadSnippets() {
  return fetch(chrome.runtime.getURL("snippets.json"))
    .then((response) => response.json())
    .then((data) => {
      snippets = data;
      return snippets;
    });
}

function applyCSS(selectedSnippets) {
  let style = document.getElementById("custom-css-snippets");
  if (!style) {
    style = document.createElement("style");
    style.id = "custom-css-snippets";
    document.head.appendChild(style);
  }

  const cssToApply = snippets
    .filter((snippet) => selectedSnippets.includes(snippet.id))
    .map((snippet) => snippet.css)
    .join("\n");

  style.textContent = cssToApply;
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "applyCSS") {
    applyCSS(request.selectedSnippets);
    sendResponse({ success: true });
  }
  return true;
});

loadSnippets().then(() => {
  chrome.storage.sync.get(["selectedSnippets"], (result) => {
    const selectedSnippets = result.selectedSnippets || [];
    applyCSS(selectedSnippets);
  });
});
