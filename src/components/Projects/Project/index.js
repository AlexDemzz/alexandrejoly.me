import React from 'react';
import './styles.css';
import particles from '../../../assets/img/particles.svg'
import { Link } from "react-router-dom";

class Project extends React.Component{
    demoMethod = (value) => {
        this.props.sendData(value);
    }

    renderSvg = (svg) => {
        return {__html: svg};
    }

    temp = () => {
        if(this.props.details.title === 'Burger King'){
            return 'active';
        }
    }
    
    iconHit = e => {
        let $iconParticles = document.getElementsByClassName('icon-particles')[0];
        let $iconImg = document.getElementsByClassName('icon-img')[0];
        $iconImg.style.webkitAnimation = 'none';
        $iconParticles.style.webkitAnimation = 'none';
        setTimeout(function() {
            $iconParticles.childNodes[0].style.transform = `rotate(${Math.floor(Math.random() * 90) + 1}deg)`;
            $iconImg.style.webkitAnimation = '';
            $iconParticles.style.webkitAnimation = '';
            $iconImg.style.animationDelay = '0s';
            $iconParticles.style.animationDelay = '0s';
        },0);
    };

    render(){
        return(
            <div className={'project js-project ' + this.temp()}>
                <Link to={{ pathname: `/work/${this.props.details.id}/${this.props.details.title.toLowerCase().split(' ').join('-')}`}}>
                    <h2 className="project-title">{this.props.details.title}</h2>
                </Link>
                <div className="icon" onClick={e => this.iconHit(e)}>
                    <div className="icon-img" dangerouslySetInnerHTML={this.renderSvg(this.props.details.icon)}/>
                    <div className="icon-particles">
                        <img src={particles} alt=""/>
                    </div>
                    <div className="line"/>
                </div>
            </div>
        )
    }
}

export default Project;