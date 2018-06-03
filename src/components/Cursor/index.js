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

    // uiAnimationEvent = () => {
    //     function getRandomColor() {
    //         var letters = '0123456789ABCDEF';
    //         var color = '#';
    //         for (var i = 0; i < 6; i++) {
    //             color += letters[Math.floor(Math.random() * 16)];
    //         }
    //         return color;
    //     }
    //     this.refs.main.style.background = getRandomColor();
    // }
    //
    // classBeforeDuringLoad = () => {
    //     if(!this.props.appLoaded && this.refs.main){
    //         this.refs.main.style.borderWidth = '0px';
    //         return 'fluid'
    //     }else if(this.refs.main){
    //         this.refs.main.style.background = '';
    //         this.refs.main.style.borderWidth = '';
    //         return '';
    //     }
    // };
    //
    // componentDidUpdate(){
    //     if(!this.props.appLoaded){
    //         this.uiAnimationEvent()
    //     }
    // }

    render(){


        return(
           <div className={`cursor ${this.classHovered()} ${this.classHold()}`} style={{top: this.props.top, left: this.props.left}}>
               <div className="pointer">
                   <div className="main" ref="main"/>
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