import React from 'react';
import './styles.css';
import projectsList from '../../../projects';
import { TransitionGroup, CSSTransition } from 'react-transition-group'
import TrackVisibility from 'react-on-screen'

class ProjectDetails extends React.Component{
    getProject = () => {

    }

    render(){
        const project = projectsList.map(project => {
                if (project.id === this.props.match.params.id){
                    let imgs = project.images.map(
                        (img, index) => {
                            if(index === 0){
                                return (
                                    <TrackVisibility key={index} once className="fadeTranslateAnimation--isVisibility">
                                        {({ isVisible }) => isVisible && <img src={img} alt=""/>}
                                    </TrackVisibility>
                                );
                            }else{
                                return(
                                    <div key={index} className="fadeTranslateAnimation--isVisibility">
                                        <img src={img} alt=""/>
                                    </div>
                                )
                            }
                        });
                    let works = project.works.map(
                        (work, index) => { return (
                            <div className="info" key={index}>
                                <p>{work}</p>
                            <div className="line"/></div>)}
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