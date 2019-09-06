import React, {Component, Fragment} from 'react';
import {withRouter} from "react-router-dom";
import {Layout, Button, Select, Input, DatePicker, Loading, MessageBox} from 'element-react'
import _ from 'lodash'
import Http from '../../../utils/http'
import Validate from '../../../utils/validate'
import store from "../../../store";

import './yewuyuyueshenqing.scss'

class Yewuyuyueshenqing extends Component {
    constructor() {
        super()
        this.state = {
            loadingShow: true,
            selectList:[],
            userOption:{
                typeId: "",
                customerName:"",
                certId:"",
                appointDate:null,
                money:"",
                operator:"" // 员工号
            },
            operatorName:""
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

    getOperatorName(e) {
        let val = e.target.value
        let params = {staffId:val}
        Http.post('/user/userDetail',params)
            .then(res=>{
                console.log(res)
                if(res.resultCode === "success"){
                    if(res.data != null){
                        let name = res.data.userName
                        if(name != null){
                            this.setState({operatorName:name})
                        }else{
                            this.setState({operatorName:""})
                        }
                    }else{
                        this.setState({operatorName:""})
                    }
                }else{
                    this.setState({operatorName:""})
                }
            })
            .catch(err=>{
                console.log(err)
            })
    }

    confirm(){
        let userName = localStorage.getItem('userName')
        let params = _.assign({staffId:userName},this.state.userOption)
        // 验证
        if(params.typeId !== ''){
            if(Validate.validateNotEmpty(params.customerName)){
                if(Validate.validateIdCard(params.certId)){
                    if(params.appointDate != null){
                        if(params.typeId === '01' || params.typeId === '12'){
                            if(Validate.validateCash(params.money)){
                                this.checkOperator(params)
                            }else{
                                MessageBox.msgbox({
                                    title:'提示',
                                    message:'请填写正确的金额格式',
                                    type:'error'
                                })
                            }
                        }else{
                            params.money = ""
                            this.checkOperator(params)
                        }
                    }else{
                        MessageBox.msgbox({
                            title:'提示',
                            message:'日期不能为空',
                            type:'error'
                        })
                    }
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
                    message:'请填写客户名称',
                    type:'error'
                })
            }
        }else{
            MessageBox.msgbox({
                title:'提示',
                message:'请选择预约类型',
                type:'error'
            })
        }

    }

    checkOperator(params){
        if(params.typeId === '08' || params.typeId === '10'){
            if(params.operator === ""){
                MessageBox.confirm('确定不设置操作人员？!', '提示', {
                    type: 'warning'
                }).then(() => {
                    this.request(params)
                }).catch(() => {
                    console.log('用户点击取消')
                })
            }else{
                this.setState({loadingShow:true})
                let operate = {staffId: params.operator}
                Http.post('/user/userDetail',operate)
                    .then(res=>{
                        console.log(res)
                        if(res.resultCode === "success"){
                            if(res.data != null){
                                let name = res.data.userName
                                if(name != null){
                                    this.setState(
                                        {operatorName:name},
                                        ()=>{
                                            this.request(params)
                                        }
                                    )
                                }else{
                                    this.setState({operatorName:"",loadingShow:false})
                                    MessageBox.msgbox({
                                        title:'提示',
                                        message:'请填写正确的操作人员工号',
                                        type:'error'
                                    })
                                }
                            }else{
                                this.setState({operatorName:"",loadingShow:false})
                                MessageBox.msgbox({
                                    title:'提示',
                                    message:'请填写正确的操作人员工号',
                                    type:'error'
                                })
                            }
                        }else{
                            this.setState({operatorName:"",loadingShow:false})
                            MessageBox.msgbox({
                                title:'提示',
                                message:'请填写正确的操作人员工号',
                                type:'error'
                            })
                        }
                    })
                    .catch(err=>{
                        console.log(err)
                        this.setState({loadingShow:false})
                    })
            }
        }else{
            params.operator = ""
            this.request(params)
        }
    }

    request(params){
        this.setState({loadingShow:true})
        Http.post('/appoint/apply',params)
            .then(
                res=>{
                    console.log(res)
                    if(res.resultCode === 'success'){
                        this.setState({
                            loadingShow:false,
                            userOption:{
                                typeId: "",
                                customerName:"",
                                certId:"",
                                appointDate:null,
                                money:"",
                                operator:""
                            },
                            operatorName:""
                        })
                        MessageBox.msgbox({
                            title:'提示',
                            message:'预约成功',
                            type:'success'
                        }).then(()=>{
                            // 跳转预约进度查询
                            store.dispatch({type: 'change_Current_flag', value: '5-1-2'})
                        })
                    }else{
                        console.log('提交失败')
                        this.setState({loadingShow:false})
                        MessageBox.msgbox({
                            title:'提示',
                            message: res.resultMsg,
                            type:'error'
                        })
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

    render() {
        return (
            <div className="content-box">
                <Loading loading={this.state.loadingShow} text='加载中...'>
                    <Layout.Row className='content-item'>
                        <Layout.Col style={{textAlign:'right',fontSize:'16px',letterSpacing:'2px'}} span={4}>预约类型：</Layout.Col>
                        <Layout.Col span={16} offset={2}>
                            <Select onChange={this.updateUserOption.bind(this,'typeId')} style={{width:'100%'}} placeholder='请选择预约类型' value={this.state.userOption.typeId}>
                                {
                                    this.state.selectList.map(el =>
                                        <Select.Option key={el.code} label={el.name} value={el.code}/>
                                    )
                                }
                            </Select>
                        </Layout.Col>
                    </Layout.Row>
                    <Layout.Row className='content-item' style={this.state.userOption.typeId === "08" || this.state.userOption.typeId === "10" ? {} : {display:'none'}}>
                        <Layout.Col style={{textAlign:'right',fontSize:'16px',letterSpacing:'2px'}} span={4}>操作员工号：</Layout.Col>
                        <Layout.Col span={16} offset={2}>
                            <Input placeholder='请输入操作员工号' value={this.state.userOption.operator} onChange={this.updateUserOption.bind(this,'operator')} onBlur={this.getOperatorName.bind(this)}/>
                        </Layout.Col>
                    </Layout.Row>
                    <Layout.Row className='content-item' style={this.state.userOption.typeId === "08" || this.state.userOption.typeId === "10" ? {} : {display:'none'}}>
                        <Layout.Col style={{textAlign:'right',fontSize:'16px',letterSpacing:'2px'}} span={4}>操作员姓名：</Layout.Col>
                        <Layout.Col span={16} offset={2}>
                            <Input disabled={true} value={this.state.operatorName}/>
                        </Layout.Col>
                    </Layout.Row>
                    <Layout.Row className='content-item'>
                        <Layout.Col style={{textAlign:'right',fontSize:'16px',letterSpacing:'2px'}} span={4}>客户名称：</Layout.Col>
                        <Layout.Col span={16} offset={2}>
                            <Input style={{width:'100%'}} onChange={this.updateUserOption.bind(this,'customerName')} value={this.state.userOption.customerName} placeholder='请输入客户名称'/>
                        </Layout.Col>
                    </Layout.Row>
                    <Layout.Row className='content-item'>
                        <Layout.Col style={{textAlign:'right',fontSize:'16px',letterSpacing:'2px'}} span={4}>主证件号码：</Layout.Col>
                        <Layout.Col span={16} offset={2}>
                            <Input style={{width:'100%'}} onChange={this.updateUserOption.bind(this,'certId')} value={this.state.userOption.certId} placeholder='请输入身份证号码'/>
                        </Layout.Col>
                    </Layout.Row>
                    <Layout.Row className='content-item'>
                        <Layout.Col style={{textAlign:'right',fontSize:'16px',letterSpacing:'2px'}} span={4}>预计发生日期：</Layout.Col>
                        <Layout.Col span={16} offset={2}>
                            <DatePicker
                                value={this.state.userOption.appointDate != null ? new Date(this.state.userOption.appointDate) : null}
                                placeholder="选择日期"
                                onChange={date=>{
                                    let obj = _.assign({},this.state.userOption)
                                    if(date){
                                        let val = date.getTime()
                                        obj.appointDate = val
                                        this.setState({userOption:obj})
                                    }else{
                                        obj.appointDate = null
                                        this.setState({userOption:obj})
                                    }
                                }}
                                disabledDate={time=>time.getTime() < Date.now()}
                            />
                        </Layout.Col>
                    </Layout.Row>
                    <Layout.Row className='content-item' style={this.state.userOption.typeId === '01' || this.state.userOption.typeId === '12' ? {} : {display:'none'}}>
                        <Layout.Col style={{textAlign:'right',fontSize:'16px',letterSpacing:'2px'}} span={4}>金额：</Layout.Col>
                        <Layout.Col span={16} offset={2}>
                            <Input style={{width:'100%'}} onChange={this.updateUserOption.bind(this,'money')} value={this.state.userOption.money} placeholder='请输入金额'/>
                        </Layout.Col>
                    </Layout.Row>
                    <div style={{textAlign:'center',marginTop:'40px'}}>
                        <Button onClick={this.confirm.bind(this)} type='primary' className='btn-confirm' size='large'>提交</Button>
                    </div>
                </Loading>
            </div>
        )
    }
}

export default withRouter(Yewuyuyueshenqing)