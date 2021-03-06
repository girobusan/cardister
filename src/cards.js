import { v4 as uuid } from 'uuid';
import {csvParse, autoType} from 'd3-dsv';
var MarkdownIt = require('markdown-it')
import { render, h , Component , createRef  } from 'preact';
import {CardViewer} from './components/CardViewer.js';
import Fuse from 'fuse.js';



const md = new MarkdownIt({
  html: true,
  linkify: true,
})
.use(require("./lib/markdown-it-multimd-table.js") , {multiline: true, headerless: true})
.use(require("markdown-it-checkbox"));
;

function encodeMdLinks(md){
  const replacer = (m , g1 , g2, g3)=>{ return g1 + encodeURI(g2.trim()) + g3 };
  return md.replace( /(\[.+\]\()([^)]+)(\))/g  , replacer);
}

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
//
function eqNoCase(s1,s2){
  if(s1.toLowercase()==s2.toLowercase()){
  return true;
  }
  return false;
}
export function eliminateNegativeCoords(){
  STORE.forEach(c=>{
    if(c.props.x<0){c.props.x = -c.props.x}
    if(c.props.y<0){c.props.y = -c.props.y}
  })
  modified("okay");
}


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
     modified(retobj.unwrap() , prop);
     if(retobj){return retobj}
     return;
  }
  return obj[prop];
}

////// STORE ///////
const STORE = [];
//// CALLBACKS /////
const callbacks = {
  "test" :  ()=>console.log("test callback") 
}

export function setCallback(evt, fn){
   let clbid = uuid();
   if(!evt){evt="default"}
   if(!callbacks[evt]){callbacks[evt] = {}}
   callbacks[evt][uuid] = fn;
   return clbid;
}

export function removeCallback(evt, clbid){
    //find callback
    if(!evt){console.error("Can not remove" , clbid, evt); return}
    delete(callbacks[evt][clbid]);
}

function doCallbacks(evt , params){
  //default
  if(callbacks["default"]){
     Object.values( callbacks.default ).forEach(c=>c(params));
  }
  if(callbacks[evt]){
     Object.values( callbacks[evt] ).forEach(c=>c(params));
  }
}

function actualize(card){
  const i = getIndexByCondition(c=>c.id==card.id);
  if(i!=-1){ return STORE[i] }else{return null}
}

function modified( card , what){
   if(what!="added") 
   {
     card.modified = (new Date()).getTime();
   }
  //:TODO real callbacks
  doCallbacks("default" , {card: card, changed: what});
}

export function search(str){
  const fuse = new Fuse(STORE , {
     includeMatches: true,
     includeScore: true,
     minMatchCharLength: str.length-1,
     threshold: 0.92,
     ignoreLocation: true,
     keys: [ 
       { name:  "title"  , weight: 0.5 }, 
        { name: "src" , weight: 0.5 } ]
  })
  return fuse.search(str);
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
        return "{{" + p1 + "}}" ;
        }
     //return "+"+ p1 + "+";
  }
  const withTags =  md.replace(/{{([^}]+)}}/g , replacer);
  const outer = document.createElement("span");
  outer.innerHTML = withTags;
  const embeds = outer.querySelectorAll(".cardisterEmbed");
  if(embeds.length==0){return outer}

  embeds.forEach(e=>{
     const card = getByTitle(e.dataset.etitle);
     const viewer = h( CardViewer , {card:card} ) ;
     render(viewer, e);
  })
  return outer;
}

const views = {
  js: (card , element)=>{ 
    try{
    let f = Function( "Me" , "Element" , card.src.trim() || "return false");
      let r =  f(getWrapper(card) , element);
      return r||"";
    }catch(err){
      return "<span style='color:orangered'>Error: " + err.message + "</span>";
    }
  },
  markdown: (card)=>{
    return makeEmbeds(md.render(encodeMdLinks(card.src)));
  },
  html: (card , element)=>{
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
  json: (card)=>`<pre style="font-size:0.75em"><code>${ card.src }</code></pre>`,
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
  },
  csv: (card)=>{
     let d;
     let t = `<table class="csvView">`;
     try{
     d=csvParse(card.src , autoType);
     }catch(e){
       return "CSV parse error";
     }
     const header = d.columns;
     if(d.length>20){
      t = "Showing first 20 of " + d.length + " rows totlal " + t;
      d = d.slice(0,20);
     }

     t += `<tr>${header.map(h=>`<th>${h}</th>`).join("")}</tr>`;
     // console.log("header added" , t)
     t += d.map( r=>`<tr>${header.map(v=>`<td>${r[v]}</td>`).join("")}</tr>` ).join("")
     // console.log("rows added" , t )
     t = t + "</table>"
     // console.log("result" , t);
     return t;

  }

}

