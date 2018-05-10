import React from 'react';
import './styles.css';
import Project from './Project';
import Slider from "react-slick";
import projectsList from '../../projects'

class Projects extends React.Component{
    state = {
        x: 0,
        mouseDown: false,
        activeProject: 0,
    };
    mouseDown = false;
    dragPos = 0;
    mY = 0;
    distance = 0;
    activeProject = 0;
    tX = 0;

    onMouseMove = e => {
        if(this.state.mouseDown === true){
            let $projects = document.getElementsByClassName('js-project');
            let projectSize = [];
            let size = 0;
            for(let n=0; n < $projects.length ; n++){
                switch(true){
                    case n === 0:
                        projectSize.push(-Math.abs($projects[n].offsetWidth)/2);
                        break;
                    default:
                        projectSize.push(-Math.abs($projects[n].offsetWidth/2 + $projects[n-1].offsetWidth/2));
                        break;
                }
            }

            function getComputedTranslateXY(obj)
            {
                const transArr = [];
                if(!window.getComputedStyle) return;
                const style = getComputedStyle(obj),
                    transform = style.transform || style.webkitTransform || style.mozTransform;
                let mat = transform.match(/^matrix3d\((.+)\)$/);
                if(mat) return parseFloat(mat[1].split(', ')[13]);
                mat = transform.match(/^matrix\((.+)\)$/);
                mat ? transArr.push(parseFloat(mat[1].split(', ')[4])) : 0;
                mat ? transArr.push(parseFloat(mat[1].split(', ')[5])) : 0;
                return transArr;
            }

            function scrollAnimation(direction){
                for(let i=0; i < $projects.length ; i++){
                    if(direction === 'next'){
                        $projects[i].style.transform = 'skew(-20deg)';
                    }else{
                        $projects[i].style.transform = 'skew(20deg)';
                    }
                }
            }

            let $projectsDragArea = document.getElementsByClassName('projects-drag-area')[0];
            let currentPos = getComputedTranslateXY($projectsDragArea)[0];
            if(this.dragPos<=0+26 && this.dragPos>= projectSize[projectSize.length-1]*2.1){
                if (e.pageX < this.mY) {
                    this.dragPos  = this.dragPos - 10;
                    this.distance = this.distance - 1;
                    scrollAnimation('next');
                } else{
                    this.dragPos = this.dragPos + 10;
                    this.distance = this.distance + 1;
                    scrollAnimation('prev');
                }
            }else if(this.dragPos>0){
                this.dragPos = 0;
            }else if(this.dragPos<projectSize[projectSize.length-1]*2.1){
                this.dragPos = projectSize[projectSize.length-1]*2.1;
            }
            this.mY = e.pageX;
            for(let y=0; y<projectSize.length; y++){
                console.log('-----------------');
                console.log(this.dragPos);
                console.log(y);
                console.log(projectSize);
                console.log('projectSize[y]' + projectSize[y]);
                if(this.dragPos < projectSize[y]){
                    this.setState({activeProject: y});
                }
            }
        }
    };

    onMouseDown = () => {
        this.setState({mouseDown: true});
    };

    onMouseLeave = () => {
        this.setState({mouseDown: false});
        let $projects = document.getElementsByClassName('js-project');
        let $projectsDragArea = document.getElementsByClassName('projects-drag-area')[0];
        for(let i=0; i < $projects.length ; i++){
            $projects[i].style.transform = 'skew(0deg)';
        }
    };

    // componentDidMount(){
    //     document.addEventListener("mouseout", (e) => {
    //         e = e ? e : window.event;
    //         var from = e.relatedTarget || e.toElement;
    //         if (!from || from.nodeName == "HTML") {
    //             this.onMouseLeave();
    //         }
    //     });
    // }
    render(){
        const projects = Object
            .keys(projectsList)
            .map(key => {
                if(Number(key) === this.state.activeProject){
                    return (
                        <Project active={true} holdEnd={this.props.holdEnd} cursorEvent={this.props.cursorEvent} key={key} details={projectsList[key]}/>
                    )
                }else{
                   return(
                       <Project active={false} holdEnd={this.props.holdEnd} cursorEvent={this.props.cursorEvent} key={key} details={projectsList[key]}/>
                   )
                }
            });
        const { x, y } = this.state;
        return(
            <div className="projects">
                <h3>Front-end developer based in France<br/>obessed with UI animations</h3>
                <div className="projects-drag-area" style={{transform: `translateX(${this.dragPos}px)`}}  onMouseLeave={() => this.onMouseLeave()} onMouseMove={(e) => this.onMouseMove(e)} onMouseDown={() => this.onMouseDown()} onMouseUp={() => this.onMouseLeave()}>
                    {projects}
                </div>
            </div>
        )
    }
}

export default Projects;