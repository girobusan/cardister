import { saveAs } from 'file-saver';
import * as Cards from './cards';

export function saveCardsToHTML(cards){
  const attrs = ["type" , "src" , "title" , "id" , "tags" , "props"]
  let container = document.createElement("section");
  container.id = "cards";
  cards.forEach(card=>{
    let s = document.createElement("div");
    s.setAttribute("class" , "card");

    attrs.forEach(a=>{
       s.dataset[a] = card[a];
    })
    
    s.dataset.card = JSON.stringify(card);
    s.innerHTML = Cards.view(card);  //???

  });
  return container.outerHTML;
}

export function restoreCardsFromHTML(element){
  let cc = element.querySelector("#cards");
  if(!cc){return []}
  let crds = Array.from( cc.querySelectorAll(".card") );
  return crds.map(e=>e.dataset.card);

}

export function convertSettingsToHTML(settings){
  let c= document.createComment("SETTINGS\n" + JSON.stringify(settings, null , 2));
  return c.outerHTML;
}

export function restoreSettingsFromHTML(element){
  var st=null;
  element.childNodes.forEach(
    n=>{
      if(n.nodeType===8 && n.nodeValue.startsWith("SETTINGS")){
      st = JSON.parse( n.nodeValue.replace("SETTINGS" , "") )
      }
    }
  )
  ;
 return st;
}


//dirty
export function makeHTMLExport(cards,settings){
  // duplicate html
  let clone = document.documentElement.cloneNode(true);
  let crds =  saveCardsToHTML(cards);
  let sets =  saveSettingsToHTML(settings);
  clone.body.innerHTML=crds+sets;
  return clone.outerHTML;

}
export function saveAsHTML(cards, settings){
  cards = cards || [];
  settings = settings || {};
  let fname = settings.filename || "cardister.html";
  let blob = new Blob( 
    [makeHTMLExport(cards, settings)] ,
  {type: "text/plain;charset=utf-8"});

  saveAs(blob, fname);
   
}
