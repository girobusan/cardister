import {Component, createRef} from 'preact';
import {html} from 'htm/preact';
import {CodeJar} from "codejar";
import Prism from "prismjs";
import {InlineButton} from "./InlineButton";
require("./cardeditor.scss");


export class CardEditor extends Component{
  constructor(props){
    super(props);
    this.editorElement=createRef();
    this.typesSelector=createRef();

  }
  render(){
   
    return html`
    <div class="CardEditor">
      <div class="inner">
      <div 
      contenteditable=${true}
      class="titleEditor">Title</div>
        <div class="editorArea language-md" ref=${this.editorElement} ></div>
        <div class="actions">
        <${InlineButton} label="cancel" action=${this.props.cancelAction}/>
        <${InlineButton} label="save" />
        <${InlineButton} label="delete" />
        </div>
    </div>
  </div>`
      
  }
  componentDidMount(){
  console.log("Edprps" , this.props);
   this.editor = CodeJar(this.editorElement.current ,
   Prism.highlightElement , {tab: '  '})
   this.editor.updateCode(this.props.source);
   
  }
}

CardEditor.defaultProps = {
 saveFn: ()=>console.log("save"),
 types: [ "markdown" , "text" , "html","js" ],
 source: "Nothing loaded",
 type: "markdown",
 cancelAction: ()=>console.log("cancel"),
 saveAction: ()=>console.log("save"),
 deleteAction: ()=>console.log("delete"),
}
