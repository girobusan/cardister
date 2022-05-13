import { v4 as uuid } from 'uuid';
import {csvParse, autoType} from 'd3-dsv';
var MarkdownIt = require('markdown-it')
import { render, h , Component , createRef  } from 'preact';
import {CardViewer} from './components/CardViewer.js';

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
//
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
     modified(prop);
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
    return makeEmbeds(md.render(card.src));
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
  card.props[propName] = propVal;
}

export function updateCard(card,newcard){
  // console.log("Update card" , newcard)
  if(newcard.title && newcard.title != card.title){
     newcard.title = uniquifyTitle(newcard.title);
  }
  Object.assign(card, newcard)
  modified(card.id);
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
    Object.assign(STORE[bi] , card );
    return successCallback ? successCallback(card) : true;
  }
  if(t && !uniquify){
    return errCalback ? errCalback("Title is not unique") : false;
  }
  card.title = uniquifyTitle(card.title);
  card.id = card.id || uuid();
  STORE.push(card);
  modified(card.id);
  //:TODO Update Call!!
  return successCallback ? successCallback(card) : true;
}

export function remove(card){
  let idx = getIndexByCondition(c=>c.id==card.id);
  if(idx==-1){return false}
   STORE.splice(idx,1); //:TODO: CALLBACK
   // console.log(store.map(e=>e.title))
   modified("yes");
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
