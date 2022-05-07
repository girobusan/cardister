
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
      action=${()=>{console.log(0 , this.state); 
      this.setState({hidden:0 , test: 1}) ; 
      console.log(1,this.state) }}
      />`
    }
    return html`<div class="SettingsEditor">
    <h2>Settings</h2>
    <${InlineButton} label=${"Cancel"} action=${()=>this.setState({hidden:1})} />
    <${InlineButton} label=${"Save and exit"} action=${()=>{ this.saveSettings();this.setState({hidden:1}) }} />
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
