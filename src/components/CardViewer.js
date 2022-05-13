import {Component, createRef} from 'preact';
import {html} from 'htm/preact';
import * as cards from "../cards";

export class CardViewer extends Component{
  constructor(props){
  super(props);
  this.viewarea = createRef();
  }
  render(){

    return html`<div class='CardViewer' ref=${this.viewarea}>
      <!--view--->
    </div>`
  }

  refreshView(){
    // console.log("refresh" , this.viewarea.current)
    const v = cards.view(this.props.card , this.viewarea.current);
    if ( v==this.viewarea.current ){
    // console.log("Persistent DOM element detected")
    return;
    }
    this.viewarea.current.innerHTML = "";
    try{
      this.viewarea.current.appendChild(v);
    }catch{
      if(typeof(v)==='string'){
        this.viewarea.current.innerHTML = v;
        return;
      }
      try{
        // console.log(v , JSON.stringify(v))
        this.viewarea.current.innerHTML = JSON.stringify(v);
      }catch{
        this.viewarea.current.innerHTML = v.toString();
      }
    }
  }
  componentDidMount(){
    this.refreshView();
    this.currentSrc = this.props.card.src;
  }
  componentDidUpdate(){
    this.refreshView();
  }
  componentWillUpdate( nextProps ){
    if(nextProps.card.src!=this.currentSrc){
      this.currentSrc = nextProps.card.src;
      this.viewarea.current.innerHTML = "";
    }
      // this.refreshView();
      return true;
    
  }
}
