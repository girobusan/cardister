import { v4 as uuid } from 'uuid';
// uuid(); // ⇨ '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d'*
var MarkdownIt = require('markdown-it');
md = new MarkdownIt({
   html: true,
   linkify: true,
});
 
/*
 * {
   title: string,
   id: string,
   tags: string[],
   src: string,
   type: string,
   style: string,
   props: {},
   deleted: boolean,
   status: modified | stashed | saved // not saved at all | saved in broweser | saved

}

 */

const store = [];

const callbacks = {
  "test" :  ()=>console.log("test callback") 
}

// view = visual display of content (default = return src)
// result = what to send to other block(default =  view)
// editor = editor UI for the type (default=textarea)

const views = {
  js: (card)=>{ 
     let f = Function("card" , card.src);
     try{
       return f(card);

     }catch(err){
        return "Error: " + err.message;
     }
  },
  markdown: (card)=>{
    return md.render(card.src);
  },
  html: (card)=>{
     return card.src; //default behavior
  },
  text: (card)=>{
     return card.src
     .replace(/&/g, "&amp;")
     .replace(/</g, "&lt;")
     .replace(/>/g, "&gt;")
     .replace(/"/g, "&quot;")
     .replace(/'/g, "&#039;");
  }

}

const results = {
  text: (card)=>card.src
}


export function view(card){
   return views[card.type] ? views[card.type](card) : card.src ; 
}
export function result(card){
   return results[card.type] ? results[card.type](card) : card.src ; 
}

export function add(card , successCallback , errCalback){
  let t = byTitle(card.title);
  if(t){
    return errCalback ? errCalback("Title is not unique") : false;
  }
  store.push(card);
  return successCallback ? successCallback(card) : true;
}

export function remove(card){
   let idx = getIndexByField("id", card.id);
   if(idx==-1){return false}
   store.splice(idx,1); //:TODO: CALLBACK
   // card.deleted = true;
}

export function getByTitle(title){
  let idx =getIndexByField("title" , title); 
  if(idx==-1){return null}
  return store[idx]
   
}

export function getIndexByField(field , value){
  for(let i = 0 ; i < store.length ; i++){
    if(store[i][field]==value){
       return i;
    }
  }
  return -1;
}

export function makeNew(type){
   type = type || "markdown";
   return {
      type: type,
      title: "New card",
      src: "",
      tags: [],
      style: "",
      id: uuid()

   }
}
