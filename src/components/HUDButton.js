import {Component, createRef} from 'preact';
// import {createPortal} from "preact/compat";
import {html} from 'htm/preact';

export class HUDButton extends Component{
  constructor(props){
    super(props);
    this.icon = createRef();
  }
  render(){
  // console.log("ICON" , this.props.icons);
     return html`<div class="HUDButton" 
     ref=${this.icon}
     onclick=${this.props.action}
     style=${
       {
       position: "fixed",
       zIndex: 10000,
       display: "block",
       boxSizing: "border-box", 
       cursor: "pointer",
       top: this.props.top ? this.props.top+"px" : "unset", 
       left: this.props.left ? this.props.left+"px" : "unset", 
       right: this.props.right ? this.props.right+"px" : "unset", 
       bottom: this.props.bottom ? this.props.bottom+"px" : "unset", 
       backgroundColor: this.props.bcolors[this.props.state],
       color: this.props.fcolors[this.props.state],
       fill: this.props.fcolors[this.props.state],
       textAlign: "center",
       width: "32px",
       height: "32px",
       borderRadius: "8px",
       padding: "4px"

         }
       }

      ></div>`
  }
  refreshIcon(){
    this.icon.current.innerHTML = this.props.icons[this.props.state] ;
  }
  componentDidMount(){
    this.refreshIcon();
  }
  componentDidUpdate(){
    this.refreshIcon();
  }
}

HUDButton.defaultProps = {
  // top: 8,
  state: 0,
  // left: 8,
  icons: ["!"],
  width: 24,
  height:24,
  bcolors: ["orangered"],
  fcolors: ["white"],
  action: (e)=>console.log("HUD button click")
}

