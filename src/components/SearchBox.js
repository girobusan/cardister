import { render, h , Component , createRef  } from 'preact'; import { html } from 'htm/preact';
import { search as searchCards } from '../cards';
import {icons} from "../icons";
require("./searchbox.scss");

function insertTagAt(text , tag, i0 , i1){
   return text.substring(0, i0) + `<${tag}>` + 
    text.substring(i0, i1) + `</${tag}>` + text.substring(i1);
}

function FoundItem(props){

  
   return html`<div class="result"
   onclick=${()=>{ 
   console.log("click seatch result")
   this.props.goTo(this.props.item) }
   } >
    <h4>${props.item.title}</h4> 
    <div class="matches">
    ${props.matches[0].value.substring(0,100)}
    </div>
    </div>`
 
}


export class SearchBox extends Component{
  constructor(props){
    super(props);
    this.container = createRef();
    this.inputField = createRef();
    this.results = createRef();
    this.doSearch = this.doSearch.bind(this);
    this.undoSearch = this.undoSearch.bind(this);
    this.checkFormState = this.checkFormState.bind(this);
    this.state={"results" : []}
  }

  render(){
    return html`<div class="SearchBox" ref=${this.container}>
    <div class="searchIcon" 
    dangerouslySetInnerHTML=${{__html: icons.search}}></div>
    <input type="text" 
    ref=${this.inputField}
    onkeyup=${this.doSearch}
    onfocus=${this.checkFormState}
    onblur=${this.checkFormState}
    onclick=${this.undoSearch}
    data-hint=${"Search cards"}></input>
    <div class="searchResults" ref=${this.results}>
    ${this.state.results.map( 
      (e)=>html`<${FoundItem} goTo=${this.props.goTo} item=${e.item} matches=${e.matches}/>`
      )}
    </div>
    </div>`
  }

  componentDidUpdate(){
  this.checkFormState();
  }

  checkFormState(){
    if(!this.inputField.current.value || this.inputField.current.value.length==0){
     this.container.current.classList.remove("active");
    }else{
     this.container.current.classList.add("active");
    }

  }

  undoSearch(){
     this.setState({"results" : []})
  }

  doSearch(){
      
     if(this.inputField.current.value.length<2){
        this.setState({results: []})
        return}
     const s = searchCards(this.inputField.current.value)
     console.log(s);
     this.setState({"results" : s});
  }
}