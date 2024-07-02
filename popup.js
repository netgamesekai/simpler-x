let snippets = [];

function loadSnippets() {
  return fetch(chrome.runtime.getURL("snippets.json"))
    .then((response) => response.json())
    .then((data) => {
      snippets = data;
      return snippets;
    });
}

function applySnippets(selectedSnippets) {
  return new Promise((resolve) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(
        tabs[0].id,
        { action: "applyCSS", snippets, selectedSnippets },
        resolve
      );
    });
  });
}

function saveAndApplySnippets(selectedSnippets) {
  return new Promise((resolve) => {
    chrome.storage.sync.set({ selectedSnippets }, () => {
      applySnippets(selectedSnippets).then(resolve);
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("snippets");

  loadSnippets().then(() => {
    chrome.storage.sync.get(["selectedSnippets"], (result) => {
      let selectedSnippets = result.selectedSnippets || [];

      snippets.forEach((snippet) => {
        const label = document.createElement("label");
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.id = snippet.id;
        checkbox.checked = selectedSnippets.includes(snippet.id);
        checkbox.addEventListener("change", () => {
          if (checkbox.checked) {
            selectedSnippets.push(snippet.id);
          } else {
            selectedSnippets = selectedSnippets.filter(
              (id) => id !== snippet.id
            );
          }
          saveAndApplySnippets(selectedSnippets).then(() => {
            console.log("Snippets applied:", selectedSnippets);
          });
        });
        label.appendChild(checkbox);
        label.appendChild(document.createTextNode(snippet.name));
        container.appendChild(label);
      });

      applySnippets(selectedSnippets);
    });
  });
});
