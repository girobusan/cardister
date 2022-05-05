// import * as PD from "preact/debug";
require("./index.scss");
import * as serialization from "./serialization";
import {initUI} from "./ui";
import * as cards from "./cards";
console.log("Cardister" , VERSION);



window.store = {
  version: VERSION,
  make: ()=>{ let c = cards.makeNew(); cards.add(c) ; return cards.getWrapper(c) },
  get: (t)=>{ 
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
  initUI(settings)
});




