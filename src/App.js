import React, { Component } from 'react';
import './App.css';
import Header from './components/Header';
import Footer from './components/Footer';
import Projects from './components/Projects';
import ProjectDetails from './components/Projects/ProjectDetails';
import Cursor from './components/Cursor';
import About from './components/About';
import { TransitionGroup, CSSTransition } from 'react-transition-group'
import { BrowserRouter as Router, Route, Link, Switch } from "react-router-dom";
import projectsList from './projects';

class App extends Component {


    state = {
        x : 0,
        y: 0,
        transitionName: 'home-to-project',
        transitionDelay: 2000,
        hover: false,
        hold: false,
        holdEnd: false
    };

    getClickEvent = (param) => {
        this.setState({transitionName: param.transitionName, transitionDelay: param.transitionDelay});
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
                                    <Route match exact path="/" render={()=><Projects cursorEvent={this.cursorEvent} holdEnd={this.state.holdEnd}/>}/>
                                    <Route path={`/work/:id/:workName`} component={ProjectDetails}/>
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
