import React from 'react';
import './styles.css';
import projectsList from '../../../projects';
import OnVisible, {setDefaultProps} from 'react-on-visible';
import ReactIScroll from 'react-iscroll';
import iScroll from 'iscroll/build/iscroll-probe';
import Footer from '../../Footer';

class ProjectDetails extends React.Component{

    state = {
        scrollIsBot : false,
        scrollBottomNumber: 0,
        preventDoublePushLoc: false,
        wheelTransEnd: 0,
        ready: true,
        scrolled: 0,
        prevYPosition: 0,
        currTransform: 0.5
    }

    projectIdEvent = (id) => {
        this.props.projectIdEvent(id);
    };
    
    componentWillReceiveProps(nextProps){
        if(nextProps.match.params.id !== this.props.match.params.id){
            console.log('RELOAD PAGE');
            this.setState({preventDoublePushLoc: false});
            this.setState({ready: false});
            setTimeout(()=>{
                this.setState({ready: true});
            },200);
        }
    }

    componentWillUnmount(){
    }
    componentDidMount(){
        var all = document.getElementsByTagName("*");
        this.setState({ready: true});
        console.log('COMPONENET DID MOUNT');
        this.projectIdEvent(this.props.match.params.id);
        setDefaultProps({
            bounce: true,
            visibleClassName: 'visible',
            percent: 5
        });
    };

    onScrollStart = () =>{
        console.log("iScroll starts scrolling")
    }

    handleScroll = (e) => {
        // console.log(e);
        // console.log('MDR',e);

        let newYPosition = e.y;

        const addSkewY = (add) => {
            let nbr = this.state.currTransform;
            if(add){
                this.refs.projectDetailsHeader.style.transform = `translate3d(0,${newYPosition/3}px,0) skewY(${nbr}deg)`;
                this.refs.projectsDetailsImages.style.transform = `skewY(${nbr}deg)`;
            }else{
                this.refs.projectDetailsHeader.style.transform = `translate3d(0,${newYPosition/3}px,0) skewY(-${nbr}deg)`;
                this.refs.projectsDetailsImages.style.transform = `skewY(-${nbr}deg)`;
            }
        }


        if(newYPosition > this.state.prevYPosition){
            console.log('top');
            addSkewY(false);
        }else if(newYPosition < this.state.prevYPosition){
            console.log('down');
            addSkewY(true);
        }



        this.setState({prevYPosition: e.y});

        const wrappedElement = document.getElementsByClassName('next-project')[0];
        console.log('(this.isBottom(wrappedElement)', this.isBottom(wrappedElement));
        if (this.isBottom(wrappedElement)) {
            this.setState({scrollIsBot: true});
        }else{
            this.setState({scrollIsBot: false});
        }
        this.state.currTransform <= 1.5 ? this.setState({currTransform: this.state.currTransform+0.05}) : this.setState({currTransform: this.state.currTransform});
    };

    handleScrollStart = (e) => {

        // console.log(e.dirX);

    }

    handleScrollEnd = (e) => {
        let newYPosition = e.y;
        this.refs.projectDetailsHeader.style.transform = `translate3d(0,${newYPosition/3}px,0) skewY(0deg)`;
        this.refs.projectsDetailsImages.style.transform = 'skewY(0deg)';
        console.log(this.state.scrolled);
        this.setState({currTransform: 0});

    }


    isBottom(el) {
       if(el){
           return el.getBoundingClientRect().bottom-5 <= window.innerHeight;
       }
    }

