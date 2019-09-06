import React from 'react'
import {withRouter} from "react-router-dom"
import {Menu} from 'element-react'
import routeMap from '../../routermap'
import store from '../../store'
import _ from 'lodash'

import logo from '../../images/logo.png'

class LeftNav extends React.Component {
    constructor() {
        super()
        this.state = {
            openSubMenu:[1],
            menuList:[],
            staffId:"",
            flag: store.getState().currentFlag
        }
        store.subscribe(this.changeUrl.bind(this))
    }

    componentWillUnmount() {
        this.setState = (state, callback) => {
            return
        }
    }

    componentWillMount() {
        // 过滤路径(默认路径：1-1-1)
        let basePath = window.location.pathname.match(/^\/\w+/) != null ? window.location.pathname.match(/^\/\w+/)[0] : null
        let flag = _.find(routeMap, obj => {
            return obj.url === basePath
        }) != null ? _.find(routeMap, obj => {
            return obj.url === basePath
        }).flag : '1-1-1'
        store.dispatch({type: 'change_Current_flag', value: flag})
    }

    componentDidMount() {
        let key = localStorage.getItem('userName')
        let str = localStorage.getItem('menu')
        let menuList = JSON.parse(str)
        // console.log(menuList)
        this.setState({menuList:menuList,staffId:key})
    }

    select(item) {
        // 同一父路由下禁止切换路由
        let basePath = window.location.pathname.match(/^\/\w+/) != null ? window.location.pathname.match(/^\/\w+/)[0] : null
        let oldFlag = _.find(routeMap, obj => {
            return obj.url === basePath
        }) != undefined ? _.find(routeMap, obj => {
            return obj.url === basePath
        }).flag : null
        if (oldFlag != item) {
            store.dispatch({type: 'change_Current_flag', value: item}) // 路由跳转
        }
    }

    changeUrl() {
        // 响应url组件
        let newFlag = store.getState().currentFlag
        this.setState({flag: newFlag})
        let obj = _.find(routeMap, obj => {
            return obj.flag === newFlag
        })
        let path = obj != null ? obj.url : null
        let currentSubMenu = obj != null ? obj.flag.split('-')[0] : null

        path && this.props.history.push(path)
        if(currentSubMenu != null){
            let arr = []
            arr.push(currentSubMenu.toString())
            this.setState({openSubMenu:arr})
        }
    }

