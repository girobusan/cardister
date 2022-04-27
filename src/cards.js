import { v4 as uuid } from 'uuid';
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
hidden: boolean,
?status

}

*/
/////// UTIL ///////

function uniquifyTitle(title){
  if(!getByTitle(title)){return title}

  let num = 1;
  while( getByTitle(title + "_" + num) ){
    num+=1;
  }
  return title + "_" + num;
}

function setOrRet(obj, prop, val , retobj){
  if(val){
     obj[prop]= val;
     //modified!
     if(retobj){return retobj}
     return;
  }
  return obj[prop];
}

////// STORE ///////
const store = [];
//// CALLBACKS /////
const callbacks = {
  "test" :  ()=>console.log("test callback") 
}


// VIEWS AND RESULTS
// view = visual display of content (default = src)
// result = what to send to other block(default =  view)

const views = {
  js: (card)=>{ 
    let f = Function("card" , card.src);
    try{
      let r =  f(card);
      return r;
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


///// CARD FUNCTIONS COMBINED //////

export function cardFns(card){
  return {
    prop: (p,v)=>setOrRet(card.props , p , v , cardFns(card)),
    src:  (s)=>setOrRet(card, "src", s , cardFns(card)),
    type: (t)=>setOrRet(card, "type" , t , cardFns(card)),
    title: (t)=>{
        if(!t){return card.title}
        card.title = uniquifyTitle(t);
        return cardFns(card);
    },
    view: ()=>view(card),
    read: ()=>result(card),
    del:  ()=>remove(card),
  }
}

////// CARD FUNCTIONS //////

//danger!
export function list(){
  return store.slice();
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


export function setProp(card, propName , propVal){
  card.props[propName] = propVal;
}

export function tags(card){

}

export function tag(card, t , del){
   
}

export function add(card , successCallback , errCalback , uniquify){
  let t = getByTitle(card.title);
  let bi = getIndexByCondition(c=>c.id==card.id);
  if(bi!=-1){
    // Adding card with same id means rewritting card
    //:TODO: ask user!
    Object.assign(store[bi] , card );
    return successCallback ? successCallback(card) : true;
  }
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

export function makeNew(type, title){
  type = type || "markdown";
  title = uniquifyTitle(title || "Card")
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
