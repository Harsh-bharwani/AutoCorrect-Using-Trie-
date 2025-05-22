class TrieNode {
  constructor() {
    this.children = new Array(26).fill(null);
    this.isEndOfWord = false;
  }
}

function insert(root, word) {
  let node = root;
  for (let ch of word) {
    let idx = ch.charCodeAt(0) - "a".charCodeAt(0);
    if (node.children[idx] == null) node.children[idx] = new TrieNode();
    node = node.children[idx];
  }
  node.isEndOfWord = true;
}

function search(root, word) {
  let node = root;
  for (let ch of word) {
    let idx = ch.charCodeAt(0) - "a".charCodeAt(0);
    if (node.children[idx] == null) return false;
    node = node.children[idx];
  }
  return node.isEndOfWord;
}

function generateSuggestions(i, root, word, maxEdits, suggestions) {
  if (search(root, word)) {
    if (!suggestions[word] || suggestions[word] < maxEdits) {
      suggestions[word] = maxEdits;
    }
    return;
  }
  if (i >= word.length || maxEdits == 0) return;
  generateSuggestions(i + 1, root, word, maxEdits, suggestions);
  let idx = word.charCodeAt(i);
  let originalCh = word.charAt(i);
  for (let j = 0; j < 26; j++) {
    const ch = String.fromCharCode(j + "a".charCodeAt());
    // update
    word = word.slice(0, i) + ch + word.slice(i + 1);
    generateSuggestions(i + 1, root, word, maxEdits - 1, suggestions);
    word = word.slice(0, i) + originalCh + word.slice(i + 1);

    // insert
    word = word.slice(0, i) + ch + word.slice(i);
    generateSuggestions(i + 1, root, word, maxEdits - 1, suggestions);
    word = word.slice(0, i) + originalCh + word.slice(i + 1);

    // delete
    word = word.slice(0, i) + word.slice(i + 1);
    generateSuggestions(i + 1, root, word, maxEdits - 1, suggestions);
    word = word.slice(0, i) + originalCh + word.slice(i + 1);

    // transpositions
    if (i + 1 < word.length) {
      const wordArr = word.split("");
      [wordArr[i], wordArr[i + 1]] = [wordArr[i + 1], wordArr[i]];
      generateSuggestions(
        i + 2,
        root,
        wordArr.join(""),
        maxEdits - 1,
        suggestions
      );
    }
  }
}

function getSuggestions(root, input, maxEdits = 2) {
  let suggestions = {};
  generateSuggestions(0, root, input.toLowerCase(), maxEdits, suggestions);

  let sorted = Object.entries(suggestions)
    .map(([word, score]) => [word, maxEdits - score])
    .sort((a, b) => a[1] - b[1] || a[0].localeCompare(b[0]));

  return sorted;
}

const root = new TrieNode();

function loadDictionary(root, words) {
  for (let word of words) insert(root, word.toLowerCase());
}

async function loadDictionaryFromFile() {
    const response = await fetch("./dictionary.txt");
    const text = await response.text();
    const words = text.split(/\r?\n/).filter(Boolean);
    loadDictionary(root, words);
    console.log("Dictionary loaded!");
}

// Load dictionary on page load
window.onload = loadDictionaryFromFile;

function showLoading() {
  document.getElementById("searchIcon").style.display = "none";
  document.getElementById("loadingSpinner").style.display = "block";
}

function hideLoading() {
  document.getElementById("searchIcon").style.display = "block";
  document.getElementById("loadingSpinner").style.display = "none";
}

function autoCorrect() {
  let inputWord = document.querySelector("#input").value.trim();
  const msg = document.querySelector("#msg");

  if (inputWord.length === 0) {
    msg.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-keyboard"></i>
                        <p>Start typing to see intelligent word suggestions</p>
                    </div>
                `;
    return;
  }

  // Show loading for better UX
  showLoading();

  // Add small delay to show loading animation
  setTimeout(() => {
    let maxEdits = 3;
    let result = getSuggestions(root, inputWord, maxEdits);

    if (result.length > 0 && result[0][1] === 0) {
      msg.innerHTML = `
                        <div class="correct-message">
                            <i class="fas fa-check-circle"></i>
                            <span>Perfect! Word is already correct</span>
                        </div>
                    `;
    } else if (result.length > 0) {
      let suggestionsHtml = `
                        <div class="suggestions-title">
                            <i class="fas fa-lightbulb"></i>
                            Suggested corrections:
                        </div>
                        <ul class="suggestions-list">
                    `;

      let count = 0;
      for (let [word, edits] of result) {
        suggestionsHtml += `
                            <li class="suggestion-item" onclick="selectSuggestion('${word}')">
                                <span class="suggestion-word">${word}</span>
                                <span class="suggestion-badge">${edits} edit${
          edits !== 1 ? "s" : ""
        }</span>
                            </li>
                        `;
        count++;
        if (count >= 6) break;
      }

      suggestionsHtml += "</ul>";
      msg.innerHTML = suggestionsHtml;
    } else {
      msg.innerHTML = `
                        <div class="empty-state">
                            <i class="fas fa-search"></i>
                            <p>No suggestions found for "${inputWord}"</p>
                        </div>
                    `;
    }

    hideLoading();
  }, 150);
}

function selectSuggestion(word) {
  document.querySelector("#input").value = word;
  document.querySelector("#input").focus();
  autoCorrect();
}

// Add enter key support for better UX
document.getElementById("input").addEventListener("keypress", function (e) {
  if (e.key === "Enter") {
    const firstSuggestion = document.querySelector(".suggestion-item");
    if (firstSuggestion) {
      const word =
        firstSuggestion.querySelector(".suggestion-word").textContent;
      selectSuggestion(word);
    }
  }
});
