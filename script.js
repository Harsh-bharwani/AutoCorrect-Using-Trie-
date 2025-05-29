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

function generateSuggestions(i, root, word, maxEdits, suggestions, visited){
    const key = i+ "|" + word + "|" + maxEdits; // where 'step' is the i-th step in
    if(search(root, word)){
        if(!suggestions[word] || suggestions[word]<maxEdits){
            suggestions[word]=maxEdits;
        }
        return;
    }
    if(i>=word.length || maxEdits ==0) return;
    if(visited.has(key)) return;
    visited.add(key);
    // Directly jumping to the next index
    generateSuggestions(i + 1, root, word, maxEdits, suggestions, visited);
    for(let j=0;j<26;j++){
        const ch=String.fromCharCode(j+'a'.charCodeAt());
        // update
        generateSuggestions(i + 1, root, word.slice(0, i) + ch + word.slice(i+1), maxEdits-1, suggestions, visited);
        // insert
        generateSuggestions(i + 1, root, word.slice(0, i) + ch + word.slice(i), maxEdits-1, suggestions, visited);
    }
    // delete
    generateSuggestions(i + 1, root, word.slice(0, i) + word.slice(i+1), maxEdits-1, suggestions, visited);
    // transpositions
    if(i+1<word.length)
    {
        const wordArr=word.split('');
        [wordArr[i], wordArr[i+1]]=[wordArr[i+1], wordArr[i]];
        generateSuggestions(i+2, root, wordArr.join(''), maxEdits-1, suggestions, visited);
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
function prefixMatch(input, str){
    let ct=0;
    for(let i=0;i<Math.min(input.length, str.length);i++){
        if(input.charAt(i)!=str.charAt(i)) return ct;
        ct++;
    }
    return ct;
}
function compare(){
    return (a, b)=>{
        if(a[1]!=b[1]) return a[1]-b[1];
        const p1=prefixMatch(a[0], input);
        const p2=prefixMatch(b[0], input);
        return p2-p1;
    }
}

function getSuggestions(root, input, maxEdits) {
    let suggestions = {};
    let visited=new Set();
    generateSuggestions(0, root, input.toLowerCase(), maxEdits, suggestions, visited);

    let sorted = Object.entries(suggestions)
        .map(([word, score]) => [word, maxEdits - score])
        .sort(compare(input));
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

let timer;
function debounce(delay=300){
    clearTimeout(timer);
    timer=setTimeout(autoCorrect, delay);
}

function autoCorrect(){    
    let input = document.querySelector("#input").value;   
    const msg=document.querySelector("#msg");
    if(input.length==0 && msg.firstChild) {
        msg.removeChild(msg.firstChild);
        return;
    }
    let maxEdits=2;
    let result = getSuggestions(root, input, maxEdits);    
    console.log(result);
    if(result.length==0){
        let p = document.createElement("p");
        p.textContent = "Word not found";
        p.style.color = "orange";
        p.style.fontSize = "25px";
        if (msg.firstChild) {
            msg.removeChild(msg.firstChild);
        }

        msg.appendChild(p);
        return;
    }

    if (result.length==1) {
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
