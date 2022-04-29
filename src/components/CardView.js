import {Component, createRef} from 'preact';
import {html} from 'htm/preact';
import * as cards from "../cards";
require("./cardview.scss");

export class CardView extends Component{
  constructor(props){
   super(props);
   this.viewer = createRef();
   // console.log("REFF" , this.viewer);
   this.state = {
      editmode: false
   }
  }
  edit(yesOrNo){
    this.setState({editmode: yesOrNo});
  }

  refreshView(){
   
     const v =  cards.view(this.props.card);
     try{
        this.viewer.current.appendChild(v);
     }catch{
       
       this.viewer.current.innerHTML = typeof(v) === "string" ? v : v.toString();
       
     }
  }


  render(){
    return html`
       <div class="cardView" key=${this.props.card.id}>
         <h4>${this.props.card.title}</h4>
         <div class="viewer" ref=${this.viewer}></div>
       </div>
    `

  }
  componentDidMount(){
    this.refreshView();
  }
  componentDidUpdate(){
     this.refreshView();
  }
}
