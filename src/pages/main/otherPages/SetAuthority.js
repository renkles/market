import React, {Component, Fragment} from 'react';
import {withRouter} from "react-router-dom";
import {Tree, Loading, Button, MessageBox, Input} from 'element-react'
import store from "../../../store";
import _ from 'lodash'
import Http from '../../../utils/http'

import '../../../iconfont/iconfont.css'
import './setAuthority.scss'

class SetAuthority extends Component {
    constructor() {
        super()
        this.state = {
            leftList: [
                {
                    id: '0',
                    name: "所有部门",
                    description:'所有部门',
                    children: []
                }
            ],
            rightList:[],
            firstChoose:true,
            leftLoading:false,
            rightLoading:false,
            currentSelected:"",
            leftOptions: {
                children: 'children',
                label: 'name'
            },
            rightOptions: {
                children: 'children',
                label: 'RES_NAME'
            },
            checkedList:[] // 已选中列表
        }
    }

    // 跳转编辑
    toEditList() {
        store.dispatch({type: 'change_Current_flag', value: '0-0-2'})
    }

    componentDidMount(){
        this.initUserList()
    }

    componentWillUnmount() {
        this.setState = (state, callback) => {
            return
        }
    }

    // 获取用户列表
    initUserList(){
        this.setState({leftLoading:true})
        Http.post('/depOrJob/deps',{departmentName:""})
            .then(
                res=> {
                    console.log(res)
                    if(res.resultCode === 'success'){
                        let list = [...this.state.leftList]
                        list[0].children = res.data
                        this.setState({leftList:list,leftLoading:false})
                    }else{
                        console.log('获取职位失败')
                        this.setState({leftLoading:false})
                    }
                }
            )
            .catch(
                err=> {
                    console.log(err)
                    this.setState({leftLoading:false})
                }
            )
    }

    // 左侧列表选择
    chooseItem(data) {
        if(!data.children){
            let selected = `${data.parentId}-${data.id}`
            if(selected !== this.state.currentSelected){
                this.setState(
                    {currentSelected:selected},
                    ()=>{
                        this.updateRightList()
                    }
                )
            }
        }else{
            return
        }
    }

    // 更新右侧状态
    updateRightList(){
        this.setState({rightLoading:true})

        let depId = this.state.currentSelected.split('-')[0]
        let jobId = this.state.currentSelected.split('-')[1]
        let params = {
            depId: depId,
            jobId: jobId
        }
        Http.post('/resource/jobResource',params)
            .then(
                res=> {
                    console.log(res)
                    if(res.resultCode === 'success'){
                        let dataList = res.data
                        // 获取已选择的列表
                        let selectedList = []
                        _.forEach(dataList,(outsideObj)=>{
                            if(outsideObj.children === undefined){
                                if(outsideObj.SELECTED === 'TRUE'){
                                    selectedList.push(outsideObj.ID)
                                }
                            }else{
                                _.forEach(outsideObj.children,(obj)=>{
                                    if(obj.children === undefined) {
                                        if (obj.SELECTED === 'TRUE') {
                                            selectedList.push(obj.ID)
                                        }
                                    }else{
                                        _.forEach(obj.children,(insideObj)=>{
                                            if(insideObj.SELECTED === 'TRUE'){
                                                selectedList.push(insideObj.ID)
                                            }
                                        })
                                    }
                                })
                            }
                        })
                        console.log(selectedList)
                        if(this.state.firstChoose){
                            this.setState(
                                {rightList: dataList, checkedList: selectedList, firstChoose:false,rightLoading:false},
                                ()=>{
                                    this.tree.setCheckedKeys(selectedList)
                                }
                            )
                        }else{
                            this.setState(
                                {checkedList: selectedList,rightLoading:false},
                                ()=>{
                                    this.tree.setCheckedKeys(selectedList)
                                }
                            )
                        }
                    }else{
                        console.log('获取数据失败')
                        this.setState({rightLoading:false})
                    }
                }
            )
            .catch(
                err=> {
                    console.log(err)
                    this.setState({rightLoading:false})
                }
            )
    }

    // 右侧刷新
    refreshList() {
        if(this.state.currentSelected !== ""){
            this.updateRightList()
        }else{
            return
        }
    }

