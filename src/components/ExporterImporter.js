import {Component, createRef} from 'preact';
import {html} from 'htm/preact';
import { InlineButton } from './InlineButton';
import {list} from "../cards";
import { saveFile } from '../serialization' ;
import * as cards from '../cards';

export class Exporter extends Component{
  constructor(props){
  super(props);
  this.doExport = this.doExport.bind(this);
  this.cardsE = createRef();
  this.styleE = createRef();
  this.settingsE = createRef();
  }

  doExport(){
     let eo = { };
     let ce = document.querySelector("#cardisterCustomCSS");

     if(this.settingsE.current.checked){
       eo.settings = this.props.settings;
     }
     if(this.cardsE.current.checked)
     {
       eo.cards = list();
     }
     if(this.styleE.current.checked)
     {
       eo.customCSS = ce ? ce.innerHTML : "";
     }

     if(eo.settings && eo.settings.cleanHead){delete(eo.settings.cleanHead)}
     saveFile(JSON.stringify(eo,null,2) , "export.cardister.json")
     }

  render(){
    return html`<div class='Exporter utilityWidget'>
 <h3>Export</h3>
 <input type='checkbox' checked name="cards" ref=${this.cardsE}>
 </input>
 <label for='cards'>Cards</label>
 <br />
 <input type='checkbox' checked name='settings' ref=${this.settingsE}>
 </input>
 <label for='settings'>Settings</label>
 <br />
 <input type='checkbox' name='css' checked ref=${this.styleE}>
 </input>
 <label for='css'>Custom CSS</label>
 <br />
 <br />

 <${InlineButton} label="Click to save" action=${this.doExport}/>
    </div>`
  }
}

export class Importer extends Component{
  constructor(props){
         super(props);
         this.modeSelector = createRef();
         this.doImport=this.doImport.bind(this);
         this.applyImport = this.applyImport.bind(this);
  }

  applyImport(r){
   // console.log("apply" , r) 
   try{
     let uploaded = JSON.parse(r);

     if(uploaded.settings){
      console.info("Found settings");
      Object.assign(this.props.settings , uploaded.settings);
     }

     if(uploaded.customCSS){
      console.info("Found custom CSS");
      const se = document.getElementById("cardisterCustomCSS");
      if(se){ se.innerHTML = uploaded.customCSS }
      else{ console.error("No place for custom CSS in document") };
     }
     if(uploaded.cards){
       console.info("Found cards");
       const policy = this.modeSelector.current.value;
       if(policy=='replace'){
           cards.replaceCards(uploaded.cards);
       }
       if(policy=='append'){
          cards.appendCards(uploaded.cards, true)
       }
       if(policy=='skip'){
          cards.appendCards(uploaded.cards, false)
       }
     }

      this.props.callback(this.props.settings);

   }catch(e){
     console.error("Can not import:" , e);
   }
  }

  doImport(){
   let mode = this.modeSelector.current.value;
   const upl = document.createElement("input");
   upl.setAttribute("type", "file");
   upl.addEventListener("change", ()=>{
     upl.files[0]
     .text()
     .then(this.applyImport)
   })
   document.body.appendChild(upl);
   upl.click();
   document.body.removeChild(upl)
   
  }

  render(){
     
     return html`<div class='Importer utilityWidget' >
     <h3>Import </h3>
     <label for="modes">Cards: </label>
     <select name="modes" ref=${this.modeSelector} style='margin-right:8px'>
     <option value="replace">Replace all</option>
     <option value="append">Append new, update doubles</option>
     <option value="skip">Append new, skip doubles</option>
     </select>
     <${InlineButton} label="Click to upload" action=${this.doImport} />
     </div>`

  }

}

