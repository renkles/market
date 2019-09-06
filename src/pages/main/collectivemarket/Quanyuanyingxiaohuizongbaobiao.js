import React, {Component, Fragment} from 'react';
import {withRouter} from "react-router-dom";
import {Button, Loading, DateRangePicker, Table, Select} from 'element-react'
import Http from '../../../utils/http'
import _ from 'lodash'

import './quanyuanyingxiaohuizongbaobiao.scss'
import '../../../iconfont/iconfont.css'

class Quanyuanyingxiaohuizongbaobiao extends Component {
    constructor() {
        super()
        this.state = {
            loadingShow:false,
            pqList:[],
            searchOption:{
                area:'',
                startTime:null,
                endTime:null,
            },
            path:'/jgzjzpm/sj',
            btnList:[
                {name:'机构总价值排名',postUrl:'/jgzjzpm/sj',columns: [
                        {
                            label: "排名",
                            align: 'center',
                            render: (row, column, index)=>{
                                return <span className='rank-cube'><i className='iconfont icon-huangguan rank-bg' style={{color:this.getColor(index)}}></i><span>{index + 1}</span></span>
                            }
                        },
                        {
                            label: "机构名称",
                            prop: "jgmc",
                            align: 'center'
                        },
                        {
                            label: "总价值（元）",
                            prop: "zjz",
                            align: 'center'
                        }
                    ]},
                {name:'全行员工营销Top20',postUrl:'/qhygyxtop20/sj',columns: [
                        {
                            label: "排名",
                            align: 'center',
                            render: (row, column, index)=>{
                                return <span className='rank-cube'><i className='iconfont icon-huangguan rank-bg' style={{color:this.getColor(index)}}></i><span>{index + 1}</span></span>
                            }
                        },
                        {
                            label: "所在支行",
                            prop: "departmentName",
                            align: 'center'
                        },
                        {
                            label: "员工号",
                            prop: 'userId',
                            align: 'center'
                        },
                        {
                            label: "员工姓名",
                            prop: 'lastname',
                            align: 'center'
                        },
                        {
                            label: "奖励",
                            prop: 'ygjl',
                            align: 'center'
                        }
                    ]},
                {name:'机构借记卡排名',postUrl:'/jgjjkpm/sj',columns: [
                        {
                            label: "排名",
                            align: 'center',
                            render: (row, column, index)=>{
                                return <span className='rank-cube'><i className='iconfont icon-huangguan rank-bg' style={{color:this.getColor(index)}}></i><span>{index + 1}</span></span>
                            }
                        },
                        {
                            label: "机构名称",
                            prop: "jgmc",
                            align: 'center'
                        },
                        {
                            label: "借记卡价值（元）",
                            prop: 'zjz',
                            align: 'center'
                        }
                    ]},
                {name:'机构信用卡排名',postUrl:'/jgxykpm/sj',columns: [
                        {
                            label: "排名",
                            align: 'center',
                            render: (row, column, index)=>{
                                return <span className='rank-cube'><i className='iconfont icon-huangguan rank-bg' style={{color:this.getColor(index)}}></i><span>{index + 1}</span></span>
                            }
                        },
                        {
                            label: "机构名称",
                            prop: "jgmc",
                            align: 'center'
                        },
                        {
                            label: "信用卡价值（元）",
                            prop: 'zjz',
                            align: 'center'
                        }
                    ]},
                {name:'机构理财排名',postUrl:'/jglcpm/sj',columns: [
                        {
                            label: "排名",
                            align: 'center',
                            render: (row, column, index)=>{
                                return <span className='rank-cube'><i className='iconfont icon-huangguan rank-bg' style={{color:this.getColor(index)}}></i><span>{index + 1}</span></span>
                            }
                        },
                        {
                            label: "机构名称",
                            prop: "jgmc",
                            align: 'center'
                        },
                        {
                            label: "理财价值（元）",
                            prop: "zjz",
                            align: 'center'
                        }
                    ]},
                {name:'机构手机银行排名',postUrl:'/jgsjyhpm/sj',columns: [
                        {
                            label: "排名",
                            align: 'center',
                            render: (row, column, index)=>{
                                return <span className='rank-cube'><i className='iconfont icon-huangguan rank-bg' style={{color:this.getColor(index)}}></i><span>{index + 1}</span></span>
                            }
                        },
                        {
                            label: "机构名称",
                            prop: "jgmc",
                            align: 'center'
                        },
                        {
                            label: "手机银行价值（元）",
                            prop: "zjz",
                            align: 'center'
                        }
                    ]},
                {name:'机构网上银行排名',postUrl:'/jgwsyhpm/sj',columns: [
                        {
                            label: "排名",
                            align: 'center',
                            render: (row, column, index)=>{
                                return <span className='rank-cube'><i className='iconfont icon-huangguan rank-bg' style={{color:this.getColor(index)}}></i><span>{index + 1}</span></span>
                            }
                        },
                        {
                            label: "机构名称",
                            prop: "jgmc",
                            align: 'center'
                        },
                        {
                            label: "网上银行价值（元）",
                            prop: 'zjz',
                            align: 'center'
                        }
                    ]},
                {name:'机构贵金属排名',postUrl:'/jggjspm/sj',columns: [
                        {
                            label: "排名",
                            align: 'center',
                            render: (row, column, index)=>{
                                return <span className='rank-cube'><i className='iconfont icon-huangguan rank-bg' style={{color:this.getColor(index)}}></i><span>{index + 1}</span></span>
                            }
                        },
                        {
                            label: "机构名称",
                            prop: "jgmc",
                            align: 'center'
                        },
                        {
                            label: "贵金属价值（元）",
                            prop: "zjz",
                            align: 'center'
                        }
                    ]},
                {name:'机构信用卡分期排名',postUrl:'/jgxykfqpm/sj',columns: [
                        {
                            label: "排名",
                            align: 'center',
                            render: (row, column, index)=>{
                                return <span className='rank-cube'><i className='iconfont icon-huangguan rank-bg' style={{color:this.getColor(index)}}></i><span>{index + 1}</span></span>
                            }
                        },
                        {
                            label: "机构名称",
                            prop: "jgmc",
                            align: 'center'
                        },
                        {
                            label: "信用卡分期价值（元）",
                            prop: "zjz",
                            align: 'center'
                        }
                    ]},
                {name:'机构互联网签约排名',postUrl:'/jghlwqypm/sj',columns: [
                        {
                            label: "排名",
                            align: 'center',
                            render: (row, column, index)=>{
                                return <span className='rank-cube'><i className='iconfont icon-huangguan rank-bg' style={{color:this.getColor(index)}}></i><span>{index + 1}</span></span>
                            }
                        },
                        {
                            label: "机构名称",
                            prop: "jgmc",
                            align: 'center'
                        },
                        {
                            label: "互联网签约价值（元）",
                            prop: 'zjz',
                            align: 'center'
                        }
                    ]},
                {name:'机构互联网收单排名',postUrl:'/jghlwsdpm/sj',columns: [
                        {
                            label: "排名",
                            align: 'center',
                            render: (row, column, index)=>{
                                return <span className='rank-cube'><i className='iconfont icon-huangguan rank-bg' style={{color:this.getColor(index)}}></i><span>{index + 1}</span></span>
                            }
                        },
                        {
                            label: "机构名称",
                            prop: "jgmc",
                            align: 'center'
                        },
                        {
                            label: "互联网收单价值（元）",
                            prop: "zjz",
                            align: 'center'
                        }
                    ]}
            ],
            list:[]
        }
    }

