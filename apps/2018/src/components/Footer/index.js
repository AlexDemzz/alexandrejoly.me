import React from 'react';
import './styles.css';
import {CopyToClipboard} from 'react-copy-to-clipboard';

class Footer extends React.Component{
    state = {
        value: 'alexandre.joly36@gmail.com',
        copied: false,
    };

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

        return(
            <footer id="footer" ref="footer" className={`show ${this.props.noFixed ? 'no-fixed' : ''}`}>
                <div className="content">
                    <p>Find me on <a href="https://www.linkedin.com/in/alexandre-joly-a23154107/" rel="noopener noreferrer" target="_blank"> LinkedIn </a></p>
                    <div>
                        <p>or say Hello by</p>
                        <div className="contact-me-email">
                            <CopyToClipboard text={this.state.value}
                                             onCopy={() => {this.setState({copied: true});
                                                 setTimeout(()=>{
                                                     this.setState({copied: false});
                                                 }, 3000)
                                             }}>
                                <p className="about-interact" >mail</p>
                            </CopyToClipboard>
                            {this.state.copied ?
                                <div className={`copied`}>
                                    <div>{validSvg()}
                                        <span>email copied to clipboard</span>
                                    </div>
                                </div> : null}
                        </div>
                        <p>🔥</p>
                    </div>
                </div>
                <div className="content">
                    <p className="shy">Designed & dev with passion</p>
                </div>
            </footer>
        )
    }
}

export default Footer;