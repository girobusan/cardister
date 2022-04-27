
import { createElement , render, h , Component} from 'preact';
import { html } from 'htm/preact';
import { useState } from 'preact/hooks';
import * as cards from "./cards";

class UIcontainer extends Component{
  constructor(props){
    super(props);
   
  }
  render(){
     console.log("Props" , this.props);
     console.log(cards.list("Card"));
     return html`<div class="cardisterUI">${this.props.settings.title}</div>`
  }
}

export function initUI(settings){

  console.info("Init UI...");

  let root = h(
     UIcontainer,
     { "settings" : settings},
      ""
  );
   
  console.log("Root UI" , root);

  render (root, document.body);
   
}
