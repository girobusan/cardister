import { saveAs } from 'file-saver';
import * as Cards from './cards';

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
  const crds =  saveCardsToHTML(cards);
  const sets =  convertSettingsToHTML(settings);
  //
  // duplicate html
  const clone = document.documentElement.cloneNode(true);

  // console.log(clone);
  console.log("settings html" , settings, sets);
  console.log("clone" , clone);

  var dataContainer = document.createElement("span");
   dataContainer.id = "cardisterContainer";
  dataContainer.innerHTML=crds + sets;

  var cloneBody = clone.querySelector("body");
  var coreScript = clone.querySelector("#cardisterCore");
  cloneBody.innerHTML = "";

  const loader = document.createElement("div");
  loader.id="loader";
  //prep head
  if(settings.cleanHead){
    let head = clone.querySelector("head");
    head.innerHTML = settings.cleanHead;
    //add core CSS
    const coreCSS = document.querySelector("#cardisterCoreCSS").innerHTML;
    let nh = head.querySelector("#cardisterCoreCSS")
    nh.innerHTML = coreCSS; 
    //add user CSS
    //add user title
    //add description
  }else{
    console.info("Clean HEAD template was missed.")
  }

  cloneBody.appendChild(loader);
  cloneBody.appendChild(dataContainer);
  dataContainer.appendChild(coreScript);

  return clone.outerHTML;

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
