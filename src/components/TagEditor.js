import { render, h , Component , createRef  } from 'preact';
import { html } from 'htm/preact';
import * as cards from "../cards";
import {OneTag} from "./utilityComps";

export class TagEditor extends Component{
  constructor(props){
  super(props);
  this.handleSelect = this.handleSelect.bind(this);
  this.delTag = this.delTag.bind(this);
  this.selector = createRef();
  this.state = {tags:this.props.tags||[]}
  }

  render(){
     const alltags = cards.listTags();
    return html`<div class="TagEditor" style=${{
    display: "flex",
    flexDirection: "row"
      }}>
     <div class="taglist"
   style=${{display:"flex" , flexDirection:"row" , alignItems: "center"}}
     >
    ${this.state.tags.map(t=>{

      return html`<${OneTag} tag=${t} minus=${true} onclick=${()=>this.delTag(t)} />`
      })}
      </div>
     <div class="plus">
        <select ref=${this.selector} onchange=${this.handleSelect}>
        <option selected> + </option>
        <option >Create new tag...</option>
        ${alltags
        .map(t=>html`<option value=${t}>${t}</option>`)}
        </select>
     </div>
    </div>`
  }
  addTag(t){
    const S = new Set(this.state.tags);
    S.add(t);
    this.setState({tags:Array.from(S)})
  }
  delTag(t){
     this.setState({tags: this.state.tags.filter(tt=>tt!=t)})
  }
  handleSelect(){
    
    if(this.selector.current.selectedIndex==1){
      let t = prompt("New tag name?");
      this.addTag(t);
      this.selector.current.selectedIndex = 0;
      return;
    } 
    this.addTag(this.selector.current.value);
    this.selector.current.selectedIndex = 0;
    
  }
  componentDidUpdate(){
    if(this.props.onupdate){
      this.props.onupdate(this.state);
    }
  }
}

