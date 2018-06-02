import React from 'react';
import './styles.css';

class Footer extends React.Component{
    componentDidUpdate(){
        if(this.props.appLoaded){
            this.refs.footer.classList.add('show');
        }
    }
    render(){
        return(
            <footer id="footer" ref="footer" className={this.props.noFixed ? 'no-fixed' : ''}>
                <p>Find me on <a href="https://www.linkedin.com/in/alexandre-joly-a23154107/" target="_blank"> LinkedIn </a> or say Hello by <a href=""> mail </a> 🔥</p>
                <p className="shy">Designed & dev with passion</p>
            </footer>
        )
    }
}

export default Footer;