import React from 'react';
import './styles.css';

class Cursor extends React.Component{
    classHovered = () => {
        if(this.props.hovered){
            return 'hover';
        }else{
            return '';
        }
    }

    classHold = () => {
        if(this.props.hold){
            return 'hold';
        }else{
            return '';
        }
    };

    sendCursorEvent = (hover, hold, holdend) => {
        this.props.cursorEvent(hover, hold, holdend);
    };

    componentDidMount = () => {
        this.getCursorEvent();
    };

    getCursorEvent = () => {
        const element = document.getElementsByClassName('main')[0];
        element.addEventListener('transitionend', () => {
            if(this.props.hold){
                this.sendCursorEvent(false, false, true);
            }
        });
    };

    render(){


        return(
           <div className={`cursor ${this.classHovered()} ${this.classHold()}`} style={{top: this.props.top, left: this.props.left}}>
               <div className="pointer">
                   <div className="main"/>
                   <div className="border"/>
                   <div className="text">
                       <p className={this.props.hold ? 'text-p--show' : 'text-p--hide'}>Hold to discover</p>
                   </div>
               </div>
           </div>
        )
    }
}

export default Cursor;