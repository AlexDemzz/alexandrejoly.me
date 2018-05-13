import React from 'react';
import './styles.css';
import particles1 from '../../../assets/img/particles1.svg'
import particles2 from '../../../assets/img/particles2.svg'
import { Link, withRouter, Redirect } from "react-router-dom";

class Project extends React.Component{
    timeout;
    preventDoubleRedirect = true;
    currentProject = null;
    distance = 0;
    holdInterval;

    state = {
        mouseDown: false,
        currentProject: this.props.details,
        redirection: false,
        showIcon: false,
        freezeClass: false
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
        this.holdInterval = setInterval(() => {
            if(this.state.mouseDown){
                this.redirect();
            }
        }, 100);
    }

    onMouseUp = e => {
        this.setState({mouseDown: false});
        clearInterval(this.holdInterval);
        this.distance = 0;
    }

    preventHold = () => {
        if(this.state.mouseDown) {
            this.distance = this.distance + 5;
            console.log(this.distance);
            if(this.distance >= 80){
                this.sendCursorEvent(false, false);
            }
        }
    }

    iconHit = e => {
        // this.refs.project.classList.add('active');
        // function rotate_degree(obj) {
        //     var matrix = obj.css("-webkit-transform") ||
        //         obj.css("-moz-transform")    ||
        //         obj.css("-ms-transform")     ||
        //         obj.css("-o-transform")      ||
        //         obj.css("transform");
        //     if(matrix !== 'none') {
        //         var values = matrix.split('(')[1].split(')')[0].split(',');
        //         var a = values[0];
        //         var b = values[1];
        //         var angle = Math.round(Math.atan2(b, a) * (180/Math.PI));
        //     } else { var angle = 0; }
        //     return (angle < 0) ? angle +=360 : angle;
        // }
        //
        // let $iconParticles = this.refs.iconParticles;
        // let $iconImg = this.refs.iconImg;
        // let $hitMe = this.refs.hitMe;
        // let randomNegPos = Math.round(Math.random()) * 2 - 1;
        // let hitText = ['ow!', 'ouch!', 'argh!', 'aaugh!'];
        // let generateHitText = Math.floor(Math.random() * hitText.length) + 1;
        //
        // $hitMe.classList.remove('hit-me--hidden');
        // $hitMe.classList.add('hit-me--show');
        // $iconImg.style.webkitAnimation = 'none';
        // $iconParticles.childNodes[0].style.webkitAnimation = 'none';
        // $iconParticles.childNodes[1].style.webkitAnimation = 'none';
        //
        //
        // if(hitText[generateHitText-1] !== $hitMe.childNodes[0].innerHTML){
        //     $hitMe.childNodes[0].innerHTML = hitText[generateHitText-1];
        // }else{
        //     $hitMe.childNodes[0].innerHTML = 'awk!';
        // }
        // clearTimeout(this.timeout);
        // this.timeout = setTimeout(() => {
        //     $hitMe.classList.remove('hit-me--show');
        //     $hitMe.classList.add('hit-me--hidden');
        //     $iconImg.childNodes[0].style.transform = `rotate(${0}deg)`;
        // }, 500);
        //
        // setTimeout(()=>{
        //     let particlesRotation = Math.floor(Math.random() * 360) + 1;
        //     $iconParticles.style.transform = `rotate(${-particlesRotation}deg)`;
        //     $iconImg.style.webkitAnimation = '';
        //     $iconImg.style.animationDelay = '0s';
        //     $iconImg.style.animationName = 'icon-pop-in--hit';
        //
        //     $iconImg.childNodes[0].style.transform = `rotate(${randomNegPos * 3}deg)`;
        //
        //     $iconParticles.childNodes[0].style.webkitAnimation = '';
        //     $iconParticles.childNodes[0].style.animationDelay = '0s';
        //
        //     $iconParticles.childNodes[1].style.webkitAnimation = '';
        //     $iconParticles.childNodes[1].style.animationDelay = '0s';
        // },0)
    };

