import React, {Component, Fragment} from 'react'
import {withRouter} from "react-router-dom";
import LeftNav from '../../components/leftNav/LeftNav'
import {Input, Dropdown} from 'element-react'
import store from '../../store'
import routeMap from '../../routermap'
import _ from 'lodash'
import './main.scss'
import '../../iconfont/iconfont.css'

import test from '../../images/test.jpg'

class HomePage extends Component {
    constructor() {
        super()
        this.state = {
            nickName:'',
            navBlockShow: true,
            currentName:"",
        }
        store.subscribe(this.updateName.bind(this))
    }

    componentDidMount() {
        let nickName = localStorage.getItem('nickName')
        let key = localStorage.getItem('userName')
        this.setState({nickName: nickName,staffId:key})
    }

    componentWillUnmount() {
        this.setState = (state, callback) => {
            return
        }
    }

    toggleNav() {
        this.setState({navBlockShow: !this.state.navBlockShow})
    } // 切换导航栏显示状态

    updateName() {
        let flag = store.getState().currentFlag
        // console.log(flag)
        let currentName = _.find(routeMap,(obj)=>{return obj.flag === flag}).name
        this.setState({currentName:currentName})
    } // 更新面包屑导航

    handleCommand(desc){
        switch (desc) {
            case 'loginOut':
                localStorage.removeItem('authorization')
                localStorage.removeItem('menu')
                localStorage.removeItem('type')
                this.props.history.push('/login')
                break;
            case 'setAuthority':
                store.dispatch({type: 'change_Current_flag', value: '0-0-1'})
                break;
            default:
                return;
        }
    } // 用户信息下拉对应功能

    render() {
        return (
            <Fragment>
                <div className='left-nav-container' style={this.state.navBlockShow ? null : {transform: 'translateX(-100%)'}}>
                    <LeftNav/>
                </div>
                <div className='main-content-container' style={this.state.navBlockShow ? null : {left: 0}}>
                    {/*顶部信息栏*/}
                    <div className="top-container">
                        <div className="top-container-first">
                            {/*折叠*/}
                            <i style={this.state.navBlockShow ? {
                                fontWeight: 'bold',
                                fontSize: '24px'
                            } : {display: 'none'}}
                               className='iconfont icon-guanbidaohang icon-toggle-btn'
                               onClick={this.toggleNav.bind(this)}></i>
                            <i style={this.state.navBlockShow ? {display: 'none'} : {
                                fontWeight: 'bold',
                                fontSize: '24px'
                            }}
                               className='iconfont icon-zhankaidaohang icon-toggle-btn'
                               onClick={this.toggleNav.bind(this)}></i>
                            {/*icon按钮*/}
                            <ul className="icon-btn-list">
                                <li className="icon-btn">
                                    <i className="iconfont icon-youjian"></i>
                                    <i className="badge" style={{backgroundColor: '#9C78CC'}}>16</i>
                                </li>
                                <li className="icon-btn">
                                    <i className="iconfont icon-feijicopy"></i>
                                    <i className="badge" style={{backgroundColor: '#54D092'}}>9</i>
                                </li>
                                <li className="icon-btn">
                                    <i className="iconfont icon-trumpet"></i>
                                    <i className="badge" style={{backgroundColor: '#FF0080'}}>2</i>
                                </li>
                            </ul>
                            <div style={{float: 'right'}}>
                                {/*搜索条*/}
                                <div className='search-bar-cube'>
                                    <Input type="text" style={{width: '240px'}} className='search-bar' placeholder='搜索..'/>
                                    <i className='iconfont icon-sousuo search-btn' style={{fontSize: '18px'}}></i>
                                </div>
                                {/*用户菜单*/}
                                <Dropdown trigger="click" onCommand={this.handleCommand.bind(this)} menu={(
                                    <Dropdown.Menu style={{width: '200px', fontSize: '16px'}}>
                                        <Dropdown.Item><span className='menu-info-badge' style={{backgroundColor: "#9C78CC"}}>60%</span>个人基本信息</Dropdown.Item>
                                        <Dropdown.Item command='setAuthority' disabled={this.state.staffId !== 'admin'}><i className="iconfont icon-guanli menu-icon-style" style={{color: "#FEA409"}}></i>权限管理</Dropdown.Item>
                                        <Dropdown.Item><i className="iconfont icon-shexiangtou menu-icon-style" style={{color: "#2D60FF"}}></i>在线用户监控</Dropdown.Item>
                                        <Dropdown.Item><span className='menu-info-badge' style={{backgroundColor: "#FF0080"}}>40%</span>设置</Dropdown.Item>
                                        <Dropdown.Item command='loginOut'><i className="iconfont icon-tuichu menu-icon-style"></i>退出</Dropdown.Item>
                                    </Dropdown.Menu>
                                )}>
                                    <div className="user-menu">
                                        <img src={test} alt="" className='user-menu-head'/>
                                        <span className='user-menu-name'>
                                            {this.state.nickName}
                                            <i className='el-icon-caret-bottom' style={{fontSize: '12px', margin: '0 10px'}}></i>
                                        </span>
                                    </div>
                                </Dropdown>
                            </div>
                        </div>
                        <div className="top-container-second">
                            <p className='bread-title'>欢迎来到南通农商行营销一体化</p>
                            <ul className="bread-list">
                                {
                                    this.state.currentName.split('-').map((el,index)=>
                                        <Fragment key={index}>
                                            <li style={index>0?{}:{display:'none'}} className="bread-sign">>></li>
                                            <li className="bread-item">{el}</li>
                                        </Fragment>
                                    )
                                }
                            </ul>
                        </div>
                    </div>
                    {/*内容容器*/}
                    <div className="content-container">
                        {this.props.children}
                    </div>
                </div>
            </Fragment>
        )
    }
}

export default withRouter(HomePage)