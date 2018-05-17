import React, { Component } from 'react';
import './App.css';
import Header from './components/Header';
import Footer from './components/Footer';
import Projects from './components/Projects';
import ProjectDetails from './components/Projects/ProjectDetails';
import Cursor from './components/Cursor';
import About from './components/About';
import { TransitionGroup, CSSTransition } from 'react-transition-group'
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
// import projectsList from './projects';

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
        pos: 0
    };

    getClickEvent = (param) => {
        this.setState({transitionName: param.transitionName, transitionDelay: param.transitionDelay});
    }

    getDragPosition = (pos) => {
        this.setState({translateX: pos});
    }

    cursorDeplacement = e => {
        this.setState({x:e.clientX, y: e.clientY});
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

    render() {
        return (
            <Router>
                <Route render={({location}) => (
                    <div className="App" onMouseMove={e => this.cursorDeplacement(e)}>
                        <Cursor top={this.state.y} left={this.state.x} hovered={this.state.hover} hold={this.state.hold} cursorEvent={this.cursorEvent}/>
                        <Header getClickEvent={this.getClickEvent} cursorEvent={this.cursorEvent}/>
                        <TransitionGroup className='height100' onMouseDown={() => this.getClickEvent({transitionName: 'home-to-project', transitionDelay: 2000})}>
                            <CSSTransition
                                key={location.pathname.split('/')[1]}
                                classNames={this.state.transitionName}
                                timeout={this.state.transitionDelay}>
                                <Switch location={location}>
                                    <Route match exact path="/" render={()=><Projects dragPosition={this.state.translateX} getDragPosition={this.getDragPosition} activeProject={this.state.active} cursorEvent={this.cursorEvent} holdEnd={this.state.holdEnd} hold={this.state.hold} prevPath={this.state.prevPath}/>}/>
                                    <Route path={`/work/:id/:workName`} render={(props)=><ProjectDetails {...props} projectIdEvent={this.getProjectsDetailsProjectId}/>} />
                                    <Route match exact path="/about" component={About} />
                                </Switch>
                            </CSSTransition>
                        </TransitionGroup>
                        <Footer/>
                    </div>
                )}
                />
            </Router>
        );
    }
}

export default App;
