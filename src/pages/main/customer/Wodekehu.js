import React, {Component, Fragment} from 'react';
import {withRouter} from "react-router-dom";
import {Button, Layout, Radio, Loading, Dialog, MessageBox, Tag, Menu, Input} from 'element-react'
import Http from '../../../utils/http'
import _ from 'lodash'
import Validate from '../../../utils/validate'
import store from "../../../store"

import './wodekehu.scss'
import '../../../iconfont/iconfont.css'
import customerHead from '../../../images/user_demo.jpg'

class Wodekehu extends Component {
    constructor() {
        super()
        this.state = {
            leftLoading: false,
            rightLoading: false,
            dialogLoading: false,
            searchText:'', // 关键字搜索
            currentOpenIndex:[], // 当前展开的index
            customerList:[], // 客户列表
            currentCustomerId: null, // 当前选中的客户
            addDialogShow:false, // 添加弹框
            addGroupInfo:{
                name: "",
                property: "",
                propertyType: "0",
                type: "0" // 0:默认分组 1：自定义分组
            },
            editDialogShow:false, // 编辑弹框
            editGroupInfo:{
                id: "",
                name: "",
                property: "",
                type: "",
                propertyId: ""
            },
            customerInfo:null, // 用户详情
            customerProductList:[], // 客户产品列表
            groupListCanMove:[], // 可添加该客户的自定义分组
            controllerOpenIndex:[] // 当前展开的index
        }
    }

    componentWillUnmount() {
        this.setState = (state, callback) => {
            return
        }
    }

    componentDidMount() {
        this.getCustomerList()
    }

    // 获取客户列表
    getCustomerList(){
        this.setState({leftLoading: true})
        let key = localStorage.getItem('userName')
        let params = {staffId: key}
        Promise.all([Http.post('/customer/newMyCustomers',params), Http.post('/customer/pcGroupList',params)]).then((result)=>{
            if(result[0].resultCode === 'success' && result[1].resultCode === 'success'){
                let customerList = result[0].data.customerGroupList
                let classification = result[1].data
                // 合并分组属性
                _.forEach(classification,(obj)=>{
                    let item = _.find(customerList,(insideObj)=>{return insideObj.groupName === obj.name})
                    if(item != null){
                        item.id = obj.id
                        item.type = obj.type
                        item.property = obj.property
                        item.propertyId = obj.propertyId
                    }
                })
                _.forEach(customerList,(obj)=>{if(obj.groupName === '我的客户'){obj.id = 'all'}})
                // 重组客户ID
                _.forEach(customerList,(obj)=>{
                    _.forEach(obj.customerList,(insideObj)=>{
                        insideObj.identity = `${obj.id}&${insideObj.identity}`
                    })
                })
                console.log(customerList)
                this.setState({customerList:customerList,leftLoading:false})
            }else{
                this.setState({leftLoading:false})
                MessageBox.msgbox({
                    title:'提示',
                    message:'获取客户列表失败!',
                    type:'error'
                })
            }
        }).catch((err)=>{
            console.log(err)
            this.setState({leftLoading:false})
        })
    }

    // 搜索
    showItem(val){
        if(val !== ""){
            // 展开所有列表
            let list = []
            _.forEach(this.state.customerList,(obj)=>{list.push(obj.id)})
            this.setState({currentOpenIndex:list,searchText:val})
        }else{
            this.setState({currentOpenIndex:[],searchText:val})
        }
    }

    // 展示添加分组弹框
    showAddClassificationDialog() {
        this.setState({addDialogShow:true,currentOpenIndex:[]})
    }

    // 关闭新建分组弹框
    closeAddDialog() {
        this.setState({
            addDialogShow:false,
            dialogLoading:false,
            addGroupInfo:{
                name: "",
                property: "",
                propertyType: "0",
                type: "0"
            }
        })
    }

