import React, {Component} from 'react';
import {withRouter} from "react-router-dom";
import {Button, Loading, Pagination, Table, MessageBox} from 'element-react'
import Http from '../../../utils/http'
import _ from 'lodash'
import store from "../../../store"

import './zixunyulan.scss'
import test from '../../../images/msg.jpg'

class Zixunyulan extends Component {
    constructor() {
        super()
        this.state = {
            loading:false,
            messageList:[],
            searchOption:{
                page: 1,
                pageSize: 5,
            },
            total: 1,
            currentInfo:{},
            showDetail:false
        }
    }

    componentDidMount() {
        this.getList()
    }

    getList() {
        this.setState({loading:true})
        let key = localStorage.getItem('userName')
        let params = _.assign({staffId:key},this.state.searchOption)
        Http.post('/information/list/query',params)
            .then(res=>{
                console.log(res)
                if(res.resultCode === "success"){
                    let list = res.data.infos
                    let total = res.data.total
                    this.setState({messageList:list,loading:false,total:total})
                }else{
                    MessageBox.msgbox({
                        title:'提示',
                        message:'获取数据失败!',
                        type:'error'
                    })
                    this.setState({loading:false})
                }
            })
            .catch(err=>{
                this.setState({loading:false})
                console.log(err)
            })
    }

    changePage(n) {
        let obj = _.assign({},this.state.searchOption)
        obj.page = n
        this.setState(
            {searchOption:obj},
            ()=>{
                this.getList()
            }
        )
    }

    getImgUrl(list){
        if(list.length > 0){
            return list[0].fileUrl
        }else{
            return test
        }
    }

    showDetail(id){
        let info = _.find(this.state.messageList,(obj)=>{return obj.id === id})
        if(info != null){
            this.setState({showDetail:true,currentInfo:info})
            console.log(info)
        }
    }

    hideDetail() {
        this.setState({showDetail:false})
    }

    render() {
        return  (
            <div style={{position:'relative'}}>
                {/*资讯列表*/}
                <div className="banner-check-list-block" style={this.state.showDetail ? {transform:"scale(0)"} : {}}>
                    <div className="banner-check-list-title">
                        资讯列表
                    </div>
                    <ul className="banner-check-list-cube">
                        {
                            this.state.messageList != null && this.state.messageList.length > 0
                            ?
                            this.state.messageList.map(el=>
                                <li className="banner-check-list-item" key={el.id}>
                                    <div className="banner-check-item-img-box">
                                        <div className='banner-check-item-img' style={{backgroundImage:`url(${this.getImgUrl(el.fileModels)})`}}></div>
                                    </div>
                                    <div className="banner-check-item-info">
                                        <div onClick={this.showDetail.bind(this,el.id)} className="banner-check-info-title" title='查看该条资讯'>{el.title}</div>
                                        <div className="banner-check-info-content">{el.content}</div>
                                    </div>
                                </li>
                            )
                            :
                            <li style={{testAlign:'center',lineHeight:'100px',color:'#999999'}}>暂无资讯...</li>
                        }
                    </ul>
                    <div style={{textAlign:'center',marginTop:'20px'}}>
                        <Pagination layout="prev, pager, next" total={this.state.total} pageSize={this.state.searchOption.pageSize} onCurrentChange={this.changePage.bind(this)}/>
                    </div>
                </div>

                {/*资讯详情*/}
                <div className="banner-check-detail-block" style={this.state.showDetail ? {} : {transform:"scale(0)"}}>
                    <div className="banner-check-detail-title">
                        资讯详情
                        <i onClick={this.hideDetail.bind(this)} className="iconfont icon-guanbi return-list-btn" title='返回资讯列表'></i>
                    </div>
                    <div className="banner-check-detail-cube">
                        <div className="banner-check-detail-info-title">
                            资讯标题：<span style={{fontWeight:'bold'}}>{this.state.currentInfo.title}</span>
                        </div>
                        <div className="banner-check-detail-img-list">
                            {
                                this.state.currentInfo.fileModels != null && this.state.currentInfo.fileModels.length > 0
                                ?
                                this.state.currentInfo.fileModels.map((el, index)=>
                                    <div key={index} className="banner-check-detail-img-item" style={{backgroundImage:`url(${el.fileUrl})`}}></div>
                                )
                                :
                                null
                            }
                        </div>
                        <div className="banner-check-detail-content">
                            资讯内容：{this.state.currentInfo.content}
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default withRouter(Zixunyulan)