import {Component, createRef} from 'preact';
import {html} from 'htm/preact';
import {CodeJar} from "codejar";
import Prism from "prismjs";
import {InlineButton} from "./InlineButton";
require("./cardeditor.scss");
import * as cards from '../cards';


export class CardEditor extends Component{
  constructor(props){
    super(props);
    this.editorElement=createRef();
    this.typesSelector=createRef();
    this.titleEditorInput = createRef();
    this.saveCard = this.saveCard.bind(this);
    this.removeCard = this.removeCard.bind(this);

  }
  render(){
    this.removeCard(true)
    return html`
    <div class="CardEditor">
      <div class="inner">
      <input type="text" 
      class="titleEditor" ref=${this.titleEditorInput}></input>
        <div class="editorArea language-md" ref=${this.editorElement} ></div>
        <div class="actions">
      <${InlineButton} label="cancel" action=${this.props.cancelAction}/>
      <${InlineButton} label="save" action=${()=>{ this.saveCard() ; this.props.cancelAction() }} />
      <${InlineButton} label="delete" action=${()=>{ console.log("this" , this) ; this.removeCard() }}/>
        </div>
    </div>
  </div>`
      
  }

  saveCard(){
    console.log("saving..." , this.titleEditorInput.current);
    cards.updateCard(this.props.card, 
    {
    title: this.titleEditorInput.current.value,
    src: this.editor.toString()
    });
  }

  removeCard(test){
    console.log("deleting...")
    if(!test){
    cards.remove(this.props.card);
  }else{console.log("...not really")}
  }

  componentDidMount(){
    this.props.card.props.editMe = false;
    // console.log("Edprps" , this.props);
    this.editor = CodeJar(this.editorElement.current ,
    Prism.highlightElement , {tab: '  '})
    this.editor.updateCode(this.props.card.src);
    this.titleEditorInput.current.value = this.props.card.title;
    //this.titleEditor.currenIt.addEv
    // this.saveCard();
   
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
 card: null
}
