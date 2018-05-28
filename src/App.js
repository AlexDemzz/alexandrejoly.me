import React, { Component } from 'react';
import './App.css';
import Header from './components/Header';
import Footer from './components/Footer';
import PreHome from './components/PreHome';
import Projects from './components/Projects';
import ProjectDetails from './components/Projects/ProjectDetails';
import Cursor from './components/Cursor';
import About from './components/About';
import { TransitionGroup, CSSTransition } from 'react-transition-group'
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
// import ReallySmoothScroll from 'really-smooth-scroll';

// import projectsList from './projects';
// ReallySmoothScroll.shim();
// ReallySmoothScroll.config({
//     mousewheelSensitivity: 6, // Default
//     keydownSensitivity: 6 // Default (When you press arrow down/up key)
// });
class App extends Component {


    state = {
        x : 0,
        y: 0,
        transitionName: 'home-to-project',
        transitionDelay: 2000,
        hover: false,
        hold: false,
        holdEnd: false,
        active: 0,
        pos: 0,
        appLoaded: false,
        appLoadedHide: false,
        scrollTimeout: null,
        lastScrollTop: 0,
        scrollY: 0
    };

    getClickEvent = (param) => {
        this.setState({transitionName: param.transitionName, transitionDelay: param.transitionDelay});
    }

    getDragPosition = (pos) => {
        this.setState({translateX: pos});
    }

    cursorDeplacement = e => {
        this.setState({x:e.clientX, y: e.clientY});
        // this.bottomLineColors();
    };

    cursorEvent = (hover, hold, holdEnd = false) => {
        this.setState({hover: hover, hold: hold});
        if(holdEnd === true){
            this.setState({holdEnd: true});
        }else{
            this.setState({holdEnd: false});
        }
    }


    transitionName = (name) => {

    }

    getProjectsDetailsProjectId = (activeId) => {
        this.setState({active: Number(activeId)});
        console.log(this.state.active);
    };

    getAppLoaded = (status) => {
        this.setState({appLoaded : status});
    }

    getAppLoadedHide = (status) => {
        this.setState({appLoadedHide : status});
    }

    componentDidMount(){
        document.addEventListener('scroll', (e) => {
            console.log(e);
            console.log();
            const $contentWrapper = document.getElementsByClassName('content-wrapper')[0];
            let st = window.pageYOffset || document.documentElement.scrollTop; // Credits: "https://github.com/qeremy/so/blob/master/so.dom.js#L426"
            if (st > this.state.lastScrollTop){
                console.log('down');
                $contentWrapper.style.transform = 'skewY(0.5deg)';
            } else {
                $contentWrapper.style.transform = 'skewY(-0.5deg)';
            }
            this.setState({lastScrollTop: st});

            let scrollTimeout = setTimeout(()=>{
                $contentWrapper.style.transform = 'skewY(0deg)'
            },500);
            this.setState({scrollTimeout});
        });
    }

    // bottomLineColors = () => {
    //     function getRandomColor() {
    //         var letters = '0123456789ABCDEF';
    //         var color = '#';
    //         for (var i = 0; i < 6; i++) {
    //             color += letters[Math.floor(Math.random() * 16)];
    //         }
    //         return color;
    //     }
    //     console.log(this.refs.bottomLine);
    //     if(document.getElementsByClassName('bottom-line')[0]){
    //         document.getElementsByClassName('bottom-line')[0].style.background = getRandomColor();
    //     }
    // }

    // componentWillReceiveProps = (nextProps) => {
    //     if(nextProps.location.pathname !== this.props.location.pathname){
    //         let path = nextProps.location.pathname.split('/');
    //         if(path[1] === 'work'){
    //             this.setState({transitionName: 'project-to-',transitionDelay: 2000});
    //         }
    //     }
    // }

    render() {
        return (
            <Router>
                <Route render={({location}) => (
                    <div className="App" onMouseMove={e => this.cursorDeplacement(e)}>
                        <Cursor top={this.state.y} left={this.state.x} hovered={this.state.hover} hold={this.state.hold} cursorEvent={this.cursorEvent}/>
                        {!this.state.appLoadedHide ? <PreHome getAppLoaded={this.getAppLoaded} getAppLoadedHide={this.getAppLoadedHide} /> : null}
                        {this.state.appLoaded ? <div className="app-wrapper">
                            <Header appLoaded={this.state.appLoaded} getClickEvent={this.getClickEvent} cursorEvent={this.cursorEvent}/>
                            <TransitionGroup className='height100 content-wrapper' ref="contentWrapper" onMouseDown={() => this.getClickEvent({transitionName: 'home-to-project', transitionDelay: 2000})}>
                                <CSSTransition
                                    key={location.pathname.split('/')[1]}
                                    classNames={this.state.transitionName}
                                    timeout={this.state.transitionDelay}>
                                    <Switch location={location}>
                                        <Route match exact path="/" render={()=><Projects appLoaded={this.state.appLoaded} setupAnimation={this.state.appLoaded} dragPosition={this.state.translateX} getDragPosition={this.getDragPosition} activeProject={this.state.active} cursorEvent={this.cursorEvent} holdEnd={this.state.holdEnd} hold={this.state.hold} prevPath={this.state.prevPath}/>}/>
                                        <Route match path={`/work/:id/:workName`} render={(props)=><ProjectDetails {...props} appLoaded={this.state.appLoaded} projectIdEvent={this.getProjectsDetailsProjectId}/>} />
                                        <Route match exact path="/about" render={(props)=><About {...props} appLoaded={this.state.appLoaded}/>} />
                                    </Switch>
                                </CSSTransition>
                            </TransitionGroup>
                            <Footer appLoaded={this.state.appLoaded}/>
                        </div> : null}
                        <div className="bottom-line"/>
                    </div>
                )}
                />
            </Router>
        );
    }
}

export default App;