    handleWheel = (e, touch = false) => {
        let increaseNumber = 1;
        const resetScrollElem = () => {
            this.setState({scrollBottomNumber: 0});
            this.setState({wheelTransEnd: 0});
            document.body.classList.remove('mix-bend-mode-difference');
            this.refs.projectDetailsPage.classList.remove('project-details-page--out');
        };
       if(this.state.scrollIsBot){
           if (e.nativeEvent.wheelDelta > 0) {
               resetScrollElem();
           } else {
               if(this.refs.fillScrollBottom.offsetHeight <= this.refs.nextProjectRef.offsetHeight+100){
                   this.setState({scrollBottomNumber: this.state.scrollBottomNumber+increaseNumber});
                   document.body.classList.add('mix-bend-mode-difference');
                   this.refs.fillScrollBottom.classList.add('scrolling');
                   this.refs.fillScrollBottom.addEventListener('transitionend', () => {
                       this.refs.fillScrollBottom.classList.remove('scrolling');
                   });
               }else{
                   const element = this.refs.fillScrollBottom;
                   if(!this.state.preventDoublePushLoc && this.refs.fillScrollBottom && this.refs.projectDetailsPage){
                       this.setState({preventDoublePushLoc: true});
                       this.refs.projectDetailsPage.classList.add('project-details-page--out');
                       this.refs.fillScrollBottom.style.height = '';
                       this.refs.fillScrollBottom.classList.add('out');
                       setTimeout(()=>{
                           if(this.refs.fillScrollBottom){
                               this.refs.fillScrollBottom.classList.remove('out');
                           }
                       },2100);
                       setTimeout(()=>{
                           resetScrollElem();
                           let $scrollContainer = document.getElementsByClassName('scroll-container')[0];


                           let reactscroll = this.refs.reactIScroll;
                           $scrollContainer.classList.add('no-transition');
                           reactscroll.withIScroll((iScroll) => {
                               iScroll.scrollTo(0,0,0);
                           });

                            setTimeout(()=>{
                                $scrollContainer.classList.remove('no-transition');
                            },1000);

                           // var nodes = this.refs.projectDetailsHeader.childNodes;
                           // for(var i=0; i<nodes.length; i++) {
                           //     nodes[i].style.animation = 'none';
                           // }
                           // setTimeout(()=>{
                           //     for(var i=0; i<nodes.length; i++) {
                           //         nodes[i].style.animation = '';
                           //     }
                           // },2000);
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
    }

    nextProject = () => {
        if(projectsList[Number(this.props.match.params.id)+1]){
            return projectsList[Number(this.props.match.params.id)+1];
        }else{
            return {title: 'Home'};
        }
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
                                <p>{project.text}</p>
                            </div>
                        </div>
                    </div>
                )}
        });
        const projectImg = projectsList.map(project => {
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
                    <div className="project-details-images" ref="projectsDetailsImages">
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
            <div className="project-details-page" ref="projectDetailsPage" onWheel={e => this.handleWheel(e)} onTouchMove={e => this.handleWheel(e, true)}>
                {projectHeader}
                <ReactIScroll

                    ref="reactIScroll"
                    iScroll={iScroll}
                    onScroll={(e) => this.handleScroll(e)}
                    onScrollStart={(e) => this.handleScrollStart(e)}
                    onScrollEnd={(e) => this.handleScrollEnd(e)}
                    options={{probeType: 2, mouseWheel: true, disableTouch: true, disablePointer: true, bounce: false}}>
                    <div className="container scroll-container">

                        {/*{this.state.ready ?*/}
                            {/*<div className="project-details" ref="projectDetails">*/}
                                {/*<div className="project-details-wrapper"  ref="projectDetailsWrapper" >*/}
                                    {/*{project}*/}
                                {/*</div>*/}
                            {/*</div>*/}
                            {/*: <div style={{height: '100vh', width: '100%'}}/>}*/}
                        {projectImg}
                        <div className="next-project" ref="nextProjectRef">
                            <p>Scroll to discover</p>
                            <h3 className="project-title">{this.nextProject().title}</h3>
                        </div>
                        <Footer noFixed={true} appLoaded={true}/>
                    </div>
                </ReactIScroll>
                <div className="fill-scroll-bottom"  ref="fillScrollBottom" style={{height: this.state.scrollBottomNumber*2 + 'vh'}}>
                    <div className="fill-scroll-bottom-bg"/>
                </div>

            </div>
        )
    }
}
export default ProjectDetails;