import {Component, createRef} from 'preact';
import {html} from 'htm/preact';
import * as cards from "../cards";
require("./cardview.scss");

export class CardView extends Component{
  constructor(props){
   super(props);
   this.viewer = createRef();
   this.outer = createRef();
   this.titlebar = createRef();
   this.followMouse = this.followMouse.bind(this);
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
    let cmouse = [e.pageX , e.pageY];
    //calc mouse delta
    const delta = [cmouse[0]-this.mouseDragStart[0] , 
       cmouse[1]-this.mouseDragStart[1]]

    // console.log("couse start" , this.mouseDragStart)
    // console.log("card start" , this.cardDragStart)
    // console.log("CANDD" , cmouse , delta );
    // let db = document.documentElement.getBoundingClientRect().width;
    // let bw = document.documentElement.scrollWidth;
    
    // console.log("Document width" , db);
    // console.log("Window scroll width" , bw);



    const newPos = [+this.cardDragStart[0] + delta[0] , +this.cardDragStart[1] + delta[1]]

    // console.log("new pos" , newPos);

    this.props.card.props.x = newPos[0];
    this.props.card.props.y = newPos[1];
    this.setState({position: newPos})
  }

  refreshView(){
   
     const v =  cards.view(this.props.card);
     this.viewer.current.innerHTML = "";
     try{
        this.viewer.current.appendChild(v);
     }catch{
       
       this.viewer.current.innerHTML = typeof(v) === "string" ? v : v.toString();
       
     }
  }


  render(){
    return html`
       <div class="cardView" 
       ref=${this.outer}
       key=${this.props.card.id} 
       style=${{top:( this.state.position[1] ) +'px', left:( this.state.position[0])+'px'}}
       >
       <div class="titleBar" ref=${this.titlebar}></div>
         <h4>${this.props.card.title}</h4>
         <div class="viewer" ref=${this.viewer}></div>
       </div>
    `

  }
  componentDidMount(){
    this.titlebar.current.addEventListener( "mousedown" , (e)=>{
       console.log("Mouse down...")
       //save starting card coords
       this.cardDragStart = [this.props.card.props.x || 5 , this.props.card.props.y || 5]
       //save starting mouse coords
       this.mouseDragStart = [e.pageX , e.pageY];
        //run mouse following
        window.addEventListener("mousemove", this.followMouse)
    } )

    this.titlebar.current.addEventListener("mouseup" , (e)=>{
       //stop follow
        window.removeEventListener("mousemove", this.followMouse)
    })


    this.refreshView();
  }

  componentDidUpdate(){
     console.log(this.state.position);
     this.refreshView();
  }
}
