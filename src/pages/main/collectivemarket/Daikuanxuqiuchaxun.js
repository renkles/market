import React, {Component, Fragment} from 'react';
import {withRouter} from "react-router-dom";
import {Button, Loading, DateRangePicker, Pagination, Input} from 'element-react'
import Http from '../../../utils/http'
import _ from 'lodash'

import './daikuanxuqiuchaxun.scss'
import '../../../iconfont/iconfont.css'

class Daikuanxuqiuchaxun extends Component {
    constructor(props) {
        super(props)
        this.state = {
            loadingShow:true,
            searchOption: {
                page: 1,
                pageSize: 10,
                keyWord:''
            },
            totalNum:1,
            requireList:[]
        }
    }

    componentWillUnmount() {
        this.setState = (state, callback) => {
            return
        }
    }

    componentDidMount() {
        this.getList();
    }

    getList(){
        this.setState({loadingShow:true})
        let userName = localStorage.getItem('userName')
        let params = _.assign({staffId: userName},this.state.searchOption)
        console.log('params',params)
        Http.post('/loan/loan/list',params)
            .then(
                res=>{
                    console.log('list',res)
                    if(res.resultCode === 'success'){
                        this.setState({requireList:res.data.loanVoList,totalNum:res.data.total,loadingShow:false})
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

    changePage(num){
        let option = _.assign({},this.state.searchOption)
        option.page = num
        this.setState(
            {searchOption:option},
            ()=>{
                this.getList()
            }
        )
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
                this.getList();
            }
        )
    }

    render() {
        return (
            <div>
                <Fragment>
                    <Loading loading={this.state.loadingShow} text='加载中...'>
                        <div className="query-block">
                            <div className="query-top-title">贷款需求查询列表</div>
                            <div className='search-bar-cube'>
                                <Input type="text" style={{width: '140px'}} className='search-bar' placeholder='搜索...' value={this.state.searchOption.keyWord} onChange={this.searchKey.bind(this,'keyWord')}/>
                                <i className='iconfont icon-sousuo search-btn' style={{fontSize: '18px'}}  onClick={this.keyChange.bind(this)}></i>
                            </div>
                            <table className='query-table'>
                                <thead>
                                    <tr>
                                        <td>序号</td>
                                        <td>客户名称</td>
                                        <td>贷款用途</td>
                                        <td>金额(万元)</td>
                                        <td>申请日期</td>
                                        <td>发放日期</td>
                                    </tr>
                                </thead>
                                <tbody>
                                {
                                    this.state.requireList != null && this.state.requireList.length > 0
                                        ?
                                        this.state.requireList.map((el,index) =>
                                            <tr key={index}>
                                                <td>{(this.state.searchOption.page-1)*this.state.searchOption.pageSize+index+1}</td>
                                                <td>{el.custName}</td>
                                                <td>{el.purpose}</td>
                                                <td>{el.money}</td>
                                                <td>{el.applicationDate}</td>
                                                <td>{el.giveDate === '' ? '------' : el.giveDate}</td>
                                            </tr>
                                        )
                                        :
                                        <tr><td colSpan={6}>暂无数据</td></tr>
                                }
                                </tbody>
                            </table>
                            <div className='paginationBox'>
                                <Pagination layout="prev, pager, next" total={this.state.totalNum} pageSize={this.state.searchOption.pageSize} onCurrentChange={this.changePage.bind(this)}/>
                            </div>
                        </div>
                    </Loading>
                </Fragment>
            </div>
        )
    }
}

export default withRouter(Daikuanxuqiuchaxun)