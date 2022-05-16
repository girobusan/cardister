import { render, h , Component , createRef  } from 'preact';
import { html } from 'htm/preact';
import * as cards from "../cards";
import {If} from "./If";
require("./utility.scss");

export class OneTag extends Component{
  constructor(props){
  super(props);
  this.tagnode = createRef();
  }
  render(){
     // console.log("render one tag" , this.props.tag)
     return html`<span 
     ref=${this.tagnode}
     onclick=${this.props.onclick}
     style=${{
     backgroundColor: "#555",
     color: "white",
     margin: "2px",
     fontSize: "12px",
     borderRadius: "9px",
     display: "inline-block",
     padding: "0px 12px",
     height: "18px",
     lineHeight: "16px",
     paddingBottom: "1px",
     cursor: "pointer",
     position: "relative"
       }}
     class="OneTag">${this.props.tag}<${If} condition=${this.props.minus}><span class="minus"> -</span></${If}>
     </span>`
  }
}

export class TagViewer extends Component{
  constructor(props){
  super(props);
  this.showMenu = this.showMenu.bind(this);
  this.hideMenu = this.hideMenu.bind(this);
  this.state = {menu: null}
  }
  render(){
  // console.log("tags" , this.props.card)
    if(!this.props.card.tags||this.props.card.tags.length==0){
    return "";
    }
    // console.log("Tags!!!" , this.props.card.tags)
    return html`<div class='TagViewer'

    style=${{
      position: "relative",
      display: "flex",
      flexDirection: "row"
      }}
    >
     ${this.props.card.tags
     .map(e=>{ return html`<${OneTag} onclick=${()=>this.showMenu(e)} tag=${e}/>` })}

     <${If} condition=${this.state.menu!=null} >
        <div class="menu"
     style=${{
      position: "absolute",
      left: "0",
      top: "100%",
      backgroundColor: "white",
      padding: 0,
      boxShadow: "0 0 2px rgba(0,0,0,.2)"
       }}
        >
        <div class="menuheader" style=${{ color: "silver" }}>${this.state.menu}</div>
        ${cards.listTagged(this.state.menu)
        .filter(c=>c.title()!=this.props.card.title)
        .map(e=>html`<div class="menuitem" onclick=${()=>{ this.hideMenu();this.props.goTo(e.unwrap()) }}>${e.title()}</div>`)}

        </div>
     </${If}>


    </div>`
  }
  hideMenu(){
     this.setState({menu:null})
  }
  showMenu(t){
       //show tagged
       if(t==this.state.menu){this.hideMenu(); return}
       this.setState({menu:t});
  }
}

