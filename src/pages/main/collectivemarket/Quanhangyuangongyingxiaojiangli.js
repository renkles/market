import React, {Component} from 'react';
import {withRouter} from "react-router-dom";
import {Button, Loading, DateRangePicker, Select, Input, Table, MessageBox} from 'element-react'
import Http from '../../../utils/http'
import Validate from '../../../utils/validate'
import _ from 'lodash'

import './quanhangyuangongyingxiaojiangli.scss'
import '../../../iconfont/iconfont.css'

class Quanhangyuangongyingxiaojiangli extends Component {
    constructor() {
        super()
        this.state = {
            loadingShow:true,
            optionList:[],
            tableList:[],
            searchOption:{
                departmentNames: "",
                startTime:null,
                endTime: null,
                qsjl: "",
                zzjl: ""
            }
        }
    }

    componentWillUnmount() {
        this.setState = (state, callback) => {
            return
        }
    }

    componentDidMount() {
        this.getOptions()
    }

    getOptions() {
        Http.post('/qhygyxjl/allDepartmentName')
            .then(
                res=>{
                    console.log(res)
                    let searchOption = _.assign({},this.state.searchOption)
                    searchOption.departmentNames = res.data[0]
                    this.setState(
                        {optionList:res.data,searchOption:searchOption},
                        ()=>{
                            this.initData()
                        }
                    )
                }
            )
            .catch(
                err=> {
                    console.log(err)
                }
            )
    }

    initData(){
        const num = 365
        // 验证奖励区间
        let firstNum = this.state.searchOption.qsjl
        let lastNum = this.state.searchOption.zzjl
        if(firstNum === "" && lastNum === ""){
            // 设置默认时间
            if(this.state.searchOption.startTime == null){
                let currentYear = new Date().getFullYear()
                let currentMonth = new Date().getMonth()
                let currentDay = new Date().getDate()
                let endTime = new Date(currentYear, currentMonth, currentDay).getTime()
                let startTime = endTime - num * 24 * 60 * 60 * 1000
                let searchOption = _.assign({},this.state.searchOption)
                searchOption.startTime = startTime
                searchOption.endTime = endTime
                this.setState(
                    {searchOption:searchOption},
                    ()=>{
                        this.getList()
                    }
                )
            }else{
                this.getList()
            }
        }else{
            let bool = Validate.validateCash(firstNum) && Validate.validateCash(lastNum)
            if(bool){
                console.log(firstNum, lastNum)
                if(parseFloat(firstNum) > parseFloat(lastNum)){
                    MessageBox.msgbox({
                        title:'提示',
                        message:'请填写正确格式的奖励区间',
                        type:'error'
                    })
                }else{
                    // 设置默认时间
                    if(this.state.searchOption.startTime == null){
                        let currentYear = new Date().getFullYear()
                        let currentMonth = new Date().getMonth()
                        let currentDay = new Date().getDate()
                        let endTime = new Date(currentYear, currentMonth, currentDay).getTime()
                        let startTime = endTime - num * 24 * 60 * 60 * 1000
                        let searchOption = _.assign({},this.state.searchOption)
                        searchOption.startTime = startTime
                        searchOption.endTime = endTime
                        this.setState(
                            {searchOption:searchOption},
                            ()=>{
                                this.getList()
                            }
                        )
                    }else{
                        this.getList()
                    }
                }
            }else{
                MessageBox.msgbox({
                    title:'提示',
                    message:'请填写正确格式的奖励区间',
                    type:'error'
                })
            }
        }

    }

    getList(){
        this.setState({loadingShow:true})
        let params = _.assign({},this.state.searchOption)
        Http.post('/qhygyxjl/sj',params)
            .then(
                res=>{
                    console.log(res)
                    if(res.resultCode === 'success'){
                        this.setState({loadingShow:false,tableList:res.data.rewardList})
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

    updateOption(type, val) {
        let searchOption = _.assign({},this.state.searchOption)
        searchOption[type] = val
        this.setState({searchOption:searchOption})
    }

    render() {
        const columns =  [
            {
                label: "工号",
                prop: "userId",
                align: 'center'
            },
            {
                label: "所属支行",
                prop: "departmentName",
                align: 'center'
            },
            {
                label: "姓名",
                prop: "lastname",
                align: 'center'
            },
            {
                label: "营销奖励",
                prop: "ygjl",
                align: 'center'
            }
        ]
        return (
            <div className='collective-container'>
                <p className="collective-title">全行员工营销奖励</p>
                <Loading loading={this.state.loadingShow} text='加载中...'>
                    <div className="search-block">
                        <div className="search-cube">
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
                        </div>
                        <div className="search-cube">
                            <span style={{marginRight:'20px',letterSpacing:'1px',fontSize:'16px'}}>机构名称:</span>
                            <Select onChange={this.updateOption.bind(this, 'departmentNames')} value={this.state.searchOption.departmentNames}>
                                {
                                    this.state.optionList.map(el =>
                                        <Select.Option key={el} label={el} value={el} />
                                    )
                                }
                            </Select>
                        </div>
                        <div className="search-cube">
                            <span style={{marginRight:'20px',letterSpacing:'1px',fontSize:'16px'}}>奖励区间:</span>
                            <Input value={this.state.searchOption.qsjl} onChange={this.updateOption.bind(this, 'qsjl')} style={{width:'100px'}} placeholder='0' maxLength={8}/>
                            <span style={{margin:'0 20px'}}>~</span>
                            <Input value={this.state.searchOption.zzjl} onChange={this.updateOption.bind(this, 'zzjl')} style={{width:'100px'}} placeholder='0' maxLength={8}/>
                            <Button onClick={this.initData.bind(this)} type='primary' style={{marginLeft:'40px'}}>查询</Button>
                        </div>
                    </div>
                    <div className="table-block">
                        <Table
                            style={{width: '100%'}}
                            columns={columns}
                            maxHeight={560}
                            data={this.state.tableList}
                        />
                    </div>
                </Loading>
            </div>
        )
    }
}

export default withRouter(Quanhangyuangongyingxiaojiangli)