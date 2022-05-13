import {Component, createRef} from 'preact';
import {html} from 'htm/preact';
import {range} from "../utils.js";


export class Pager extends Component{
  constructor(props){
    super(props);
    this.selector = createRef();
  }
  render(){
    if(this.props.pageNum==0){
      return("")
    }
    return html`<div class='Pager'
    style=${
      {
        position: "fixed",
        top: "16px",
        right: "16px",
        zIndex: 10000,
      }
      }
      >
      <select 
      style=${{
       display: "block",
       height: "32px",
       fontSize: "16px",
       borderRadius: "8px",
       borderStyle: "none",
       paddingLeft: "8px"
        }}
      ref=${this.selector}
      onchange=${()=>this.props.action(this.selector.current.value)}>
      ${
        range(this.props.pageNum)
        .map(e=>html`<option selected=${e==this.props.current} value=${e}>${e}</option>`)
      }
      </select>
      </div>`

    }
}
