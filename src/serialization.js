import { saveAs } from 'file-saver';
import * as Cards from './cards';

export function saveCardsToHTML(cards){
  const attrs = ["type" , "src" , "title" , "id" , "tags" , "props"]
  let container = document.createElement("section");
  container.id = "cards";
  cards.forEach(card=>{
    let s = document.createElement("div");
    let h = document.createElement("h2");
    s.appendChild(h);
    h.innerText = card.title;
    s.setAttribute("class" , "card");

    // attrs.forEach(a=>{
      //    s.dataset[a] = JSON.stringify( card[a] );
  // })

  s.dataset.card = JSON.stringify(card);
  let cview = Cards.view(card);

  try{
    s.appendChild(cview)
  }catch{
    let ov =  typeof( cview )=='string' ? cview : cview.toString();
    s.innerHTML = s.innerHTML + ov;

  }

  container.appendChild(s)

  });
  return container.outerHTML;
}

export function restoreCardsFromHTML(element){
  let cc = element.querySelector("#cards");
  if(!cc){return []}
  let crds = Array.from( cc.querySelectorAll(".card") );
  return crds.map(e=>JSON.parse( e.dataset.card ));

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
  const clone = document.documentElement.cloneNode(true);
  const crds =  saveCardsToHTML(cards);
  const sets =  saveSettingsToHTML(settings);
  clone.body.innerHTML=crds+sets;
  return clone.outerHTML;

}
export function saveAsHTML(cards, settings){
  cards = cards || [];
  settings = settings || {};
  const fname = settings.filename || "cardister.html";
  const blob = new Blob( 
    [makeHTMLExport(cards, settings)] ,
  {type: "text/plain;charset=utf-8"});

  saveAs(blob, fname);
   
}
