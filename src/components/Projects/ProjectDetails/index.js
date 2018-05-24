import React from 'react';
import './styles.css';
import projectsList from '../../../projects';
import OnVisible, {setDefaultProps} from 'react-on-visible';

class ProjectDetails extends React.Component{

    state = {
        scrollIsBot : false,
        scrollBottomNumber: 0,
    }

    projectIdEvent = (id) => {
        this.props.projectIdEvent(id);
    };

    componentDidMount(){
        this.projectIdEvent(this.props.match.params.id);
        // this.SmoothScroll(document,50,12);
        document.addEventListener('scroll', this.handleScroll)
    };

    componentWillMount() {
        document.body.style.overflow = '';
    }

    SmoothScroll = (target, speed, smooth) => {
    if (target == document)
        target = (document.documentElement || document.body.parentNode || document.body) // cross browser support for document scrolling
    var moving = false
    var pos = target.scrollTop
    target.addEventListener('mousewheel', scrolled, false)
    target.addEventListener('DOMMouseScroll', scrolled, false)

    function scrolled(e) {
        e.preventDefault(); // disable default scrolling
        var delta = e.delta || e.wheelDelta;
        if (delta === undefined) {
            //we are on firefox
            delta = -e.detail;
        }
        delta = Math.max(-1, Math.min(1, delta)) // cap the delta to [-1,1] for cross browser consistency

        pos += -delta * speed
        pos = Math.max(0, Math.min(pos, target.scrollHeight - target.clientHeight)) // limit scrolling

        if (!moving) update()
    }

    function update() {
        moving = true
        var delta = (pos - target.scrollTop) / smooth
        target.scrollTop += delta
        if (Math.abs(delta) > 0.5)
            requestFrame(update)
        else
            moving = false
    }

    var requestFrame = function() { // requestAnimationFrame cross browser
        return (
            window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.oRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
            function(func) {
                window.setTimeout(func, 1000 / 50);
            }
        );
    }()
}

    handleScroll = (e) => {
        const wrappedElement = document.getElementsByClassName('next-project')[0];
        if (this.isBottom(wrappedElement)) {
            this.setState({scrollIsBot: true});
        }else{
            this.setState({scrollIsBot: false});
        }
    };

    isBottom(el) {
       if(el){
           return el.getBoundingClientRect().bottom <= window.innerHeight;
       }
    }


    handleWheel = (e, touch = false) => {
        let increaseNumber = 1;
        if(touch){
            increaseNumber = 0.3;
        }
        const resetScrollElem = () => {
            this.setState({scrollBottomNumber: 0});
            document.body.classList.remove('mix-bend-mode-difference');
        }
       if(this.state.scrollIsBot){
           if (e.nativeEvent.wheelDelta > 0) {
               resetScrollElem();
           } else {
               if(this.state.scrollBottomNumber<=26){
                   this.setState({scrollBottomNumber: this.state.scrollBottomNumber+increaseNumber});
                   document.body.classList.add('mix-bend-mode-difference');
               }else{
                   setTimeout(()=>{
                       resetScrollElem();
                       if(this.nextProject().id){
                           this.props.history.push(`/work/${this.nextProject().id}/${this.nextProject().title.toLowerCase().split(' ').join('-')}`);
                       }else{
                           this.props.history.push(`/`);
                       }
                   }, 1000);
               }
           }
       }
    }

    nextProject = () => {
        if(projectsList[Number(this.props.match.params.id)+1]){
            return projectsList[Number(this.props.match.params.id)+1];
        }else{
            return {title: 'Home'};
        }
    }

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
                            if(index !== 0){
                                return(
                                    <OnVisible key={index}>
                                        <img src={img} alt=""/>
                                    </OnVisible >
                                )
                            }else{
                                return(
                                    <div className="visible" key={index}>
                                        <img src={img} alt=""/>
                                    </div >
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
                        <div className="project-details-wrapper" key={project.id}>
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
            <div>
                <div className="container" onWheel={e => this.handleWheel(e)} onTouchMove={e => this.handleWheel(e, true)}>
                    <div className="project-details">
                        {project}
                        <div className="next-project">
                            <p>Scroll to discover</p>
                            <h3 className="project-title">{this.nextProject().title}</h3>
                        </div>
                    </div>
                </div>
                <div className="fill-scroll-bottom" style={{height: this.state.scrollBottomNumber/3 + '%'}}/>
            </div>
        )
    }
}
export default ProjectDetails;