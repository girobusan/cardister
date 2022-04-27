require("./index.scss");
import * as serialization from "./serialization";
import {initUI} from "./ui";
import * as cards from "./cards";
console.log("Cardister" , VERSION);



window.store = {
  make: ()=>cards.add( cards.makeNew() ),
  card: (t)=>{ 
     const c = cards.getByTitle(t);
     if(c){
       return cards.cardFns(c);
     }
     return null;
  }
  
}


//test load settings
console.log("Loading...")
const settings = serialization.restoreSettingsFromHTML(document.body);
var saved_cards = serialization.restoreCardsFromHTML(document.body);
console.log("Settings:" , settings);

//do something...
document.title = settings.title || "My Cardset"
//add cards one by one to _cards_
saved_cards.forEach(c=>cards.add(c, null, null, true))
//add test cards
for(let i = 0 ; i < 5 ; i++){
  let c = cards.makeNew(null, "The Card");
  c.src = "### Lorem\n\nIpsum *Dolor*";
  cards.add(c)
}

let textHTML = serialization.saveCardsToHTML(cards.list());
console.log(textHTML);



document.body.innerHTML=""; //clean up
initUI(settings)




