import {Component, createRef} from 'preact';
import {html} from 'htm/preact';
import { InlineButton } from './InlineButton';
import {list} from "../cards";
import { saveFile } from '../serialization' ;

export class Exporter extends Component{
  constructor(props){
  super(props);
  this.doExport = this.doExport.bind(this);
  }

  doExport(){
     let eo = { };
     let ce = document.querySelector("#cardisterCustomCSS");

     eo.settings = this.props.settings;
     eo.cards = list();
     eo.customCSS = ce ? ce.innerHTML : "";

     if(eo.settings.cleanHead){delete(eo.settings.cleanHead)}
     saveFile(JSON.stringify(eo,null,2) , "export.cardister.json")
     }

  render(){
    return html`<div class='Exporter utilityWidget'>
       
 <h3>Export</h3>
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
     //title
     if(uploaded.settings){
      console.info("Found settings");
      Object.assign(this.props.settings , uploaded.settings);
      this.props.callback(this.props.settings);
     }
   }catch(e){
     console.error("Can not import" , e);
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
     
     return html `<div class="Importer utilityWidget">
     <h3>Import </h3>
     <label for="modes">Mode: </label>
     <select name="modes" ref=${this.modeSelector}>
     <option value="replace">replace</option>
     <option value="append">append</option>
     </select>
     <${InlineButton} label="Click to upload" action=${this.doImport}
     </div>`

  }

}

