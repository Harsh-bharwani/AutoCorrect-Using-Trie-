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
// Accessing the required elements
const input = document.querySelector("#input");   
const crtMsg=document.querySelector("#crtMsg");
const def=document.querySelector("#default");
const suggestions=document.querySelector("#suggestions");
const correctedTitle=document.querySelector("#correctedTitle");

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

function setTitle(word, delay){
    return new Promise((resolve)=>{
        setTimeout(()=>{
            split1=word.split(" ");
            if(split1[0]==="Smart")  {
                if(split1[1].endsWith("Correct")){
                    correctedTitle.innerHTML=split1[0].fontcolor("orange") + " Auto-" + "Correct".fontcolor("lightgreen");
                }
                else{
                    correctedTitle.innerHTML=split1[0].fontcolor("orange") + " " + split1[1];
                }
            }
            else if(split1[1].endsWith("Correct")){
                    correctedTitle.innerHTML=split1[0]+ " Auto-" + "Correct".fontcolor("lightgreen");
            }
            else{
                correctedTitle.textContent=word;
            }
            resolve();
        }, delay);
    }) 
}

setInterval(correctTitle, 4000);

async function correctTitle(){
    const corrections=['Smart Auto-Corect', 'Smrat Auto-Correct', 'Smart Auto-Correct', 'Smartt Auto-Corect'];
    for(let word of corrections){
        await setTitle(word, 1000);
    }
}


let timer;
function debounce(delay=300){
    // console.log(input.value);
    
    clearTimeout(timer);
    timer=setTimeout(autoCorrect, delay);
}

function updateText(event){    
    input.value=event.target.children[0].textContent;
    def.classList.add("d-none");
    suggestions.classList.add("d-none");
    suggestions.innerHTML="";
    crtMsg.classList.remove("d-none");
}

function autoCorrect(){    
    if(input.value.length==0) { // No input is entered
        def.classList.remove("d-none");
        def.children[0].className="bi bi-keyboard text-secondary";
        def.children[1].textContent=`Start typing to see intelligent word suggestions`;
        crtMsg.classList.add("d-none");
        suggestions.classList.add("d-none");
        return;
    }
    let maxEdits=2;
    let result = getSuggestions(root, input.value, maxEdits);  
    // console.log(result);
    console.log(result.length);
    
    if(result.length===0){ // No suggestions generated under given maxEdits
        // console.log("no result");
        def.classList.remove("d-none");
        def.children[0].className="bi bi-search text-secondary";
        def.children[1].textContent=`No suggestions found for "${input.value}"`;
        crtMsg.classList.add("d-none");
        suggestions.classList.add("d-none");
        return;
    }

    if (result.length===1) { // Input word is already correct 
        def.classList.add("d-none");
        suggestions.classList.add("d-none");
        suggestions.innerHTML="";
        crtMsg.classList.remove("d-none");
        return;
    }
    // console.log(result);

    def.classList.add("d-none");
    crtMsg.classList.add("d-none");
    suggestions.classList.remove("d-none");
    suggestions.innerHTML="";
    for(let i=0;i<result.length && i<5;i++)
    {
        let div=document.createElement("div");
        let p=document.createElement("p");
        p.className="my-auto fw-semibold";
        p.textContent=result[i][0];
        div.append(p);
        let btn=document.createElement("button");
        btn.className="btn btn-primary rounded-pill";
        btn.textContent=`${result[i][1]} edits`;
        div.append(btn);
        div.className="rounded rounded-4 mt-2 p-3 d-flex justify-content-between shadow";
        div.onclick=updateText;
        suggestions.append(div);
    }
}

window.addEventListener("load",loadDictionaryFromFile);
window.addEventListener("load",correctTitle());