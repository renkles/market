import React, {Component, Fragment} from 'react';
import {withRouter} from "react-router-dom";
import {Tree, Dialog, Button, Input, Layout, MessageBox, Loading} from 'element-react'
import store from "../../../store";
import _ from 'lodash'
import Http from '../../../utils/http'

import '../../../iconfont/iconfont.css'
import './editAuthority.scss'

class EditAuthority extends Component {
    constructor() {
        super()
        this.state = {
            list:[
                {
                    ID: '0',
                    RES_NAME: "所有权限",
                    RES_LEVEL: 0,
                    children: []
                }
            ],
            options: {
                children: 'children',
                label: 'RES_NAME'
            },
            addDialogShowing: false,
            editDialogShowing: false,
            deleteDialogShowing: false,
            loadingShow:false,
            currentSelectedNode:{}, // 当前选中的节点
            addNodeMsg:{
                name:'',
                resUrl:''
            }, // 用户添加的节点信息
            editNodeMsg:{
                name:'',
                resUrl:''
            } // 用户编辑的节点信息
        }
    }

    // 跳转权限管理
    toManager() {
        store.dispatch({type: 'change_Current_flag', value: '0-0-1'})
    }

    componentDidMount(){
        this.initList()
    }

    componentWillUnmount() {
        this.setState = (state, callback) => {
            return
        }
    }

    // 获取列表
    initList(){
        this.setState({loadingShow:true})
        Http.post('/resource')
            .then(
                res => {
                    console.log(res)
                    let newList = [...this.state.list]
                    newList[0].children = res.data
                    this.setState({list:newList,loadingShow:false})
                }
            )
            .catch(
                err => {
                    console.log(err)
                    this.setState({loadingShow:false})
                }
            )
    }

    // 显示添加弹框
    showAddDialog(data) {
        this.setState({currentSelectedNode:data,addDialogShowing:true})
    }

    // 关闭添加弹框
    closeAddDialog() {
        this.setState({
            addDialogShowing:false,
            addNodeMsg:{
                name:'',
                resUrl:''
            }
        })
    }

    // 添加节点
    addNode() {
        let userName = localStorage.getItem('userName')
        let level = parseInt(this.state.currentSelectedNode.RES_LEVEL) + 1
        let nodeName = this.state.addNodeMsg.name
        let hasSameName = false
        // 获取序列号并判断name是否重复
        let sortNo = 1
        let childList = this.state.currentSelectedNode.children
        if(childList != null && childList.length > 0){
            _.forEach(childList,(obj)=>{
                if(parseInt(obj.SORT) >= sortNo) {
                    sortNo = parseInt(obj.SORT) + 1
                }
                if(obj.RES_NAME === nodeName){
                    hasSameName = true
                }
            })
        }
        // 发送请求
        let params = {
            name: nodeName,
            parentId: this.state.currentSelectedNode.ID,
            resUrl: this.state.addNodeMsg.resUrl,
            sort: sortNo,
            resLevel: level,
            staffId: userName
        }
        if(params.name === ""){ // 判断是否有name
            MessageBox.msgbox({
                title:'提示',
                message:'请输入添加的菜单名称',
                type:'error'
            })
        }else if(hasSameName){// 判断name是否冲突
            MessageBox.msgbox({
                title:'提示',
                message:'添加的菜单名称不能重复',
                type:'error'
            })
        }else{
            Http.post('/resource/insertResource',params)
                .then(
                    res=>{
                        console.log(res)
                        if(res.resultCode === 'success'){
                            console.log('添加成功')
                            this.setState(
                                {
                                    currentSelectedNode:{},
                                    addDialogShowing:false,
                                    addNodeMsg:{
                                        name:'',
                                        resUrl:''
                                    }
                                },
                                ()=>{
                                    MessageBox.msgbox({
                                        title:'提示',
                                        message:'添加成功',
                                        type:'success'
                                    })
                                    this.initList()
                                }
                            )
                        }else{
                            console.log('添加失败')
                        }
                    }
                )
                .catch(
                    err => {
                        console.log(err)
                    }
                )
        }
    }

    // 显示编辑弹框
    showEditDialog(data) {
        let name = data.RES_NAME
        let resUrl = data.RES_URL
        this.setState({
            currentSelectedNode:data,
            editDialogShowing:true,
            editNodeMsg:{
                name:name,
                resUrl:resUrl
            }
        })
    }

    // 关闭编辑弹框
    closeEditDialog() {
        this.setState({
            editDialogShowing:false,
            editNodeMsg:{
                name:'',
                resUrl:''
            }
        })
    }

