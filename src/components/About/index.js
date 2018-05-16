import React from 'react';
import './styles.css';

class About extends React.Component{

    render(){
        return(
            <div className="about">
                <div className="about-text-wrapper">
                    <p>Hello, i’m Alexandre, i’m a French Creative Front-end Developer, i have a keen interrest with UI animations and user experience.
                        Driven by my passion for the javascript, i try to discover and learn new things every day.
                        <br/>
                        <br/>
                        Feel free to contact me,<br/>
                        i’m looking for a full-time job.
                    </p>
                </div>
            </div>
        )
    }
}

export default About;