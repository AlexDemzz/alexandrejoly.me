import React from 'react';
import './styles.css';
import projectsList from '../../../projects';
import { TransitionGroup, CSSTransition } from 'react-transition-group'
class ProjectDetails extends React.Component{
    getProject = () => {

    }

    render(){
        const project = projectsList.map(project => {
                if (project.id === this.props.match.params.id){
                    let imgs = project.images.map(
                        (img, index) => { return <img key={index} src={img} alt=""/> }
                    );
                    let works = project.works.map(
                        (work, index) => { return <p key={index}>{work}</p> }
                    );
                    return (
                        <div className="project-details" key={project.id}>
                            <h2 className="project-title">{project.title}</h2>
                            <div className="project-details-infos">
                                <div className="project-details-infos-start">
                                    {works}
                                </div>
                                <div className="project-details-infos-end">
                                    <p>{project.date}</p>
                                </div>
                            </div>
                            <p>{project.text}</p>
                            <div className="project-details-images">
                                {imgs}
                            </div>
                        </div>
                    )
                }
            });
        return(
            <div className="container">
                {project}
            </div>
        )
    }
}
export default ProjectDetails;