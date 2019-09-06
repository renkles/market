import React, {Component} from 'react';
import {withRouter} from "react-router-dom";
import {Button, Loading, DateRangePicker} from 'element-react'
import Mycharts from '../../../components/myChart/Mycharts'
import Http from '../../../utils/http'
import _ from 'lodash'

import './wodeyingxiaojiangli.scss'
import '../../../iconfont/iconfont.css'

class Wodeyingxiaojiangli extends Component {
    constructor() {
        super()
        this.state = {
            nickName:"",
            loadingShow:false,
            searchOption:{
                startTime:null,
                endTime:null
            },
            barOption: {
                color:['#76DDFB','#53A8E2', '#2C82BE', '#d48265', '#91c7ae','#749f83',  '#ca8622', '#bda29a','#6e7074', '#546570', '#c4ccd3'],
                tooltip : {
                    trigger: 'axis',
                    axisPointer : {
                        type : 'shadow'
                    }
                },
                legend: {
                    data:[]
                },
                grid: {
                    left: 0,
                    containLabel: true
                },
                xAxis : [
                    {
                        type : 'value'
                    }
                ],
                yAxis : [
                    {
                        type : 'category',
                        data : ['营销奖励']
                    }
                ],
                series : [
                    {
                        name: "",
                        type:'bar',
                        label: {normal: {show: true, position: 'right'}},
                        data:[]
                    },
                    {
                        name: "",
                        type:'bar',
                        label: {normal: {show: true, position: 'right'}},
                        data:[]
                    }
                ]
            },
            pieOption:{
                color:['#76DDFB','#53A8E2', '#2C82BE', '#d48265', '#91c7ae','#749f83',  '#ca8622', '#bda29a','#6e7074', '#546570', '#c4ccd3'],
                tooltip: {
                    trigger: 'item',
                    formatter: "{a} <br/>{b}: {c}元 ({d}%)"
                },
                legend: {
                    x: 'left',
                    data:[]
                },
                series: [
                    {
                        name:'营销奖励来源',
                        type:'pie',
                        center:['120','50%'],
                        radius: ['55%', '70%'],
                        label: {
                            normal: {
                                show: false,
                                position: 'center'
                            },
                            emphasis: {
                                show: true,
                                textStyle: {
                                    fontSize: '24',
                                    fontWeight: 'bold'
                                }
                            }
                        },
                        data:[]
                    }
                ]
            }
        }
    }

    componentWillUnmount() {
        this.setState = (state, callback) => {
            return
        }
    }

    componentDidMount() {
        let nickName = localStorage.getItem('nickName')
        this.setState({nickName: nickName})
        this.initData()
    }

    initData(){
        if(this.state.searchOption.startTime == null){
            let currentYear = new Date().getFullYear()
            let currentMonth = new Date().getMonth()
            let currentDay = new Date().getDate()
            let endTime = new Date(currentYear, currentMonth, currentDay).getTime()
            let startTime = endTime - 365 * 24 * 60 * 60 * 1000
            let option = {
                startTime:startTime,
                endTime:endTime
            }
            this.setState(
                {searchOption:option},
                ()=>{
                    this.getList()
                }
            )
        }else{
            this.getList()
        }
    }

    getList(){
        this.setState({loadingShow:true})
        let userName = localStorage.getItem('userName')
        let params = _.assign({staffId:userName},this.state.searchOption)
        Http.post('/wdyxjl/sj',params)
            .then(
                res=>{
                    console.log(res)
                    if(res.resultCode === 'success'){
                        let barData = res.data.averageList
                        let pieData = res.data.rewardList

                        let barOption = this.state.barOption
                        let barLabelList = []
                        let barDataList = []
                        _.forEach(barData,(obj)=>{
                            barLabelList.push(obj.typeName)
                            barDataList.push(
                                {
                                    name: obj.typeName,
                                    type:'bar',
                                    label: {normal: {show: true, position: 'right'}},
                                    data:[obj.averageSum === "" ? 0 : obj.averageSum]
                                }
                            )
                        })
                        barOption.legend.data = barLabelList
                        barOption.series = barDataList

                        let pieOption =this.state.pieOption
                        let pieDataList=[]
                        let pieLabelList=[]
                        _.forEach(pieData,(obj)=>{
                            pieDataList.push({value:obj.reward,name:obj.ywlxmc})
                            pieLabelList.push(obj.ywlxmc)
                        })
                        pieOption.legend.data = pieLabelList
                        pieOption.series[0].data = pieDataList

                        this.setState({pieOption:pieOption,barOption:barOption,loadingShow:false})
                    }else{
                        this.setState({loadingShow:false})
                    }
                }
            )
            .catch(
                err=>{
                    console.log(err)
                    this.setState({loadingShow:false})
                }
            )
    }


    render() {
        return (
            <div className='market-block'>
                <p className="market-title">{this.state.nickName}-员工营销奖励</p>
                <div className="market-cube">
                    <div className="top-cube">
                        <span style={{marginRight:'20px',letterSpacing:'1px',fontSize:'16px'}}>选择查询时间:</span>
                        <DateRangePicker
                            value={[
                                this.state.searchOption.startTime != null ? new Date(this.state.searchOption.startTime) : null,
                                this.state.searchOption.endTime != null ? new Date(this.state.searchOption.endTime) : null
                            ]}
                            placeholder="选择日期范围"
                            disabledDate={time=>time.getTime() > Date.now()}
                            onChange={date=>{
                                let option = _.assign({},this.state.searchOption)
                                if(date === null){
                                    option.startTime = null
                                    option.endTime = null
                                    this.setState({searchOption:option})
                                }else{
                                    option.startTime = date[0].getTime()
                                    option.endTime = date[1].getTime()
                                    this.setState({searchOption:option})
                                }
                            }}
                        />
                        <Button onClick={this.initData.bind(this)} type='primary' style={{marginLeft:'40px'}}>查询</Button>
                    </div>

                    <Loading text='加载中...' loading={this.state.loadingShow}>
                        <div>
                            <div className="bar-block">
                                <p className="chart-title">{this.state.nickName}-员工与本行平均营销奖励对比图</p>
                                <div className="bar-cube">
                                    <Mycharts option={this.state.barOption} chartsId={1}/>
                                </div>
                            </div>
                        </div>
                    </Loading>

                    <Loading text='加载中...' loading={this.state.loadingShow}>
                        <div className="pie-block">
                            <p className="chart-title">
                                {this.state.nickName}-员工营销奖励分类饼图
                                <span style={{color:'#D06052'}}>{this.state.pieOption.legend.data.length === 0 ? '(暂无数据)' : null}</span>
                            </p>
                            <div className="pie-cube">
                                <Mycharts option={this.state.pieOption} chartsId={2}/>
                            </div>
                        </div>
                    </Loading>
                </div>
            </div>
        )
    }
}

export default withRouter(Wodeyingxiaojiangli)