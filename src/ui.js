
import { createElement , render, h , Component} from 'preact';
import { html } from 'htm/preact';
import { useState } from 'preact/hooks';
import * as cards from "./cards";
import {CardView} from "./components/CardView"
require("./ui.scss");

class UIcontainer extends Component{
  constructor(props){
    super(props);
   
  }
  render(){
     console.log("Props" , this.props);
     console.log(cards.list("Card"));
     return html`<div class="cardisterUI">
         <div class="innerUI">
         ${this.props.cards.map(e=>html`<${CardView} card=${e} />`)}
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
   
  console.log("Root UI" , root);
  let r = document.querySelector("#cardisterContainer");
  console.log("R" , r);

  render (root, r);
   
}
