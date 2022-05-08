import {Component, createRef} from 'preact';
import {html} from 'htm/preact';
import {CodeJar} from "codejar";
import Prism from "prismjs";
import {InlineButton} from "./InlineButton";
import { CardViewer } from './CardViewer';
import {If} from "./If";
require("./cardeditor.scss");
require("../prism.css");
import * as cards from '../cards';

Prism.languages.json = {
	'property': {
		pattern: /(^|[^\\])"(?:\\.|[^\\"\r\n])*"(?=\s*:)/,
		lookbehind: true,
		greedy: true
	},
	'string': {
		pattern: /(^|[^\\])"(?:\\.|[^\\"\r\n])*"(?!\s*:)/,
		lookbehind: true,
		greedy: true
	},
	'comment': {
		pattern: /\/\/.*|\/\*[\s\S]*?(?:\*\/|$)/,
		greedy: true
	},
	'number': /-?\b\d+(?:\.\d+)?(?:e[+-]?\d+)?\b/i,
	'punctuation': /[{}[\],]/,
	'operator': /:/,
	'boolean': /\b(?:false|true)\b/,
	'null': {
		pattern: /\bnull\b/,
		alias: 'keyword'
	}
};

export class CardEditor extends Component{
  constructor(props){
    super(props);
    this.editorElement=createRef();
    this.typesSelector=createRef();
    this.titleEditorInput = createRef();
    this.typeSelector = createRef();
    this.saveCard = this.saveCard.bind(this);
    this.removeCard = this.removeCard.bind(this);
    this.state={type: this.props.card.type}

  }
  render(){
    return html`
    <div class="CardEditor">
      <div class="inner">
      <input type="text" 
      class="titleEditor" ref=${this.titleEditorInput}></input>
        <!--top panel-->
        <div class="editor_top_area">
        <${If} condition=${this.props.types.indexOf(this.props.card.type)!=-1}>
        <select ref=${this.typeSelector} 
        data-hint=${"Change type"}
        >
        ${this.props.types.map(t=>html`<option selected=${t==this.props.card.type} >
        ${t}</option>`)}
        </select>
        </If>
        </div>
        <${If} condition=${this.props.types.indexOf(this.props.card.type)!=-1}>
          <div class="editorArea language-${this.state.type}" ref=${this.editorElement} ></div>
        </If>
        <${If} condition=${this.props.types.indexOf(this.props.card.type)==-1}>
        <!--no editor-->
        <${CardViewer} card=${this.props.card} />
        </If>
          <div class="actions">
      <${InlineButton} 
      hint=${"Delete this card"}
      label="delete" action=${()=>{ console.log("this" , this) ; this.removeCard() }}/>
      <${InlineButton} label="cancel" 
      hint=${"Cancel editing"}
      action=${this.props.cancelAction}/>
      <${InlineButton} 
      hint=${"Save changes"}
      label="save" action=${()=>{ this.saveCard() ; this.props.cancelAction() }} />
        </div>
    </div>
  </div>`
      
  }

  saveCard(){
    console.log("saving..."  );
    const changes = { title: this.titleEditorInput.current.value.trim()};

    if(this.props.types.indexOf(this.props.card.type)!=-1){
       changes.type = this.typeSelector.current.value ;
       changes.src = this.editor.toString();
    }

    cards.updateCard(this.props.card, changes);
  }

  removeCard(test){
    if(!test){
    cards.remove(this.props.card);
  }else{console.log("...not really")}
  }

  componentDidMount(){
    this.props.card.props.editMe = false;
    // console.log("Edprps" , this.props);
    if(this.editorElement.current){
      this.editor = CodeJar(this.editorElement.current ,
      (e)=>{return  Prism.highlightElement(e) } , {tab: '  '})
      this.editor.updateCode(this.props.card.src);
    }
    this.titleEditorInput.current.value = this.props.card.title;
    //this.titleEditor.currenIt.addEv
    // this.saveCard();
   
  }
}

CardEditor.defaultProps = {
 saveFn: ()=>console.log("save"),
 types: [ "markdown" , "text" , "html","js" , "json" ],
 source: "Nothing loaded",
 type: "markdown",
 cancelAction: ()=>console.log("cancel"),
 saveAction: ()=>console.log("save"),
 deleteAction: ()=>console.log("delete"),
 card: null
}