    // 提交
    confirm() {
        this.setState({rightLoading:true})

        let depId = this.state.currentSelected.split('-')[0]
        let jobId = this.state.currentSelected.split('-')[1]
        // 获取半选全选父节点列表
        let allList = this.state.rightList
        let childList = this.tree.getCheckedKeys(true)
        let result1 = [...childList]
        _.forEach(allList,(obj)=>{
            if(obj.children != null){
                _.forEach(obj.children,(obj1)=>{
                    if(obj1.children != null){
                        _.forEach(obj1.children,(obj2)=>{
                            _.forEach(childList,(id)=>{
                                if(id === obj2.ID){
                                    result1.push(obj2.PARENT_ID)
                                }
                            })
                        })
                    }else{
                        _.forEach(childList,(id)=>{
                            if(id === obj1.ID){
                                result1.push(obj1.PARENT_ID)
                            }
                        })
                    }
                })
            }
        })
        result1 = _.uniq(result1)
        let result2 = [...result1]
        _.forEach(allList,(obj)=>{
            if(obj.children != null){
                _.forEach(obj.children,(obj1)=>{
                    _.forEach(result1,(id)=>{
                        if(id === obj1.ID){
                            result2.push(obj1.PARENT_ID)
                        }
                    })
                })
            }
        })
        let result = _.uniq(result2)
        console.log(result)

        let params = {
            depId: depId,
            jobId: jobId,
            resourceIds: result,
        }
        Http.post('/resourceShip/insertJobResourceShip',params)
            .then(
                res=>{
                    this.setState({rightLoading:false})
                    console.log(res)
                    if(res.resultCode === 'success'){
                        console.log('设置成功')
                        MessageBox.msgbox({
                            title:'提示',
                            message:'设置成功',
                            type:'success'
                        })
                    }else{
                        console.log('设置失败')
                    }
                }
            )
            .catch(
                err=>{
                    console.log(err)
                    this.setState({rightLoading:false})
                }
            )

    }

    // 左侧列表内容填充
    renderContent(nodeModel, data, store) {
        return (
            <span>
                <span>
                    <span className={`${data.parentId}-${data.id}` === this.state.currentSelected ? 'selected-text' : null}>{data.name}</span>
                </span>
                <i style={`${data.parentId}-${data.id}` === this.state.currentSelected ? {} : {display:'none'}} className="iconfont icon-sanjiao selected-icon"></i>
            </span>
        )
    }

    render() {
        return (
            <Fragment>
                {/*左侧部分*/}
                <div className="left-list-block">
                    <Loading loading={this.state.leftLoading} text='加载中...'>
                        <div className="left-block-title">
                            部门职位列表
                            <i className="iconfont icon-shuaxin block-control-btn" title='刷新'></i>
                        </div>
                        <div  style={{marginTop:'10px',paddingRight:'16px'}}>
                            <Input placeholder="输入关键字进行搜索" onChange={text=> this.leftTree.filter(text)} />
                        </div>
                        <div className="tree-container">
                            <Tree
                                ref={e=> this.leftTree = e}
                                data={this.state.leftList}
                                options={this.state.leftOptions}
                                highlightCurrent={true}
                                defaultExpandAll={true}
                                expandOnClickNode={false}
                                onNodeClicked={this.chooseItem.bind(this)}
                                renderContent={(...args)=>this.renderContent(...args)}
                                filterNodeMethod={(value, data, node)=>{
                                    if (!value) return true;
                                    if(node.data.description != null){
                                        return node.data.description.indexOf(value) !== -1;
                                    }else{
                                        return false;
                                    }
                                }}
                            />
                        </div>
                    </Loading>
                </div>
                {/*右侧部分*/}
                <div className="right-list-block">
                    <div className="right-block-title">
                        管理权限
                        <i onClick={this.refreshList.bind(this)} className="iconfont icon-shuaxin block-control-btn" title='刷新'></i>
                        <span onClick={this.toEditList.bind(this)} className="block-control-edit">
                            菜单管理
                            <i className="iconfont icon-bianjiguanli" title='菜单管理' style={{marginLeft:'5px'}}></i>
                        </span>
                    </div>
                    <Loading loading={this.state.rightLoading} text='加载中...'>
                        <div className="tree-container">
                            <Tree
                                ref={e=>this.tree = e}
                                data={this.state.rightList}
                                options={this.state.rightOptions}
                                nodeKey="ID"
                                isShowCheckbox={true}
                                highlightCurrent={true}
                                defaultExpandAll={true}
                                expandOnClickNode={false}
                                defaultCheckedKeys={this.state.checkedList}
                            />
                        </div>
                        <div className='confirm-btn-block'>
                            <Button onClick={this.confirm.bind(this)} disabled={this.state.currentSelected === ''} type='primary' style={{padding:'10px 50px',fontSize:'16px',letterSpacing:'4px'}}>确定</Button>
                        </div>
                    </Loading>
                </div>
            </Fragment>
        )
    }
}

export default withRouter(SetAuthority)