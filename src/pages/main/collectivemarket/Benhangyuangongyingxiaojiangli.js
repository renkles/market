import React, {Component} from 'react';
import {withRouter} from "react-router-dom";
import {Button, Loading, DateRangePicker, Table} from 'element-react'
import Http from '../../../utils/http'
import _ from 'lodash'
import Mycharts from '../../../components/myChart/Mycharts'
import store from "../../../store";

import './benhangyuangongyingxiaojiangli.scss'
import '../../../iconfont/iconfont.css'

class Benhangyuangongyingxiaojiangli extends Component {
    constructor() {
        super()
        this.state = {
            loadingShow:false,
            tableList:[],
            pieOption:{
                tooltip: {
                    trigger: 'item',
                    formatter: "{a} <br/>{b}: {c}元 ({d}%)"
                },
                legend: {
                    x: 'left',
                    y: 'bottom',
                    itemGap: 20,
                    data:[]
                },
                series: [
                    {
                        name:'营销奖励分类',
                        type:'pie',
                        center:['50%','38%'],
                        radius: ['35%', '55%'],
                        label: {
                            normal: {
                                show: true,
                                position: 'outside'
                            }
                        },
                        data:[]
                    }
                ]
            },
            searchOption:{
                startTime:null,
                endTime:null
            }
        }
    }

    componentWillUnmount() {
        this.setState = (state, callback) => {
            return
        }
    }

    componentDidMount() {
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
        let params = _.assign({staffId:'06101086'},this.state.searchOption)
        Http.post('/bhygyxjl/sj',params)
            .then(
                res=>{
                    console.log(res)
                    if(res.resultCode === 'success'){
                        let list = res.data.rewardList
                        let pieList = res.data.spreadModel

                        let pieOption = this.state.pieOption
                        let labelList = []
                        let dataList = []
                        _.forEach(pieList,(obj)=>{
                            labelList.push(obj.ywlxmc)
                            dataList.push({name:obj.ywlxmc,value:obj.ywjl})
                        })
                        pieOption.legend.data = labelList
                        pieOption.series[0].data = dataList
                        this.setState({tableList:list, pieOption:pieOption,loadingShow:false})
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
        const tableComulmns= [
            {
                label: "员工号",
                prop: "userId",
                align:'center'
            },
            {
                label: "姓名",
                prop: "lastname",
                align:'center'
            },
            {
                label: "业务类型",
                prop: "ywlxmc",
                align:'center'
            },
            {
                label: "营销奖励",
                prop: "ygjl",
                align:'center'
            }
        ]
        return (
            <div className='market-block'>
                <p className="market-title">本行员工营销奖励</p>
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

                    <div className="member-list-block">
                        <Loading loading={this.state.loadingShow} text='加载中...'>
                            <Table
                                style={{width: '100%'}}
                                columns={tableComulmns}
                                maxHeight={550}
                                data={this.state.tableList}
                            />
                        </Loading>
                    </div>

                    <div className="right-chart-block">
                        <Loading loading={this.state.loadingShow} text='加载中...'>
                            <p className="chart-title">本行业务奖励分布</p>
                            <div className="pieChart-cube">
                                <Mycharts option={this.state.pieOption} chartsId={2}/>
                                <p style={this.state.pieOption.series[0].data.length > 0 ? {display:'none'} : {position:'absolute',top:'0',left:'50%',marginLeft:'-100px',width:'200px',color:'#999999',textAlign:'center',lineHeight:'500px'}}>暂无数据</p>
                            </div>
                        </Loading>
                    </div>

                </div>
            </div>
        )
    }
}

export default withRouter(Benhangyuangongyingxiaojiangli)