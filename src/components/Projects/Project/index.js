import React from 'react';
import './styles.css';
import particles1 from '../../../assets/img/particles1.svg'
import particles2 from '../../../assets/img/particles2.svg'
import { withRouter, NavLink } from "react-router-dom";

class Project extends React.Component{
    distance = 0;
    holdInterval;

    state = {
        mouseDown: false,
        currentProject: this.props.details,
        redirection: false,
        showIcon: false,
        preventHide: false,
        animationEnd: true,
        active: false,
        imgI: 0
    };

    renderSvg = (svg) => {
        return {__html: svg};
    };

    sendCursorEvent = (hoverStatus, holdStatus) => {
        console.log('hoverStatus : ',hoverStatus);
        this.props.cursorEvent(hoverStatus, holdStatus);
    };

    onMouseDown = (e) => {
        this.setState({mouseDown: true});


        const $projects = document.getElementsByClassName('project');
        for(let i=0; i < $projects.length; i++){
            $projects[i].classList.remove('active');
        }
        
        let $activeElem = e.currentTarget.parentElement.parentElement;
        console.log($activeElem);
        $activeElem.classList.add('active');

        // this.refs.projectTitle.addEventListener('transitionend', (event) => {
        //     console.log(event);
        //     this.redirect(this.props.details);
        // });
        
        // this.holdInterval = setInterval(() => {
        //     // if(this.state.mouseDown && this.props.holdEnd){
        //     //     this.redirect(this.props.details);
        //     // }
        // }, 100);
    };

    onMouseUp = e => {
        this.setState({mouseDown: false});
        clearInterval(this.holdInterval);
        this.distance = 0;
    };

    preventHold = (e) => {
        if(this.state.mouseDown) {
            this.distance = this.distance + 5;
            if(this.distance >= 10){
                this.sendCursorEvent(false, false);
                this.distance = 0;
            }
        }
        let numderDelay = 10;
        let numberIndex = 0;

        if(this.state.imgI/numderDelay === 0){
            numberIndex = 0
        }else if(this.state.imgI/numderDelay < this.refs.imgWrapper.childNodes.length){
            numberIndex = this.refs.imgWrapper.childNodes[this.refs.imgWrapper.childNodes.length-1]
        }

        if(this.state.imgI % numderDelay === 0){
            let newImg = this.img_create(this.props.details.images[this.getRandomArbitrary(0,this.props.details.images.length-1)], '', '');
            this.refs.imgWrapper.appendChild(newImg);
        }
        this.setState({imgI: this.state.imgI+1});
    };

    hitAnimation = () => {
        this.props.getIfElementHit(false);
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

        let $iconParticles = this.refs.iconParticles;
        let $iconImg = this.refs.iconImg;

        let $hitMe = this.refs.hitMe;
        let randomNegPos = Math.round(Math.random()) * 2 - 1;
        let hitText = ['ow!', 'ouch!', 'argh!', 'aaugh!'];
        let generateHitText = Math.floor(Math.random() * hitText.length) + 1;

        $hitMe.classList.remove('hit-me--hidden');
        $hitMe.classList.add('hit-me--show');
        $iconImg.style.webkitAnimation = 'none';
        $iconParticles.childNodes[0].style.webkitAnimation = 'none';
        $iconParticles.childNodes[1].style.webkitAnimation = 'none';


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

        setTimeout(()=>{
            let particlesRotation = Math.floor(Math.random() * 360) + 1;
            $iconParticles.style.transform = `rotate(${-particlesRotation}deg)`;
            $iconImg.style.webkitAnimation = '';
            $iconImg.style.webkitAnimationDelay = '0s';
            $iconImg.style.webkitAnimationName = 'icon-pop-in--hit';

            $iconImg.childNodes[0].style.transform = `rotate(${randomNegPos * 3}deg)`;

            $iconParticles.childNodes[0].style.webkitAnimation = '';
            $iconParticles.childNodes[0].style.webkitAnimationDelay = '0s';

            $iconParticles.childNodes[1].style.webkitAnimation = '';
            $iconParticles.childNodes[1].style.webkitAnimationDelay = '0s';
        },0)
    };

    resetAnimations = () => {
        this.refs.iconImg.style.webkitAnimation = '';
        this.refs.iconImg.style.webkitAnimationDelay = '';
        this.refs.iconImg.style.webkitAnimationName = '';

        this.refs.iconParticles.childNodes[0].style.webkitAnimation = '';
        this.refs.iconParticles.childNodes[1].style.webkitAnimation = '';

        this.refs.line.style.visibility = '';
        this.refs.line.style.webkitAnimation = '';
    };

    iconHit = e => {
        this.hitAnimation();
    };

    redirect = (project) => {
        this.sendCursorEvent(false, false);
        this.setState({redirection: true});
        document.getElementsByClassName('projects')[0].classList.add('project-hold');
        this.translateBeforeChangePage();
        this.props.history.push(`/work/${project.id}/${project.title.toLowerCase().split(' ').join('-')}`);
    };