    render() {
        return (
            <div style={{userSelect: 'none', position: 'relative', height: '100%', backgroundColor: '#191919'}}>
                {/*logo*/}
                <div style={{width: '100%', height: '70px', backgroundColor: '#32323A'}}>
                    <img src={logo} alt="" style={{width: '52px', height: '40px', margin: '15px 20px'}}/>
                    <span style={{fontSize: '18px', color: '#BFCBD9', lineHeight: '70px',textShadow:'4px 6px 7px #767167, 0px -2px 1px #484855',textTransform:'uppercase',fontWeight:'bold',letterSpacing:'2px'}}>营销一体化</span>
                </div>
                {/*主体导航*/}
                <div style={{
                    position: 'absolute',
                    top: '70px',
                    left: '0',
                    bottom: '0',
                    right: '0',
                    background: '#191919'
                }}>
                    <Menu
                        defaultOpeneds={this.state.openSubMenu}
                        defaultActive={this.state.flag}
                        uniqueOpened={true}
                        theme="dark"
                        onSelect={this.select.bind(this)}
                    >
                        <Menu.Item index="1-1-1"><i className='iconfont icon-zhuye' style={{marginRight:'5px',transform:'translateY(-2px)'}}></i>主页</Menu.Item>
                        <Menu.SubMenu index="2" title={<span><i className='iconfont icon-gongzuotai' style={{marginRight:'5px',transform:'translateY(-2px)'}}></i>工作台</span>}>
                            <Menu.ItemGroup style={this.state.staffId === "admin" ?{display:'none'} : {}} title="任务">
                                <Menu.Item index="2-1-1">发布填报任务</Menu.Item>
                                <Menu.Item index="2-1-2">发布营销任务</Menu.Item>
                                <Menu.Item index="2-1-3">我发布过的</Menu.Item>
                                <Menu.Item index="2-1-4">我完成过的</Menu.Item>
                                <Menu.Item index="2-1-5">我审批过的</Menu.Item>
                                <Menu.Item index="2-1-6">待办/审批</Menu.Item>
                            </Menu.ItemGroup>
                            <Menu.ItemGroup title="资讯">
                                <Menu.Item index="2-2-1">资讯管理</Menu.Item>
                                <Menu.Item index="2-2-2">资讯预览</Menu.Item>
                            </Menu.ItemGroup>
                            <Menu.ItemGroup title="其他">
                                <Menu.Item index="2-3-1">工具</Menu.Item>
                                <Menu.Item index="2-3-2">常用功能</Menu.Item>
                            </Menu.ItemGroup>
                        </Menu.SubMenu>
                        <Menu.SubMenu index="3" title={<span><i className="iconfont icon-chanpin" style={{marginRight:'5px',transform:'translateY(-2px)'}}></i>产品</span>}>
                            <Menu.Item style={this.state.staffId === "admin" ?{} : (_.indexOf(this.state.menuList,"产品管理") === -1 ? {display:'none'}: {})} index="3-1-1">产品管理</Menu.Item>
                            <Menu.Item index="3-1-2">产品预览</Menu.Item>
                        </Menu.SubMenu>
                        <Menu.SubMenu index="4" title={<span><i className="iconfont icon-kehu" style={{marginRight:'5px',transform:'translateY(-2px)'}}></i>客户</span>}>
                            <Menu.Item index="4-1-1">我的客户</Menu.Item>
                        </Menu.SubMenu>
                        <Menu.SubMenu index="5" title={<span><i className="iconfont icon-quanyuanyingxiao" style={{marginRight:'5px',transform:'translateY(-2px)'}}></i>全员营销</span>}>
                            <Menu.ItemGroup title="业务预约">
                                <Menu.Item index="5-1-1">业务预约申请</Menu.Item>
                                <Menu.Item index="5-1-2">预约进度查询</Menu.Item>
                            </Menu.ItemGroup>
                            <Menu.ItemGroup title="补认领/申诉">
                                <Menu.Item index="5-2-1">发起补认领/申诉</Menu.Item>
                                <Menu.Item index="5-2-2">补认领进度查询</Menu.Item>
                                <Menu.Item index="5-2-3">申诉进度查询</Menu.Item>
                            </Menu.ItemGroup>
                            <Menu.ItemGroup title="营销统计">
                                <Menu.Item index="5-3-1">我的营销奖励</Menu.Item>
                                <Menu.Item style={this.state.staffId === "admin" ?{} : (_.indexOf(this.state.menuList,"本行员工营销奖励") === -1 ? {display:'none'}: {})} index="5-3-2">本行员工营销奖励</Menu.Item>
                                <Menu.Item index="5-3-3">全行员工营销Top20</Menu.Item>
                                <Menu.Item style={this.state.staffId === "admin" ?{} : (_.indexOf(this.state.menuList,"全行员工营销奖励") === -1 ? {display:'none'}: {})} index="5-3-4">全行员工营销奖励</Menu.Item>
                                <Menu.Item style={this.state.staffId === "admin" ?{} : (_.indexOf(this.state.menuList,"全员营销汇总报表") === -1 ? {display:'none'}: {})} index="5-3-5">全员营销汇总报表</Menu.Item>
                            </Menu.ItemGroup>
                            <Menu.ItemGroup style={this.state.staffId === "admin" ?{} : (_.indexOf(this.state.menuList,"业务审核/控制") === -1 ? {display:'none'}: {})} title="业务审核/控制">
                                <Menu.Item style={this.state.staffId === "admin" ?{} : (_.indexOf(this.state.menuList,"补认领审核") === -1 ? {display:'none'}: {})} index="5-4-1">补认领审核</Menu.Item>
                                <Menu.Item style={this.state.staffId === "admin" ?{} : (_.indexOf(this.state.menuList,"申诉审核") === -1 ? {display:'none'}: {})} index="5-4-2">申诉审核</Menu.Item>
                                <Menu.Item style={this.state.staffId === "admin" ?{} : (_.indexOf(this.state.menuList,"补认领审核控制") === -1 ? {display:'none'}: {})} index="5-4-3">补认领审核控制</Menu.Item>
                            </Menu.ItemGroup>
                            <Menu.ItemGroup title="贷款转介绍">
                                <Menu.Item index="5-5-1">贷款需求申请</Menu.Item>
                                <Menu.Item index="5-5-2">贷款需求查询</Menu.Item>
                                <Menu.Item style={this.state.staffId === "admin" ?{} : (_.indexOf(this.state.menuList,"贷款营销台账") === -1 ? {display:'none'}: {})} index="5-5-3">贷款营销台账</Menu.Item>
                            </Menu.ItemGroup>
                        </Menu.SubMenu>
                        {/*<Menu.SubMenu index="6" title={<span><i className="iconfont icon-yingxiaobankuai" style={{marginRight:'5px',transform:'translateY(-2px)'}}></i>营销板块</span>}>*/}
                            {/*<Menu.Item index="6-1-1">创建营销活动</Menu.Item>*/}
                            {/*<Menu.Item index="6-2-1">营销活动执行</Menu.Item>*/}
                            {/*<Menu.Item index="6-3-1">营销活动管理</Menu.Item>*/}
                            {/*<Menu.Item index="6-4-1">营销活动监控及评价</Menu.Item>*/}
                            {/*<Menu.Item index="6-5-1">过度营销控制</Menu.Item>*/}
                        {/*</Menu.SubMenu>*/}
                    </Menu>
                </div>
            </div>
        )
    }
}

export default withRouter(LeftNav)