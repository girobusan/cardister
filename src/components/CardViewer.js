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
    const v = cards.view(this.props.card);
    this.viewarea.current.innerHTML = "";
    try{
        this.viewarea.current.appendChild(v);
    }catch{
        typeof(v)==='string' ? this.viewarea.current.innerHTML = v : this.viewarea.current.innerHTML = v.toString() 
    }
  }
  componentDidMount(){
    this.refreshView();
  }
  componentWillUpdate(){
    this.refreshView();
  }
  componentWillReceiveProps(){
    this.refreshView();
  }
}