const results = {
  csv: (card)=>{ try{return csvParse(card.src)}catch(e){return e} },
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
    var: (p,v)=>{ 
      // if(v){
      // JSON.stringify(v); //will throw  an error if v is not serializable
      // }
    return setOrRet(card.var , p , v , getWrapper(card)) 
    },
    src:  (s)=>setOrRet(card, "src", s , getWrapper(card)),
    type: (t)=>setOrRet(card, "type" , t , getWrapper(card)),
    title: (t)=>{
        if(!t){return card.title}
        card.title = uniquifyTitle(t);
        modified(card , "title");
        return getWrapper(card);
    },
    tags: ()=> card.tags,
    hasTag: (t)=> hasTag(card,t),
    addTag: (t)=>{ modified(card, "tags") ; addTag(card , t) },
    delTag: (t)=>{ modified(card, "tags") ; delTag(card,t) },
    view: ()=>view(card),
    read: ()=>result(card),
    del:  ()=>remove(card),
    unwrap: ()=>card
  }
}

////// CARD FUNCTIONS //////

//danger!
export function list(){
  return STORE;
}

export function wrappedList(){
  return STORE.map(c=>getWrapper(c));
}

export function view(card , element){
  return views[card.type] ? views[card.type](card , element) : card.src ; 
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
 console.error("Deprecated setProp");
  card.props[propName] = propVal;
}

export function updateCard(card,newcard){
  // console.log("Update card" , newcard)
  if(newcard.title && newcard.title != card.title){
     newcard.title = uniquifyTitle(newcard.title);
  }
  Object.assign(card, newcard)
  modified(card , "updated");
}

export function tags(card){
   return card.tags;
}

export function hasTag(card, t ){
if(!card.tags || card.tags.length==0){return false}
  if(card.tags.indexOf(t.trim())!=-1){
  return true;
  }
  return false;
}

export function delTag(card,t){
  t=t.trim();
  if(!hasTag(card,t)){return }
  card.tags.splice(card.tags.indexOf(t) , 1);
}

export function addTag(card,t){
t=t.trim();
  if(hasTag(card,t)){return}
  card.tags.push(t);
}

export function listTags(){
  const S =  STORE.reduce((a,e)=>{
     if(!e.tags || e.tags.length==0){return a};
     e.tags.forEach(t=>a.add(t.trim()));
     return a
  } , new Set());
  return Array.from(S);
}

export function listTagged(t){
// console.log("Tagged by" , t)
if(!t){return []}
t=t.trim();
// console.log("List tagged"  )
  return STORE.filter(e=>hasTag(e,t)).map(c=>getWrapper(c));
}

export function switchTag(card , t){
  if(hasTag(card.t)){delTag(card,t); return} 
  addTag(card , t);
}

export function add(card , successCallback , errCalback , uniquify){
  let t = getByTitle(card.title);
  let bi = getIndexByCondition(c=>c.id==card.id);
  if(bi!=-1){
    // Adding card with same id means rewritting card
    //:TODO: ask user!
    Object.assign(STORE[bi] , card );
    return successCallback ? successCallback(card) : true;
  }
  if(t && !uniquify){
    return errCalback ? errCalback("Title is not unique") : false;
  }
  card.title = uniquifyTitle(card.title);
  card.id = card.id || uuid();
  STORE.push(card);
  // It is not a modification!
  modified(card , "added");
  //:TODO Update Call!!
  return successCallback ? successCallback(card) : true;
}

export function remove(card){
  let idx = getIndexByCondition(c=>c.id==card.id);
  if(idx==-1){return false}
   STORE.splice(idx,1); //:TODO: CALLBACK
   // console.log(store.map(e=>e.title))
   modified(card , "deleted");
  return true;
  // card.deleted = true;
}

export function replaceCards(crds){
   STORE.length = 0;
   crds.forEach(c=>add(c, null , null , true))
}

export function appendCards(crds , updateDoubles){
  crds.forEach(c=>{
    let d = getIndexByCondition(cr=>cr.id==c.id);
    if(!d){
      add(c , null , null , true);
      return;
    }
    if(updateDoubles){
      updateCard(d, c);
    }
  })
}

export function getByTitle(title){
  let idx =getIndexByCondition( c=>c.title==title); 
  if(idx==-1){return null}
  return STORE[idx]

}

export function getIndexByCondition(conditionFn){
  for(let i = 0 ; i < STORE.length ; i++){
    if(conditionFn( STORE[i] )){
      return i;
    }
  }
  return -1;
}

export function makeNew(type, title){
  // console.log("Make new one");
  type = type || "markdown";
  title = uniquifyTitle(title || "Card")
  const newCard =  {
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
  // Do not call here!  Card may be discarded
  // modified(newCard , "created");
  return newCard;
}

//utility
export function maxPage(){
  return Math.max.apply(null , STORE.map(c=>c.props.page||0));
}

export function bounds(arr){
 if(!arr){arr=STORE}
 return {
   right: Math.max.apply(null , arr.map(c=>c.props.x+c.props.width||0)),
   left: Math.min.apply(null , arr.map(c=>c.props.x||0)),
   bottom: Math.max.apply(null , arr.map(c=>c.props.y+c.props.height||0)),
   top: Math.min.apply(null , arr.map(c=>c.props.y||0)),
   

 }
}