    translateBeforeChangePage(){
        const fixJumpPageLoad = 0;
        if(this.props.details.id !== 0){
            document.getElementsByClassName('projects-drag-area')[0].style.transform = `translate(${this.props.projectsSize[this.props.details.id-1]}px, 0px)`
        }else{
            document.getElementsByClassName('projects-drag-area')[0].style.transform = `translate(${this.props.projectsSize[0]}px, 0px)`
        }
    }

    popIn =() => {
        if(this.props.showHitBubble){
            let $hitMe = this.refs.hitMe;
            if($hitMe){
                $hitMe.classList.remove('hit-me--hidden');
                $hitMe.classList.add('hit-me--show');
            }
        }
    };

    popOut =() => {
        this.resetAnimations();
        let $hitMe = this.refs.hitMe;
        $hitMe.classList.remove('hit-me--show');
        $hitMe.classList.add('hit-me--hidden');
        setTimeout(()=>{
            $hitMe.classList.remove('hit-me--hidden');
        },300);
    };

    showIcon = (e) => {
        let $activeElem = e.currentTarget;
        if(!$activeElem.classList.contains('active') && !e.target.classList.contains('icon-img')){
            this.setState({preventHide: false});
            this.setState({'showIcon': true});
            if (this.props.showHitBubble) {
                console.log('POPIN');
                setTimeout(() => {
                    this.popIn();
                }, 1000);
            };
            // if ($activeElem.classList.contains('active--hidden')) {
            //     this.refs.line.style.webkitAnimation = 'none';
            //     this.refs.line.style.visibility = 'hidden';
            //     setTimeout(() => {
            //         this.refs.line.style.visibility = 'visible';
            //         this.refs.line.style.webkitAnimation = '';
            //     }, 0);
            //     $activeElem.classList.remove('active--hidden');
            // };
            $activeElem.classList.add('active');
            // this.addRightAndLeftClass($activeElem);
            this.setState({animationEnd: false});
            setTimeout(() => {
                this.setState({animationEnd: true});
            }, 1000);
        }

    };

    componentDidMount(){
    }

    getRandomArbitrary = (min, max) => {
        return Math.round(Math.random() * (max - min) + min);
    }

    img_create = (src, alt, title) => {
        let wrapper = document.createElement('div');
        wrapper.className = 'img-wrapper';
        wrapper.style.display = 'block';
        let img = document.createElement('img');
        img.src = src;
        if ( alt != null ) img.alt = alt;
        if ( title != null ) img.title = title;
        wrapper.appendChild(img);
        wrapper.style.top = `${this.getRandomArbitrary(-40,40)}px`;
        wrapper.style.left = `${this.getRandomArbitrary(-40,40)}px`;
        return wrapper;
    }

    hideIcon = (e) => {
        const removeAllProjectImg = () => {
            let elements = document.getElementsByClassName('img-wrapper');
            while(elements.length > 0){
                elements[0].parentNode.removeChild(elements[0]);
            }
            this.setState({imgI: 0});
        }

        const removeActiveClass = () => {
            const project = $activeElem;
            const $projects = document.getElementsByClassName('project');
            for(let i=0; i < $projects.length; i++){
                $projects[i].classList.remove('active');
            }
        }

        const $activeElem = e.currentTarget;
        if(!this.state.redirection && !e.target.classList.contains('icon-img')){
            removeAllProjectImg();
            removeActiveClass();
            // $activeElem.classList.add('active--hidden');
            // this.refs.line.style.webkitAnimation = 'none';
            // this.refs.line.style.visibility = 'hidden';
            setTimeout(() => {
                // this.refs.line.style.visibility = 'visible';
                // this.refs.line.style.webkitAnimation = 'circle-to-line 1s reverse forwards';
                this.popOut();
                setTimeout(()=>{
                    this.setState({animationEnd: false});
                }, 1000)
            }, 0);
        }
    };

    addRightAndLeftClass = (hoveredProject) => {
        let $projects = document.getElementsByClassName('project');
        let $projectsActive = hoveredProject;
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

    clickProject = (e) => {
        this.props.cursorEvent(false,false);
        this.refs.project.style.pointEvents = 'none';
    }

    render(){
        return(
            <div ref="project"
                className={`project js-project ${this.props.active === true ?  'active' : ''}`}
                onMouseOver={(e) => {this.showIcon(e); this.sendCursorEvent(true, false)}}
                onMouseLeave={(e) => {this.hideIcon(e); this.sendCursorEvent(false, false)}}>
                <div className="project-wrapper">
                    <NavLink onClick={e => this.clickProject(e)} activeClassName='active' to={{pathname: `/work/${this.props.details.id}/${this.props.details.title.toLowerCase().split(' ').join('-')}`}} className="project-title-container"
                        // onMouseDown={(e) => {this.sendCursorEvent(true, true); this.onMouseDown(e) }}
                        // onMouseUp={(e) => {this.sendCursorEvent(true, false); this.onMouseUp(e) }}
                        onMouseMove={(e) => this.preventHold(e)}>
                        <h2 className="project-title" ref="projectTitle" data-hover={this.props.details.title}>{this.props.details.title}</h2>
                    </NavLink>
                    <div className="project-img-wrapper" ref='imgWrapper'>
                    </div>
                    <div className="icon" ref='icon' onMouseDown={e => this.iconHit(e)}>
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
            </div>
        )
    }
}

export default withRouter(Project);