class TrieNode{
    constructor(){
        this.children=new Array(26).fill(null);
        this.isEndOfWord=false;
    }
}

function insert(root, word){
    let node=root;
    for(let ch of word){
        let idx=ch.charCodeAt(0)-'a'.charCodeAt(0);
        if(node.children[idx]==null) node.children[idx]=new TrieNode();
        node=node.children[idx];
    }
    node.isEndOfWord=true;
}

function search(root, word){
    let node=root;
    for(let ch of word){
        let idx=ch.charCodeAt(0)-'a'.charCodeAt(0);
        if(node.children[idx]==null) return false;
        node=node.children[idx];
    }
    return node.isEndOfWord;
}

function generateSuggestions(i, root, word, maxEdits, suggestions){
    if(search(root, word)){
        if(!suggestions[word] || suggestions[word]<maxEdits){
            suggestions[word]=maxEdits;
        }
        return;
    }
    if(i>=word.length || maxEdits ==0) return;
    generateSuggestions(i + 1, root, word, maxEdits, suggestions);
    let idx=word.charCodeAt(i);
    let originalCh=word.charAt(i);
    for(let j=0;j<26;j++){
        const ch=String.fromCharCode(j+'a'.charCodeAt());
        // update
        word = word.slice(0, i) + ch + word.slice(i+1);
        generateSuggestions(i + 1, root, word, maxEdits-1, suggestions);
        word = word.slice(0, i) + originalCh + word.slice(i+1);

        // insert
        word = word.slice(0, i) + ch + word.slice(i);
        generateSuggestions(i + 1, root, word, maxEdits-1, suggestions);
        word = word.slice(0, i) + originalCh + word.slice(i+1);

        // delete
        word=word.slice(0, i) + word.slice(i+1);
        generateSuggestions(i + 1, root, word, maxEdits-1, suggestions);
        word=word.slice(0, i) + originalCh + word.slice(i+1);

        // transpositions

        if(i+1<word.length)
        {
            const wordArr=word.split('');
            [wordArr[i], wordArr[i+1]]=[wordArr[i+1], wordArr[i]];
            generateSuggestions(i+2, root, wordArr.join(''), maxEdits-1, suggestions);
        }
    }
}


function sortSuggestions(suggestions, maxEdits) {
    return Object.entries(suggestions)
        .map(([word, editsLeft]) => [word, maxEdits - editsLeft])
        .sort((a, b) => {
            if (a[1] === b[1]) return a[0].localeCompare(b[0]);
            return a[1] - b[1];
        });
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

window.onload = loadDictionaryFromFile;

function autoCorrect(){
    let inputWord = document.querySelector("#input").value;  
    const msg=document.querySelector("#msg");
    if(inputWord.length==0 && msg.firstChild) {
        msg.removeChild(msg.firstChild);
        return;
    }
    let maxEdits=2;
    let result = getSuggestions(root, inputWord, maxEdits);    
    if (result[0][1] === 0) {
        let p = document.createElement("p");
        p.textContent = "Word is already correct";
        p.style.color = "green";
        p.style.fontSize = "25px";
        if (msg.firstChild) {
            msg.removeChild(msg.firstChild);
        }

        msg.appendChild(p);
        return;
    }

    let ul=document.createElement("ul");
    let ct=0;
    for (let [word, edits] of result) {
        let li=document.createElement("li");
        li.innerHTML=`${word} (Edits: ${edits})`;
        ul.appendChild(li);
        ct++;
        if(ct>6) break;
    }
    if (msg.firstChild) {
    msg.removeChild(msg.firstChild);
    }
    msg.appendChild(ul);
}