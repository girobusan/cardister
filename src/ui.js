
import { render, h , Component , createRef  } from 'preact';
import { html } from 'htm/preact';
import { useState } from 'preact/hooks';
import * as cards from "./cards";
import {CardView} from "./components/CardView"
import {HUDButton} from "./components/HUDButton"
import { SettingsEditor } from './components/SettingsEditor';
import {Pager} from './components/Pager'
import {If} from "./components/If";
import {icons} from "./icons";
import {colors} from "./colors/Cardister.es6";
import * as serialization from "./serialization";
// import {dataTransferToImage} from "./files";
import {dataURLFromFile , killEvent , dataTransferToImage} from './utils.js';
require("./ui.scss");
require("./hints");

function preventDefault(e) {
    e.preventDefault();
    e.stopPropagation();
}

function handleDrop(e , prps){
   const images=["image/jpeg" , "image/jpg"];
   const images_asis = ["image/png" , "image/gif"]
   const htmls = ["image/svg+xml" , "image/svg" , "text/html" ];
   const json = "application/json";
   const csv = "text/csv";
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
  const point = [e.pageX + cont.scrollLeft, e.pageY + scrolled];
  const position = (c)=>{c.props.x = point[0] ; 
  c.props.y = point[1] ;
  console.log("Pos" ,prps);
  c.props.page = prps.page;
  console.log("Pos" , c.props)
  // c.props = Object.assign(c.props, prps);
  };

  if(images_asis.indexOf(type)!=-1){
    console.info("Saving as is");
     const url = dataURLFromFile(files[0])
     .then(r=>{
      let c = cards.makeNew("image", files[0].name ||"image" );
      c.src=r;
      position(c);
      cards.add(c);
     })

  }

  if(images.indexOf(type)!=-1){
    dataTransferToImage(data)
    .then(r=>{
      let c = cards.makeNew("image", files[0].name ||"image" );
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

  if(type===csv){
     files[0].text()
     .then(r=>{
        let c = cards.makeNew("csv" , files[0].name || "data");
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
  killEvent(e)
}

class UIcontainer extends Component{
  constructor(props){
    super(props);
    this.container = createRef();
    this.innerContainer = createRef();
    this.followWindowSize = this.followWindowSize.bind(this);
    this.fitInnerSize = this.fitInnerSize.bind(this);
    this.state = {
       scale: 1,
       translate: [0,0],
       height: cards.bounds().bottom + 32,
       width: cards.bounds().right + 8,
       modified: false,
       fullscreen: document.fullscreenElement ? true : false,
       locked: this.props.settings.locked ? true : false,
       pageNames: this.props.settings.page_names,
       page: 0,
       pages: Math.max( 
      this.props.settings.min_pages||0 ,
      cards.maxPage() +1
      ),

    }
    this.dataUpdated = this.dataUpdated.bind(this);
    this.handleDropped = this.handleDropped.bind(this);
    cards.setCallback("update", this.dataUpdated);
  }

  render(){
     //console.log("Props" , this.props);
     // console.log(cards.list("Card"));

     return html`<div class="cardisterUI ${this.state.fullscreen ? "fullscreen" : "windowed"}" 
     ref=${this.container}
     style=${{
        height:  "100vh",
       }}
     >
       <${HUDButton} 
       hint=${"Export to file"}
       icons=${[icons.save, icons.save]} 
       top=${16} left=${16} 
       bcolors=${[ colors.buttons_bg, "orangered"]}
       fcolors=${["white" , "white"]}
       action=${()=>{ 
       serialization.saveAsHTML(cards.list(), this.props.settings) ;
       this.setState({modified: 0})
       }}
       state=${this.state.modified? 1 : 0}
       />

       <${Pager} pageNum=${this.state.pages} 
       current=${this.state.page}
       pageNames=${this.state.pageNames ||[]}
       action=${(p)=>this.setState({page:p})}
       />

      <${If} condition=${!this.state.locked}>


       <${HUDButton} 
       hint=${"Add card"}
       icons=${[icons.add]} 
       left=${16} bottom=${16}
       bcolors=${[ colors.buttons_bg]}
       action=${()=>{
         let c = cards.makeNew("markdown", "New Card");
         let cbb = -this.container.current.getBoundingClientRect().y;
         let elscroll = this.container.current.scrollTop;
         // console.log("VALS" , cbb , elscroll);
         c.props.x = 0;
         c.props.y = window.innerHeight/2-100 + Math.max(cbb,elscroll);
         c.props.width=200;
         c.props.height=200;
         c.props.editMe = true;
         c.props.page = this.state.page;
         cards.add(c);
         }}
         state=${0}
       />

       <${SettingsEditor} 
       settings=${this.props.settings}
       pages=${this.state.pages}
       page=${this.state.page}
       onupdate=${(s)=>this.setState({
           pages: Math.max(s.min_pages , cards.maxPage()+1),
           pageNames: s.page_names
         })}
       />
       </${If}>

       <${HUDButton}
       hint=${"Full screen mode"}
       state=${this.state.fullscreen ? 1 : 0}
       icons=${[icons.fullscreen , icons.exit_fullscreen]}
       bcolors=${[colors.buttons_bg, colors.buttons_bg]}
       fcolors=${["white" , "white"]}
       right=${16}
       bottom=${16}
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
       hint=${"Lock/unlock"}
       state=${this.state.locked ? 1 : 0}
       icons=${[icons.unlocked , icons.locked]}
       bcolors=${[colors.buttons_bg , colors.buttons_bg]}
       fcolors=${["white" , "white"]}
       right=${52}
       bottom=${16}
       action=${()=>this.setState({locked: !this.state.locked})}
       />
         <div class="innerUI"
         ref=${this.innerContainer}
         style=${{
           height: this.state.height ? (this.state.height/this.state.scale)+"px" : "100vh",
           width: this.state.width ? (this.state.width/this.state.scale) + "px" : "100vw"
           }}
         >
         ${cards.list()
         .filter(c=>(!c.props.page && this.state.page==0)||(c.props.page==this.state.page))
         .map(e=>html`<${CardView} 
         key=${e.id}
         card=${e} 
         title=${e.title}
         cardProps=${e.props}
         type=${e.type}
         src=${e.src}
         tags=${e.tags}
         pages=${this.state.pages}
         page=${this.state.page}
         pageNames=${this.state.pageNames}
         view=${cards.view(e)}
         locked=${this.state.locked}
         sizeFitFunction=${this.fitInnerSize}
         />`)}
         </div>
      </div>`
  }

  dataUpdated(){
    this.setState({modified: (new Date).getTime()});
  }

  handleDropped(e){
    const p = {page:this.state.page}
    console.log("Handling dropped" , p)
    handleDrop(e , p);
  }

  fitInnerSize(){
    const b = cards.bounds();
    let newW = this.state.width;
    let newH = this.state.height;
    let doChange = false;
    if(b.right+8>this.state.width){
          newW = b.right + 8;
          doChange = true;
    } 
    if(b.bottom+32>this.state.height){
        newH = b.bottom +32;
        doChange=true;
    }
    if(doChange){
      this.setState({width: newW , height: newH});
    }
  }

  followWindowSize(){
     const myh = this.container.current.offsetHeight;
     const scrollHeight = Math.max(
      document.body.scrollHeight, document.documentElement.scrollHeight,
      document.body.offsetHeight, document.documentElement.offsetHeight,
      document.body.clientHeight, document.documentElement.clientHeight
    );
    if(scrollHeight>myh && this.state.height < (scrollHeight+8)){
      
      this.setState({height: scrollHeight+8})
    }
     

  }

  componentWillMount(){
     
  
  }

  componentDidMount(){
    let ldr = document.querySelector("#loader");
    if(ldr){ 
      ldr.style.pointerEvents = "none";
      ldr.style.opacity=0; 
      window.setTimeout(()=>ldr.remove() , 2000) 
    }
    this.container.current.addEventListener('dragenter', preventDefault, false);
    this.container.current.addEventListener('dragleave', preventDefault, false);
    this.container.current.addEventListener('dragover', preventDefault, false);
    //drop
    this.container.current.addEventListener('drop', this.handleDropped, false); 
    this.container.current.addEventListener("dblclick" , 
    (evt)=>{ 
       // console.log("Doubleclick" , evt.pageX , evt.pageY , evt.target) ;
       // console.log("Doubleclick" , evt.pageX , evt.pageY , evt.target) ;
       // console.log("scrollLeft" , this.container.current.scrollLeft);
       // console.log("scrollTop" , this.container.current.scrollTop);
       if(evt.target!=this.innerContainer.current){return};
       const posX = evt.pageX + this.container.current.scrollLeft;
       const posY = evt.pageY + this.container.current.scrollTop;
       const card = cards.makeNew("markdown", "New Card");
       card.props.x = posX;
       card.props.y = posY;
       card.props.width = 200;
       card.props.height = 200;
       card.props.editMe = true;
       cards.add(card);

       })

  }
  componentDidUpdate(){
    this.props.settings.locked = this.state.locked;
  
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
