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
    this.viewarea.current.innerHTML = 
     cards.view(this.props.card);
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
