import React from 'react';
import './styles.css';
import Project from './Project/';

import Draggable from 'react-draggable';
import projectsList from '../../projects'
import { withRouter } from "react-router-dom";

class Projects extends React.Component{

    state = {
        projectsWidth: 1600,
        prevPath: '',
        active: '',
        translateX: 0,
        projectsListWidth: [],
        showHitBubble: true,
        projectsSize: [],
        dragging: false,
        isMobile: false
    };

    handleStart = (event, ui) => {
        this.getMaxBoundLeft();
        this.setState({dragging: true});
    };

    handleDrag = (event, ui) => {
        const removeActiveClass = () => {
            const $projects = document.getElementsByClassName('project');
            for(let i=0; i < $projects.length; i++){
                $projects[i].classList.remove('active');
            }
        };

        if(ui.deltaX>0){
            this.scrollAnimation(true, 'prev', event.movementX);
            removeActiveClass();
        }else{
            this.scrollAnimation(true, 'next', event.movementX);
            removeActiveClass();
        }
    };

    scrollAnimation = (status, direction = false, deg) => {
        let posDeg = Math.abs(deg)*2;
        posDeg >= 40 ?  posDeg = 40 : posDeg;
        let rotateZ = Math.abs(deg)/5;
        rotateZ >= 4 ?  rotateZ = 4 : rotateZ;
        let $projects = document.getElementsByClassName('js-project');
        if(status){
            for(let i=0; i < $projects.length ; i++){
                if(Math.abs(deg)>2){
                    this.refs.projectsDraggableArea.classList.add('projects-not-dragging');
                }else{
                    this.refs.projectsDraggableArea.classList.remove('projects-not-dragging');
                }
                if(direction === 'next'){
                    $projects[i].style.transform = `skew(-${posDeg}deg)`;
                    this.refs.projectsDraggableArea.classList.remove('dir-left');
                    this.refs.projectsDraggableArea.classList.add('dir-right');
                    this.refs.projectsDragAreaWrapper.style.transform = `scale(0.8) rotateZ(-${rotateZ}deg)`
                }else if(direction === 'prev'){
                    $projects[i].style.transform = `skew(${posDeg}deg)`;
                    this.refs.projectsDraggableArea.classList.remove('dir-right');
                    this.refs.projectsDraggableArea.classList.add('dir-left');
                    this.refs.projectsDragAreaWrapper.style.transform = `scale(0.8) rotateZ(${rotateZ}deg)`
                }
            }
        }else{
            for(let i=0; i < $projects.length ; i++) {
                $projects[i].style.transform = 'skew(0deg)';
            }
            this.refs.projectsDragAreaWrapper.style.transform = 'scale(1) rotateZ(0deg)'
        }
    };

    handleStop = (event, ui) => {
        this.scrollAnimation(false);
        this.sendDragPosition(ui.x);
        this.setState({dragging: false});
    };

    getMaxBoundLeft = () => {
        let $projects = document.getElementsByClassName('js-project');
        let projectSize = [];
        for(let n=0; n < $projects.length ; n++){
            switch(true){
                case n === 0:
                    projectSize.push(-Math.abs($projects[n].offsetWidth));
                    break;
                default:
                    projectSize.push(-Math.abs($projects[n].offsetWidth + $projects[n-1].offsetWidth));
                    break;
            }
        }
        this.setState({projectsWidth: projectSize[projectSize.length-1]+400});
        this.setState({projectsListWidth: projectSize});
    };

    componentWillReceiveProps(nextProps) {
        if (nextProps.location !== this.props.location) {
            this.setState({ prevPath: this.props.location });
        }
    }

    componentWillUnmount(){
        this.refs.projects.classList.remove('show');
        window.removeEventListener('resize', this.getIfMobile);
    }
    componentDidMount(){
        let $projects = document.getElementsByClassName('js-project');
        let projectsSize = [];
        let size = 0;
        for(let n=0; n < $projects.length ; n++){
            if(n !== 0){
                size = $projects[n].offsetWidth + $projects[n-1].offsetWidth;
                projectsSize.push(-Math.abs(size));
            }else{
                projectsSize.push(-Math.abs($projects[n].offsetWidth));
            }
        }
        this.setState({projectsSize});
        this.refs.projects.classList.add('show');
        if(this.props.history.action === 'POP'){
            this.refs.projects.classList.add('init-projects-end');
        }
        this.getIfMobile();
        window.addEventListener('resize', this.getIfMobile);
    }

    componentWillMount(){
        document.body.style.overflow = 'hidden';
        if(this.props.dragPosition){
            this.setState({translateX: this.props.dragPosition});
        }
    }

    sendDragPosition(pos){
        this.props.getDragPosition(pos);
    }

    getIfElementHit = (status) =>{
        this.setState({showHitBubble: status});
    }
    

    // setNotHolding = () => {
    //     let timeout = null;
    //     console.log(this.refs.projectsDraggableArea);
    //     if(!this.props.hold && this.state.dragging){
    //         timeout = setTimeout(()=>{
    //             this.refs.projects.classList.add('project-not-holding');
    //         },500)
    //     }else{
    //         this.refs.projects.classList.remove('project-not-holding');
    //     }
    //     clearInterval(timeout);
    // }

    getIfMobile = () => {
        if(window.innerWidth<480){
            this.setState({isMobile: true});
        }else{
            this.setState({isMobile: false});
        }
    }

    render(){
        const projects = Object
            .keys(projectsList)
            .map(key => {
                if(key === this.props.activeProject){
                    return(
                        <Project projectsSize={this.state.projectsSize}
                                 showHitBubble={this.state.showHitBubble} getIfElementHit={this.getIfElementHit} active={true} className={this.props.activeProject ? 'active' : ''} holdEnd={this.props.holdEnd} cursorEvent={this.props.cursorEvent} key={key} details={projectsList[key]}/>
                    )
                }else{
                    return(
                        <Project projectsSize={this.state.projectsSize} showHitBubble={this.state.showHitBubble} getIfElementHit={this.getIfElementHit} active={false} holdEnd={this.props.holdEnd} cursorEvent={this.props.cursorEvent} key={key} details={projectsList[key]}/>
                    )
                }
            });

        return(
            <div className={`projects ${this.props.hold ? 'project-hold' : ''}`} ref="projects">
                {/*<h3>Creative front-end developer based in France<br/>obessed with UI animations</h3>*/}
                <div className="container">
                    {!this.state.isMobile ?
                        <Draggable
                            axis="x"
                            handle=".projects-drag-area"
                            grid={[75, 75]}
                            defaultPosition={{x: this.state.translateX, y: 0}}
                            bounds={{left: this.state.projectsSize[this.state.projectsSize.length-1], top: 0, right: 0, bottom: 0}}
                            onStart={this.handleStart}
                            onDrag={this.handleDrag}
                            onStop={this.handleStop}>
                            <div className="projects-drag-area" ref="projectsDraggableArea">
                                <div className="projects-drag-area-wrapper" ref="projectsDragAreaWrapper">
                                    {projects}
                                </div>
                            </div>
                        </Draggable>
                        :
                        <div className="mobile-projects-wrapper">
                            {projects}
                        </div>
                    }

                </div>
                <div className="fill-scroll-bottom scrolling" ref="fillScrollBottom">
                    <div className="fill-scroll-bottom-bg"/>
                </div>
            </div>
        )
    }
}
export default withRouter(Projects);