# Smart Auto-Correct (Vanilla JS Project)

Smart Auto-Correct is a browser-based spell checker that uses a Trie data structure and edit-distance algorithms to suggest and autocorrect words in real time.

🔗 **Live Demo**: [https://auto-correct-using-trie.vercel.app/](https://auto-correct-using-trie.vercel.app/)

---

## 📁 Code Structure

```
smart-auto-correct/
├── index.html       # Main UI and structure
├── style.css        # Styling using Bootstrap + custom styles
├── script.js        # Core logic (Trie, autocorrect, suggestions)
├── words.txt        # Word dictionary (used to build the Trie)
├── trie.cpp         # Initial logic written in C++  
├── images           # To keep the favicon image
```

### Key Components:
- **Trie Construction**: All valid words are stored in a trie for fast prefix and full-word search.
- **generateSuggestions()**: Recursively finds all valid word transformations within a given edit distance.
- **getSuggestions()**: Collects, ranks, and displays suggestions.
- **Title Animator**: Dynamically animates spelling corrections in the page title.

---

## ▶️ How to Run

1. **Download or clone** the repository:
   ```bash
   git clone https://github.com/Harsh-bharwani/smart-auto-correct
   cd smart-auto-correct
   ```

2. **Open `index.html` in your browser**  
   No build tools or server required — everything runs client-side.

> ⚠️ Make sure `words.txt` is in the same directory if you're loading a custom dictionary via fetch.

---

## ✅ Assumptions Made

- The dictionary (`words.txt`) contains commonly used English words (you can swap this with your own list).
- The max edit distance is capped (e.g., `k=2` or `k=3`) for performance reasons.
- Suggestions are case-insensitive but displayed in lowercase.
- Browser supports ES6 features (like `Set`, `Map`, arrow functions, `let/const`, etc.).

---