    componentWillUnmount() {
        this.setState = (state, callback) => {
            return
        }
    }

    componentDidMount() {
        // 获取片区数据
        this.getPq()
        // 初始化path
        let path = this.state.btnList[0].postUrl
        // 获取table数据
        this.setState(
            {path:path},
            ()=> {
                this.checkTime(this.getList.bind(this))
            }
        )
    }

    // 片区
    getPq(){
        this.setState({loadingShow:true})
        Http.post('/pq/sj')
            .then(
                res=>{
                    console.log(res)
                    if(res.resultCode === 'success'){
                        let list = res.data
                        let index = _.indexOf(list,'总的')
                        list.splice(index,1)
                        this.setState({pqList:res.data,loadingShow:false})
                    }else{
                        console.log("获取数据失败")
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

    // check时间
    checkTime(callback) {
        // 默认获取最近三个月
        let option = _.assign({},this.state.searchOption)
        if(option.startTime === null){
            let start = new Date().getTime() - 3600 * 1000 * 24 * 90
            let end = new Date().getTime()
            option.startTime = start
            option.endTime = end
            this.setState(
                {searchOption: option},
                ()=>{
                    callback()
                }
            )
        }else{
            callback()
        }
    }

    // 根据条件获取table数据
    getList(){
        let params = _.assign({}, this.state.searchOption)
        this.setState({loadingShow:true})
        Http.post(this.state.path, params)
            .then(
                res=> {
                    console.log(res)
                    if(res.resultCode === 'success'){
                        let data = res.data.rewardList
                        this.setState({list:data,loadingShow:false})
                    }else{
                        console.log('获取数据失败')
                        this.setState({loadingShow:false})
                    }
                }
            )
            .catch(
                err=> {
                    console.log(err)
                    this.setState({loadingShow:false})
                }
            )

    }

    updateSearchOption(type,val){
        let data = _.assign({},this.state.searchOption)
        data[type]= val
        this.setState(
            {searchOption:data},
            ()=>{
                this.checkTime(this.getList.bind(this))
            }
        )
    }

    btnActive(index) {
        let path = this.state.btnList[index].postUrl
        if(path === this.state.path){
            return
        }else{
            this.setState(
                {path:path},
                ()=>{
                    this.checkTime(this.getList.bind(this))
                }
            )
        }
    }



    render() {
        return (
            <Fragment>
                <Loading loading={this.state.loadingShow} text='加载中...'>
                    <div className="query-top-block" style={{minHeight: '180px'}}>
                        <div className="query-top-title">请选择查询条件</div>
                        <div className="search-bar">
                            <div className="search-cube">
                                片区：
                                <Select placeholder='请选择片区'  onChange={this.updateSearchOption.bind(this,'area')} value={this.state.searchOption.area}>
                                    {
                                        this.state.pqList.map((el,index) =>
                                            <Select.Option key={index} label={el} value={el}/>
                                        )
                                    }
                                </Select>
                            </div>
                            <div className="search-data">
                                时间：
                                <DateRangePicker
                                    ref={e=>this.daterangepicker = e}
                                    placeholder="选择日期范围"
                                    rangeSeparator=' ~ '
                                    value={[
                                        this.state.searchOption.startTime != null ? new Date(this.state.searchOption.startTime) : null,
                                        this.state.searchOption.endTime != null ? new Date(this.state.searchOption.endTime) : null
                                    ]}
                                    onChange={date=>{
                                        let option = _.assign({},this.state.searchOption)
                                        if(date){
                                            let startTime = date[0].getTime()
                                            let endTime = date[1].getTime()
                                            option.startTime = startTime
                                            option.endTime = endTime
                                            this.setState(
                                                {searchOption:option},
                                                ()=>{
                                                    this.checkTime(this.getList.bind(this))
                                                }
                                            )
                                        }else{
                                            option.startTime = null
                                            option.endTime = null
                                            this.setState({searchOption:option})
                                        }
                                    }}
                                    shortcuts={[
                                        {
                                            text: '最近一个月',
                                            onClick: ()=> {
                                                const start = new Date().getTime() - 3600 * 1000 * 24 * 30;
                                                const end = new Date().getTime();
                                                let option = _.assign({},this.state.searchOption)
                                                option.startTime = start
                                                option.endTime = end
                                                this.setState(
                                                    {searchOption:option},
                                                    ()=> {
                                                        this.checkTime(this.getList.bind(this))
                                                    }
                                                )
                                                this.daterangepicker.togglePickerVisible()
                                            }
                                        },
                                        {
                                            text: '最近三个月',
                                            onClick: ()=> {
                                                const start = new Date().getTime() - 3600 * 1000 * 24 * 90;
                                                const end = new Date().getTime();
                                                let option = _.assign({},this.state.searchOption)
                                                option.startTime = start
                                                option.endTime = end
                                                this.setState(
                                                    {searchOption:option},
                                                    ()=> {
                                                        this.checkTime(this.getList.bind(this))
                                                    }
                                                )
                                                this.daterangepicker.togglePickerVisible()
                                            }
                                        },
                                        {
                                            text: '最近一年',
                                            onClick: ()=> {
                                                const start = new Date().getTime() - 3600 * 1000 * 24 * 365;
                                                const end = new Date().getTime();
                                                let option = _.assign({},this.state.searchOption)
                                                option.startTime = start
                                                option.endTime = end
                                                this.setState(
                                                    {searchOption:option},
                                                    ()=> {
                                                        this.checkTime(this.getList.bind(this))
                                                    }
                                                )
                                                this.daterangepicker.togglePickerVisible()
                                            }
                                        }
                                    ]}
                                />
                            </div>
                        </div>
                        <div className="search-btn">
                            {
                                this.state.btnList.map((el,index) =>
                                    <Button className={ this.state.path === el.postUrl ? 'btn-title active' : 'btn-title' } onClick={ this.btnActive.bind(this, index) }>{el.name}</Button>
                                )
                            }
                        </div>
                    </div>

                    <div className="query-bottom-block">
                        <div className="query-top-title">
                            {_.find(this.state.btnList, (obj)=>{return obj.postUrl === this.state.path}).name}
                            {this.state.searchOption.area !== "" ? `——${this.state.searchOption.area}` : `——总的`}
                        </div>
                        <Table
                            style={{width: '100%'}}
                            columns={_.find(this.state.btnList,(obj)=>{return obj.postUrl === this.state.path}).columns}
                            maxHeight={600}
                            data={this.state.list}
                        />
                    </div>
                </Loading>
            </Fragment>
        )
    }
}

export default withRouter(Quanyuanyingxiaohuizongbaobiao)