import React from 'react';
import './styles.css';
import { Link } from "react-router-dom";

class Project extends React.Component{
    demoMethod = (value) => {
        this.props.sendData(value);
    }
    render(){
        return(
            <div className="project js-project">
                <Link to={{ pathname: `/work/${this.props.details.id}/${this.props.details.title.toLowerCase().split(' ').join('-')}`}}>
                    <h2 className="project-title">{this.props.details.title}</h2>
                    <div className="project-container">
                        <div className="picture-container">
                            <img src="http://fakeimg.pl/900x900" alt=""/>
                        </div>
                    </div>
                </Link>
            </div>
        )
    }
}

export default Project;