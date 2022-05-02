import {Component, createRef} from 'preact';
import {html} from 'htm/preact';
import {CodeJar} from "codejar";
import Prism from "prismjs";
require("./cardeditor.scss");


export class CardEditor extends Component{
  constructor(props){
    super(props);
    this.editorElement=createRef();
    this.typesSelector=createRef();

  }
  render(){
   
    return html`<div class="CardEditor">
   <div class="editorArea language-md" ref=${this.editorElement} ></div>
    </div>`
    
  }
  componentDidMount(){
   this.editor = CodeJar(this.editorElement.current ,
   Prism.highlightElement , {tab: '  '})
   this.editor.updateCode(this.props.source);
   
  }
}

CardEditor.defaultProps = {
 saveFn: ()=>console.log("save"),
 types: [ "markdown" , "text" , "html","js" ],
 source: "Nothing loaded",
 type: "markdown"
}
