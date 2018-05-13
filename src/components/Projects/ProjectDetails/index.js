import React from 'react';
import './styles.css';
import projectsList from '../../../projects';
import { TransitionGroup, CSSTransition } from 'react-transition-group'
import OnVisible, {setDefaultProps} from 'react-on-visible';

class ProjectDetails extends React.Component{
    getProject = () => {

    };

    projectIdEvent = (id) => {
        this.props.projectIdEvent(id);
    };

    componentDidMount(){
        this.projectIdEvent(this.props.match.params.id);
    };

    render(){
        setDefaultProps({
            bounce: true,
            visibleClassName: 'visible',
            percent: 5
        });

        const project = projectsList.map(project => {
                if (project.id === this.props.match.params.id){
                    let imgs = project.images.map(
                        (img, index) => {
                            return(
                                <OnVisible key={index}>
                                    <img src={img} alt=""/>
                                </OnVisible >
                            )
                        });
                    let works = project.works.map(
                        (work, index) => { return (
                            <div className="info" key={index}>
                                <p>{work}</p>
                            <div className="line"/></div>)}
                    );
                    return (
                        <div className="project-details" key={project.id}>
                            <div className="project-details-header-fixed">
                                <h2 className="project-title">{project.title}</h2>
                                <div className="project-details-infos">
                                    <div className="project-details-infos-start">
                                        <div className="subtitle">
                                            <span>HOW?</span>
                                        </div>
                                        <div className="content">
                                            {works}
                                        </div>
                                    </div>
                                    <div className="project-details-infos-end">
                                        <div className="subtitle">
                                            <span>WHEN?</span>
                                        </div>
                                        <div className="content">
                                            <p>{project.date}</p>
                                        </div>

                                    </div>
                                </div>
                                <div className="project-details-text">
                                    <div className="subtitle">
                                        <span>WHY?</span>
                                    </div>
                                    <div className="content">
                                        <p>{project.text}</p>
                                    </div>
                                </div>
                            </div>
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