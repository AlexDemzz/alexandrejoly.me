import React, { Component } from 'react';
import './App.css';
import Header from './components/Header';
import Projects from './components/Projects';
import ProjectDetails from './components/Projects/ProjectDetails';
import Cursor from './components/Cursor';
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
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
                <div className="App" onMouseMove={e => this.cursorDeplacement(e)}>
                    <Cursor top={this.state.y} left={this.state.x} />
                    <Header/>
                    <Projects projectsList={projectsList} />
                    <Route path={`/work/:id/:workName`} component={ProjectDetails}/>
                </div>
            </Router>
        );
    }
}


export default App;
