import React from 'react';
import './styles.css';
import projectsList from '../../../projects';
import OnVisible, {setDefaultProps} from 'react-on-visible';
import Scrollbar from 'react-smooth-scrollbar';

// import ReactIScroll from 'react-iscroll';
// import iScroll from 'iscroll/build/iscroll-probe';
// import ScrollArea from 'react-scrollbar';
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
        inertia:0,
        currYPosition: 0,
        scrollLimit: null,
        scrollDirTop: null
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
        // document.getElementsByClassName('container')[0].addEventListener("transitionend", this.onScrollEnd);
        // document.getElementsByClassName('container')[0].addEventListener("transitionstart", this.onScrollStart);
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



    handleScrollDistord = (e) => {
        let inertia = this.state.inertia+0.2;
        inertia >= 3 ? inertia = 3 : inertia;
        this.setState({inertia});
        const addSkewY = (add) => {
            if(add){
                this.refs.projectDetailsHeader.style.transform = `translate3d(0,${this.state.currYPosition}px,0) skewY(${inertia}deg)`;
                this.refs.projectsDetailsImages.style.transform = `skewY(${inertia}deg)`;
            }else{
                this.refs.projectDetailsHeader.style.transform = `translate3d(0,${this.state.currYPosition}px,0) skewY(-${inertia}deg)`;
                this.refs.projectsDetailsImages.style.transform = `skewY(-${inertia}deg)`;
            }
        };
        if(e.deltaY < 0){
            addSkewY(false);
            this.setState({scrollDirTop: true});
        }else{
            this.setState({scrollDirTop: false});
            addSkewY(true);
        }
        clearTimeout(this.state.distordTimeout);
        const distordTimeout = setTimeout(()=>{
            if(this.refs.projectDetailsHeader && this.refs.projectsDetailsImages){
                this.setState({inertia: 0});
                this.refs.projectDetailsHeader.style.transform = `translate3d(0,${this.state.currYPosition}px,0) skewY(0deg)`;
                this.refs.projectsDetailsImages.style.transform = 'skewY(0deg)';
                this.setState({currTransform: 0});
            }
        }, 200);
        this.setState({distordTimeout});


        const { scrollbar } = this.$container;
        if(e.deltaY > 0 && this.state.scrollLimit>=100 && -this.state.currYPosition >= this.state.scrollLimit){
            let increaseNumber = 1.5;
            let changePageoffsetHeightAdd = 50;
            this.refs.fillScrollBottom.classList.remove('animate');
            if( this.refs.fillScrollBottom.offsetHeight <= this.refs.nextProjectRef.offsetHeight+changePageoffsetHeightAdd){
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
                            this.$container['scrollbar'].scrollTop = 0;
                            setTimeout(()=>{
                                this.refs.projectDetailsPage.classList.remove('project-details-page--out');
                            },50);
                            this.props.history.push(`/work/${this.nextProject().id}/${this.nextProject().title.toLowerCase().split(' ').join('-')}`);
                        }, 1000);
                    }else{
                        this.setState({goToHome: true});
                    }
                }
            }
        }else if(e.deltaY < 0){
            this.resetScrollElem();
        }


    }
    handleScrollWheel = (e) =>{
        // console.log(e);
        let newYPosition = -e['offset'].y;
        this.setState({currYPosition: newYPosition});
        this.setState({scrollLimit: e['limit'].y})
    }

    inertiaFillScrollBottom = () => {
        let nbr = this.state.inertia;
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
            <div className="project-details-page" ref="projectDetailsPage" onWheel={(e) => this.handleScrollDistord(e)}>
                {this.state.goToHome ? <Redirect to='/'/> : null}
                {projectHeader}
                <Scrollbar
                    damping={0.05}
                    alwaysShowTracks={false}
                    onScroll={(e)=> this.handleScrollWheel(e)}
                    ref={c => this.$container = c}
                    >
                   <div className="container">
                       <div style={{height: this.state.fixedHeaderHeight, width: '100%', pointerEvents: 'none'}}/>
                       {projectImg}
                       <div className="next-project" ref="nextProjectRef">
                           <p>Scroll to discover</p>
                           <h3 className="project-title">{this.nextProject().title}</h3>
                       </div>
                       <Footer noFixed={true} appLoaded={true}/>
                   </div>
                </Scrollbar>

                <div className="fill-scroll-bottom scrolling"  ref="fillScrollBottom" style={{height: this.state.scrollBottomNumber*2 + 'vh'}}>
                    <div className="fill-scroll-bottom-bg"/>
                    <div className="fill-scroll-bottom-inertia" ref="fillScrollBottomInertia"/>
                </div>
            </div>
        )
    }
}


export default ProjectDetails;