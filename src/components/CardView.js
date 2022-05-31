import {Component, createRef} from 'preact';
import {createPortal} from "preact/compat";
import {html} from 'htm/preact';
import * as cards from "../cards";
import {icons} from "../icons";
require("./cardview.scss");
import {CardViewer} from "./CardViewer";
import {CardEditor} from "./CardEditor";
import {TagViewer} from "./utilityComps";
import {killEvent} from "../utils.js";

export class CardView extends Component{
  constructor(props){
   super(props);
   this.outer = createRef();
   this.titlebar = createRef();
   this.editBtn = createRef();
   this.resizeCrn = createRef();
   this.moveWithMouse = this.moveWithMouse.bind(this);
   this.resizeWithMouse = this.resizeWithMouse.bind(this);
   this.portal = document.querySelector(".cardisterUI");

   this.position =[this.props.card.props.x || 0 , this.props.card.props.y || 0];
   this.size=[this.props.card.props.width || 200 , this.props.card.props.height || 200];
   // console.log("portal" , this.portal);
   // console.log("REFF" , this.viewer);
   this.state = {
      editmode: this.props.card.props.editMe? true : false,
      position: [this.props.card.props.x || 5, this.props.card.props.y || 5],
      size: [this.props.card.props.width || 200 , this.props.card.props.height || 200]
   }
  }


  moveWithMouse(e){
    const cmouse = [e.pageX , e.pageY];
    const delta = [cmouse[0]-this.mouseDragStart[0] , 
    cmouse[1]-this.mouseDragStart[1]]
    const newPos = [+this.cardDragStart[0] + delta[0] , +this.cardDragStart[1] + delta[1]]
//no negative coords
    if(newPos[0]<0){newPos[0]=0}
    if(newPos[1]<0){newPos[1]=0}
    this.props.card.props.x = newPos[0];
    this.props.card.props.y = newPos[1];

    // this.setп{position: newPos})
    this.outer.current.style.top = this.props.card.props.y + "px";
    this.outer.current.style.left = this.props.card.props.x + "px";
    killEvent(e);
    //
    // let scrollHeight = Math.max(
    //   document.body.scrollHeight, document.documentElement.scrollHeight,
    //   document.body.offsetHeight, document.documentElement.offsetHeight,
    //   document.body.clientHeight, document.documentElement.clientHeight
    // );
    // console.log("Scroll height" , scrollHeight);
  }

  resizeWithMouse(e){
    const cmouse = [e.pageX , e.pageY];
    const delta = [cmouse[0]-this.mouseResizeStart[0] , 
    cmouse[1]-this.mouseResizeStart[1]];
    const newSize = [+this.cardResizeStart[0] + delta[0] , +this.cardResizeStart[1] + delta[1]]
    this.props.card.props.width = newSize[0];
    this.props.card.props.height = newSize[1];
    this.outer.current.style.width = this.props.card.props.width + "px";
    this.outer.current.style.height = this.props.card.props.height + "px";
    this.size = newSize;
    // this.setState({size: newSize})
    killEvent(e);
  }



  render(){

    let editor = this.state.editmode ? html`${ createPortal( html`<${CardEditor} 
    card=${this.props.card}
    page=${this.props.page}
    pages=${this.props.pages}
    pageNames=${this.props.pageNames}
    source=${this.props.card.src} 
    cancelAction=${()=>this.setState({editmode:false})}/>` , this.portal )}` : "";
    return html`
       <div class="cardView ${( this.props.locked ? "locked" : "" ) + 
       " type-" + this.props.card.type + " cardisterCard-" + ( this.props.card.style||"default" ) }" 

       id=${this.props.card.id || ""}
       ref=${this.outer}
       key=${this.props.card.id} 
       style=${{top:( this.state.position[1] ) +'px', 
       left:( this.state.position[0])+'px',
       width: (this.state.size[0]) + 'px',
       height: (this.state.size[1]) + "px"
       }}
       onmouseover=${(e)=>{ if(this.props.locked){return;}
       this.outer.current.classList.add("hovered");killEvent(e) }}

       onmouseout=${()=>this.outer.current.classList.remove("hovered")}
       >
       <div class="titleBar" data-hint="Drag to move" ref=${this.titlebar}>${this.props.card.title}</div>
         <div class="editModeBtn" 
         data-hint="Click to edit"
         onclick=${(e)=>this.setState({editmode:!this.state.editmode})} 
         ref=${this.editBtn} dangerouslySetInnerHTML=${{__html:icons.edit}}></div>
         <div class="resizerCorner" data-hint="Drag to resize" dangerouslySetInnerHTML=${{__html:icons.resizer_alt}} ref=${this.resizeCrn}></div>
       <${TagViewer} card=${this.props.card} goTo=${this.props.goTo} />
       <${CardViewer} card=${this.props.card} />
       ${editor}
       </div>
    `

  }
  componentDidMount(){
    //move 
    this.titlebar.current.addEventListener( "pointerdown" , (e)=>{
      // console.log("Mouse down...")
      //save starting card coords
      this.cardDragStart = [this.props.card.props.x || 5 , 
      this.props.card.props.y || 5]
      //save starting mouse coords
      this.mouseDragStart = [e.pageX , e.pageY];
      //run mouse following
      this.dragged = true;
      window.addEventListener("pointermove", this.moveWithMouse)
    } )

    window.addEventListener("pointerup" , (e)=>{
       if(!this.dragged){return}
       //stop follow
        this.dragged = false;
        this.setState({position: [this.props.card.props.x , this.props.card.props.y]})
        this.props.sizeFitFunction();
        window.removeEventListener("pointermove", this.moveWithMouse)
    })
    //resize
    this.resizeCrn.current.addEventListener("pointerdown" , e=>{
       // console.log("Start resize..." , this.size);
       this.cardResizeStart = this.size;
       this.mouseResizeStart =  [e.pageX , e.pageY];
       this.resizing = true;
       window.addEventListener("pointermove", this.resizeWithMouse)
       
       // window.addEventListener("drag" , (e)=>console.log("drag" , e.target))
    })

    window.addEventListener("pointerup" , e=>{
        if(!this.resizing){return} 
        this.resizing=false;
        this.setState({size: [this.props.card.props.width , this.props.card.props.height]})
        this.props.sizeFitFunction();
      window.removeEventListener("pointermove", this.resizeWithMouse)
       // window.removeEventListener("mouseover" , killEvent)
  })
   
  }

  componentDidUpdate(){
     // console.log(this.porps.card);
  }
}
