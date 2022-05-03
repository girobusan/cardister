import {Component, createRef} from 'preact';
import {createPortal} from "preact/compat";
import {html} from 'htm/preact';
import * as cards from "../cards";
import {icons} from "../icons";
require("./cardview.scss");
import {CardViewer} from "./CardViewer";
import {CardEditor} from "./CardEditor";

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
   // console.log("portal" , this.portal);
   // console.log("REFF" , this.viewer);
   this.state = {
      editmode: false,
      position: [this.props.card.props.x || 5, this.props.card.props.y || 5],
      size: [this.props.card.props.width || 200 , this.props.card.props.height || 200]
   }
  }

  edit(yesOrNo){
    this.setState({editmode: yesOrNo});
  }

  moveWithMouse(e){
    const cmouse = [e.pageX , e.pageY];
    //calc mouse delta
    const delta = [cmouse[0]-this.mouseDragStart[0] , 
    cmouse[1]-this.mouseDragStart[1]]
    const newPos = [+this.cardDragStart[0] + delta[0] , +this.cardDragStart[1] + delta[1]]

    // console.log("new pos" , newPos);

    this.props.card.props.x = newPos[0];
    this.props.card.props.y = newPos[1];
    this.setState({position: newPos})
  }

  resizeWithMouse(e){
     
    const cmouse = [e.pageX , e.pageY];
    const delta = [cmouse[0]-this.mouseResizeStart[0] , 
    cmouse[1]-this.mouseResizeStart[1]];
    const newSize = [+this.cardResizeStart[0] + delta[0] , +this.cardResizeStart[1] + delta[1]]
    this.props.card.props.width = newSize[0];
    this.props.card.props.height = newSize[1];
    this.setState({size: newSize})


  }



  render(){

    let editor = this.state.editmode ? html`${ createPortal( html`<${CardEditor} source=${this.props.card.src} cancelAction=${()=>this.setState({editmode:false})}/>` , this.portal )}` : "";
    return html`
       <div class="cardView" 
       ref=${this.outer}
       key=${this.props.card.id} 
       style=${{top:( this.state.position[1] ) +'px', 
       left:( this.state.position[0])+'px',
       width: (this.state.size[0]) + 'px',
       height: (this.state.size[1]) + "px"
       }}
       onmouseover=${()=>this.outer.current.classList.add("hovered")}
       onmouseout=${()=>this.outer.current.classList.remove("hovered")}
       >
       <div class="titleBar" ref=${this.titlebar}>${this.props.card.title}</div>
         <div class="editModeBtn" onclick=${(e)=>this.setState({editmode:!this.state.editmode})} ref=${this.editBtn} dangerouslySetInnerHTML=${{__html:icons.edit}}></div>
         <div class="resizerCorner" dangerouslySetInnerHTML=${{__html:icons.resizer}} ref=${this.resizeCrn}></div>
       <${CardViewer} card=${this.props.card} />
       ${editor}
       </div>
    `

  }
  componentDidMount(){
    //move 
    this.titlebar.current.addEventListener( "mousedown" , (e)=>{
      console.log("Mouse down...")
      //save starting card coords
      this.cardDragStart = [this.props.card.props.x || 5 , 
      this.props.card.props.y || 5]
      //save starting mouse coords
      this.mouseDragStart = [e.pageX , e.pageY];
      //run mouse following
      window.addEventListener("mousemove", this.moveWithMouse)
    } )

    this.titlebar.current.addEventListener("mouseup" , (e)=>{
       //stop follow
        window.removeEventListener("mousemove", this.moveWithMouse)
    })
    //resize
    this.resizeCrn.current.addEventListener("mousedown" , e=>{
       console.log("Start resize...");
       this.cardResizeStart = this.state.size;
       this.mouseResizeStart =  [e.pageX , e.pageY];
       window.addEventListener("mousemove", this.resizeWithMouse)
    })

    this.resizeCrn.current.addEventListener("mouseup" , e=>{
      window.removeEventListener("mousemove", this.resizeWithMouse)
  })

  }

  componentDidUpdate(){
     // console.log(this.porps.card);
  }
}
