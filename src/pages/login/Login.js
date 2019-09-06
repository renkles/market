import React, {Component} from 'react'
import {withRouter} from "react-router-dom";
import {Checkbox,Button,Input,Loading,MessageBox,Message} from 'element-react'
import store from '../../store'
import _ from 'lodash'
import Http from '../../utils/http'
import Md5 from '../../utils/md5'
import logo from '../../images/logo.png'
import './login.scss'
import '../../iconfont/iconfont.css'

import loginImg1 from "../../images/login-img.png"
import loginImg2 from "../../images/login-bg-2.jpg"
import loginImg3 from "../../images/login-bg-3.jpg"

class Login extends Component{
    constructor(){
        super()
        this.state = {
            userName:'',
            password:'',
            isChecked: true,
            loadingShow:false,
            canLogin:true
        }
    }

    componentWillUnmount() {
        this.setState = (state, callback) => {
            return
        }
    }

    componentDidMount(){
        let check = localStorage.getItem('isChecked')
        if(check === '0' || check == null){
            this.setState({userName:"",password:"",isChecked:false})
        }else{
            let userName = localStorage.getItem('userName')
            let password = localStorage.getItem('password')
            this.setState({userName:userName,password:password,isChecked:true})
        }
        window.onkeydown=(e) =>{
            if(e.keyCode === 13){
                this.login()
            }
        }
    }

    updateInfo(type,val){
        switch (type) {
            case 'userName':
                this.setState({userName:val})
                break;
            case 'password':
                this.setState({password:val})
                break;
            default:
                return
        }
    }

    setStatus(val){
        this.setState({isChecked:val})
    }

    login(){
        if(this.state.canLogin){
            this.setState(
                {canLogin:false},
                ()=>{
                    if(this.state.password === "" || this.state.userName === ""){
                        MessageBox.confirm('账号或者密码不能为空!', '提示', {
                            type: 'warning'
                        }).then(() => {
                            this.setState({canLogin:true})
                        }).catch(() => {
                            this.setState({canLogin:true})
                        })
                    }else{
                        this.setState({loadingShow:true})
                        let str = Md5(this.state.password)
                        let params = {
                            grant_type: 'password',
                            username: this.state.userName,
                            password: str,
                            scope: 'all'
                        }
                        Http.post('/oauth/token',params)
                            .then(
                                (res)=>{
                                    console.log(res)
                                    if(res.resultCode !== 400){
                                        let authorization = `${res.token_type} ${res.access_token}`
                                        localStorage.setItem('authorization',authorization)
                                        localStorage.setItem('userName',this.state.userName)
                                        localStorage.setItem('password',this.state.password)
                                        if(this.state.isChecked){
                                            localStorage.setItem('isChecked','1')
                                        }else{
                                            localStorage.setItem('isChecked','0')
                                        }
                                        this.getUserInfo(this.state.userName)
                                    }else{
                                        this.setState({loadingShow:false})
                                        localStorage.setItem('isChecked','0')
                                        localStorage.removeItem('userName')
                                        localStorage.removeItem('password')
                                        MessageBox.confirm('请检查用户名和密码是否输入正确!', '登录失败', {
                                            type: 'error',
                                            showCancelButton:false
                                        }).then(() => {
                                            this.setState({canLogin:true})
                                        }).catch(() => {
                                            this.setState({canLogin:true})
                                        })
                                    }
                                }
                            )
                            .catch(
                                (err)=>{
                                    this.setState({loadingShow:false,canLogin:true})
                                    console.log(err)
                                }
                            )
                    }
                }
            )
        }
    }

