require("./index.scss");
import * as serialization from "./serialization";
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
console.log("Settings:" , settings);

//do something...
document.title = settings.title || "My Cardset"




