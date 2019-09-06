import React, {Component} from 'react';
import {withRouter} from "react-router-dom";
import {Button, DateRangePicker, Loading, MessageBox, Pagination} from 'element-react'
import _ from 'lodash'
import Http from '../../../utils/http'

import './shensujinduchaxun.scss'
import '../../../iconfont/iconfont.css'

class Shensujinduchaxun extends Component {
    constructor() {
        super()
        this.state = {
            list:[],
            searchOption:{
                startTime:null,
                endTime:null,
                pageSize: 10,
                page: 1
            },
            total:1,
            loadingShow:false
        }
    }

    componentWillUnmount() {
        this.setState = (state, callback) => {
            return
        }
    }

    componentDidMount() {
        // 默认获取最近三个月
        let option = _.assign({},this.state.searchOption)
        let start = new Date().getTime() - 3600 * 1000 * 24 * 90
        let end = new Date().getTime()
        option.startTime = start
        option.endTime = end
        this.setState(
            {searchOption:option},
            ()=>{
                this.getList()
            }
        )
    }

    getList() {
        let userName = localStorage.getItem('userName')
        let params = _.assign({staffId: userName}, this.state.searchOption)
        if (params.startTime != null) {
            this.setState({loadingShow:true})
            Http.post('/complain/progress/query',params)
                .then(
                    res=> {
                        console.log(res)
                        if(res.resultCode === 'success'){
                            let data = res.data.complainProgressList
                            let total = res.data.total
                            this.setState({list:data,total:total,loadingShow:false})
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
        }else{
            this.componentDidMount()
        }
    }

    changePage(num) {
        let option = _.assign({},this.state.searchOption)
        option.page = num
        this.setState(
            {searchOption:option},
            ()=>{
                this.getList()
            }
        )
    }

    formatStatus(str){
        switch(parseInt(str)) {
            case 0:
                return {label:'申诉中',color:'#F1C500'}
            case 1:
                return {label:'成功',color:'#63BF6A'}
            case 2:
                return {label:'拒绝',color:'#D06052'}
            case 3:
                return {label:'已处理',color:'#209EFB'}
            default:
                return {label:'',color:'#209EFB'}
        }
    }

    render() {
        return (
            <div className='query-block'>
                <Loading loading={this.state.loadingShow} text='加载中...'>
                    <div className="query-title">补认领进度列表</div>
                    <div className="query-search-cube">
                        选择查询时间：
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
                                    this.setState({searchOption:option})
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
                                        this.setState({searchOption:option})
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
                                        this.setState({searchOption:option})
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
                                        this.setState({searchOption:option})
                                        this.daterangepicker.togglePickerVisible()
                                    }
                                }
                            ]}
                            // disabledDate={time=>time.getTime() > Date.now()}
                        />
                        <Button
                            type='primary'
                            style={{marginLeft:'40px'}}
                            onClick={
                                ()=>{
                                    let option = _.assign({},this.state.searchOption)
                                    option.page = 1
                                    this.setState(
                                        {searchOption:option},
                                        ()=>{
                                            this.getList()
                                        }
                                    )
                                }
                            }
                        >
                            查询
                        </Button>
                    </div>
                    <table className='query-list'>
                        <thead>
                        <tr>
                            <td>客户名称</td>
                            <td>客户证件号</td>
                            <td>业务类型</td>
                            <td>补认领日期</td>
                            <td>状态</td>
                        </tr>
                        </thead>
                        <tbody>
                        {
                            this.state.list != null && this.state.list.length > 0
                                ?
                                this.state.list.map((el,index) =>
                                    <tr key={index}>
                                        <td>{el.customerName}</td>
                                        <td>{el.certId}</td>
                                        <td>{el.businessType}</td>
                                        <td>{`${el.complainDate.slice(0,4)}-${el.complainDate.slice(4,6)}-${el.complainDate.slice(6,8)}`}</td>
                                        <td><Button size='mini' style={{backgroundColor:`${this.formatStatus(el.complainStatus).color}`,color:'#FFFFFF'}}>{this.formatStatus(el.complainStatus).label}</Button></td>
                                    </tr>
                                )
                                :
                                <tr><td colSpan={5}>暂无数据</td></tr>
                        }
                        </tbody>
                    </table>
                    <div style={this.state.total < 2 ? {display:'none'} : {textAlign:'center',marginTop:'40px'}}>
                        <Pagination layout="prev, pager, next" total={this.state.total} pageSize={this.state.searchOption.pageSize} onCurrentChange={this.changePage.bind(this)}/>
                    </div>
                </Loading>
            </div>
        )
    }
}

export default withRouter(Shensujinduchaxun)