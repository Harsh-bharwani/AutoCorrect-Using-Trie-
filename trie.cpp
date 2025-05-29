#include<bits/stdc++.h>
#include<fstream> // for file input/ output
using namespace std;
string input;

struct TrieNode{    
    TrieNode* children[26];
    bool isEndOfWord;
    TrieNode(){
        for(int i=0;i<26;i++){
            children[i]=nullptr;
        }
        isEndOfWord=false;
    }
}; 

void insert(TrieNode* root, const string& word){
    TrieNode* node=root;
    for(char ch: word){
        int idx=ch-'a';
        if(node->children[idx]==nullptr) {
            node->children[idx]=new TrieNode();
        }
        node=node->children[idx];
    }   
    node->isEndOfWord=true;
}

bool search(TrieNode* root, const string& word){
    TrieNode* node=root;
    for(char ch: word){
        int idx=ch-'a';
        if(node->children[idx]==nullptr){
            return false;
        }
        node=node->children[idx];
    }
    return node->isEndOfWord;
}

void loadDisctionary(TrieNode* root, const string& filename){
    ifstream file(filename); // creating the new input filestream for the given file
    if(!file.is_open()){
      cerr<<"File is failed to open.";
      return;  
    }
    string word;
    while(file>>word){ // accessing words of the file stream
        insert(root, word);
    }
    file.close();
}
void  generateSuggestions(int i, TrieNode* root, string& word, int maxEdits, unordered_map<string, int>& suggestions){
    if(search(root, word)) {   
        if(suggestions.find(word)!=suggestions.end()){
            if(suggestions[word]<maxEdits){
                suggestions[word]= maxEdits;
            }
            return;
        }
        suggestions.insert({word, maxEdits});
        return;
    }
    if(i==word.length() || maxEdits==0) return;
    // calling without editing
    generateSuggestions(i+1, root, word, maxEdits, suggestions);
    int idx=word[i]-'a';
    for(int j=0;j<26;j++){
        // update
        word[i]=j+'a';
        generateSuggestions(i+1, root, word, maxEdits-1, suggestions);
        word[i]=idx+'a';
        // insert
        word.insert(i, string(1, j+'a'));  
        generateSuggestions(i+1, root, word, maxEdits-1, suggestions);
        word.erase(i, 1);
        // delete
        word.erase(i, 1);
        generateSuggestions(i, root, word, maxEdits-1, suggestions);
        word.insert(i, string(1, idx+'a'));
        // transpositions (swapping)
        if(i+1<word.length()) {
            swap(word[i], word[i+1]);
            generateSuggestions(i+2, root, word, maxEdits-1, suggestions);
            swap(word[i], word[i+1]);
        }
    }
}

int prefixMatch(string a, string b){
    int ct=0;
    for(int i=0, j=0;i<a.size() && j<b.size();i++, j++){
        if(a[i]!=b[i]) break;
        ct++;
    }
    return ct;
}

bool compare(pair<string, int>& p1, pair<string, int>& p2){
    if(p1.second==p2.second) return prefixMatch(p1.first, input)>prefixMatch(p2.first, input);
    return p1.second>p2.second;
}


int main(){
    TrieNode* root=new TrieNode();  
    loadDisctionary(root, "dictionary.txt");     
    cin>>input;
    insert(root, "tumbler");
    if(search(root, input)){
        cout<<"Element is there";
    }
    else{
        unordered_map<string, int> suggestions;
        int maxEdits=3;
        generateSuggestions(0, root, input, maxEdits, suggestions);
        vector<pair<string, int>> sortedSuggestions(suggestions.begin(), suggestions.end());
        sort(sortedSuggestions.begin(), sortedSuggestions.end(), compare);
        for(auto& pair:sortedSuggestions){
            cout<<pair.first<<" "<<maxEdits-pair.second<<'\n';
        }
    }
}