import React from 'react';
import './styles.css';
import Project from './Project';
import Slider from "react-slick";
import projectsList from '../../projects'

class Projects extends React.Component{
    state = { x: 0 };
    mouseDown = false;
    dragPos = 0;
    onMouseMove = e => {
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
            let oldX = getComputedTranslateXY($projectsDragArea)[1];
            this.dragPos = e.screenX - oldX;
            console.log('oldX :      ', oldX);
            console.log('e.screenX : ', e.screenX);
            console.log('deplacement : ', e.screenX-oldX);
            console.log('this.dragPos : ', this.dragPos);

        }
    };

    onMouseDown = () => {
        this.mouseDown = true
    };

    onMouseLeave = e => {
        this.mouseDown = false;
        this.setState({x: e.screenX});
    };

    render(){
        const projects = Object
            .keys(projectsList)
            .map(key => <Project key={key} details={projectsList[key]}/>);

        const { x, y } = this.state;
        return(
            <div className="projects">
                <div className="projects-drag-area" style={{transform: `translateX(${this.dragPos}px)`}}  onMouseMove={e => this.onMouseMove(e)} onMouseDown={this.onMouseDown} onMouseUp={e => this.onMouseLeave(e)}>
                    {projects}
                </div>
            </div>
        )
    }
}

export default Projects;