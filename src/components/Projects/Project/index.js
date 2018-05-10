import React from 'react';
import './styles.css';
import particles1 from '../../../assets/img/particles1.svg'
import particles2 from '../../../assets/img/particles2.svg'
import { Link, withRouter, Redirect } from "react-router-dom";

class Project extends React.Component{
    timeout;
    preventDoubleRedirect = true;
    currentProject = null;
    distance;

    state = {
        mouseDown: false,
        currentProject: this.props.details,
        redirection: false,
    }

    demoMethod = (value) => {
        this.props.sendData(value);
    }

    renderSvg = (svg) => {
        return {__html: svg};
    }

    getActive = () => {
        return ;
    }

    sendCursorEvent = (hoverStatus, holdStatus) => {
        this.props.cursorEvent(hoverStatus, holdStatus);
    }

    onMouseDown = e => {
        e.preventDefault();
        this.setState({mouseDown: true});
    }

    onMouseUp = e => {
        this.setState({mouseDown: false});
    }

    preventHold = () => {
        this.distance = 0;
        if(this.state.mouseDown) {
            this.distance = this.distance - 5;
            if(this.distance <= 100){
                this.sendCursorEvent(false, false);
            }
        }
    }

    iconHit = e => {
        function rotate_degree(obj) {
            var matrix = obj.css("-webkit-transform") ||
                obj.css("-moz-transform")    ||
                obj.css("-ms-transform")     ||
                obj.css("-o-transform")      ||
                obj.css("transform");
            if(matrix !== 'none') {
                var values = matrix.split('(')[1].split(')')[0].split(',');
                var a = values[0];
                var b = values[1];
                var angle = Math.round(Math.atan2(b, a) * (180/Math.PI));
            } else { var angle = 0; }
            return (angle < 0) ? angle +=360 : angle;
        }


        let $iconParticles = document.getElementById('icon-particles');
        let $iconImg = document.getElementById('icon-img');
        let $hitMe = document.getElementById('hit-me');
        let randomNegPos = Math.round(Math.random()) * 2 - 1;
        $hitMe.classList.remove('hit-me--hidden');
        $hitMe.classList.add('hit-me--show');
        $iconImg.style.webkitAnimation = 'none';
        $iconParticles.childNodes[0].style.webkitAnimation = 'none';
        $iconParticles.childNodes[1].style.webkitAnimation = 'none';
        let hitText = ['ow!', 'ouch!', 'argh!', 'aaugh!'];
        let generateHitText = Math.floor(Math.random() * hitText.length) + 1;

        if(hitText[generateHitText-1] !== $hitMe.childNodes[0].innerHTML){
            $hitMe.childNodes[0].innerHTML = hitText[generateHitText-1];
        }else{
            $hitMe.childNodes[0].innerHTML = 'awk!';
        }
        clearTimeout(this.timeout);
        this.timeout = setTimeout(() => {
            $hitMe.classList.remove('hit-me--show');
            $hitMe.classList.add('hit-me--hidden');
            $iconImg.childNodes[0].style.transform = `rotate(${0}deg)`;
        }, 500);

        setTimeout(function() {
            let particlesRotation = Math.floor(Math.random() * 360) + 1;
            $iconParticles.style.transform = `rotate(${-particlesRotation}deg)`;



            $iconImg.style.webkitAnimation = '';
            $iconImg.style.animationDelay = '0s';
            $iconImg.style.animationName = 'icon-pop-in--hit';

            $iconImg.childNodes[0].style.transform = `rotate(${randomNegPos * 3}deg)`;

            $iconParticles.childNodes[0].style.webkitAnimation = '';
            $iconParticles.childNodes[0].style.animationDelay = '0s';

            $iconParticles.childNodes[1].style.webkitAnimation = '';
            $iconParticles.childNodes[1].style.animationDelay = '0s';


        },0);
    };

    componentDidMount(){
        function popIn(){
            let $hitMe = document.getElementById('hit-me');
            setTimeout(()=>{
                $hitMe.classList.add('hit-me--animate');
            },2000)
        };
        popIn();
    }

    render(){
        const redirect = () => {
            if(this.props.holdEnd && this.props.active){
                this.sendCursorEvent(false, false);
                document.getElementsByClassName('project active')[0].style.pointerEvents = 'none';
                return (<Redirect to={`/work/${this.props.details.id}/${this.props.details.title.toLowerCase().split(' ').join('-')}`}/>)
            }
        }
        return(
            <div className={`project js-project ${this.props.active === true ?  'active' : ''}`}>
                {redirect()}
                <a
                    onMouseOver={() => this.sendCursorEvent(true, false)}
                    onMouseOut={() => this.sendCursorEvent(false, false)}
                    onMouseDown={(e) => {this.sendCursorEvent(true, true); this.onMouseDown(e) }}
                    onMouseUp={(e) => {this.sendCursorEvent(true, false); this.onMouseUp(e) }}
                    onMouseMove={(e) => this.preventHold()}>
                    <h2 className="project-title">{this.props.details.title}</h2>
                </a>

                <div className="icon" onMouseDown={e => this.iconHit(e)}  id={this.props.active === true ? 'icon' : ''}>
                    <div className="hit-me" id={this.props.active === true ? 'hit-me' : ''}>
                        <p>Hit me !</p>
                    </div>
                    <div className="icon-img" dangerouslySetInnerHTML={this.renderSvg(this.props.details.icon)} id={this.props.active === true ? 'icon-img' : ''}/>
                    <div className="icon-particles" id={this.props.active === true ? 'icon-particles' : ''}>
                        <img src={particles1} alt=""/>
                        <img src={particles2} alt=""/>
                    </div>
                    <div className="line"/>
                </div>
            </div>
        )
    }
}

export default withRouter(Project);