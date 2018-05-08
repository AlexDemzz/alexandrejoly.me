import React from 'react';
import './styles.css';

class Cursor extends React.Component{

    addClass = () => {
        if(this.props.hovered) return 'hover';
        if(this.props.needToHold) return 'hold';
    };

    render(){
        return(
           <div className="cursor" classNames={this.addClass()} style={{top: this.props.top, left: this.props.left}}>
               <div className="pointer">
                   <div className="main"/>
                   <div className="border"/>
               </div>
           </div>
        )
    }
}

export default Cursor;