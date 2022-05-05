import { render, h , Component , createRef  } from 'preact';
import { html } from 'htm/preact';

export class If extends Component{
  constructor(props){
    super(props)
  }

  render(){
    if(this.props.condition){
      return this.props.children
    }else{
    return ""
    }
  }
}

