import React, {Component} from 'react';
import {withRouter} from "react-router-dom";
import {Input, Button, Dialog, Loading, Pagination, Checkbox, MessageBox} from 'element-react'
import _ from 'lodash'
import Http from '../../../utils/http'

import './shensushenhe.scss'
import '../../../iconfont/iconfont.css'

class Shensushenhe extends Component {
    constructor() {
        super()
        this.state = {
            loadingShow:false,
            tableList:[],
            searchOption: {
                pageSize: 10,
                page: 1
            },
            total:1,
            complainIdList:[],
            currentComplainId:"",
            dialogType: 0, // 1：批量审核通过 2：批量审核不通过 3：单选审核通过 4：单选审核不通过 0：关闭
            advice:"", // 意见
            canConfirm:false
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

    getList() {
        this.setState({loadingShow:true})
        let userName = localStorage.getItem('userName')
        let params = _.assign({staffId: userName}, this.state.searchOption)
        Http.post('/complain/approve/query',params)
            .then(
                res=>{
                    console.log(res)
                    if(res.resultCode === 'success'){
                        let list = res.data.complainApproveList
                        let total = res.data.total
                        this.setState({tableList:list,total:total,complainIdList:[],loadingShow:false})
                    }else{
                        console.log('获取数据失败')
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

    changePage(val) {
        let data = _.assign({},this.state.searchOption)
        data.page = val
        this.setState(
            {searchOption:data},
            ()=>{
                this.getList()
            }
        )
    }

    selectAll(val) {
        if(this.state.tableList != null && this.state.tableList.length > 0){
            if(val){
                let list = []
                _.forEach(this.state.tableList,(obj)=>{
                    list.push(obj.complainId)
                })
                this.setState({complainIdList:list})
            }else{
                this.setState({complainIdList:[]})
            }
        }else{
            return
        }
    }

    selectItem(id,val) {
        if(val){
            let list = [...this.state.complainIdList]
            list.push(id)
            this.setState({complainIdList:list})
        }else{
            let list = [...this.state.complainIdList]
            let index = _.indexOf(list, id)
            list.splice(index,1)
            this.setState({complainIdList:list})
        }
    }

    // 审核通过弹框
    showResolve(id) {
        if(typeof id === 'number'){
            this.setState({currentComplainId:id,dialogType:3,canConfirm:true})
        }else{
            if(this.state.complainIdList.length > 0){
                this.setState({dialogType:1,canConfirm:true})
            }else{
                MessageBox.msgbox({
                    title:'提示',
                    message:'请先选择客户',
                    type:'error'
                })
            }
        }
    }

    // 审核拒绝弹框
    showReject(id) {
        if(typeof id === 'number'){
            this.setState({currentComplainId:id,dialogType:4,canConfirm:true})
        }else{
            if(this.state.complainIdList.length > 0){
                this.setState({dialogType:2,canConfirm:true})
            }else{
                MessageBox.msgbox({
                    title:'提示',
                    message:'请先选择客户',
                    type:'error'
                })
            }
        }
    }

    // 关闭弹框
    closeDialog() {
        let type = this.state.dialogType
        switch (type){
            case 3:
                this.setState({currentComplainId:"",dialogType:0,advice:"",canConfirm:false})
                break;
            case 4:
                this.setState({currentComplainId:"",dialogType:0,advice:"",canConfirm:false})
                break;
            default:
                this.setState({dialogType:0,advice:"",canConfirm:false})
                break;
        }
    }

    // 审核通过
    setResolve() {
        if(this.state.canConfirm){
            this.setState({canConfirm:false})
            switch (this.state.dialogType){
                case 1: // 批量通过
                    let params1 = {
                        advice: this.state.advice,
                        status: "1",
                        complainId: this.state.complainIdList
                    }
                    Http.post('/complain/approve',params1)
                        .then(
                            res=>{
                                console.log(res)
                                if(res.resultCode  === 'success'){
                                    this.setState(
                                        {dialogType:0,advice:"",currentComplainId:"",complainIdList:[]},
                                        ()=>{
                                            MessageBox.msgbox({
                                                title:'提示',
                                                message:'审核成功',
                                                type:'success'
                                            })
                                            this.getList()
                                        }
                                    )
                                }else{
                                    console.log('审核失败')
                                }
                            }
                        )
                        .catch(
                            err=> {
                                console.log(err)
                            }
                        )
                    break;
                case 3: // 通过
                    let params2 = {
                        advice: this.state.advice,
                        status: "1",
                        complainId: [this.state.currentComplainId]
                    }
                    Http.post('/complain/approve',params2)
                        .then(
                            res=>{
                                console.log(res)
                                if(res.resultCode  === 'success'){
                                    this.setState(
                                        {dialogType:0,advice:"",currentComplainId:"",complainIdList:[]},
                                        ()=>{
                                            MessageBox.msgbox({
                                                title:'提示',
                                                message:'审核成功',
                                                type:'success'
                                            })
                                            this.getList()
                                        }
                                    )
                                }else{
                                    console.log('审核失败')
                                }
                            }
                        )
                        .catch(
                            err=> {
                                console.log(err)
                            }
                        )
                    break;
            }
        }
    }

    // 审核拒绝
    setReject() {
        if(this.state.canConfirm){
            this.setState({canConfirm:false})
            switch (this.state.dialogType){
                case 2: // 批量拒绝
                    let params1 = {
                        advice: this.state.advice,
                        status: "2",
                        complainId: this.state.complainIdList
                    }
                    Http.post('/complain/approve',params1)
                        .then(
                            res=>{
                                console.log(res)
                                if(res.resultCode  === 'success'){
                                    this.setState(
                                        {dialogType:0,advice:"",currentComplainId:"",complainIdList:[]},
                                        ()=>{
                                            MessageBox.msgbox({
                                                title:'提示',
                                                message:'审核成功',
                                                type:'success'
                                            })
                                            this.getList()
                                        }
                                    )
                                }else{
                                    console.log('审核失败')
                                }
                            }
                        )
                        .catch(
                            err=> {
                                console.log(err)
                            }
                        )
                    break;
                case 4: // 拒绝
                    let params2 = {
                        advice: this.state.advice,
                        status: "2",
                        complainId: [this.state.currentComplainId]
                    }
                    Http.post('/complain/approve',params2)
                        .then(
                            res=>{
                                console.log(res)
                                if(res.resultCode  === 'success'){
                                    this.setState(
                                        {dialogType:0,advice:"",currentComplainId:"",complainIdList:[]},
                                        ()=>{
                                            MessageBox.msgbox({
                                                title:'提示',
                                                message:'审核成功',
                                                type:'success'
                                            })
                                            this.getList()
                                        }
                                    )
                                }else{
                                    console.log('审核失败')
                                }
                            }
                        )
                        .catch(
                            err=> {
                                console.log(err)
                            }
                        )
                    break;
            }

        }
    }

    render() {
        return (
            <div className="check-clock">
                <Loading loading={this.state.loadingShow} text='加载中...'>
                    <div className="check-title">申诉审核进度列表</div>
                    <div className="table-box">
                        <table className="table-style">
                            <thead>
                            <tr>
                                <td><Checkbox onChange={this.selectAll.bind(this)} checked={this.state.tableList.length > 0 ? this.state.tableList.length === this.state.complainIdList.length : false}/>全选</td>
                                <td>客户名称</td>
                                <td>证件号</td>
                                <td>业务类型</td>
                                <td>金额</td>
                                <td>开户日期</td>
                                <td>补认领人</td>
                                <td>操作</td>
                            </tr>
                            </thead>
                            <tbody>
                            {
                                this.state.tableList != null && this.state.tableList.length > 0
                                    ?
                                    this.state.tableList.map((el,index)=>
                                        <tr key={index}>
                                            <td><Checkbox onChange={this.selectItem.bind(this,el.complainId)} checked={_.indexOf(this.state.complainIdList,el.complainId) !== -1}/></td>
                                            <td>{el.customerName}</td>
                                            <td>{el.certId}</td>
                                            <td>{el.businessType}</td>
                                            <td>{parseFloat(el.transAmt).toFixed(2)}</td>
                                            <td>{el.openDate != null && el.openDate !== "" ? `${el.openDate.slice(0,4)}-${el.openDate.slice(4,6)}-${el.openDate.slice(6,8)}` : '------'}</td>
                                            <td>{el.complainStaffName}</td>
                                            <td>
                                                <i className='iconfont icon-queren' style={{margin:'0 5px',color:'#63BF6A',cursor:'pointer'}} onClick={this.showResolve.bind(this,el.complainId)}></i>
                                                <i className='iconfont icon-chacha' style={{margin:'0 5px',color:'#D06052',cursor:'pointer'}} onClick={this.showReject.bind(this,el.complainId)}></i>
                                            </td>
                                        </tr>
                                    )
                                    :
                                    <tr><td colSpan={8}>暂无数据</td></tr>
                            }
                            </tbody>
                        </table>
                        <div className="batch-btn">
                            <Button onClick={this.showResolve.bind(this)} style={{background:'#63BF6A',color:'#FFFFFF'}} size='small'>批量通过</Button>
                            <Button onClick={this.showReject.bind(this)} style={{background:'#D06052',color:'#FFFFFF'}} size='small'>批量拒绝</Button>
                        </div>
                    </div>
                    <div className="pagination-box">
                        <Pagination layout="prev, pager, next" total={this.state.total} pageSize={this.state.searchOption.pageSize} onCurrentChange={this.changePage.bind(this)}/>
                    </div>
                </Loading>
                {/*弹框*/}
                <Dialog
                    title="审批"
                    size="tiny"
                    top='35%'
                    visible={ this.state.dialogType !== 0 }
                    onCancel={ this.closeDialog.bind(this) }
                    lockScroll={ false }
                >
                    <Dialog.Body style={{padding:'20px 40px'}}>
                        <div style={{lineHeight:'20px',marginBottom:'20px'}}>
                            <p style={{marginBottom:'10px'}}>填写审核意见：</p>
                            <Input value={this.state.advice} onChange={(val)=>{this.setState({advice:val})}} maxLength={140} type='textarea' autosize={{ minRows: 3, maxRows: 5}} placeholder='请输入审核意见(不超过140字)'/>
                        </div>
                        <div style={{textAlign:'center'}}>
                            <Button onClick={this.closeDialog.bind(this)}>取消</Button>
                            <Button onClick={this.setResolve.bind(this)} style={this.state.dialogType === 1 || this.state.dialogType === 3 ? {color:'#FFFFFF',background:'#63BF6A'} : {display:'none'}}>{this.state.dialogType === 1 ? '批量通过' : '通过'}</Button>
                            <Button onClick={this.setReject.bind(this)} style={this.state.dialogType === 2 || this.state.dialogType === 4 ? {color:'#FFFFFF',background:'#D06052'} : {display:'none'}}>{this.state.dialogType === 2 ? '批量拒绝' : '拒绝'}</Button>
                        </div>
                    </Dialog.Body>
                </Dialog>
            </div>
        )
    }
}

export default withRouter(Shensushenhe)