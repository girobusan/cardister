
import { render, h , Component , createRef  } from 'preact';
import { html } from 'htm/preact';
import { useState } from 'preact/hooks';
import * as cards from "./cards";
import {CardView} from "./components/CardView"
import {HUDButton} from "./components/HUDButton"
import {If} from "./components/If";
import {icons} from "./icons";
import {colors} from "./colors/Cardister.es6";
import * as serialization from "./serialization";
import {dataTransferToImage} from "./files";
require("./ui.scss");
require("./hints");

function preventDefault(e) {
    e.preventDefault();
    e.stopPropagation();
}

function handleDrop(e){
   const images=["image/jpeg" , "image/png" , "image/gif" , "image/jpg"];
   const htmls = ["image/svg+xml" , "image/svg" , "text/html" ];
   const json = "application/json";
   const markdown = "text/markdown";
   const cont = document.querySelector(".cardisterUI");
   const scrolled = cont ? cont.scrollTop : 0 ;
   console.log("scrolled" , scrolled);

  const data = e.dataTransfer;
  const files = data.files;
  console.log(data, files);
  let type = files[0].type;

  console.log("Dropped" , type , files[0]);
  // console.log("at" , e.pageX , e.pageY);
  const point = [e.pageX - (window.innerWidth/2) , e.pageY + scrolled];
  const position = (c)=>{c.props.x = point[0] ; c.props.y = point[1]};

  if(images.indexOf(type)!=-1){
    dataTransferToImage(data)
    .then(r=>{
      let c = cards.makeNew("image", data.files[0].name ||"image" );
      c.src=r;
      position(c);
      cards.add(c);
    });
  }

  if(htmls.indexOf(type)!=-1){
     console.log("text" , files[0].text());
     files[0].text()
     .then(r=>{
        let c = cards.makeNew("html" , files[0].name || "html");
        c.src = r;
      position(c);
        cards.add(c);
     })
  }
  
  if(type===json){
     files[0].text()
     .then(r=>{
        let c = cards.makeNew("json" , files[0].name || "data");
        c.src = r;
      position(c);
        cards.add(c);
     })
  }

  if(type===markdown){
     files[0].text()
     .then(r=>{
        let c = cards.makeNew("markdown" , files[0].name || "data");
        c.src = r;
      position(c);
        cards.add(c);
     })
  }
  preventDefault(e);
}

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
      <${If} condition=${!this.state.locked}>
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
       </${If}>

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

       <${HUDButton}
       state=${this.state.locked ? 1 : 0}
       icons=${[icons.unlocked , icons.locked]}
       bcolors=${[colors.buttons_bg , colors.buttons_bg]}
       fcolors=${["white" , "white"]}
       right=${52}
       bottom=${8}
       action=${()=>this.setState({locked: !this.state.locked})}
       />
         <div class="innerUI"
         style=${{
           height: this.state.height ? (this.state.height/this.state.scale)+"px" : "100%"}}
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
    //no default drops
    this.followWindowSize()
    this.container.current.addEventListener('dragenter', preventDefault, false);
    this.container.current.addEventListener('dragleave', preventDefault, false);
    this.container.current.addEventListener('dragover', preventDefault, false);
    // this.container.current.addEventListener('drop', preventDefault, false);e();
    //drop
    this.container.current.addEventListener('drop', handleDrop, false); 

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