    // 验证添加的分组信息
    validateAddClassification() {
        let info = _.assign({},this.state.addGroupInfo)
        info.name = this.state.addGroupInfo.name.replace(/^$| /g,'')
        if(parseInt(this.state.addGroupInfo.type) === 1){
            delete info.property
            delete info.propertyType
        }
        this.setState(
            {addGroupInfo:info},
            ()=>{
                if(this.state.addGroupInfo.name !== ""){
                    let index = _.findIndex(this.state.customerList, (obj)=>{return obj.groupName === this.state.addGroupInfo.name})
                    if(index === -1){
                        if(parseInt(this.state.addGroupInfo.type) === 1){
                            this.addClassification()
                        }else{
                            if(Validate.validateCash(this.state.addGroupInfo.property)){
                                this.addClassification()
                            }else{
                                MessageBox.msgbox({
                                    title:'提示',
                                    message:'请填写正确格式的金额!',
                                    type:'error'
                                })
                            }
                        }
                    }else{
                        MessageBox.msgbox({
                            title:'提示',
                            message:'分组名称不能重复!',
                            type:'error'
                        })
                    }
                }else{
                    MessageBox.msgbox({
                        title:'提示',
                        message:'分组名称不能为空!',
                        type:'error'
                    })
                }
            }
        )
    }

    // 添加分组
    addClassification() {
        this.setState({dialogLoading:true})
        let key = localStorage.getItem('userName')
        let params = _.assign({staffId: key}, this.state.addGroupInfo)
        Http.post('/customer/newPcGroup',params)
            .then(res=>{
                console.log(res)
                if(res.resultCode === 'success'){
                    this.setState(
                        {
                            currentCustomerId:null,
                            customerInfo:null,
                            customerProductList:[],
                            groupListCanMove:[],
                            controllerOpenIndex:[]
                        },
                        ()=>{
                            this.closeAddDialog()
                            this.getCustomerList()
                        }
                    )
                }else{
                    this.setState({dialogLoading:false})
                    MessageBox.msgbox({
                        title:'提示',
                        message:'添加分组失败!',
                        type:'error'
                    })
                }
            })
            .catch(err=>{
                console.log(err)
                this.setState({dialogLoading:false})
            })
    }


    // 展示编辑分组弹框
    showEditClassificationDialog(id, name, value, type, propertyId) {
        this.setState({
            editDialogShow:true,
            currentOpenIndex:[],
            editGroupInfo:{
                id: id,
                name: name,
                property: value,
                type: type,
                propertyId: propertyId
            }
        })
    }

    // 关闭编辑弹框
    closeEditDialog() {
        this.setState({
            editDialogShow:false,
            dialogLoading:false,
            editGroupInfo:{
                id: "",
                name: "",
                property: "",
                type: "",
                propertyId: ""
            }
        })
    }


    // 验证编辑的分组信息
    validateEditClassification() {
        let info = _.assign({},this.state.editGroupInfo)
        info.name = this.state.editGroupInfo.name.replace(/^$| /g,'')
        this.setState(
            {editGroupInfo:info},
            ()=>{
                if(this.state.editGroupInfo.name !== ""){
                    let index = _.findIndex(this.state.customerList, (obj)=>{
                        if(obj.id !== this.state.editGroupInfo.id){
                            return obj.groupName === this.state.editGroupInfo.name
                        }
                    })
                    if(index === -1){
                        if(parseInt(this.state.editGroupInfo.type) === 1){
                            this.editClassification()
                        }else{
                            if(Validate.validateCash(this.state.editGroupInfo.property)){
                                this.editClassification()
                            }else{
                                MessageBox.msgbox({
                                    title:'提示',
                                    message:'请填写正确格式的金额!',
                                    type:'error'
                                })
                            }
                        }
                    }else{
                        MessageBox.msgbox({
                            title:'提示',
                            message:'分组名称不能重复!',
                            type:'error'
                        })
                    }
                }else{
                    MessageBox.msgbox({
                        title:'提示',
                        message:'分组名称不能为空!',
                        type:'error'
                    })
                }
            }
        )
    }

    // 编辑分组
    editClassification() {
        this.setState({dialogLoading:true})
        let key = localStorage.getItem('userName')
        let params = _.assign({staffId: key}, this.state.editGroupInfo)
        delete params.type
        Http.post('/customer/pcUpdateGroup',params)
            .then(res=>{
                console.log(res)
                if(res.resultCode === 'success'){
                    this.setState(
                        {
                            currentCustomerId:null,
                            customerInfo:null,
                            customerProductList:[],
                            groupListCanMove:[],
                            controllerOpenIndex:[]
                        },
                        ()=>{
                            this.closeEditDialog()
                            this.getCustomerList()
                        }
                    )
                }else{
                    this.setState({dialogLoading:false})
                    MessageBox.msgbox({
                        title:'提示',
                        message:'编辑分组失败!',
                        type:'error'
                    })
                }
            })
            .catch(err=>{
                this.setState({dialogLoading:false})
                console.log(err)
            })
    }

