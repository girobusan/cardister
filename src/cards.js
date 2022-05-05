import { v4 as uuid } from 'uuid';
var MarkdownIt = require('markdown-it')

const md = new MarkdownIt({
  html: true,
  linkify: true,
})
.use(require("./lib/markdown-it-multimd-table.js") , {multiline: true, headerless: true});
;

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
    if(num>10000){console.error("Can not uniquify", title) ; break}
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

export function setCallback(evt, fn){
   let clbid = uuid();
   callbacks[uuid] = fn;
   return clbid;
}

export function removeCallback(evt, clbid){
    delete(callbacks[clbid]);
}

function modified(p){
  Object.values(callbacks).forEach(
   e=>e(p)
  )
}

// VIEWS AND RESULTS
// view = visual display of content (default = src)
// result = what to send to other block(default =  view)
function makeEmbeds(md){
  const replacer=function(m,p1){
     // console.log("REPLACER" , m , p1);
     let emb = getByTitle(p1.trim());
     if(emb){
        return `<span class="cardisterEmbed" data-etitle="${p1}"></span>`
        }else{
        return p1+"?"
        }
     //return "+"+ p1 + "+";
  }
  const withTags =  md.replace(/{{([^}]+)}}/g , replacer);
  const outer = document.createElement("span");
  outer.innerHTML = withTags;
  const embeds = outer.querySelectorAll(".cardisterEmbed");
  if(embeds.length==0){return outer}

  embeds.forEach(e=>{
      // console.log("EMBED" , e);
      let ec = getByTitle(e.dataset.etitle);
      console.log(ec);
      let ev = view(ec);
      // console.log("EMBEDDED VIEW" , ev);
      try{
          e.appendChild(ev);
      }catch{
         typeof(ev)==='string' ? e.innerHTML = ev : e.innerHTML = ev.toString();
      }

  })
  return outer;
}

const views = {
  js: (card)=>{ 
    try{
    let f = Function("card" , card.src);
      let r =  f(card);
      return r;
    }catch(err){
      return "<span style='color:orangered'>Error: " + err.message + "</span>";
    }
  },
  markdown: (card)=>{
    return makeEmbeds(md.render(card.src));
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
  },
  image: (card)=>`<img src=${card.src} />`,
  html: (card)=>{
     //create node,
     let sp = document.createElement("span");
     sp.innerHTML = card.src;
     let scripts = sp.querySelectorAll("script");
     //reset scripts
     scripts.forEach((s, i)=>{
        let cm = document.createComment("fix");
        s.parentNode.insertBefore(cm , s);
        s.remove();
        let snew = document.createElement("script");
        snew.innerHTML = s.innerHTML;
        let sattrs = Array.from(s.attributes);
        sattrs.forEach(a=>snew.setAttribute(a.name, a.value));
        cm.parentNode.insertBefore(snew, cm);
     })
     return sp;
  }

}

const results = {
  text: (card)=>card.src,
  json: (card)=>{ 
     try{
     return JSON.parse(card.src) 
     
     }catch{
      return {error: true}
     }
  }
}


///// CARD FUNCTIONS COMBINED //////

export function getWrapper(card){
  return {
    prop: (p,v)=>setOrRet(card.props , p , v , getWrapper(card)),
    var: (p,v)=>setOrRet(card.var , p , v , getWrapper(card)),
    src:  (s)=>setOrRet(card, "src", s , getWrapper(card)),
    type: (t)=>setOrRet(card, "type" , t , getWrapper(card)),
    title: (t)=>{
        if(!t){return card.title}
        card.title = uniquifyTitle(t);
        return getWrapper(card);
    },
    view: ()=>view(card),
    read: ()=>result(card),
    del:  ()=>remove(card),
  }
}

////// CARD FUNCTIONS //////

//danger!
export function list(){
  return store;
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

export function updateCard(card,newcard){
  console.log("Update card" , newcard)
  if(newcard.title && newcard.title != card.title){
     newcard.title = uniquifyTitle(newcard.title);
  }
  Object.assign(card, newcard)
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
  modified(card.id);
  //:TODO Update Call!!
  return successCallback ? successCallback(card) : true;
}

export function remove(card){
  let idx = getIndexByCondition(c=>c.id==card.id);
  if(idx==-1){return false}
   store.splice(idx,1); //:TODO: CALLBACK
   console.log(store.map(e=>e.title))
   modified("yes");
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
  console.log("Make new one");
  type = type || "markdown";
  title = uniquifyTitle(title || "Card")
  return {
    type: type,

    title: title,
    src: "",
    tags: [],
    style: "",
    id: uuid(),
    props: {},
    var: {},
    created: ( new Date() ).getTime()
  }
}
