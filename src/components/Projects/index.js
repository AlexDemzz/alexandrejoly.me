import React from 'react';
import './styles.css';
import Project from './Project';
import Slider from "react-slick";


class Projects extends React.Component{
    state = {
        projects: this.props.projectsList
    }
    beforeChange= () => {
        // let $slickTrack = document.getElementsByClassName('slick-track')[0];
        // let $activeSlide = document.getElementsByClassName('slick-active')[0];
        // let index = $activeSlide.dataset.index-1;
        // let $prevSlide = $slickTrack.children[index];
        // $activeSlide.classList.add('js-slick-no-more-active');
        // setTimeout(() => {
        //     $activeSlide.classList.remove('js-slick-no-more-active');
        // }, 3000);
        // console.log($activeSlide);
    };
    getSelectedProjectData(val){
        console.log(val);
    }
    render(){
        let settings = {
            dots: false,
            infinite: false,
            speed: 900,
            arrows: false,
            slidesToShow: 1,
            slidesToScroll: 1,
            edgeFriction:0,
            variableWidth: true
            // cssEase: 'cubic-bezier(.32,2,.55,.27)'
        };
        const projects = Object
            .keys(this.state.projects)
            .map(key => <Project key={key} sendData={this.getSelectedProjectData} details={this.state.projects[key]}/>);
        return(
            <div className="projects">
                <Slider {...settings} beforeChange={this.beforeChange}>
                    {projects}
                </Slider>
            </div>
        )
    }
}

export default Projects;