    // 删除分组
    deleteItem(id) {
        this.setState({currentOpenIndex:[]})
        MessageBox.confirm('确认删除该分组，删除后不可恢复!', '提示', {
            type: 'warning'
        }).then(() => {
            let key = localStorage.getItem('userName')
            let params = {staffId: key, id: id}
            this.setState({leftLoading:true})
            Http.post('/customer/delGroup',params)
                .then(res=>{
                    console.log(res)
                    if(res.resultCode === 'success'){
                        this.setState(
                            {
                                currentCustomerId:null,
                                customerInfo:null,
                                customerProductList:[],
                                groupListCanMove:[],
                                controllerOpenIndex:[]
                            },
                            ()=>{
                                this.getCustomerList()
                            }
                        )
                    }else{
                        MessageBox.msgbox({
                            title:'提示',
                            message:'删除分组失败!',
                            type:'error'
                        })
                        this.setState({leftLoading:false})
                    }
                })
                .catch(err=>{
                    console.log(err)
                    this.setState({leftLoading:false})
                })
        }).catch(()=>{
            console.log("取消")
        })
    }

    // 删除客户
    deleteCustomer(groupId, id,e) {
        e.stopPropagation()
        MessageBox.confirm('确认把客户从该分组下删除!', '提示', {
            type: 'warning'
        }).then(() => {
            let key = localStorage.getItem('userName')
            let params={identity:id.split('&')[1],groupId:groupId,staffId:key}
            Http.post('/customer/groupDelAction',params)
                .then(res=>{
                    console.log(res)
                    if(res.resultCode === 'success'){
                        this.setState(
                            {
                                currentOpenIndex:[],
                                currentCustomerId:null,
                                customerInfo:null,
                                customerProductList:[],
                                groupListCanMove:[],
                                controllerOpenIndex:[]
                            },
                            ()=>{
                                this.getCustomerList()
                            }
                        )
                    }else{
                        MessageBox.msgbox({
                            title:'提示',
                            message:'删除该客户失败!',
                            type:'error'
                        })
                    }
                })
                .catch(err=>{
                    console.log(err)
                })
        }).catch(()=>{
            console.log('取消')
        })
    }

    // 移动客户分组
    addCustomerToGroup(groupId){
        this.setState({controllerOpenIndex: [], leftLoading: true})
        let key = localStorage.getItem('userName')
        let customerId = this.state.currentCustomerId.split('&')[1]
        let params = {
            groupId: groupId,
            identity: customerId,
            staffId: key
        }
        Http.post('/customer/groupAction', params)
            .then(res=>{
                console.log(res)
                if(res.resultCode === 'success'){
                    // 更新该客户可移动的自定义分组列表
                    let groupList = this.state.groupListCanMove
                    let index = _.findIndex(groupList,(obj)=>{return obj.id === groupId})
                    groupList.splice(index, 1)
                    let item = _.find(this.state.customerList,(obj)=>{return obj.id === this.state.currentCustomerId.split('&')[0]})
                    if(parseInt(item.type) === 1){
                        groupList.push({id:item.id, groupName: item.groupName})
                    }
                    // 设置当前客户id和展开的index
                    let targetCustomerId = `${groupId}&${customerId}`
                    this.setState(
                        {groupListCanMove: groupList, currentOpenIndex: [groupId], currentCustomerId: targetCustomerId},
                        ()=>{
                            this.getCustomerList()
                        }
                    )
                }else{
                    this.setState({leftLoading: false})
                    MessageBox.msgbox({
                        title:'提示',
                        message:'添加至该分组失败!',
                        type:'error'
                    })
                }
            })
            .catch(err=>{
                console.log(err)
                this.setState({leftLoading: false})
            })
    }

    // 选择客户
    chooseCustomer(id) {
        if(id !== this.state.currentCustomerId){
            this.setState(
                {currentCustomerId: id, controllerOpenIndex: []},
                ()=> {
                    this.showCustomerInfo()
                }
            )
        }
    }

