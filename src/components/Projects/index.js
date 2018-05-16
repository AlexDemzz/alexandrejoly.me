import React from 'react';
import './styles.css';
import Project from './Project';

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
        showHitBubble: true
    };

    handleStart = (event, ui) => {
        this.getMaxBoundLeft();
    };

    handleDrag = (event, ui) => {
        if(ui.deltaX>0){
            this.scrollAnimation(true, 'prev', event.movementX);
        }else{
            this.scrollAnimation(true, 'next', event.movementX);
        }
    };

    scrollAnimation = (status, direction = false, deg) => {
        let posDeg = Math.abs(deg)*5;
        posDeg >= 20 ?  posDeg = 20 : posDeg;
        let $projects = document.getElementsByClassName('js-project');
        if(status){
            for(let i=0; i < $projects.length ; i++){
                if(direction === 'next'){
                    $projects[i].style.transform = `skew(-${posDeg}deg)`;
                    this.refs.projectsDraggableArea.classList.remove('dir-left');
                    this.refs.projectsDraggableArea.classList.add('dir-right');
                }else if(direction === 'prev'){
                    $projects[i].style.transform = `skew(${posDeg}deg)`;
                    this.refs.projectsDraggableArea.classList.remove('dir-right');
                    this.refs.projectsDraggableArea.classList.add('dir-left');
                }
            }
        }else{
            for(let i=0; i < $projects.length ; i++) {
                $projects[i].style.transform = 'skew(0deg)';
            }
        }
    };

    handleStop = (event, ui) => {
        this.scrollAnimation(false);
        this.sendDragPosition(ui.x)
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
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.location !== this.props.location) {
            this.setState({ prevPath: this.props.location })
        }
    }

    componentDidUpdate(){
    }

    componentWillMount(){
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

    render(){
        const projects = Object
            .keys(projectsList)
            .map(key => {
                if(key === this.props.activeProject){
                    return(
                        <Project showHitBubble={this.state.showHitBubble} getIfElementHit={this.getIfElementHit} active={true} className={this.props.activeProject === true ? 'active' : ''} holdEnd={this.props.holdEnd} cursorEvent={this.props.cursorEvent} key={key} details={projectsList[key]}/>
                    )
                }else{
                    return(
                        <Project showHitBubble={this.state.showHitBubble} getIfElementHit={this.getIfElementHit} active={false} holdEnd={this.props.holdEnd} cursorEvent={this.props.cursorEvent} key={key} details={projectsList[key]}/>
                    )
                }
            });

        return(
            <div className={`projects ${this.props.hold ? 'project-hold' : ''}`}>
                <h3>Creative front-end developer based in France<br/>obessed with UI animations</h3>
                <Draggable
                    axis="x"
                    handle=".projects-drag-area"
                    grid={[25, 25]}
                    defaultPosition={{x: this.state.translateX, y: 0}}
                    bounds={{left: this.state.projectsWidth, top: 0, right: 0, bottom: 0}}
                    onStart={this.handleStart}
                    onDrag={this.handleDrag}
                    onStop={this.handleStop}>
                    <div className="projects-drag-area" ref="projectsDraggableArea">
                        <div className="projects-drag-area-wrapper">
                            {projects}
                        </div>
                    </div>
                </Draggable>
            </div>
        )
    }
}
export default withRouter(Projects);