    // 修改节点
    editNode() {
        let userName = localStorage.getItem('userName')
        let nodeName = this.state.editNodeMsg.name
        let currentId = this.state.currentSelectedNode.ID
        let hasSameName = false
        //获取父节点的兄弟集合
        let siblingNodes = []
        let parentId = this.state.currentSelectedNode.PARENT_ID
        let parentLevel = parseInt(this.state.currentSelectedNode.RES_LEVEL) - 1
        switch (parentLevel) {
            case 0:
                siblingNodes = this.state.list[0].children
                break;
            case 1:
                let fatherList1 = this.state.list[0].children
                siblingNodes = _.find(fatherList1,(obj)=>{return obj.ID === parentId}).children
                break;
            case 2:
                let fatherList2 = this.state.list[0].children
                _.forEach(fatherList2,(obj)=>{
                    _.forEach(obj.children,(insideObj)=>{
                        if(insideObj.ID === parentId){
                            siblingNodes = insideObj.children
                        }
                    })
                })
                break;
            default:
                break;
        }
        // console.log(siblingNodes)
        // 判断是否名称冲突
        _.forEach(siblingNodes,(obj)=>{
            if(obj.ID !== currentId){
                if(obj.RES_NAME === nodeName){hasSameName = true}
            }
        })
        // 发送请求
        let params = {
            id: currentId,
            name: nodeName,
            resUrl: this.state.editNodeMsg.resUrl,
            staffId: userName
        }
        if(params.name === ""){ // 判断是否有name
            MessageBox.msgbox({
                title:'提示',
                message:'请输入修改的菜单名称',
                type:'error'
            })
        }else if(hasSameName){// 判断name是否冲突
            MessageBox.msgbox({
                title:'提示',
                message:'菜单名称不能重复',
                type:'error'
            })
        }else{
            Http.post('/resource/updateResource',params)
                .then(
                    res=> {
                        console.log(res)
                        if(res.resultCode === 'success'){
                            console.log('修改成功')
                            this.setState(
                                {
                                    currentSelectedNode:{},
                                    editDialogShowing:false,
                                    editNodeMsg:{
                                        name:'',
                                        resUrl:''
                                    }
                                },
                                ()=>{
                                    MessageBox.msgbox({
                                        title:'提示',
                                        message:'修改成功',
                                        type:'success'
                                    })
                                    this.initList()
                                }
                            )
                        }else{
                            console.log('修改失败')
                        }
                    }
                )
                .catch(
                    err=> {
                        console.log(err)
                    }
                )
        }
    }

    // 显示删除弹框
    showDeleteDialog(data) {
        this.setState({currentSelectedNode:data,deleteDialogShowing:true})
    }

    // 关闭删除弹框
    closeDeleteDialog() {
        this.setState({deleteDialogShowing:false})
    }

    // 删除节点
    confirmDelete() {
        let userName = localStorage.getItem('userName')
        let params = {
            id: this.state.currentSelectedNode.ID,
            staffId: userName
        }
        Http.post('/resource/delResource',params)
            .then(
                res=> {
                    console.log(res)
                    if(res.resultCode === 'success'){
                        console.log('删除成功')
                        this.setState(
                            {deleteDialogShowing:false},
                            ()=>{
                                this.initList()
                            }
                        )
                    }else{
                        console.log('删除失败')
                    }
                }
            )
            .catch(
                err=> {
                    console.log(err)
                }
            )
    }

    // 更新添加弹框input内容
    updateAddInput(type,val) {
        let data = _.assign({},this.state.addNodeMsg)
        data[type] = val
        this.setState({addNodeMsg:data})
    }

    // 更新添加弹框input内容
    updateEditInput(type,val) {
        let data = _.assign({},this.state.editNodeMsg)
        data[type] = val
        this.setState({editNodeMsg:data})
    }

    // tree内容填充
    renderContent(nodeModel, data, store) {
        return (
            <span>
                <span>
                    <span>{data.RES_NAME}</span>
                </span>
                <i onClick={this.showDeleteDialog.bind(this,data)} className="iconfont icon-lajixiang icon-item-style" style={data.ID === "0" ? {display: 'none'} : {}} title='删除'></i>
                <i onClick={this.showEditDialog.bind(this,data)} className="iconfont icon-bianji icon-item-style" style={data.ID === "0" ? {display: 'none'} : {}} title='编辑'></i>
                <i onClick={this.showAddDialog.bind(this,data)} className="iconfont icon-tianjia icon-item-style" style={parseInt(data.RES_LEVEL) >= 3 ? {display: 'none'} : {}} title='添加'></i>
            </span>
        )
    }