    getUserInfo(id) {
        let params = {staffId:id}
        Promise.all([Http.post('/user/userDetail', params),Http.post('/user/right')]).then(result=>{
            this.setState({loadingShow:false})
            let res1 = result[0]
            let res2 = result[1]
            console.log(res1)
            console.log(res2)
            if(res1.resultCode === 'success' && res2.resultCode === 'success'){
                let menuList = []
                let list = res2.data.resourceList
                console.log(list)
                _.forEach(list,(obj1)=>{
                    menuList.push(obj1.name)
                    if(obj1.children != null && obj1.children.length > 0){
                        _.forEach(obj1.children,(obj2)=>{
                            menuList.push(obj2.name)
                            if(obj2.children != null && obj2.children.length > 0){
                                _.forEach(obj2.children,(obj3)=>{
                                    menuList.push(obj3.name)
                                })
                            }
                        })
                    }
                })
                let menuStr = JSON.stringify(menuList)
                console.log(menuStr)
                localStorage.setItem('menu',menuStr) // 导航权限
                localStorage.setItem('nickName',res1.data.userName)
                localStorage.setItem('userId',res1.data.id)
                this.getHomepageType(res1.data)
                this.getProductPageType(res1.data)
                this.getTaskType(res1.data)
                window.onkeydown = null
                this.props.history.push('/index')
            }else{
                MessageBox.confirm('获取用户资料失败!', '登录失败', {
                    type: 'error'
                }).then(() => {
                    this.setState({canLogin:true})
                }).catch(() => {
                    this.setState({canLogin:true})
                })
            }
        }).catch(
            err=> {
                this.setState({loadingShow:false,canLogin:true})
                console.log(err)
            }
        )
    }

    // 获取主页内容显示类型
    getHomepageType(info) {
        let type
        if(info.departmentName === "总行高管" || info.departmentName === '零售业务部'){
            type = 1
        }else if(info.jobName === "支行行长"){
            type = 2
        }else if(info.jobName === "支行副行长"){
            type = 3
        }else if(info.jobName === "客户经理"){
            type = 4
        }else{
            type = 5
        }
        localStorage.setItem('homepageType',type)
    }

    // 获取产品展示页显示类型
    getProductPageType(info) {
        let type
        if(info.departmentName === "总行高管" || info.departmentName === "零售业务部"){
            type = 1
        }else if(info.jobName === "支行行长"){
            type = 2
        }else{
            type = 3
        }
        localStorage.setItem('productPageType',type)
    }

    // 获取发布营销任务的类型
    getTaskType(info) {
        let type
        if(info.departmentName === '零售业务部'){
            type = 1
        }else if(info.departmentName === "总行高管"){
            type = 2
        }else if(info.jobName === "支行行长"){
            type = 3
        }else{
            type = 4
        }
        localStorage.setItem('taskType',type)
    }

    render(){
        return(
            <Loading loading={this.state.loadingShow} text='正在登录'>
                <div className='login-container'>
                    {/*当前展示的图片*/}
                    <div className="current-login-bgimg" style={{backgroundImage:`url(${loginImg1})`}}></div>
                    {/*<div className="bg-show-block">*/}

                    {/*</div>*/}

                    <div className='login-box show'>
                        <div className="login-box-left">
                            <img className="login-logo" src={logo}/>
                            <p className="logo-desc">Marketing Intergration</p>
                        </div>
                        <div className="login-box-right">
                            <p className="login-title">
                                <img src={logo} alt="" className='title-logo'/>
                                营销一体化平台
                            </p>
                            <div className="login-form">
                                <p className="form-title">欢迎回来!</p>
                                <div className="form-cube">
                                    <span className="form-label">
                                        <i className="iconfont icon-yonghu"></i>
                                        用户名
                                    </span>
                                    <div>
                                        <Input onChange={this.updateInfo.bind(this,'userName')} type='text' className='input-control' placeholder='请输入您的用户名' value={this.state.userName}/>
                                    </div>
                                </div>
                                <div className="form-cube">
                                    <span className="form-label">
                                        <i className="iconfont icon-mima"></i>
                                        密码
                                    </span>
                                    <div>
                                        <Input onChange={this.updateInfo.bind(this,'password')} type='password' className='input-control' placeholder='请输入您的密码' value={this.state.password}/>
                                    </div>
                                </div>
                                <div className="form-cube">
                                    <div className="check-list">
                                        <Checkbox checked={this.state.isChecked} onChange={this.setStatus.bind(this)} style={{color: '#999999'}}>记住密码</Checkbox>
                                        {/*<br/>*/}
                                        {/*<Checkbox style={{color: '#999999'}}>自动登录</Checkbox>*/}
                                    </div>
                                    <Button onClick={this.login.bind(this)} type='primary' style={{margin:'12px 0',backgroundColor:'#1C7AFF',width:'120px',fontSize:'16px',float:'right'}}>
                                        登录
                                        <i className="iconfont icon-jiantou" style={{marginLeft:'10px',fontSize:'16px'}}></i>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Loading>

        )
    }
}
export default withRouter(Login)