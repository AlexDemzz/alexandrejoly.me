import React from 'react';
import './styles.css';
import projectsList from '../../projects';

class PreHome extends React.Component{
    state = {
        imgLength: 1,
        imgsLoaded: 0,
        timer: 0,
        loadedNumber: 0,
    }

    imgLoaded = () => {
        console.log('load');
        this.setState({imgsLoaded: this.state.imgsLoaded+1});
        console.log(Math.round(this.state.imgsLoaded*100/this.state.imgLength)+7);
        this.setState({loadedNumber: Math.round(this.state.imgsLoaded*100/this.state.imgLength)+7});
    }

    componentDidUpdate(){
    // && this.state.timer>=5000
        if(this.state.imgLength === this.state.imgsLoaded){
            this.props.getAppLoaded(true);
            // console.log('loaded!!!!!!!!!!!!!!!!!!!!!!!!!!!');
        }
    }

    componentDidMount(){
        projectsList.map((project) => {
            project.images.map(() =>
                {this.setState({imgLength: this.state.imgLength ++});}
            );
        });
        setInterval(()=>{
            this.setState({timer: this.state.timer+1000});
        },1000)
    }

    render(){
        const imgs = projectsList.map((project) => {
            let renderImg = project.images.map((img, key) => <img key={key} onLoad={() => this.imgLoaded()} src={img} alt=""/>);
            return renderImg
        });
        return(
            <div className="PreHome">
                ...Loading {this.state.loadedNumber}
                <div className="preload-content">
                    {imgs}
                </div>
            </div>
        )
    }
}

export default PreHome;