    render() {
        return (
            <Fragment>
                <div className="authority-list-block">
                    <div className="authority-block-title">
                        菜单管理
                        <i className="iconfont icon-shuaxin block-control-btn" title='刷新'></i>
                        <span className="block-control-edit" onClick={this.toManager.bind(this)}>
                            管理权限
                            <i className="iconfont icon-bianjiguanli" title='管理权限' style={{marginLeft:'5px'}}></i>
                        </span>
                    </div>
                    <div className="tree-container">
                        <Loading loading={this.state.loadingShow} text='加载中...'>
                            <Tree
                                data={this.state.list}
                                options={this.state.options}
                                highlightCurrent={true}
                                defaultExpandAll={true}
                                expandOnClickNode={false}
                                renderContent={(...args)=>this.renderContent(...args)}
                            />
                        </Loading>
                    </div>
                </div>

                {/*添加弹框*/}
                <Dialog
                    title={`添加【${this.state.currentSelectedNode.RES_NAME}】下的子菜单`}
                    size="tiny"
                    style={{minWidth: "540px"}}
                    top='35%'
                    visible={ this.state.addDialogShowing }
                    onCancel={ this.closeAddDialog.bind(this)}
                    lockScroll={ false }
                >
                    <Dialog.Body>
                        <Layout.Row className='input-cube'>
                            <Layout.Col span={6} className='control-label'>菜单名称:</Layout.Col>
                            <Layout.Col span={16}><Input onChange={this.updateAddInput.bind(this, 'name')} value={this.state.addNodeMsg.name} type='text' placeholder='请输入权限名称'/></Layout.Col>
                        </Layout.Row>
                        <Layout.Row className='input-cube'>
                            <Layout.Col span={6} className='control-label'>配置路径:</Layout.Col>
                            <Layout.Col span={16}><Input onChange={this.updateAddInput.bind(this, 'resUrl')} value={this.state.addNodeMsg.resUrl} type='text' placeholder='请输入后台配置路径'/></Layout.Col>
                        </Layout.Row>
                    </Dialog.Body>
                    <Dialog.Footer>
                        <div style={{textAlign: 'center'}}>
                            <Button onClick={ this.closeAddDialog.bind(this) }>取消</Button>
                            <Button type="primary" onClick={this.addNode.bind(this)}>确定</Button>
                        </div>
                    </Dialog.Footer>
                </Dialog>

                {/*修改弹框*/}
                <Dialog
                    title={`修改【${this.state.currentSelectedNode.RES_NAME}】菜单`}
                    size="tiny"
                    style={{minWidth: "540px"}}
                    top='35%'
                    visible={ this.state.editDialogShowing }
                    onCancel={ this.closeEditDialog.bind(this)}
                    lockScroll={ false }
                >
                    <Dialog.Body>
                        <Layout.Row className='input-cube'>
                            <Layout.Col span={6} className='control-label'>菜单名称:</Layout.Col>
                            <Layout.Col span={16}><Input onChange={this.updateEditInput.bind(this, 'name')} value={this.state.editNodeMsg.name} type='text' placeholder='请输入权限名称'/></Layout.Col>
                        </Layout.Row>
                        <Layout.Row className='input-cube'>
                            <Layout.Col span={6} className='control-label'>配置路径:</Layout.Col>
                            <Layout.Col span={16}><Input onChange={this.updateEditInput.bind(this, 'resUrl')} value={this.state.editNodeMsg.resUrl} type='text' placeholder='请输入后台配置路径'/></Layout.Col>
                        </Layout.Row>
                    </Dialog.Body>
                    <Dialog.Footer>
                        <div style={{textAlign: 'center'}}>
                            <Button onClick={ this.closeEditDialog.bind(this) }>取消</Button>
                            <Button type="primary" onClick={this.editNode.bind(this)}>确定</Button>
                        </div>
                    </Dialog.Footer>
                </Dialog>

                {/*删除弹框*/}
                <Dialog
                    title="提示"
                    size="tiny"
                    top='35%'
                    visible={ this.state.deleteDialogShowing }
                    onCancel={ this.closeDeleteDialog.bind(this) }
                    lockScroll={ false }
                >
                    <Dialog.Body style={{textAlign: 'center'}}>
                        <span>确定删除【{this.state.currentSelectedNode.RES_NAME}】? 删除后不可恢复!</span>
                    </Dialog.Body>
                    <Dialog.Footer className="dialog-footer">
                        <Button type="primary" onClick={ this.confirmDelete.bind(this) }>确定</Button>
                    </Dialog.Footer>
                </Dialog>
            </Fragment>
        )
    }
}

export default withRouter(EditAuthority)