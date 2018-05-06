import React from 'react';
import './styles.css';
import { Link } from "react-router-dom";

class About extends React.Component{

    render(){
        return(
            <div className="about">
                <p>Hello, i’m Alexandre, but call me Alex, i’m a French Front-end Developer, i have a keen interrest with UI animations and user experience.
                    Driven by my passion for the javascript, i try to discover and learn new things every day.
                    <br/>
                    <br/>
                    Feel free to contact me,<br/>
                    i’m looking for a full-time job.
                </p>
            </div>
        )
    }
}

export default About;