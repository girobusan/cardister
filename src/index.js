require("./index.scss");
import * as serialization from "./serialization";
import {initUI} from "./ui";
import * as cards from "./cards";
console.log("Cardister" , VERSION);



window.store = {
  version: VERSION,
  make: ()=>cards.add( cards.makeNew() ),
  card: (t)=>{ 
     const c = cards.getByTitle(t);
     if(c){
       return cards.getWrapper(c);
     }
     return null;
  },
  dumpCards: ()=>{serialization.dumpCards(cards.list())}
  
}


window.addEventListener("DOMContentLoaded", function(){
  //test load settings
  const saved_cards = serialization.restoreCardsFromHTML(document.body);
  const settings = serialization.restoreSettingsFromHTML(document.body);
  console.log("The settings:" , settings);

  //do something...
  document.title = settings.title || "My Cardset"
  //add cards one by one to _cards_
  saved_cards.forEach(c=>cards.add(c, null, null, true))
  //add test cards
  // for(let i = 0 ; i < 5 ; i++){
  //   let c = cards.makeNew(null, "Test Card");
  //   c.src = "### Lorem\n\nIpsum *Dolor*";
  //   cards.add(c)
  // }

  // let textHTML = serialization.saveCardsToHTML(cards.list());
  // console.log(textHTML);
  // let fhtml = serialization.makeHTMLExport(cards.list(), settings);
  // console.log("FHTML!" , fhtml);



  // document.body.rHTML=""; //clean up
  initUI(settings)
});