    // 展示用户详情
    showCustomerInfo() {
        this.setState({rightLoading: true})
        let id = this.state.currentCustomerId
        let identity = id.split('&')[1]
        let groupList = this.getGroupListCanMove()
        let params = {identity: identity}
        // let params = {identity: "01420827-5"}
        Http.post('/customer/customerBasicInfo',params)
            .then(res=>{
                console.log(res)
                if(res.resultCode === 'success'){
                    let info = res.data.customerBaseInfoModel
                    let list = res.data.productList
                    this.setState({rightLoading:false, customerInfo: info, customerProductList: list, groupListCanMove: groupList})
                }else{
                    MessageBox.msgbox({
                        title:'提示',
                        message:'获取用户资料失败!',
                        type:'error'
                    })
                    this.setState({rightLoading:false})
                }
            })
            .catch(err=>{
                console.log(err)
                this.setState({rightLoading:false})
            })
    }

    // 获取可添加该客户的分组
    getGroupListCanMove() {
        let customerId = this.state.currentCustomerId.split('&')[1]
        let groupList = []
        _.forEach(this.state.customerList,(obj)=>{
            if(obj.type != null && parseInt(obj.type) === 1){
                let index = _.findIndex(obj.customerList, (item)=>{return item.identity.split("&")[1] === customerId})
                console.log(index)
                if(index === -1){
                    groupList.push({id:obj.id, groupName: obj.groupName})
                }
            }
        })
        return groupList
    }

    formatTagStyle(num) {
        let n = num % 5
        switch (n) {
            case 0:
                return 'primary'
            case 1:
                return 'success'
            case 2:
                return 'warning'
            case 3:
                return 'gray'
            case 4:
                return 'danger'
            default:
                break;
        }
    }

    formatDate(str) {
        if(str != null && str.split("").length === 8){
            let year = str.slice(0, 4)
            let month = parseInt(str.slice(4, 6))
            let day = parseInt(str.slice(6, 8))
            return `${year}年${month}月${day}日`
        }else{
            return "------"
        }
    }

