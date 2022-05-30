import {Component, createRef} from 'preact';
import {html} from 'htm/preact';
import {CodeJar} from "codejar";
import Prism from "prismjs";
import {InlineButton} from "./InlineButton";
import { CardViewer } from './CardViewer';
import { TagEditor } from './TagEditor';
import {If} from "./If";
import {range} from "../utils.js";
import {addMarkdown} from "./prism_markdown.js";
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

 addMarkdown(Prism);

export class CardEditor extends Component{
  constructor(props){
    super(props);
    this.editorElement=createRef();
    this.typesSelector=createRef();
    this.styleSelector = createRef();
    this.titleEditorInput = createRef();
    this.typeSelector = createRef();
    this.pageSelector = createRef();
    this.saveCard = this.saveCard.bind(this);
    this.removeCard = this.removeCard.bind(this);
    this.state={type: this.props.card.type}
    this.cardTags = this.props.card.tags ||[];

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
    <label for="types">Type: </label>
        <select name="types" ref=${this.typeSelector} 
        data-hint=${"Change type"}
        style=${{marginRight: "8px"}}
        >
        ${this.props.types.map(t=>html`<option selected=${t==this.props.card.type} >
        ${t}</option>`)}
        </select>
        </If>
        
      <label for="styles">Style: </label>
        <select name="styles" ref=${this.styleSelector}
        data-hint=${"Change style"}
        style=${{marginRight: "8px"}}
        >
        <option value="" > none </option>
        ${this.customStyles.map(s=>html`<option selected=${s==this.props.card.style}>
        ${s}</option>`)}
        </select>

        <label for="pages">Page: </label>
        <select name="pages" ref=${this.pageSelector}
        data-hint=${"Choose page"}
        >
        ${range(this.props.pages)
        .map(e=>html`<option selected=${e==this.props.card.props.page} value=${e}>${this.props.pageNames[e]||e}</option>`)}
        </select>



        </div>
        <div class="editor_top_area"> <label style="display:inline-block">Tags: </label>
        <${TagEditor} tags=${this.props.card.tags} onupdate=${(s)=>this.cardTags=s.tags} />
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
    const changes = { title: this.titleEditorInput.current.value.trim(),
    style: this.styleSelector.current.value,
    tags: this.cardTags
    };

    if(this.props.types.indexOf(this.props.card.type)!=-1){
       changes.type = this.typeSelector.current.value ;
       changes.src = this.editor.toString();
    }
    this.props.card.props.page = this.pageSelector.current.value;

    cards.updateCard(this.props.card, changes);
  }

  removeCard(test){
    if(!test){
    cards.remove(this.props.card);
  }else{console.log("...not really")}
  }
  componentWillMount(){
  const styleRx = /\.cardisterCard-[^, ]+$/ ;
    this.customStyles = [];
    let customCSSe = document.querySelector("#cardisterCustomCSS");
    // console.log("element" , customCSSe);
    let rules =customCSSe.sheet.cssRules || customCSSe.sheet.rules ;
    // console.log("riles" , rules)
    for (let s of rules){
       let st = s.selectorText;

       if (styleRx.test(st))
       {
         this.customStyles.push(s.selectorText.split("-")[1])
       }
    }
     // console.log("custom styles" , this.customStyles) ;

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
    //find styles
  }
}

CardEditor.defaultProps = {
 saveFn: ()=>console.log("save"),
 types: [ "markdown" , "text" , "html","js" , "json" , "csv" ],
 source: "Nothing loaded",
 type: "markdown",
 cancelAction: ()=>console.log("cancel"),
 saveAction: ()=>console.log("save"),
 deleteAction: ()=>console.log("delete"),
 card: null
}
