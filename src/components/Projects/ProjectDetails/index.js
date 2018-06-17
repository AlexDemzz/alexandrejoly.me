import React from 'react';
import './styles.css';
import projectsList from '../../../projects';
import OnVisible, {setDefaultProps} from 'react-on-visible';
// import ReactIScroll from 'react-iscroll';
// import iScroll from 'iscroll/build/iscroll-probe';
import ScrollArea from 'react-scrollbar';
import {Redirect} from 'react-router';
import Footer from '../../Footer';
// import PropTypes from 'prop-types'

class ProjectDetails extends React.Component{

    state = {
        scrollIsBot : false,
        scrollBottomNumber: 0,
        preventDoublePushLoc: false,
        wheelTransEnd: 0,
        ready: true,
        scrolled: 0,
        prevYPosition: 0,
        currTransform: 0.5,
        distordTimeout: null,
        topPosition: 0,
        isMobile: false,
        goToHome: false,
        fixedHeaderHeight: 0,
        scrollInertiaTO: null,
    }

    projectIdEvent = (id) => {
        this.props.projectIdEvent(id);
    };
    
    componentWillReceiveProps(nextProps){
        if(nextProps.match.params.id !== this.props.match.params.id){
            setTimeout(()=>{
                this.updateImagesPosition();
                this.refs.fillScrollBottom.classList.remove('out');
                this.setState({preventDoublePushLoc: false});
            },2100);
            this.setState({ready: false});
            setTimeout(()=>{
                this.setState({ready: true});
            },200);
        }
    }

    componentWillUnmount(){
        window.removeEventListener("resize", this.updateImagesPosition);
        document.getElementsByClassName('container')[0].removeEventListener("transitionend", this.onScrollEnd);
        document.getElementsByClassName('container')[0].removeEventListener("transitionstart", this.onScrollStart);
    }

    onScrollEnd = () => {
        this.setState({scrollIsBot: true});
    };
    onScrollStart = () => {
        this.setState({scrollIsBot: false});
    };

    componentDidMount(){
        this.setState({ready: true});
        this.projectIdEvent(this.props.match.params.id);
        setDefaultProps({
            bounce: true,
            visibleClassName: 'visible',
            percent: 5
        });
        window.addEventListener("resize", this.updateImagesPosition);
        this.updateImagesPosition();
        document.addEventListener("touchstart", this.pageDrag);
        document.getElementsByClassName('container')[0].addEventListener("transitionend", this.onScrollEnd);
        document.getElementsByClassName('container')[0].addEventListener("transitionstart", this.onScrollStart);
    };

    updateImagesPosition = () => {
        if(this.refs.projectDetailsHeader && document.getElementsByClassName('header')[0]){
            this.setState({scrollBottomNumber:0});
            const fixedHeaderHeight = this.refs.projectDetailsHeader.offsetHeight+document.getElementsByClassName('header')[0].offsetHeight;
            this.setState({fixedHeaderHeight});
        }
    }

    nextProject = () => {
        if(projectsList[Number(this.props.match.params.id)+1]){
            return projectsList[Number(this.props.match.params.id)+1];
        }else{
            return {title: 'Home'};
        }
    };