    render() {
        let text = this.state.searchText
        return (
            <div style={{position:'relative'}}>
                <div className='customer-block'>
                    <Loading loading={this.state.leftLoading} text='加载中...'>
                        <div style={{padding:'10px 20px'}}>
                            <Input placeholder='搜索...' value={this.state.searchText} onChange={this.showItem.bind(this)}/>
                        </div>
                        <div className="customer-list-menu">
                            <Menu defaultOpeneds={this.state.currentOpenIndex} onOpen={(val)=>{this.setState({currentOpenIndex:[val]})}}>
                                {
                                    this.state.customerList.map((el, index)=>
                                        <Menu.SubMenu
                                            key={index}
                                            index={el.id}
                                            style={
                                                this.state.searchText !== ""
                                                    ?
                                                    el.groupName.indexOf(text) === -1
                                                        ?
                                                        el.customerList != null && el.customerList.length > 0
                                                            ?
                                                            _.find(el.customerList,(obj)=>{return obj.name.indexOf(text) !== -1}) != null
                                                                ?
                                                                {}
                                                                :
                                                                {display:'none'}
                                                            :
                                                            {display:'none'}
                                                        :
                                                        {}
                                                    :
                                                    {}
                                            }
                                            title={
                                                <div style={index === 0 ? {fontWeight:'bold'} : {}}>
                                                    {el.groupName}
                                                    <span style={{position:'relative',top:"-2px"}}>（{el.customerList != null ? el.customerList.length : 0}）</span>
                                                    <i style={el.id === 'all' ? {} : {display:'none'}} onClick={this.showAddClassificationDialog.bind(this)} className='iconfont icon-tianjia menu-icon-style' title='添加客户分组'></i>
                                                    <i style={el.id !== 'all' ? {} : {display:'none'}} onClick={this.deleteItem.bind(this,el.id)} className='iconfont icon-lajixiang menu-icon-style' title='删除客户分组'></i>
                                                    <i style={el.id !== 'all' ? {marginRight:'10px'} : {display:'none'}} onClick={this.showEditClassificationDialog.bind(this, el.id, el.groupName, el.property, el.type, el.propertyId)} className='iconfont icon-bianji menu-icon-style' title='编辑客户分组'></i>
                                                </div>
                                            }
                                        >
                                            {
                                                el.customerList != null && el.customerList.length > 0
                                                    ?
                                                    el.customerList.map((item, insideIndex)=>
                                                        <Menu.Item
                                                            key={insideIndex}
                                                            index={`${index}-${item.identity}`}
                                                            style={
                                                                this.state.searchText !== ""
                                                                    ?
                                                                    el.groupName.indexOf(text) !== -1
                                                                        ?
                                                                        {}
                                                                        :
                                                                        item.name.indexOf(text) !== -1
                                                                            ?
                                                                            {}
                                                                            :
                                                                            {display:'none'}
                                                                    :
                                                                    {}
                                                            }
                                                        >
                                                            <div
                                                                onClick={this.chooseCustomer.bind(this, item.identity)}
                                                                style={this.state.currentCustomerId === item.identity ? {color:'#0D93FF'}:{color:'#48576A'}}
                                                            >
                                                                {item.name}
                                                                <i onClick={this.deleteCustomer.bind(this, el.id, item.identity)} style={parseInt(el.type) === 1 ? {marginRight:'5px'} : {display:'none'}} className='iconfont icon-lajixiang menu-icon-style' title='删除客户'></i>
                                                                <i className="iconfont icon-sanjiao" style={this.state.currentCustomerId === item.identity ? {position:'absolute',right:'20px',top:'-2px'} : {display:'none'}}></i>
                                                            </div>
                                                        </Menu.Item>
                                                    )
                                                    :
                                                    null
                                            }
                                        </Menu.SubMenu>
                                    )
                                }
                            </Menu>
                        </div>
                    </Loading>
                </div>

                <div className="customer-info-block">
                    <Loading loading={this.state.rightLoading}>
                        <div className="customer-info-cube">
                            <div className="customer-info-title">客户基本信息</div>
                            {
                                this.state.customerInfo != null
                                    ?
                                    <Fragment>
                                        <img src={customerHead} alt="" className='customer-info-head'/>
                                        <ul className="customer-info-list">
                                            <li className="customer-info-item">
                                                <span className="customer-info-label">{this.state.customerInfo.type === 'private' ? "姓名" : "公司名称"}</span>
                                                <span className="customer-info-value">{this.state.customerInfo == null || this.state.customerInfo.name === "" ? '未知' : this.state.customerInfo.name}</span>
                                            </li>
                                            <li className="customer-info-item" style={this.state.customerInfo.type === 'private' ? {} : {display: 'none'}}>
                                                <span className="customer-info-label">性别</span>
                                                <span className="customer-info-value">{this.state.customerInfo == null || this.state.customerInfo.sex === "" ? '未知' : this.state.customerInfo.sex}</span>
                                            </li>
                                            <li className="customer-info-item">
                                                <span className="customer-info-label">手机号</span>
                                                <span className="customer-info-value">{this.state.customerInfo == null || this.state.customerInfo.phone === "" ? '未知' : this.state.customerInfo.phone}</span>
                                            </li>
                                            <li className="customer-info-item">
                                                <span className="customer-info-label">住址</span>
                                                <span className="customer-info-value">{this.state.customerInfo == null || this.state.customerInfo.address === "" ? '未知' : this.state.customerInfo.address}</span>
                                            </li>
                                            <li className="customer-info-item">
                                                <span className="customer-info-label">身份证</span>
                                                <span className="customer-info-value">{this.state.customerInfo == null || this.state.customerInfo.identity === "" ? '未知' : this.state.customerInfo.identity}</span>
                                            </li>
                                            <li className="customer-info-item">
                                                <span className="customer-info-label">{this.state.customerInfo.type === 'private' ? '出生日期' : "注册日期"}</span>
                                                <span className="customer-info-value">{this.state.customerInfo == null || this.state.customerInfo.birthday === "" ? '未知' : this.formatDate(this.state.customerInfo.birthday)}</span>
                                            </li>
                                        </ul>
                                        <div className='controller-list-cube' style={this.state.customerInfo.type === 'private' ? {} : {marginTop:'40px'}}>
                                            <div className="controller-list-title">客户分组管理</div>
                                            <div className="controller-list-box">
                                                <Menu defaultOpeneds={this.state.controllerOpenIndex} onOpen={(val)=>{this.setState({controllerOpenIndex:[val]})}}>
                                                    <Menu.SubMenu index="1" title={<div><i className="iconfont icon-chengyuan" style={{position:'relative',top:'-2px',marginRight:'5px',color:'#F1C500'}}></i>分组</div>}>
                                                        {
                                                            this.state.groupListCanMove.map((el, index)=>
                                                                <Menu.Item index={`1-${index}`} key={index}>
                                                                    <div>
                                                                        {el.groupName}
                                                                        <i onClick={this.addCustomerToGroup.bind(this, el.id)} style={{color:"#20A0FF", float:"right", cursor: "pointer"}} title='添加至该分组下' className="iconfont icon-chuangjianren"></i>
                                                                    </div>
                                                                </Menu.Item>
                                                            )
                                                        }
                                                    </Menu.SubMenu>
                                                    <Menu.SubMenu index="2" title={<div><i className="iconfont icon-guolv" style={{position:'relative',top:'-2px',marginRight:'5px',color:'#5CC691'}}></i>分配</div>}>
                                                    </Menu.SubMenu>
                                                    <Menu.SubMenu index="3" title={<div><i className="iconfont icon-shenling" style={{position:'relative',top:'-2px',marginRight:'5px',color:'#E96E6C'}}></i>申领</div>}>
                                                    </Menu.SubMenu>
                                                    <Menu.SubMenu index="4" title={<div><i className="iconfont icon-fenpei" style={{position:'relative',top:'-2px',marginRight:'5px',color:'#2D60FF'}}></i>平移</div>}>
                                                    </Menu.SubMenu>
                                                </Menu>
                                            </div>
                                        </div>
                                    </Fragment>
                                    :
                                    <div className='empty-customer-desc'>暂无客户信息，请先选择客户！</div>
                            }

                        </div>

                        <div className="customer-product-cube">
                            <div className="customer-product-title">客户所持产品</div>
                            <div className="customer-product-list-box">
                                <div className="product-desc-list-title">已购买</div>
                                <div className='product-desc-list-cube'>
                                    {
                                        _.filter(this.state.customerProductList, (obj)=>{return obj.isPurchase === "true"}).length > 0
                                            ?
                                            _.filter(this.state.customerProductList, (obj)=>{return obj.isPurchase === "true"}).map((el, index)=>
                                                <Tag key={index} type={this.formatTagStyle(index)} style={{marginRight:'20px',marginBottom:'15px'}}>{el.name}</Tag>
                                            )
                                            :
                                            <div style={{textAlign:'center',color:"#999999",lineHeight:'30px'}}>暂无产品</div>
                                    }
                                </div>
                                <div className="product-desc-list-title">未购买</div>
                                <div className='product-desc-list-cube'>
                                    {
                                        _.filter(this.state.customerProductList, (obj)=>{return obj.isPurchase === "false"}).length > 0
                                            ?
                                            _.filter(this.state.customerProductList, (obj)=>{return obj.isPurchase === "false"}).map((el, index)=>
                                                <Tag key={index} type={this.formatTagStyle(index)} style={{marginRight:'20px',marginBottom:'15px'}}>{el.name}</Tag>
                                            )
                                            :
                                            <div style={{textAlign:'center',color:"#999999",lineHeight:'30px'}}>暂无产品</div>
                                    }
                                </div>
                            </div>
                        </div>
                    </Loading>
                </div>


                {/*创建弹框*/}
                <Dialog
                    title="新建客户分组"
                    size="tiny"
                    top='32%'
                    style={{minWidth:'500px'}}
                    visible={ this.state.addDialogShow }
                    onCancel={ this.closeAddDialog.bind(this) }
                    lockScroll={ false }
                >
                    <Dialog.Body style={{padding: "10px 50px 30px 30px"}}>
                        <Loading loading={this.state.dialogLoading} text='创建中...'>
                            <Layout.Row className='input-row-item'>
                                <Layout.Col span={6} style={{textAlign:'right'}}>客户分组类型：</Layout.Col>
                                <Layout.Col span={17} offset={1}>
                                    <Radio
                                        value='0'
                                        checked={parseInt(this.state.addGroupInfo.type) === 0}
                                        onChange={(val)=>{
                                            let info = _.assign({},this.state.addGroupInfo)
                                            info.type = val
                                            this.setState({addGroupInfo:info})
                                        }}
                                    >
                                        默认分组
                                    </Radio>
                                    <Radio
                                        value='1'
                                        checked={parseInt(this.state.addGroupInfo.type) === 1}
                                        onChange={(val)=>{
                                            let info = _.assign({},this.state.addGroupInfo)
                                            info.type = val
                                            this.setState({addGroupInfo:info})
                                        }}
                                    >
                                        自定义分组
                                    </Radio>
                                </Layout.Col>
                            </Layout.Row>
                            <Layout.Row className='input-row-item'>
                                <Layout.Col span={6} style={{textAlign:'right'}}>客户分组名称：</Layout.Col>
                                <Layout.Col span={17} offset={1}>
                                    <Input
                                        value={this.state.addGroupInfo.name}
                                        placeholder='请输入分组名称'
                                        onChange={(val)=>{
                                            let info = _.assign({},this.state.addGroupInfo)
                                            info.name = val
                                            this.setState({addGroupInfo: info})
                                        }}
                                    />
                                </Layout.Col>
                            </Layout.Row>
                            <Layout.Row className='input-row-item' style={parseInt(this.state.addGroupInfo.type) === 0 ? {} : {display:'none'}}>
                                <Layout.Col span={6} style={{textAlign:'right'}}>交易金额下限：</Layout.Col>
                                <Layout.Col span={17} offset={1}>
                                    <Input
                                        append={'元'}
                                        placeholder='请输入金额下限'
                                        value={this.state.addGroupInfo.property}
                                        onChange={(val)=>{
                                            let info = _.assign({},this.state.addGroupInfo)
                                            info.property = val
                                            this.setState({addGroupInfo: info})
                                        }}
                                    />
                                </Layout.Col>
                            </Layout.Row>

                            <div style={{textAlign:'center',marginTop:'20px'}}>
                                <Button onClick={this.closeAddDialog.bind(this)} style={{marginRight:'40px'}}>取消</Button>
                                <Button type='primary' onClick={this.validateAddClassification.bind(this)}>创建</Button>
                            </div>
                        </Loading>
                    </Dialog.Body>
                </Dialog>

                {/*编辑弹框*/}
                <Dialog
                    title={`编辑${parseInt(this.state.editGroupInfo.type) === 0 ? '默认' : '自定义'}分组`}
                    size="tiny"
                    top='32%'
                    style={{minWidth:'500px'}}
                    visible={ this.state.editDialogShow }
                    onCancel={ this.closeEditDialog.bind(this) }
                    lockScroll={ false }
                >
                    <Dialog.Body style={{padding: "10px 50px 30px 30px"}}>
                        <Loading loading={this.state.dialogLoading} text='编辑中...'>
                            <Layout.Row className='input-row-item'>
                                <Layout.Col span={6} style={{textAlign:'right'}}>客户分组名称：</Layout.Col>
                                <Layout.Col span={17} offset={1}>
                                    <Input
                                        value={this.state.editGroupInfo.name}
                                        placeholder='请输入分组名称'
                                        onChange={(val)=>{
                                            let info = _.assign({},this.state.editGroupInfo)
                                            info.name = val
                                            this.setState({editGroupInfo: info})
                                        }}
                                    />
                                </Layout.Col>
                            </Layout.Row>
                            <Layout.Row className='input-row-item' style={parseInt(this.state.editGroupInfo.type) === 0 ? {} : {display:'none'}}>
                                <Layout.Col span={6} style={{textAlign:'right'}}>交易金额下限：</Layout.Col>
                                <Layout.Col span={17} offset={1}>
                                    <Input
                                        append={'元'}
                                        placeholder='请输入金额下限'
                                        value={this.state.editGroupInfo.property}
                                        onChange={(val)=>{
                                            let info = _.assign({},this.state.editGroupInfo)
                                            info.property = val
                                            this.setState({editGroupInfo: info})
                                        }}
                                    />
                                </Layout.Col>
                            </Layout.Row>

                            <div style={{textAlign:'center',marginTop:'20px'}}>
                                <Button onClick={this.closeEditDialog.bind(this)} style={{marginRight:'40px'}}>取消</Button>
                                <Button type='primary' onClick={this.validateEditClassification.bind(this)}>编辑</Button>
                            </div>
                        </Loading>
                    </Dialog.Body>
                </Dialog>

            </div>
        )
    }
}

export default withRouter(Wodekehu)