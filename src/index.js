require("./index.scss");
import * as serialization from "./serialization";
import {initUI} from "./ui";
import * as cards from "./cards";
console.log("Cardister" , VERSION);



//state
//load saved
//setup API
//run GUI
//
window.store = {}

//init sequence

//test load settings
console.log("Loading p...")
const settings = serialization.restoreSettingsFromHTML(document.body);
var saved_cards = serialization.restoreCardsFromHTML(document.body);
console.log("Settings:" , settings);

//do something...
document.title = settings.title || "My Cardset"
//add cards one by one to _cards_

initUI(settings)




