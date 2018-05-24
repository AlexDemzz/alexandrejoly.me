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
            <footer id="footer" ref="footer">
                <p>Find me on <a href="">LinkedIn</a> or say Hello! by <a href="">mail</a> 🔥</p>
                <p className="shy">Designed & Dev by me</p>
            </footer>
        )
    }
}

export default Footer;