import { v4 as uuid } from 'uuid';
// uuid(); // ⇨ '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d'*
var MarkdownIt = require('markdown-it');
const md = new MarkdownIt({
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

const fnCache = {};

function uniquifyTitle(title){
  if(!getByTitle(title)){return title}

  let num = 1;
  while( getByTitle(title + "_" + num) ){
      num+=1;
  }
  return title + "_" + num;
}

const views = {
  js: (card)=>{ 
    if(card.modified && fnCache[card.title]){
      fnCache[card.title] = "";
    }
    if(!card.modified && fnCache[card.title]){
      return fnCache[card.title](card);
    }
    let f = Function("card" , card.src);
    try{
      let r =  f(card);
      fnCache[card.title] = f;

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
  if(results[card.type]){
      return results[card.type](card);
  }
  if(views[card.type]){
      return views[card.type](card);
  }
  return card.src;
}

export function add(card , successCallback , errCalback , uniquify){
  let t = getByTitle(card.title);
  if(t && !uniquify){
    return errCalback ? errCalback("Title is not unique") : false;
  }
  card.title = uniquifyTitle(card.title);
  card.id = card.id || uuid();
  store.push(card);
  //:TODO Update Call!!
  return successCallback ? successCallback(card) : true;
}

export function remove(card){
   let idx = getIndexByCondition(c=>c.id==card.id);
   if(idx==-1){return false}
   store.splice(idx,1); //:TODO: CALLBACK
   return true;
   // card.deleted = true;
}

export function getByTitle(title){
  let idx =getIndexByCondition( c=>c.title==title); 
  if(idx==-1){return null}
  return store[idx]
   
}

export function getIndexByCondition(conditionFn){
  for(let i = 0 ; i < store.length ; i++){
    if(conditionFn( store[i] )){
       return i;
    }
  }
  return -1;
}

export function makeNew(type){
   type = type || "markdown";
   const title = uniquifyTitle("Card")
   return {
      type: type,
      title: title,
      src: "",
      tags: [],
      style: "",
      id: uuid(),
      props: {}
   }
}