    componentDidMount(){

    }

    redirect = () => {
        if(this.props.holdEnd){
            this.sendCursorEvent(false, false);
            this.setState({freezeClass: true});
            this.props.history.push(`/work/${this.props.details.id}/${this.props.details.title.toLowerCase().split(' ').join('-')}`);
        }
    };

    showIcon = (e) => {
        // this.setState({'showIcon': true});
        // function popIn(){
        //     let $hitMe = document.getElementsByClassName('hit-me')[0];
        //     $hitMe.classList.add('hit-me--animate');
        // };
        // popIn();
        if(!this.state.freezeClass){
            const project = this.refs.project;
            project.classList.remove('active--hidden');
            project.classList.add('active');
            this.addRightAndLeftClass();
        }
    };


    addRightAndLeftClass = () => {
        let $projects = document.getElementsByClassName('project');
        let $projectsActive = document.getElementsByClassName('project active')[0];
        for(let i=0; i<$projects.length; i++){
            $projects[i].classList.remove('not-active-before');
            $projects[i].classList.remove('not-active-after');
        }
        let $next = $projectsActive.nextElementSibling;
        let $prev = $projectsActive.previousElementSibling;
        if($next){
            $next.classList.add('not-active-after');
            if($next.nextElementSibling){
                $next.nextElementSibling.classList.add('not-active-after');
            }
        }
        if($prev){
            $prev.classList.add('not-active-before');
            if($prev.previousElementSibling){
                $prev.previousElementSibling.classList.add('not-active-before');
            }
        }
    };

    hideIcon = () => {
        if(!this.state.freezeClass) {
            this.setState({'showIcon': false});
            const project = this.refs.project;
            project.classList.remove('active');
            project.classList.add('active--hidden');
            this.refs.line.style.webkitAnimation = 'none';
            this.refs.line.style.visibility = 'hidden';
            setTimeout(() => {
                this.refs.line.style.visibility = 'visible';
                this.refs.line.style.webkitAnimation = '';
                setTimeout(() => {
                    project.classList.remove('active--hidden');
                }, 1000);
            }, 0)
        }
        // this.refs.line.style.webkitAnimation = 'none';
        // setTimeout(()=>{
        //     this.refs.line.style.webkitAnimation = '';
        //     project.classList.add('active--hidden');
        //     project.classList.remove('active');
        // },0)

        // setTimeout(()=>{
        //     if(project.classList.contains('active--hidden')) {
        //         project.classList.remove('active');
        //         project.classList.remove('active--hidden');
        //     }
        // },1500)
    };

    render(){

        return(
            <div ref="project" className={`project js-project ${this.props.active === true ?  'active' : ''}`} onMouseOver={(e) => this.showIcon(e)} onMouseLeave={() => this.hideIcon()}>
                <a
                    onMouseOver={() => this.sendCursorEvent(true, false)}
                    onMouseOut={() => this.sendCursorEvent(false, false)}
                    onMouseDown={(e) => {this.sendCursorEvent(true, true); this.onMouseDown(e) }}
                    onMouseUp={(e) => {this.sendCursorEvent(true, false); this.onMouseUp(e) }}
                    onMouseMove={(e) => this.preventHold()}>
                    <h2 className="project-title">{this.props.details.title}</h2>
                </a>

                <div className="icon" onMouseDown={e => this.iconHit(e)} ref='icon'>
                    <div className="hit-me" ref="hitMe">
                        <p>Hit me !</p>
                    </div>
                    <div className="icon-img" ref="iconImg" dangerouslySetInnerHTML={this.renderSvg(this.props.details.icon)}/>
                    <div className="icon-particles" ref="iconParticles">
                        <img src={particles1} alt=""/>
                        <img src={particles2} alt=""/>
                    </div>
                    <div className="line" ref="line"/>
                </div>
            </div>
        )
    }
}

export default withRouter(Project);