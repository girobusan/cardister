import { saveAs } from 'file-saver';
import * as Cards from './cards';
import { createHTML } from './template';

export function saveCardsToHTML(cards ){
  let  container = document.createElement("div")
  container.setAttribute("id", "cards")
  

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
  let cview = card.type=='html' ? card.src : "";

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
  //remove 
  cc.innerHTML = "";
  return crds.map(e=>JSON.parse( e.dataset.card ));

}

export function convertSettingsToHTML(settings){
  let c= document.createElement("script");
  c.id = "settings"
  c.type="data/json"
  c.innerHTML = JSON.stringify(settings)
  return c.outerHTML;
}

export function restoreSettingsFromHTML(element){
   const r = element.querySelector("script#settings").innerHTML;
   return r ? JSON.parse(r) : {}
}


//dirty
export function makeHTMLExport(cards,settings){
  return createHTML(cards, settings) ;
  }

export function saveAsHTML(cards, settings){
console.info("Exporting...")
  cards = cards || [];
  settings = settings || {};
  console.log("settings html" , settings);
  const fname = settings.filename || "cardister.html";
   const content =  makeHTMLExport(cards, settings) ;
  saveFile(content, fname);
   
}

export function saveFile(content, fname){
  const blob = new Blob( 
    [content] ,
  {type: "text/plain;charset=utf-8"});

  saveAs(blob, fname);
}

export function dumpCards(cards){
  saveFile( saveCardsToHTML(cards), "default_cards.htm" );
}
