
import {useRef} from 'preact/hooks';
import {Component, createRef ,} from 'preact';
import {html} from 'htm/preact';
import {CodeJar} from "codejar";
import Prism from "prismjs";
require("../prism.css");
import {InlineButton} from "./InlineButton";
import {HUDButton} from "./HUDButton"
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
    this.state={test: 0 , hidden: 1 , tab: 0 , settings: this.props.settings}
  }
  render(){
    // console.log("render" , this.state);
    if(this.state.hidden===1){

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
   <!--<${Tab} index=2 selected=${this.state.tab} 
   label="Utility" action=${i=>this.setState({tab:i})}
   />-->
    </div>
<div class="tabcontent">
  <${If} condition=${this.state.tab==0}>

  <!--settings-->
  <div class="formRow">
  <${TextInput} 
     name=${"title"}
     label=${"Title"}
     value=${this.state.title}
     action=${(v)=>this.setState({title:v})}
  />
  <${TextInput} 
     name=${"filename"}
     label=${"File name"}
     value=${this.state.filename}
     action=${(v)=>this.setState({filename:v})}
  />

  </div>
  <${TextArea} 
     name=${"description"}
     label=${"Description"}
     value=${this.state.description}
     action=${(v)=>this.setState({description:v})}
  />
    
  </${If}>
  <${If} condition=${this.state.tab==1}>

  <div class="cssEditor language-css" ref=${this.cssEditor}> </div>

  </${If}>
  <${If} condition=${this.state.tab==2}>
   utilities
   </${If}>
</div>
    <div class="actions">
    <${InlineButton} label=${"Cancel"} action=${()=>this.setState({hidden:1})} />
    <${InlineButton} label=${"Save and exit"} 
    action=${()=>{ this.saveSettings();this.setState({hidden:1}) }} /></div>
    </div>`
  }
  saveSettings(){
      //title
      this.props.settings.title = this.state.title;
      document.title = this.state.title;
      //description
      this.props.settings.description = this.state.description;
      //file name!
      this.props.settings.filename = this.state.filename;
      //custom css
      if(this.customCSSElement)
      {
        this.customCSSElement.innerHTML = this.editorBuffer;
      }else{
        console.error("Can not save custom CSS");
      }
  }
  componentDidUpdate(){
    // console.log("CSS Editor update"  );
    //if we have css editor?
    if(this.cssEditor.current){
       this.editor = CodeJar(this.cssEditor.current,
      // Prism.highlightElement , 
      (e)=>{
               return Prism.highlightElement(e); // magic. do not touch.
         },
      {tab: '  ' , window: window});
      this.editor.updateCode(this.editorBuffer);
      this.editor.onUpdate((css)=>this.editorBuffer=css);
         
       
    }
  }
  componentDidMount(){
  //read css
     this.customCSSElement = document.getElementById("cardisterCustomCSS");
     const cCSS = this.customCSSElement ? this.customCSSElement.innerHTML : "/*custom CSS error*/";
     console.log("Settings" , this.props.settings)
     this.editorBuffer = cCSS;
     
    //read all settings
    this.setState({
      title: document.title,
      filename: this.props.settings.filename || "My_cards.html",
      description: this.props.settings.description || "?" ,
      css: this.editorBuffer, 
    })
  }
}
