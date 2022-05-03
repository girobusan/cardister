import {Component, createRef} from 'preact';
import {html} from 'htm/preact';


export class InlineButton extends Component{
  constructor(props){
  super(props);
  }

  render(){
   return html`<input type='button' 
   value=${this.props.label}
   onclick=${this.props.action}
   ></input>`

  }
}

InlineButton.defaultProps = {
  label: "Button",
  action: ()=>console.log("InlineButton clicked")
}
