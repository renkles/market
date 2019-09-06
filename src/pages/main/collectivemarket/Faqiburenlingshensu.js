import React, {Component} from 'react';
import {withRouter} from "react-router-dom";
import {Button, Select, Input, Dialog, Loading, MessageBox} from 'element-react'
import _ from 'lodash'
import Http from '../../../utils/http'
import Validate from '../../../utils/validate'
import store from "../../../store";

import './faqiburenlingshensu.scss'
import '../../../iconfont/iconfont.css'

class Faqiburenlingshensu extends Component {
    constructor() {
        super()
        this.state = {
            loadingShow:false,
            selectList:[],
            list:[],
            userOption:{
                businessType: "",
                certId:"",
            },
            currentInfo:{},
            dialogShow:false,
            operateNum:"", // 补认领操作员
            operateName:"", // 补认领操作员
            dialogLoading:false
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
        let params = {
            staffId: userName
        }
        Http.post('/appoint/businessType/query',params)
            .then(
                res=>{
                    console.log(res)
                    if(res.resultCode === 'success'){
                        this.setState({selectList:res.data.types,loadingShow:false})
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

    updateUserOption(type,val){
        let data = _.assign({},this.state.userOption)
        data[type]= val
        this.setState({userOption:data})
    }

    // 查询
    getInfo(){
        let params = _.assign({},this.state.userOption)
        // 验证
        if(params.businessType !== ''){
            if(Validate.validateIdCard(params.certId)){
                this.setState({loadingShow:true})
                Http.post('/supply/infoList/query',params)
                    .then(
                        res=>{
                            console.log(res)
                            if(res.resultCode === 'success'){
                                this.setState({loadingShow:false})
                                let list = res.data.list
                                this.setState({list:list})
                            }else{
                                this.setState({loadingShow:false})
                                console.log('获取数据失败')
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
                MessageBox.msgbox({
                    title:'提示',
                    message:'请填写正确的身份证号码',
                    type:'error'
                })
            }
        }else{
            MessageBox.msgbox({
                title:'提示',
                message:'请选择业务类型',
                type:'error'
            })
        }
    }

    // 补认领弹框
    toSupply(index) {
        let info = _.assign({},this.state.list[index])
        console.log(info)
        this.setState({dialogShow:true,currentInfo:info,dialogLoading:false,operateNum:"",operateName:""})
    }

    // 申诉弹框
    toComplain(index) {
        let info = _.assign({},this.state.list[index])
        this.setState({dialogShow:true,currentInfo:info,dialogLoading:false,operateNum:"",operateName:""})
    }

    // 关闭弹框
    closeDialog() {
        this.setState({dialogShow:false,currentInfo:{}})
    }

    // 发起补认领
    supply() {
        let _this = this
        if(!this.state.dialogLoading) {
            let userName = localStorage.getItem('userName')
            let year = this.state.currentInfo.openDate.slice(0, 4)
            let month = this.state.currentInfo.openDate.slice(4, 6)
            let day = this.state.currentInfo.openDate.slice(6, 8)
            let time = new Date(`${year}-${month}-${day}`).getTime()
            let params = {
                acctNo: this.state.currentInfo.acctNo,
                businessType: this.state.currentInfo.businessTypeId,
                certId: this.state.currentInfo.certId,
                customerName: this.state.currentInfo.customerName,
                reason: this.state.currentInfo.reason,
                transAmt: this.state.currentInfo.transAmt,
                openDate: time,
                staffId: userName,
                // operator:"" // 员工号
            }

            // 添加员工号
            if(this.state.currentInfo.businessTypeId === "08" || this.state.currentInfo.businessTypeId === "10"){
                if(this.state.operateNum === ""){
                    MessageBox.confirm('确定不设置操作人员？!', '提示', {
                        type: 'warning'
                    }).then(() => {
                        _this.supplyRequest(params)
                    }).catch(() => {
                        console.log('用户点击取消')
                    })
                }else{
                    this.setState({dialogLoading:true})
                    let operate = {staffId:this.state.operateNum}
                    Http.post('/user/userDetail',operate)
                        .then(res=>{
                            console.log(res)
                            if(res.resultCode === "success"){
                                if(res.data != null){
                                    let name = res.data.userName
                                    if(name != null){
                                        this.setState(
                                            {operateName:name},
                                            ()=>{
                                                params.operator = _this.state.operateNum
                                                // 发起请求
                                                _this.supplyRequest(params)
                                            }
                                        )
                                    }else{
                                        this.setState({operateName:"",dialogLoading:false})
                                        MessageBox.msgbox({
                                            title:'提示',
                                            message:'请填写正确的操作人员工号',
                                            type:'error'
                                        })
                                    }
                                }else{
                                    this.setState({operateName:"",dialogLoading:false})
                                    MessageBox.msgbox({
                                        title:'提示',
                                        message:'请填写正确的操作人员工号',
                                        type:'error'
                                    })
                                }
                            }else{
                                this.setState({operateName:"",dialogLoading:false})
                                MessageBox.msgbox({
                                    title:'提示',
                                    message:'请填写正确的操作人员工号',
                                    type:'error'
                                })
                            }
                        })
                        .catch(err=>{
                            console.log(err)
                            this.setState({dialogLoading:false})
                        })
                }
            }else{
                // 发起请求
                this.supplyRequest(params)
            }
        }
    }

    // 补认领请求
    supplyRequest(params) {
        let _this = this
        this.setState({dialogLoading:true})
        Http.post('/supply/apply', params)
            .then(
                res => {
                    this.setState({dialogLoading:false})
                    console.log(res)
                    if (res.resultCode === 'success') {
                        _this.setState(
                            {list: []},
                            () => {
                                _this.closeDialog()
                            }
                        )
                        MessageBox.msgbox({
                            title: '提示',
                            message: '申请成功',
                            type: 'success'
                        }).then(() => {
                            // 跳转补认领进度查询
                            store.dispatch({type: 'change_Current_flag', value: '5-2-2'})
                        })
                    } else {
                        MessageBox.msgbox({
                            title:'提示',
                            message:'发起补认领失败',
                            type:'error'
                        })
                    }
                }
            )
            .catch(
                err => {
                    console.log(err)
                    this.setState({dialogLoading:false})
                }
            )
    }

    // 发起申诉
    complain() {
        if(!this.state.dialogLoading) {
            this.setState({dialogLoading:true})
            let userName = localStorage.getItem('userName')
            let year = this.state.currentInfo.openDate.slice(0, 4)
            let month = this.state.currentInfo.openDate.slice(4, 6)
            let day = this.state.currentInfo.openDate.slice(6, 8)
            let time = new Date(`${year}-${month}-${day}`).getTime()
            let params = {
                acctNo: this.state.currentInfo.acctNo,
                businessType: this.state.currentInfo.businessTypeId,
                certId: this.state.currentInfo.certId,
                customerName: this.state.currentInfo.customerName,
                reason: this.state.currentInfo.reason,
                transAmt: this.state.currentInfo.transAmt,
                openDate: time,
                staffId: userName
            }
            Http.post('/complain/apply', params)
                .then(
                    res => {
                        console.log(res)
                        this.setState({dialogLoading:false})
                        if (res.resultCode === 'success') {
                            this.setState(
                                {list: []},
                                () => {
                                    this.closeDialog()
                                }
                            )
                            MessageBox.msgbox({
                                title: '提示',
                                message: '申请成功',
                                type: 'success'
                            }).then(() => {
                                // 跳转补认领进度查询
                                store.dispatch({type: 'change_Current_flag', value: '5-2-3'})
                            })
                        } else {
                            MessageBox.msgbox({
                                title:'提示',
                                message:'发起申诉失败',
                                type:'error'
                            })
                        }
                    }
                )
                .catch(
                    err => {
                        console.log(err)
                        this.setState({dialogLoading:false})
                    }
                )
        }
    }

    // 获取员工姓名
    getOperateName(e) {
        let val = e.target.value
        let params = {staffId:val}
        Http.post('/user/userDetail',params)
            .then(res=>{
                console.log(res)
                if(res.resultCode === "success"){
                    if(res.data != null){
                        let name = res.data.userName
                        if(name != null){
                            this.setState({operateName:name})
                        }else{
                            this.setState({operateName:""})
                        }
                    }else{
                        this.setState({operateName:""})
                    }
                }else{
                    this.setState({operateName:""})
                }
            })
            .catch(err=>{
                console.log(err)
            })
    }

    render() {
        return (
            <div className='launch-block'>
                <Loading loading={this.state.loadingShow} text='加载中...'>
                    <div className="search-bar">
                        <div className="search-cube">
                            业务类型：
                            <Select onChange={this.updateUserOption.bind(this,'businessType')} placeholder='请选择预约类型' value={this.state.userOption.businessType}>
                                {
                                    this.state.selectList.map(el =>
                                        <Select.Option key={el.code} label={el.name} value={el.code}/>
                                    )
                                }
                            </Select>
                        </div>
                        <div className="search-cube">
                            客户证件号：
                            <Input style={{display:'inline-block',width:'200px'}} onChange={this.updateUserOption.bind(this,'certId')} value={this.state.userOption.certId} placeholder='请输入身份证号码'/>
                        </div>
                        <Button onClick={this.getInfo.bind(this)} type='primary'>查询</Button>
                    </div>
                    <p style={{padding:'10px 0',color:'#D06052'}}>注意：存款、理财、贷款、国际业务不能发起补认领。</p>
                    <div className='table-block'>
                        <table className='table-style'>
                            <thead>
                            <tr>
                                <td>证件号</td>
                                <td>客户姓名</td>
                                <td>业务类型</td>
                                <td>开户日期</td>
                                <td>操作</td>
                            </tr>
                            </thead>
                            <tbody>
                            {
                                this.state.list != null && this.state.list.length > 0
                                ?
                                this.state.list.map((el,index)=>
                                    <tr key={index}>
                                        <td>{el.certId}</td>
                                        <td>{el.customerName}</td>
                                        <td>{el.businessTypeName}</td>
                                        <td>{el.openDate !== "" ? `${el.openDate.slice(0,4)}-${el.openDate.slice(4,6)}-${el.openDate.slice(6,8)}` : '------'}</td>
                                        <td>
                                            <Button onClick={this.toSupply.bind(this,index)} size='mini' style={el.canSupply ? {color:'#FFFFFF',background:'#F1C500'} : {display:'none'}}>补认领</Button>
                                            <Button onClick={this.toComplain.bind(this,index)} size='mini' style={el.canComplain ? {color:'#FFFFFF',background:'#D06052'} : {display:'none'}}>申诉</Button>
                                            {!el.canSupply && !el.canComplain ? '------' : null}
                                        </td>
                                    </tr>
                                )
                                :
                                <tr><td colSpan={5}>暂无数据</td></tr>
                            }
                            </tbody>
                        </table>
                    </div>
                </Loading>

                {/*弹框*/}
                <Dialog
                    title="详情"
                    size="tiny"
                    top='30%'
                    style={{minWidth:'450px'}}
                    visible={ this.state.dialogShow }
                    onCancel={ this.closeDialog.bind(this) }
                    lockScroll={ true }
                >
                    <Dialog.Body>
                        <Loading loading={this.state.dialogLoading}>
                            <p className="info-item">证件号：{this.state.currentInfo.certId}</p>
                            <p className="info-item">客户姓名：{this.state.currentInfo.customerName}</p>
                            <p className="info-item">业务类型：{this.state.currentInfo.businessTypeName}</p>
                            <p className="info-item">开户日期：{this.state.currentInfo.openDate != null ? `${this.state.currentInfo.openDate.slice(0,4)}-${this.state.currentInfo.openDate.slice(4,6)}-${this.state.currentInfo.openDate.slice(6,8)}`:`------`}</p>
                            <p className="info-item" style={this.state.currentInfo.canSupply && (this.state.currentInfo.businessTypeId === "08" || this.state.currentInfo.businessTypeId === "10") ? {} : {display:'none'}}>操作员工号：<Input size='mini' value={this.state.operateNum} onChange={(val)=>{this.setState({operateNum:val})}} onBlur={this.getOperateName.bind(this)} placeholder='请输入员工号' style={{width:'200px'}}/></p>
                            <p className="info-item" style={this.state.currentInfo.canSupply && (this.state.currentInfo.businessTypeId === "08" || this.state.currentInfo.businessTypeId === "10") ? {} : {display:'none'}}>操作员姓名：{this.state.operateName === "" ? "无" : this.state.operateName}</p>
                            <p className="info-item">备注：</p>
                            <div style={{paddingLeft:'20px'}}>
                                <Input
                                    type="textarea"
                                    maxLength={140}
                                    style={{width:'350px'}}
                                    autosize={{ minRows: 4, maxRows: 7}}
                                    placeholder="请输入内容(不超过140字)"
                                    value={this.state.currentInfo.reason}
                                    onChange={(val)=>{
                                        let info = _.assign({},this.state.currentInfo)
                                        info.reason = val
                                        this.setState({currentInfo:info})
                                    }}
                                />
                            </div>
                            <div style={{textAlign:'center',marginTop:'20px'}}>
                                <Button onClick={this.closeDialog.bind(this)}>取消</Button>
                                <Button onClick={this.supply.bind(this)} type="primary" style={this.state.currentInfo.canSupply ? {} : {display:'none'}}>补认领</Button>
                                <Button onClick={this.complain.bind(this)} type="primary" style={this.state.currentInfo.canComplain ? {} : {display:'none'}}>申诉</Button>
                            </div>
                        </Loading>
                    </Dialog.Body>
                </Dialog>
            </div>
        )
    }
}

export default withRouter(Faqiburenlingshensu)