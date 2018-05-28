import React from 'react';
import './styles.css';

class About extends React.Component{
    uiAnimationEvent = (e) => {
        function getRandomColor() {
            var letters = '0123456789ABCDEF';
            var color = '#';
            for (var i = 0; i < 6; i++) {
                color += letters[Math.floor(Math.random() * 16)];
            }
            return color;
        }
        document.body.style.background = getRandomColor();
    }

    uiAnimationEventOut = () => {
        document.body.style.background = '';
    }
    
    userExperienceEvent = () => {
        document.body.classList.add('bg-user-experience');
    }
    userExperienceEventOut = () => {
        document.body.classList.remove('bg-user-experience');
    }

    componentWillMount() {
        document.body.style.overflow = 'hidden';
    }

    componentDidUpdate(prevProps){
        if(prevProps.appLoaded === false && prevProps.appLoaded !== this.props.appLoaded){
            if(this.props.appLoaded){
                var all = document.getElementsByTagName("*");
                for (var i=0, max=all.length; i < max; i++) {
                    all[i].style.animation = '';
                }
            }
        }
    }

    componentWillUnmount(){
        document.body.style.overflow = '';
        document.body.classList.remove('bg-user-experience');
        document.body.style.background = '';
    }

    render(){
        return(

                <div className="about">
                    <div className="container">
                        <div className="about-text-wrapper">
                            <p>Hello, i’m Alexandre, i’m a French Creative Front-end Developer, i have a keen interrest with <span onMouseMove={(e) => this.uiAnimationEvent(e)} onMouseLeave={() => this.uiAnimationEventOut()}>UI animations</span> and <span onMouseEnter={() => this.userExperienceEvent()} onMouseLeave={() => this.userExperienceEventOut()}>user experience</span>.
                                Driven by my passion for the javascript, i try to discover and learn new things every day.
                                <br/>
                                <br/>
                                Feel free to <span>contact me</span>,<br/>
                                i’m looking for a full-time job.
                            </p>
                        </div>
                    </div>
                </div>
        )
    }
}

export default About;