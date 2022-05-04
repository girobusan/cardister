
import { render, h , Component , createRef  } from 'preact';
import { html } from 'htm/preact';
import { useState } from 'preact/hooks';
import * as cards from "./cards";
import {CardView} from "./components/CardView"
import {HUDButton} from "./components/HUDButton"
import {icons} from "./icons";
import {colors} from "./colors/Cardister.es6";
import * as serialization from "./serialization";
require("./ui.scss");
require("./hints");

class UIcontainer extends Component{
  constructor(props){
    super(props);
    this.container = createRef();
    this.followWindowSize = this.followWindowSize.bind(this);
    this.state = {
       scale: 1,
       translate: [0,0],
       height: 0,
       width: 0,
       modified: false,
       fullscreen: document.fullscreenElement ? true : false,
       locked: this.props.settings.locked ? true : false
    }
    this.dataUpdated = this.dataUpdated.bind(this);
    cards.setCallback("update", this.dataUpdated);
   
  }
  render(){
     //console.log("Props" , this.props);
     // console.log(cards.list("Card"));

     return html`<div class="cardisterUI" 
     ref=${this.container}
     style=${{
        height: this.state.height ? this.state.height+"px" : "100vh",
       }}
     >
       <${HUDButton} 
       icons=${[icons.save, icons.save]} 
       top=${8} left=${16} 
       bcolors=${[ colors.buttons_bg, "orangered"]}
       fcolors=${["white" , "white"]}
       action=${()=>{ 
       serialization.saveAsHTML(cards.list(), this.props.settings) ;
       this.setState({modified: 0})
       }}
       state=${this.state.modified? 1 : 0}
       />

       <${HUDButton} 
       icons=${[icons.add]} 
       left=${16} bottom=${8}
       bcolors=${[ colors.buttons_bg]}
       action=${()=>{
         let c = cards.makeNew("markdown", "New Card");
         c.props.editMe = true;
         cards.add(c);
         }}
         state=${0}
       />

       <${HUDButton}
       state=${this.state.fullscreen ? 1 : 0}
       icons=${[icons.fullscreen , icons.exit_fullscreen]}
       bcolors=${["black" , "black"]}
       fcolors=${["white" , "white"]}
       right=${16}
       bottom=${8}
       action=${()=>{
         if(this.state.fullscreen){
           document.exitFullscreen()
           .then(this.setState({fullscreen: false}))
           }else{

           this.container.current.requestFullscreen()
           .then(this.setState({fullscreen: true}))
           // .catch(this.setState({fullscreen: false}))
           }
         }         
         }

       />
         <div class="innerUI"
         style=${{
           height: this.state.height ? (this.state.height/this.state.scale)+"px" : "100vh"}}
         >
         ${cards.list().map(e=>html`<${CardView} 
         key=${e.id}
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

  dataUpdated(){
    this.setState({modified: (new Date).getTime()});
  }

  followWindowSize(){
     const myh = this.container.current.offsetHeight;
     const scrollHeight = Math.max(
      document.body.scrollHeight, document.documentElement.scrollHeight,
      document.body.offsetHeight, document.documentElement.offsetHeight,
      document.body.clientHeight, document.documentElement.clientHeight
    );
    if(scrollHeight>myh){
      this.setState({height: scrollHeight+8})
    }
     

  }

  componentDidMount(){
    window.addEventListener("scroll" , this.followWindowSize);
    this.followWindowSize();
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
