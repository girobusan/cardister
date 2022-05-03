
import { createElement , render, h , Component} from 'preact';
import { html } from 'htm/preact';
import { useState } from 'preact/hooks';
import * as cards from "./cards";
import {CardView} from "./components/CardView"
import {HUDButton} from "./components/HUDButton"
import {icons} from "./icons";
require("./ui.scss");

class UIcontainer extends Component{
  constructor(props){
    super(props);
   
  }
  render(){
     //console.log("Props" , this.props);
     // console.log(cards.list("Card"));

     return html`<div class="cardisterUI">
       <${HUDButton} icons=${[icons.save]} />
         <div class="innerUI"
         ondragover=${(e)=>e.preventDefault()}
         ondragenter=${(e=>e.preventDefault())}

         >
         ${this.props.cards.map(e=>html`<${CardView} 
         card=${e} 
         title=${e.title}
         cardProps=${e.props}
         type=${e.type}
         src=${e.src}
         tags=${e.tags}
         view=${cards.view(e)}
         />`)}
         </div>
      </div>`
  }
}

export function initUI(settings){

  console.info("Init UI...");

  let root = h(
     UIcontainer,
     { "settings" : settings , cards: cards.list()},
      ""
  );
   
  let r = document.querySelector("#cardisterContainer");
  render (root, r);
   
}
