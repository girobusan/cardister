
import {useRef} from 'preact/hooks';
import {Component, createRef ,} from 'preact';
import {html} from 'htm/preact';
import {CodeJar} from "codejar";
import Prism from "prismjs";
require("../prism.css");
import {InlineButton} from "./InlineButton";
import {HUDButton} from "./HUDButton"

import {Exporter, Importer} from "./ExporterImporter"
import {If} from "./If";
import {colors} from "../colors/Cardister.es6";
import {icons} from "../icons";
require("./settingsed.scss")

function Tab(props){
   return html`
    <div 
    class="Tab ${props.index==props.selected ? "selected" : ""}"
    onclick=${()=>props.action(props.index)}
    >
      ${props.label}
    </div>`
}

function TextInput(props){
 const inv = useRef(null);
 //const handler = ()=>inv &&inv.current
  return html`
     <div class="TextInput">
     <label for=${props.name}>${props.label}</label>
     <input type="text" name=${props.name} 
     ref=${inv}
     value=${props.value} 
     onkeyup=${ ()=>props.action(inv.current.value)} />
     </div>
  `
}

function TextArea(props){
  const txt = useRef(null);
  return html`
   <div class="TextArea">
   <label for=${props.name}>${props.label}</label>
   <textarea ref=${txt}
   resizable=${false}
   style="width:100%;display:block;min-height:150px"
   name=${props.name}
   onkeyup=${()=>props.action(txt.current.value)} >
   ${props.value}
   </textarea>
   </div>
  `
}

export class SettingsEditor extends Component{
  constructor(props){
    super(props);
    this.cssEditor = createRef();
    this.state={ hidden: true , tab: 0 , settings: this.props.settings}
    this.formState={}
  }
  render(){
    // console.log("render" , this.state);
    if(this.state.hidden){

      return html`<${HUDButton} 
      hint=${"Settings"}
      icons=${[icons.settings]}
      bcolors=${[colors.buttons_bg]}
      left=${56} 
      bottom=${16}
      action=${()=>{ this.setState({hidden:0}) }}
      />`
    }
    return html`<div class="SettingsEditor">
    <h2>Settings</h2>
    <div class="tabheader">
   <${Tab} index=0 selected=${this.state.tab} 
   label="Settings"
   action=${i=>this.setState({tab:i})}
   />
   <${Tab} index=1 selected=${this.state.tab} 
   label="Custom CSS" action=${i=>this.setState({tab:i})}
   />
   <${Tab} index=2 selected=${this.state.tab} 
   label="Utility" action=${i=>this.setState({tab:i})}
   />
    </div>
<div class="tabcontent">
  <${If} condition=${this.state.tab==0}>

  <!--settings-->
  <h3>Information</h3>
  <div class="formRow">
  <${TextInput} 
     name=${"title"}
     label=${"Title"}
     value=${this.formState.title}
     action=${(v)=>this.formState.title=v}
  />
  <${TextInput} 
     name=${"filename"}
     label=${"File name"}
     value=${this.formState.filename}
     action=${(v)=>this.formState.filename=v}
  />

  </div>
  <${TextArea} 
     name=${"description"}
     label=${"Description"}
     value=${this.formState.description}
     action=${(v)=>this.formState.description = v}
  />
  <h3>Parameters</h3>
  <div class="formRow">
   <${TextInput}
   name=${"minpages"}
   label=${"Min. pages"}
   value=${this.formState.min_pages}
   action=${(v)=>this.formState.min_pages = v}
   />
  </div>
    
  </${If}>
  <${If} condition=${this.state.tab==1}>

  <div class="cssEditor language-css" ref=${this.cssEditor}> </div>

  </${If}>
  <${If} condition=${this.state.tab==2}>
  <div class="formRow">
   <${Exporter} settings=${this.props.settings} />
   <${Importer} settings=${this.props.settings} 
   callback=${(s)=>{this.readSettings();this.saveSettings()}} />
   </div>
   </${If}>


</div>

    <div class="actions">
    <${InlineButton} label=${"Hide editor"} action=${()=>this.setState({hidden:1})} />

    <${InlineButton} label=${"Clear all edits"} 
    action=${()=>{this.readSettings(); }} />

    <${InlineButton} label=${"Apply settings"} 
    action=${()=>{ this.saveSettings() }} /></div>
    </div>`
  }
    // this.setState({settings:this.props.settings});
  saveSettings(){
      //title
      console.log("Save Settings" , this.props.settings.title);
      this.props.settings.title = this.formState.title;
      document.title = this.formState.title;
      this.props.settings.min_pages = this.formState.min_pages;
      //description
      this.props.settings.description = this.formState.description;
      //file name!
      this.props.settings.filename = this.formState.filename;
      //custom css
      if(this.customCSSElement)
      {
        this.customCSSElement.innerHTML = this.formState.css;
      }else{
        console.error("Can not save custom CSS");
      }
      if(this.props.onupdate){
        this.props.onupdate(this.props.settings);
      }
  }

  readSettings(){
    //reads settings
     this.customCSSElement = document.getElementById("cardisterCustomCSS");
     const cCSS = this.customCSSElement ? this.customCSSElement.innerHTML : "/*custom CSS error*/";
     // console.log("Settings" , this.props.settings)
     this.formState.css = cCSS;
     this.formState.title = this.props.settings.title;
     this.formState.filename = this.props.settings.filename || "MyCards.html";
     this.formState.description = this.props.settings.description || "?";
     this.formState.min_pages = this.props.settings.min_pages ||0;

     

     // console.log("Form State" , this.formState)
  }
  componentDidUpdate(){
    // console.log("Settings editor Editor update"  );
    this.readSettings();


    //if we have css editor?
    if(this.cssEditor.current){
       this.editor = CodeJar(this.cssEditor.current,
      // Prism.highlightElement , 
      (e)=>{
               return Prism.highlightElement(e); // magic. do not touch.
         },
      {tab: '  ' , window: window});
      this.editor.updateCode(this.formState.css);
      this.editor.onUpdate((css)=>this.formState.css=css);
    }
  }
  componentDidMount(){
     this.readSettings();
  }
}
