
import {Component, createRef} from 'preact';
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

class Tab extends Component{
  constructor(props){
  super(props);
  }
  render(){ return html`
    <div 
    class="Tab ${this.props.index==this.props.selected ? "selected" : ""}"
    onclick=${()=>this.props.action(this.props.index)}
    >
      ${this.props.label}
    </div>
  `
}
}

export class SettingsEditor extends Component{
  constructor(props){
    super(props);
    this.state={test: 0 , hidden: 1 , tab: 0 , settings: this.props.settings}
  }
  render(){
    console.log("render" , this.state);
    if(this.state.hidden===1){

      return html`<${HUDButton} 
      hint=${"Settings"}
      icons=${[icons.settings]}
      bcolors=${[colors.buttons_bg]}
      left=${56} 
      bottom=${8}
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
</div>
    <div class="actions">
    <${InlineButton} label=${"Cancel"} action=${()=>this.setState({hidden:1})} />
    <${InlineButton} label=${"Save and exit"} 
    action=${()=>{ this.saveSettings();this.setState({hidden:1}) }} /></div>
    </div>`
  }
  saveSettings(){
      //title
      //description
      //language
      //file name!


      //custom css
  }
  componentDidUpdate(){
    console.log("Editor update" , this.state);
  }
}
