import React from 'react';
import './styles.css';
import Project from './Project';
import Slider from "react-slick";
import projectsList from '../../projects'

class Projects extends React.Component{
    state = { x: 0 };

    render(){

        const projects = Object
            .keys(projectsList)
            .map(key => <Project key={key} details={projectsList[key]}/>);

        const { x, y } = this.state;
        return(
            <div className="projects">
                <h3>Front-end developer based in France<br/>obessed with UI animations</h3>
                <div className="projects-drag-area">
                    {projects}
                </div>
            </div>
        )
    }
}

export default Projects;