    handleScrollWheel = (value) => {
        let newYPosition = -value.topPosition;
        if(value.topPosition){
            this.setState({topPosition: value.topPosition+100});
        }
        clearTimeout(this.state.distordTimeout);
        const addSkewY = (add) => {
            let nbr = this.state.currTransform;
            if(add){
                this.refs.projectDetailsHeader.style.transform = `translate3d(0,${newYPosition/3}px,0) skewY(${nbr}deg)`;
                this.refs.projectsDetailsImages.style.transform = `skewY(${nbr}deg)`;
            }else{
                this.refs.projectDetailsHeader.style.transform = `translate3d(0,${newYPosition/3}px,0) skewY(-${nbr}deg)`;
                this.refs.projectsDetailsImages.style.transform = `skewY(-${nbr}deg)`;
            }
        };
        if(newYPosition > this.state.prevYPosition){
            addSkewY(false);
        }else if(newYPosition < this.state.prevYPosition){
            addSkewY(true);
        }
        this.setState({prevYPosition: -value.topPosition});
        this.state.currTransform <= 1.5 ? this.setState({currTransform: this.state.currTransform+0.5}) : this.setState({currTransform: this.state.currTransform});

        const distordTimeout = setTimeout(()=>{
            if(this.refs.projectDetailsHeader && this.refs.projectsDetailsImages){
                this.refs.projectDetailsHeader.style.transform = `translate3d(0,${newYPosition/3}px,0) skewY(0deg)`;
                this.refs.projectsDetailsImages.style.transform = 'skewY(0deg)';
                this.setState({currTransform: 0});
            }
        }, 200);

        this.setState({distordTimeout});
        if(value.topPosition + value.containerHeight >= value.realHeight){
            let increaseNumber = 1.5;
            let changePageoffsetHeightAdd = 160;
            // if(this.state.isMobile){
            //     changePageoffsetHeightAdd = 160;
            //     increaseNumber = 1.5;
            // }
            this.refs.fillScrollBottom.classList.remove('animate');
            if(this.refs.fillScrollBottom.offsetHeight <= this.refs.nextProjectRef.offsetHeight+changePageoffsetHeightAdd){
                this.setState({scrollBottomNumber: this.state.scrollBottomNumber+increaseNumber});
                this.inertiaFillScrollBottom();
            }else{
                if(!this.state.preventDoublePushLoc && this.refs.fillScrollBottom && this.refs.projectDetailsPage){
                    if(this.nextProject().id){
                        this.setState({preventDoublePushLoc: true});
                        this.refs.projectDetailsPage.classList.add('project-details-page--out');
                        this.refs.fillScrollBottom.classList.add('out');
                        setTimeout(()=>{
                                this.resetScrollElem();
                                this.refs.projectDetailsPage.classList.add('reset-scroll');
                                setTimeout(()=>{
                                    this.refs.projectDetailsPage.classList.remove('reset-scroll');
                                    this.refs.projectDetailsPage.classList.remove('project-details-page--out');
                                },50);
                                this.props.history.push(`/work/${this.nextProject().id}/${this.nextProject().title.toLowerCase().split(' ').join('-')}`);
                        }, 1000);
                    }else{
                        this.setState({goToHome: true});
                    }
                }
            }
        }else if(value.topPosition && this.refs.fillScrollBottom && this.refs.fillScrollBottom.offsetHeight>0){
            this.resetScrollElem();
        }
    };

    inertiaFillScrollBottom = () => {
        let nbr = this.state.currTransform;
        nbr >= 1 ? nbr=1 : nbr;
        this.refs.fillScrollBottom.classList.add('scrolling');
        this.refs.fillScrollBottomInertia.style.transform = `rotateZ(${nbr}deg)`;
        clearTimeout(this.state.scrollInertiaTO);
        let scrollInertiaTO = setTimeout(()=>{
            this.refs.fillScrollBottom.classList.remove('scrolling');
            this.refs.fillScrollBottomInertia.style.transform = `rotateZ(0deg)`;
        },300);
        this.setState({scrollInertiaTO});
    }

    resetScrollElem = () => {
        if(this.refs.projectDetailsPage){
            this.setState({scrollBottomNumber: 0});
            this.refs.fillScrollBottom.style.height = '';
        }
    };

