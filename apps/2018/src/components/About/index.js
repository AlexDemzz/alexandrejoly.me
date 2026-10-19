import React from 'react';
import './styles.css';
import {CopyToClipboard} from 'react-copy-to-clipboard';
import Scrollbar from 'react-smooth-scrollbar';

class About extends React.Component{
    state = {
        value: 'alexandre.joly36@gmail.com',
        copied: false,
    };

    uiAnimationEvent = (e) => {
        function getRandomColor() {
            var letters = '0123456789ABCDEF';
            var color = '#';
            for (var i = 0; i < 6; i++) {
                color += letters[Math.floor(Math.random() * 16)];
            }
            return color;
        }
        document.body.style.background = getRandomColor();
    }

    uiAnimationEventOut = () => {
        document.body.style.background = '';
    }
    
    userExperienceEvent = () => {
        document.body.classList.add('bg-user-experience');
    }
    userExperienceEventOut = () => {
        document.body.classList.remove('bg-user-experience');
    }

    componentWillMount() {
        document.body.style.overflow = 'hidden';
    }

    componentDidUpdate(prevProps){
        if(prevProps.appLoaded === false && prevProps.appLoaded !== this.props.appLoaded){
            if(this.props.appLoaded){
                var all = document.getElementsByTagName("*");
                for (var i=0, max=all.length; i < max; i++) {
                    all[i].style.animation = '';
                }
            }
        }
    }

    componentWillUnmount(){
        document.body.style.overflow = '';
        document.body.classList.remove('bg-user-experience');
        document.body.style.background = '';
    }

    sendCursorEvent = (status) =>{
        this.props.cursorEvent(status, false);
    }

    render(){

        const validSvg = () => (
            <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 6720 8400' fillRule='evenodd'
                 clipRule='evenodd' shapeRendering='geometricPrecision' textRendering='geometricPrecision'
                 imageRendering='optimizeQuality'>
                <defs />
                <path className='fil0' d='M2659 3838l1989 -1989c33,-33 87,-33 121,0l0 0 341 341c33,33 33,87 0,121l0 0 -2389 2389c-33,33 -87,33 -121,0l0 0 -1092 -1092c-33,-33 -33,-87 0,-121 1,-1 3,-3 5,-4l334 -336 0 0c33,-33 87,-34 121,0l1 1 691 691zm3261 -478c0,-707 -287,-1347 -750,-1810 -463,-463 -1103,-750 -1810,-750 -707,0 -1347,287 -1810,750 -463,463 -750,1103 -750,1810 0,707 287,1347 750,1810 463,463 1103,750 1810,750 707,0 1347,-287 1810,-750 463,-463 750,-1103 750,-1810z'
                />
            </svg>
        );

        const content = () => (
            <div className="container">
                <div className="about-text-wrapper">
                    <div className="about-text-wrapper-ctn">
                        <div>
                            <p>Hi ! I’m Alexandre, a French creative Front-end Developper, My special field of knowledge is <span className="about-interact" onMouseMove={(e) => this.uiAnimationEvent(e)} onMouseLeave={() => this.uiAnimationEventOut()}>UI animations</span> and <span className="about-interact" onMouseEnter={() => this.userExperienceEvent()} onMouseLeave={() => this.userExperienceEventOut()}>user experience</span>.
                                Leaded by my great interest for Javascript, I try to discover and learn new things everyday.
                                <br/>
                                <br/>
                            </p>
                            <div className="contact-me">
                                <p>Feel free to</p>
                                <div className="contact-me-copy" onMouseOver={()=>this.sendCursorEvent(true)} onMouseLeave={()=>this.sendCursorEvent(false)}>
                                    <div className="contact-me-email">
                                        <CopyToClipboard text={this.state.value}
                                                         onCopy={() => {this.setState({copied: true});
                                                             setTimeout(()=>{
                                                                 this.setState({copied: false});
                                                             }, 3000)
                                                         }}>
                                            <p className="about-interact" ><span>contact me</span></p>
                                        </CopyToClipboard>
                                        {this.state.copied ?
                                            <div className={`copied`}>
                                                <div>{validSvg()}
                                                    <span>email copied to clipboard</span>
                                                </div>
                                            </div> : null}
                                    </div>
                                </div>
                            </div>
                            <p>I’m now free to any job proposition !</p>
                        </div>
                    </div>
                </div>
            </div>
        )

        return(

                <div className="about">
                    <div className="container">
                        {this.props.isMobile ?
                            <div style={{overflow: 'auto', height: '100%'}} ref="classicScroll" className="classicScroll">{content()}</div> :
                            <Scrollbar
                                damping={0.05}
                                alwaysShowTracks={false}>
                                {content()}
                            </Scrollbar>}
                    </div>
                    <div className="fill-scroll-bottom scrolling" ref="fillScrollBottom">
                        <div className="fill-scroll-bottom-bg"/>
                        <div className="fill-scroll-bottom-inertia"/>
                    </div>
                </div>
        )
    }
}

export default About;