import React,{Fragment} from 'react'
import {withRouter} from "react-router-dom";
import echarts from 'echarts';
import _ from 'lodash'

class Charts extends React.Component{
    constructor(){
        super()
        this.state = {
            dataList:[]
        }
    }

    componentDidMount(){
        console.log(this.props.option)
        let list = [...this.props.option.series[0].data]
        this.setState({dataList:list})
        this.initCharts()
    }

    componentWillReceiveProps(nextProps) {
        let newList = [...nextProps.option.series[0].data]
        if(_.isEqual(newList,this.state.dataList)){
            // console.log('相同')
        }else{
            this.setState({dataList:newList})
            this.initCharts()
        }
    }


    initCharts(){
        let myChart = echarts.init(document.getElementById('chartsId'+this.props.chartsId));
        myChart.setOption(this.props.option,true)
        window.addEventListener("resize",()=>{
            myChart.resize()
        })
    }

    render(){
        return(
            <Fragment>
                <div id={'chartsId'+this.props.chartsId} style={this.props.size != null ? { width: `${this.props.size[0]}px`, height: `${this.props.size[1]}px`} : { width: '100%', height: '100%' }}/>
            </Fragment>
        )
    }
}
export default withRouter(Charts)