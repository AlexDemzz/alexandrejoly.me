import React from 'react';
import './styles.css';

class Cursor extends React.Component{

    render(){
        return(
           <div className="cursor" style={{top: this.props.top, left: this.props.left}}>
               <div className="pointer">
                   <div className="main"/>
                   <div className="border"/>
               </div>
           </div>
        )
    }
}

export default Cursor;