import React, {Component} from 'react';
import {withRouter} from "react-router-dom";
import {Button, Loading, Table, DateRangePicker} from 'element-react'
import Http from '../../../utils/http'
import _ from 'lodash'

import './quanhangyuangongTOP20.scss'
import '../../../iconfont/iconfont.css'

class QuanhangyuangongTOP20 extends Component {
    constructor() {
        super()
        this.state = {
            loadingShow:false,
            tableList:[],
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

    getColor(num) {
        switch (num) {
            case 0:
                return '#FF964E';
            case 1:
                return '#2D60FF';
            case 2:
                return '#2FD186';
            default:
                return '#7A7A7A';
        }
    }

    getList(){
        this.setState({loadingShow:true})
        let userName = localStorage.getItem('userName')
        let params = _.assign({staffId:'06101086'},this.state.searchOption)
        Http.post('/qhyxtop20/sj',params)
            .then(
                res=>{
                    console.log(res)
                    if(res.resultCode === 'success'){
                        let list = res.data.rewardList
                        console.log(list)
                        this.setState({tableList:list,loadingShow:false})
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
                label: "排名",
                align: 'center',
                render: (row, column, index)=>{
                    return <span className='rank-cube'><i className='iconfont icon-huangguan rank-bg' style={{color:this.getColor(index)}}></i><span>{index + 1}</span></span>
                }
            },
            {
                label: "员工号",
                prop: "userId",
                align:'center'
            },
            {
                label: "所在支行",
                prop: "departmentName",
                align:'center'
            },
            {
                label: "员工姓名",
                prop: "lastname",
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
                <p className="market-title">全行员工营销Top20</p>

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

                    <Loading loading={this.state.loadingShow} text='加载中...'>
                        <Table
                            style={{width: '100%'}}
                            columns={tableComulmns}
                            maxHeight={550}
                            data={this.state.tableList}
                        />
                    </Loading>
                    
                </div>
            </div>
        )
    }
}

export default withRouter(QuanhangyuangongTOP20)