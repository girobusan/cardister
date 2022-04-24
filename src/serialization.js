import { saveAs } from 'file-saver';

function saveCardsToHTML(cards){
  const attrs = ["type" , "src" , "title" , "id" , "tags" , "props"]
  let container = document.createElement("section");
  container.id = "cards";
  cards.forEach(card=>{
    let s = document.createElement("div");
    s.setAttribute("class" , "card");

    attrs.forEach(a=>{
       s.dataset[a] = card[a];
    })
    s.innerHTML = 'CARD' ; //:TODO: card view!

  });
  return container.outerHTML;
}

function saveSettingsToHTML(settings){
  let c= document.createComment("SETTINGS\n" + JSON.stringify(settings, null , 2));
  return c.outerHTML;
}

function restoreSettingsFromHTML(node){
  let s;
  node.childNodes.forEach(
    n=>{
      if(n.nodeType===8 && n.innerHTML.startsWith("SETTINGS")){
      s = JSON.parse( s.innerHTML.replace("SETTINGS\n" , "") )
      }
    }
  )
  ;
 return s;
}


function makeHTMLExport(cards,settings){
  // duplicate html
  let clone = document.documentElement.cloneNode(true);
  let crds =  saveCardsToHTML(cards);
  let sets =  saveSettingsToHTML(settings);

  clone.body.innerHTML=crds+sets;
  return clone.outerHTML;

}

export function saveAsHTML(cards, settings){

  let fname = settings.filename || "cardister.html";
  let blob = new Blob( 
  [makeHTMLExport(cards, settings)] ,
  {type: "text/plain;charset=utf-8"});

  saveAs(blob, fname);
   
}
