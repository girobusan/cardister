import {Component, createRef} from 'preact';
import {createPortal} from "preact/compat";
import {html} from 'htm/preact';
import * as cards from "../cards";
import * as icons from "../icons";
require("./cardview.scss");
import {CardViewer} from "./CardViewer";
import {CardEditor} from "./CardEditor";

export class CardView extends Component{
  constructor(props){
   super(props);
   this.outer = createRef();
   this.titlebar = createRef();
   this.editBtn = createRef();
   this.followMouse = this.followMouse.bind(this);
   this.portal = document.querySelector(".cardisterUI");
   console.log("portal" , this.portal);
   // console.log("REFF" , this.viewer);
   this.state = {
      editmode: false,
      position: [this.props.card.props.x || 5, this.props.card.props.y || 5]
   }
  }

  edit(yesOrNo){
    this.setState({editmode: yesOrNo});
  }

  followMouse(e){
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



  render(){

    let editor = this.state.editmode ? html`${ createPortal( html`<${CardEditor}/>` , this.portal )}` : "";
    return html`
       <div class="cardView" 
       ref=${this.outer}
       key=${this.props.card.id} 
       style=${{top:( this.state.position[1] ) +'px', 
       left:( this.state.position[0])+'px'}}
       onmouseover=${()=>this.editBtn.current.classList.add("shown")}
       onmouseout=${()=>this.editBtn.current.classList.remove("shown")}
       >
       <div class="titleBar" ref=${this.titlebar}></div>
         <h4>${this.props.card.title}</h4>
         <div class="editModeBtn" onclick=${(e)=>this.setState({editmode:!this.state.editmode})} ref=${this.editBtn} dangerouslySetInnerHTML=${{__html:icons.icons.edit}}></div>
       <${CardViewer} card=${this.props.card} />
       ${editor}
       </div>
    `

  }
  componentDidMount(){
    this.titlebar.current.addEventListener( "mousedown" , (e)=>{
      console.log("Mouse down...")
      //save starting card coords
      this.cardDragStart = [this.props.card.props.x || 5 , 
      this.props.card.props.y || 5]
      //save starting mouse coords
      this.mouseDragStart = [e.pageX , e.pageY];
      //run mouse following
      window.addEventListener("mousemove", this.followMouse)
    } )

    this.titlebar.current.addEventListener("mouseup" , (e)=>{
       //stop follow
        window.removeEventListener("mousemove", this.followMouse)
    })

  }

  componentDidUpdate(){
     console.log(this.state.position);
  }
}