    pageDrag = () => {
        this.setState({isMobile: true});
        // document.body.classList.add('remove-scroll-transition');
    }
    render(){
        const projectHeader = projectsList.map(project => {
            if (project.id === this.props.match.params.id) {
                let worksCol = project.works.map(
                    (work, index) => { return (
                        <div className="info-col" key={index}>
                            <p>{work}</p>
                        </div>
                    )}
                );
                return (
                    <div className="project-details-header project-details-header-fixed" ref="projectDetailsHeader" key={project.id}>
                        <div className="project-title-container">
                            <h2 className="project-title">{project.title}</h2>
                        </div>
                        <div className="project-details-infos-row">
                            <div className="row">
                                <p>{project.date}</p>
                            </div>
                            <div className="row">
                                {worksCol}
                            </div>
                            <div className="row">
                                <p dangerouslySetInnerHTML={{__html:project.text}}/>
                            </div>
                        </div>
                    </div>
                )}
        });
        const projectImg = projectsList.map((project, index) => {
            if (project.id === this.props.match.params.id) {
                let imgs = project.images.map(
                    (img, index) => {
                        return(
                            <div className="visible" key={index}>
                                <img src={img} alt=""/>
                            </div >
                        )
                    });
                return (
                    <div className="project-details-images" ref="projectsDetailsImages" key={index}>
                        {imgs}
                    </div>
                )}
        });
        const project = projectsList.map(project => {
                if (project.id === this.props.match.params.id){
                    let imgs = project.images.map(
                        (img, index) => {
                            if(index === null){
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
                    let worksCol = project.works.map(
                        (work, index) => { return (
                            <div className="info-col" key={index}>
                                <p>{work}</p>
                            </div>
                        )}
                    );
                    return (
                        <div className="project-details-wrapper"  ref="projectDetailsWrapper" key={project.id}>
                            <div className="project-details-header project-details-header-fixed" ref="projectDetailsHeader">
                                <div className="project-title-container">
                                    <h2 className="project-title">{project.title}</h2>
                                </div>
                                <div className="project-details-infos-row">
                                    <div className="row">
                                        <p>{project.date}</p>
                                    </div>
                                    <div className="row">
                                        {worksCol}
                                    </div>
                                    <div className="row">
                                        <p>{project.text}</p>
                                    </div>
                                </div>
                                {/*<div className="project-details-infos">*/}
                                    {/*<div className="project-details-infos-start">*/}
                                        {/*<div className="subtitle">*/}
                                            {/*<span>HOW?</span>*/}
                                        {/*</div>*/}
                                        {/*<div className="content">*/}
                                            {/*{works}*/}
                                        {/*</div>*/}
                                    {/*</div>*/}
                                    {/*<div className="project-details-infos-end">*/}
                                        {/*<div className="subtitle">*/}
                                            {/*<span>WHEN?</span>*/}
                                        {/*</div>*/}
                                        {/*<div className="content">*/}
                                            {/*<p>{project.date}</p>*/}
                                        {/*</div>*/}
                                    {/*</div>*/}
                                {/*</div>*/}
                                {/*<div className="project-details-text">*/}
                                    {/*<div className="subtitle">*/}
                                        {/*<span>WHY?</span>*/}
                                    {/*</div>*/}
                                    {/*<div className="content">*/}
                                        {/*<p>{project.text}</p>*/}
                                    {/*</div>*/}
                                {/*</div>*/}
                            </div>
                            <div className="project-details-images">
                                {imgs}
                            </div>
                        </div>
                    )
                }
            });

        return(
            <div className="project-details-page" ref="projectDetailsPage">
                {this.state.goToHome ? <Redirect to='/'/> : null}
                {projectHeader}
                <ScrollArea
                    speed={1}
                    className="scroll-container"
                    contentClassName="container"
                    smoothScrolling={false}
                    // smoothScrolling={true}
                    horizontal={false}
                    onScroll={(value) => this.handleScrollWheel(value)}
                >


                        {/*{this.state.ready ?*/}
                            {/*<div className="project-details" ref="projectDetails">*/}
                                {/*<div className="project-details-wrapper"  ref="projectDetailsWrapper" >*/}
                                    {/*{project}*/}
                                {/*</div>*/}
                            {/*</div>*/}
                            {/*: <div style={{height: '100vh', width: '100%'}}/>}*/}
                        <div style={{height: this.state.fixedHeaderHeight, width: '100%', pointerEvents: 'none'}}/>
                        {projectImg}
                        <div className="next-project" ref="nextProjectRef">
                            <p>Scroll to discover</p>
                            <h3 className="project-title">{this.nextProject().title}</h3>
                        </div>
                        <Footer noFixed={true} appLoaded={true}/>
                        <div className="fill-scroll-bottom scrolling"  ref="fillScrollBottom" style={{height: this.state.scrollBottomNumber*2 + 'vh'}}>
                            <div className="fill-scroll-bottom-bg"/>
                            <div className="fill-scroll-bottom-inertia" ref="fillScrollBottomInertia"/>
                        </div>
                </ScrollArea>
            </div>
        )
    }
}

// ProjectDetails.contextTypes = {
//     scrollArea: React.PropTypes.object
// };

export default ProjectDetails;