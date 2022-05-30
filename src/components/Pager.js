import {Component, createRef} from 'preact';
import {html} from 'htm/preact';
import {range} from "../utils.js";


export class Pager extends Component{
  constructor(props){
    super(props);
    this.selector = createRef();
  }
  render(){
   console.log(this.props)
    if(this.props.pageNum==0){
      return("")
    }
    return html`<div class='Pager'
    data-hint="Choose page"
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
    data-hint="Choose page"
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
        .map(( e,i )=>html`<option selected=${e==this.props.current} value=${e}>${this.props.pageNames[i]||e}</option>`)
      }
      </select>
      </div>`

    }
}
