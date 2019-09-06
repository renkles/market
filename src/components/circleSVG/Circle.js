import React from 'react'
import {withRouter} from "react-router-dom";

class Circle extends React.Component{
    constructor(props){
        super(props)
        this.state={}
    }


    render(){
        return(
            <div style={{display:'inline-block',position:'relative',width:`${this.props.size}px`,height:`${this.props.size}px`}}>
                <svg width={`${this.props.size}px`} height={`${this.props.size}px`} style={{transform: 'rotate(-90deg)'}}>
                    <circle
                        r={this.props.size / 2 - 5}
                        cy={this.props.size / 2}
                        cx={this.props.size / 2}
                        strokeWidth="10"
                        stroke="#F2F2F2"
                        strokeLinejoin="round"
                        strokeLinecap="round"
                        fill="none"
                    />
                    <circle
                        style={{transition:`all ${this.props.animationTime}s ease`}}
                        r={this.props.size / 2 - 5}
                        cy={this.props.size / 2}
                        cx={this.props.size / 2}
                        strokeWidth="10"
                        stroke={`url(#linearColor-${this.props.id})`}
                        strokeLinejoin="round"
                        strokeLinecap="round"
                        strokeDasharray={Math.ceil(Math.PI * (this.props.size - 10))}
                        strokeDashoffset={Math.ceil(Math.PI * (this.props.size - 10))*(100 - parseFloat(this.props.progress))/100}
                        fill="none"
                    />
                    <defs>
                        <linearGradient id={`linearColor-${this.props.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor={this.props.linearColor[0]} />
                            <stop offset="100%" stopColor={this.props.linearColor[1]} />
                        </linearGradient>
                    </defs>
                </svg>
                <div style={{position:'absolute',width:`${this.props.size}px`,top:'50%',left:'0',textAlign:'center',lineHeight:'40px',marginTop:'-20px',fontSize:'20px',color:`${this.props.linearColor[0]}`}}>{this.props.progress}%</div>
            </div>
        )
    }
}
export default withRouter(Circle)