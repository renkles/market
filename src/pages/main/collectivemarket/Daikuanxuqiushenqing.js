import React, {Component} from 'react';
import {withRouter} from "react-router-dom";
import {Button, Loading, DateRangePicker, Form, Input, Select, Layout, MessageBox,Cascader} from 'element-react'
import Http from '../../../utils/http'
import _ from 'lodash'

import './daikuanxuqiushenqing.scss'
import '../../../iconfont/iconfont.css'
import store from "../../../store";
import Validate from "../../../utils/validate";

class Daikuanxuqiushenqing extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selectBankList:[],
            parentAreaOptions: [],
            areaOptions: [],
            areaIdList:[],
            loadingShow:true,
            userOption:{
                addr: "",
                certId: "",
                custName: "",
                deptName: "",
                mobile: "",
                money: "",
                purpose: "",
            },
        };
    }

    componentWillUnmount() {
        this.setState = (state, callback) => {
            return
        }
    }

    componentDidMount() {
        this.getList();
        this.getAreaList()
    }

    getAreaList(id=0) {
        let params = {id: id}
        Http.post('/loan/area/list',params)
            .then(
                res=>{
                    console.log(res)
                    if(res.resultCode === 'success'){
                        if(id === 0){
                            this.setState({parentAreaOptions:res.data.areas, loadingShow:false})
                        }else{
                            this.setState({areaOptions:res.data.areas})
                        }
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

    getList(){
        Http.post('/loan/bank/list')
            .then(
                res=>{
                    console.log(res)
                    if(res.resultCode === 'success'){
                        this.setState({selectBankList:res.data.bankList,loadingShow:false})
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

    changeArea(index,val){
        let list = [...this.state.areaIdList]
        list.splice(index + 1)
        list[index] = val
        this.setState(
            {areaIdList: list},
            ()=> {
                console.log(list)
                if(index === 0){
                    this.getAreaList(val)
                }
            }
        )
    }

    confirm(){
        let userName = localStorage.getItem('userName')
        let params = _.assign({staffId:userName},this.state.userOption)
        console.log(params)
        // 验证
        if(Validate.validateIdCard(params.certId)) {
            if (Validate.validateNotEmpty(params.custName)) {
                if (Validate.validatePhone(params.mobile)) {
                    if (Validate.validateNotEmpty(params.addr)) {
                        if (Validate.validateCash(params.money)) {
                            if (Validate.validateNotEmpty(params.purpose)) {
                                if (params.deptName!=='') {
                                    this.request(params)
                                }else {
                                    MessageBox.msgbox({
                                        title:'提示',
                                        message:'请选择受理支行',
                                        type:'error'
                                    })
                                }
                            }else {
                                MessageBox.msgbox({
                                    title:'提示',
                                    message:'请填写用途',
                                    type:'error'
                                })
                            }
                        }else {
                            MessageBox.msgbox({
                                title:'提示',
                                message:'请填写正确的金额格式',
                                type:'error'
                            })
                        }
                    }else {
                        MessageBox.msgbox({
                            title:'提示',
                            message:'请填写详细地址',
                            type:'error'
                        })
                    }
                }else {
                    MessageBox.msgbox({
                        title:'提示',
                        message:'请填写正确的手机号',
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
        }else {
            MessageBox.msgbox({
                title:'提示',
                message:'请填写正确的身份证号码',
                type:'error'
            })
        }
    }

    request(params){
        console.log(this.state.areaIdList)
        this.setState({loadingShow:true})
        let str = ""
        let len = this.state.areaIdList.length
        if(len === 1){
            str += _.find(this.state.parentAreaOptions,(obj)=>{return obj.id === this.state.areaIdList[0]}).name
        }else if(len === 2){
            str += _.find(this.state.parentAreaOptions,(obj)=>{return obj.id === this.state.areaIdList[0]}).name
            str += _.find(this.state.areaOptions,(obj)=>{return obj.id === this.state.areaIdList[1]}).name
        }
        console.log(str)
        if(str !== ""){params.addr = `${str}${params.addr}`}

        Http.post('/loan/apply',params)
            .then(
                res=>{
                    console.log(res)
                    if(res.resultCode === 'success'){
                        this.setState({
                            loadingShow:false,
                            areaIdList:[],
                            userOption:{
                                addr: "",
                                certId: "",
                                custName: "",
                                deptName: "",
                                mobile: "",
                                money: "",
                                purpose: "",
                            }
                        })
                        MessageBox.confirm('恭喜提交成功,现在前往查看!', '提示', {
                            type: 'success'
                        }).then(() => {
                            store.dispatch({type: 'change_Current_flag', value: '5-5-2'})
                        }).catch(() => {
                            console.log('取消')
                        })
                    }else{
                        console.log('提交失败')
                        this.setState({loadingShow:false})
                        MessageBox.msgbox({
                            title:'提示',
                            message:res.resultMsg,
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
                        <Layout.Col style={{textAlign:'right',fontSize:'16px',letterSpacing:'2px'}} span={2}>证件号</Layout.Col>
                        <Layout.Col span={10} offset={2}>
                            <Input style={{width:'100%'}} onChange={this.updateUserOption.bind(this,'certId')} value={this.state.userOption.certId} placeholder="请输入身份证号码"/>
                        </Layout.Col>
                    </Layout.Row>
                    <Layout.Row className='content-item'>
                        <Layout.Col style={{textAlign:'right',fontSize:'16px',letterSpacing:'2px'}} span={2}>客户名称</Layout.Col>
                        <Layout.Col span={10} offset={2}>
                            <Input style={{width:'100%'}} onChange={this.updateUserOption.bind(this,'custName')} value={this.state.userOption.custName} placeholder="请输入客户名称"/>
                        </Layout.Col>
                    </Layout.Row>
                    <Layout.Row className='content-item'>
                        <Layout.Col style={{textAlign:'right',fontSize:'16px',letterSpacing:'2px'}} span={2}>手机号</Layout.Col>
                        <Layout.Col span={10} offset={2}>
                            <Input style={{width:'100%'}} onChange={this.updateUserOption.bind(this,'mobile')} value={this.state.userOption.mobile} placeholder="请输入手机号"/>
                        </Layout.Col>
                    </Layout.Row>
                    <Layout.Row className='content-item'>
                        <Layout.Col style={{textAlign:'right',fontSize:'16px',letterSpacing:'2px'}} span={2}>联系地址</Layout.Col>
                        <Layout.Col span={10} offset={2}>
                            <Select style={{width:'180px'}} value={this.state.areaIdList[0]} onChange={this.changeArea.bind(this,0)} placeholder='选择区县'>
                                {
                                    this.state.parentAreaOptions.map((el,index)=>
                                        <Select.Option key={index} label={el.name} value={el.id}/>
                                    )
                                }
                            </Select>
                            <Select style={this.state.areaOptions != null && this.state.areaOptions.length > 0 ? {width:'180px',marginLeft:'20px'} : {display:'none'}} value={this.state.areaIdList[1]} onChange={this.changeArea.bind(this,1)} placeholder='选择村镇'>
                                {
                                    this.state.areaOptions.map((el,index)=>
                                        <Select.Option key={index} label={el.name} value={el.id}/>
                                    )
                                }
                            </Select>
                            <Input style={{width:'100%',marginTop:'14px'}} placeholder='详细地址' onChange={this.updateUserOption.bind(this,'addr')} value={this.state.userOption.addr}/>
                        </Layout.Col>
                    </Layout.Row>
                    <Layout.Row className='content-item'>
                        <Layout.Col style={{textAlign:'right',fontSize:'16px',letterSpacing:'2px'}} span={2}>额度</Layout.Col>
                        <Layout.Col span={10} offset={2}>
                            <Input style={{width:'100%'}} append="万元" onChange={this.updateUserOption.bind(this,'money')} value={this.state.userOption.money} placeholder="请输入额度"/>
                        </Layout.Col>
                    </Layout.Row>
                    <Layout.Row className='content-item'>
                        <Layout.Col style={{textAlign:'right',fontSize:'16px',letterSpacing:'2px'}} span={2}>用途</Layout.Col>
                        <Layout.Col span={10} offset={2}>
                            <Input style={{width:'100%'}} onChange={this.updateUserOption.bind(this,'purpose')} value={this.state.userOption.purpose} placeholder="请输入用途"/>
                        </Layout.Col>
                    </Layout.Row>
                    <Layout.Row className='content-item'>
                        <Layout.Col style={{textAlign:'right',fontSize:'16px',letterSpacing:'2px'}} span={2}>受理支行</Layout.Col>
                        <Layout.Col span={10} offset={2}>
                            <Select style={{width:'100%'}} placeholder='请选择' onChange={this.updateUserOption.bind(this,'deptName')} value={this.state.userOption.deptName}>
                                {
                                    this.state.selectBankList.map((el,index) =>
                                        <Select.Option key={index} label={el} value={el}/>
                                    )
                                }
                            </Select>
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

export default withRouter(Daikuanxuqiushenqing)