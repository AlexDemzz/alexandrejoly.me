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
    };

    cursorDeplacement = e => {
        this.setState({x:e.clientX, y: e.clientY});
    };

    getProjectDetails = (projectID) => {

    }
    render() {
        return (
            <Router>
                <Route render={({location}) => (
                    <div className="App" onMouseMove={e => this.cursorDeplacement(e)}>
                        <Cursor top={this.state.y} left={this.state.x} />
                        <Header/>
                        <TransitionGroup className='height100'>
                            <CSSTransition key={location.pathname.split('/')[1]} classNames="message" timeout={3000}>
                                <Switch location={location}>
                                    <Route match exact path="/" component={Projects} />
                                    <Route path={`/work/:id/:workName`} component={ProjectDetails}/>
                                </Switch>
                            </CSSTransition>
                            <CSSTransition key={location.key} classNames="ntm" timeout={1000}>
                                <Switch location={location}>
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
