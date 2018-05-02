import React from 'react';
import './styles.css';
import Project from './Project';
import Slider from "react-slick";
import projectsList from '../../projects'

class Projects extends React.Component{
    state = { x: 0 };
    mouseDown = false;
    dragPos = 0;
    mY = 0;
    distance = 0;
    activeProject = 0;
    tX = 0;

    onMouseMove = e => {
        let $projects = document.getElementsByClassName('js-project');
        let projectSize = [];
        let size = 0;
        for(let n=0; n < $projects.length ; n++){
            if(n !== 0){
                size = $projects[n].offsetWidth + $projects[n-1].offsetWidth;
                projectSize.push(-Math.abs(size));
            }else{
                projectSize.push(-Math.abs($projects[n].offsetWidth));
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

        if(this.mouseDown){
            let $projectsDragArea = document.getElementsByClassName('projects-drag-area')[0];
            let currentPos = getComputedTranslateXY($projectsDragArea)[0];
            if(this.mouseDown){
                if (e.pageX < this.mY) {
                    console.log('next');
                    this.dragPos  = this.dragPos - 5;
                    this.distance = this.distance - 5;
                } else{
                    console.log('prev');
                    this.dragPos = this.dragPos + 5;
                    this.distance = this.distance + 5;
                }

                if(this.distance <= -300 || this.distance >= 300){
                    $projectsDragArea.style.transition = "all 1s";
                    if(this.distance<0){
                        console.log('next pjt');
                        this.activeProject++;
                        this.dragPos = projectSize[this.activeProject-1];
                    }else{
                        console.log('prev pjt');
                        if(this.activeProject>0){
                            this.activeProject--;
                            if(this.activeProject !== 0){
                                this.dragPos = projectSize[this.activeProject-1];
                            }else{
                                this.dragPos = 0;
                            }
                        }
                    }
                    this.mouseDown = false;
                    console.log(projectSize);
                    console.log('slide');
                    console.log('this.activeProject : ' + this.activeProject);
                    console.log('this.dragPos : ' + this.dragPos);
                    this.distance = 0;
                }
                this.mY = e.pageX;
            }
        }
    };

    onMouseDown = e => {
        this.mouseDown = true;
        let $projectsDragArea = document.getElementsByClassName('projects-drag-area')[0];
        $projectsDragArea.style.transition = "all 0s";
        console.log('start');
    };

    onMouseLeave = e => {
        this.mouseDown = false;
        console.log('stop / reset distance');

        let $projects = document.getElementsByClassName('js-project');
        let projectSize = [];
        let size = 0;
        for(let n=0; n < $projects.length ; n++){
            if(n !== 0){
                size = $projects[n].offsetWidth + $projects[n-1].offsetWidth;
                projectSize.push(-Math.abs(size));
            }else{
                projectSize.push(-Math.abs($projects[n].offsetWidth));
            }
        }

        let $projectsDragArea = document.getElementsByClassName('projects-drag-area')[0];

        if(this.activeProject===0){
            this.dragPos = 0;
        }else{
            this.dragPos = projectSize[this.activeProject-1];
        }
        $projectsDragArea.style.transition = "all 1s";
    };

    render(){

        const projects = Object
            .keys(projectsList)
            .map(key => <Project key={key} details={projectsList[key]}/>);

        const { x, y } = this.state;
        return(
            <div className="projects">
                <div className="projects-drag-area" style={{transform: `translateX(${this.dragPos}px)`}}  onMouseMove={e => this.onMouseMove(e)} onMouseDown={e => this.onMouseDown(e)} onMouseUp={e => this.onMouseLeave(e)}>
                    {projects}
                </div>
            </div>
        )
    }
}

export default Projects;