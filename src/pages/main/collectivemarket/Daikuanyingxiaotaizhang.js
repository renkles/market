import React, {Component, Fragment} from 'react';
import {withRouter} from "react-router-dom";
import {Button, Loading, DateRangePicker, Input, Pagination} from 'element-react'
import Http from '../../../utils/http'
import _ from 'lodash'

import './daikuanyingxiaotaizhang.scss'
import '../../../iconfont/iconfont.css'

class Daikuanyingxiaotaizhang extends Component {
    constructor(props) {
        super(props)
        this.state = {
            loadingShow:true,
            list:[],
            searchOption: {
                page: 1,
                pageSize: 8,
                keyword:''
            },
            totalNum:1,
            showList: [],
            canShowMore: true
        }
    }

    componentWillUnmount() {
        this.setState = (state, callback) => {
            return
        }
    }

    componentDidMount() {
        this.getList()
    }

    getList(){
        this.setState({loadingShow:true})
        let userName = localStorage.getItem('userName')
        let params = _.assign({staffId: userName},this.state.searchOption)
        Http.post('/loan/loan/list2',params)
            .then(
                res=>{
                    console.log(res)
                    if(res.resultCode === 'success'){
                        this.setState({list:res.data.loanVoList,totalNum:res.data.total,loadingShow:false})
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

    showDetail(index) {
        let list = [...this.state.showList]
        let num = _.indexOf(list,index)
        if(num === -1){
            this.state.canShowMore
            ?
            list.push(index)
            :
            list = [index]
        }else{
            list.splice(num,1)
        }
        this.setState({showList:list})
    }

    searchKey(type,val){
        let data = _.assign({},this.state.searchOption)
        data[type]= val
        this.setState({searchOption:data})
    }

    keyChange(){
        let obj = _.assign({},this.state.searchOption)
        obj.page = 1
        this.setState(
            {searchOption:obj},
            ()=>{
                this.getList()
            }
        )
    }

    changePage(num){
        let option = _.assign({},this.state.searchOption)
        option.page = num
        this.setState(
            {searchOption:option,showList:[]},
            ()=>{
                this.getList()
            }
        )
    }

    render() {
        return (
            <div>
                <Fragment>
                    <Loading loading={this.state.loadingShow} text='加载中...'>
                        <div className="query-block">
                            <div className="query-top-title">贷款营销台账列表</div>
                            <div className='search-bar-cube'>
                                <Input type="text" style={{width: '140px'}} className='search-bar' placeholder='搜索...' value={this.state.searchOption.keyword} onChange={this.searchKey.bind(this,'keyword')}/>
                                <i className='iconfont icon-sousuo search-btn' style={{fontSize: '18px'}}  onClick={this.keyChange.bind(this)}></i>
                            </div>
                            <table className='query-table'>
                                <thead>
                                <tr>
                                    <td>序号</td>
                                    <td>客户名称</td>
                                    <td>贷款用途</td>
                                    <td>贷款金额(万元)</td>
                                    <td>申请日期</td>
                                    <td>发放日期</td>
                                    <td>详细</td>
                                </tr>
                                </thead>
                                <tbody>
                                {
                                    this.state.list != null && this.state.list.length > 0
                                        ?
                                        this.state.list.map((el,index) =>
                                            <Fragment key={index}>
                                                <tr>
                                                    <td>{(this.state.searchOption.page-1)*this.state.searchOption.pageSize+index+1}</td>
                                                    <td>{el.custName}</td>
                                                    <td>{el.purpose}</td>
                                                    <td>{el.money}</td>
                                                    <td>{el.applicationDate}</td>
                                                    <td>{el.giveDate === '' ? '------' : el.giveDate}</td>
                                                    <td onClick={ this.showDetail.bind(this, index) }>
                                                        { _.indexOf(this.state.showList,index) === -1 ? (<i className="el-icon-caret-right" style={{cursor:'pointer'}}></i>): (<i className="el-icon-caret-top" style={{cursor:'pointer'}}></i>) }
                                                    </td>
                                                </tr>
                                                <tr style={_.indexOf(this.state.showList,index) !== -1 ? {textAlign: 'left'} : {display:'none'}}>
                                                    <td style={{padding: '0 41px'}} colSpan={7}>
                                                        <span style={{marginRight: '40px'}}>证件号码：{el.certId}</span>
                                                        <span style={{marginRight:'40px'}}>联系方式：{el.mobile}</span>
                                                        <span>联系地址：{el.addr}</span><br/>
                                                        <span style={{marginRight: '40px'}}>申请人：{el.applier}</span>
                                                        <span style={{marginRight: '40px'}}>申请人单位：{el.departName}</span>
                                                        <span>受理支行：{el.deptName}</span>
                                                    </td>
                                                </tr>
                                            </Fragment>
                                        )
                                        :
                                        <tr><td colSpan={7}>暂无数据</td></tr>
                                }
                                </tbody>
                            </table>
                            <div className='pagination-box'>
                                <Pagination  layout="prev, pager, next" total={this.state.totalNum} pageSize={this.state.searchOption.pageSize} onCurrentChange={this.changePage.bind(this)}/>
                            </div>
                        </div>
                    </Loading>
                </Fragment>
            </div>
        )
    }
}

export default withRouter(Daikuanyingxiaotaizhang)