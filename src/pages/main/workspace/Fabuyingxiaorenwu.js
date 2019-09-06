import React, {Component,Fragment} from 'react';
import {withRouter} from "react-router-dom";
import {Layout, Select, DatePicker, Input, Button, Dialog, Loading, Tag, Cascader, Switch, Upload, MessageBox} from 'element-react';
import {Tree} from 'antd'
import baseUrl from '../../../utils/api'
import Http from '../../../utils/http'
import _ from 'lodash'

import './fabuyingxiaorenwu.scss'
import store from "../../../store"

const { TreeNode } = Tree

class Fabuyingxiaorenwu extends Component{
    constructor() {
        super()
        this.state={
            loading:true,
            typeList:[],
            typeInfoList:[],
            dialogVisible:false,
            userList:[],
            getTree:false, // 是否已获取到最外层tree数据
            userSelectedList:[], // 已勾选的人员列表
            approveList:[], // 审批人列表
            finalApproveIdList:[], // 审批人最终Id列表
            alreadyLoadList:[], // 已加载审批人的id列表
            approveOption:{
                value: 'id',
                label: 'name',
                children: 'list'
            }, // 审批人索引配置
            switchValue: true, // 考核分数开关
            uploadFileList:[], // 上传附件列表
            uploadExcelInfo: null, // 上传的excel文件
            uploadExcelPhone: null, // 上传的excel通讯录
            params:{
                type: "", // 任务类型
                indexTypeId: "", // 指标类型id
                indexValue: "", // 指标值
                taskStartTime: null, // 开始时间
                taskEndTime: null, // 结束时间
                title: "", // 任务标题
                description: "", // 任务描述
                executeUserIds: [], // 指定人员id
                approveUserIds: [], // 审批人员id
                score: "", // 考核积分
                fileVos: [], // 上传的文件
                template: {}, // 模板文件
                location: false, // 是否需要定位
                phone: false, // 是否需要打电话
                ReqImportClient:[
                    {phone:"",userName:""}
                ]  // 通讯录
            }
        }
    }

    componentWillUnmount() {
        this.setState = (state, callback) => {
            return
        }
    }

    componentDidMount(){
        this.getTypeList()
        this.getApproveList()
    }

    getTypeList(){
        this.setState({loading:true})
        Http.post('/task/type/list')
            .then(
                res=> {
                    console.log(res)
                    if(res.resultCode === 'success'){
                        this.setState({typeList: res.data.types, loading:false})
                    }else{
                        this.setState({loading:false})
                    }
                }
            )
            .catch(
                err=> {
                    console.log(err)
                    this.setState({loading:false})
                }
            )
    }

    // 设置任务类型
    getTypeInfo(id){
        if(id === this.state.params.type){
            return
        }
        let obj = _.assign({}, this.state.params)
        obj.indexTypeId = ""
        obj.indexValue = ""
        obj.type = id
        this.setState(
            {params: obj, typeInfoList: []},
            () => {
                let key = localStorage.getItem('userName')
                let params = {staffId:key,taskTypeId:id}
                Http.post('/task/indexType/list', params)
                    .then(res=>{
                        console.log(res)
                        let list = []
                        if(res.data != null && res.data.types != null){
                            list = res.data.types
                        }
                        this.setState({typeInfoList: list})
                    })
                    .catch(err=>{
                        console.log(err)
                    })
            }
        )
    }

    // 设置指标类型
    selectInsideType(id) {
        let obj = _.assign({}, this.state.params)
        obj.indexTypeId = id
        obj.indexValue = ""
        this.setState({params:obj})
    }

    // 更新数据
    updateMsg(type, val) {
        let obj = _.assign({},this.state.params)
        obj[type] = val
        this.setState({params:obj})
    }

    // 展示树形选择弹框
    showTreeDialog() {
        this.setState(
            {dialogVisible:true},
            ()=>{
                this.getUserList()
            }
        )
    }

    // 获取外层tree数据
    getUserList() {
        if(!this.state.getTree) {
            let key = localStorage.getItem('userName')
            let params = {
                flag: 0,
                nodeId: "",
                parentId: "",
                type: "",
                staffId: key
            }
            this.setState({treeLoading:true})
            Http.post('/task/findAssigneeList', params)
                .then(res => {
                    console.log(res)
                    let list = res.data.assigneeList
                    let len = list.length
                    for (let i = 0; i < len; i++) {
                        list[i].id = `${list[i].type}-${list[i].id}`
                    }
                    this.setState({userList: list, getTree: true, treeLoading: false})
                })
                .catch(err => {
                    console.log(err)
                })
        }else{
            return
        }
    }

    // 更新指定人员
    setUserList(key,e) {
        let type = e.node.props.dataRef.type
        let list = []
        if(type === 4){
            let info = {
                id: e.node.props.dataRef.id.split('-')[1],
                userName: e.node.props.dataRef.name
            }
            list = [info]
        }else{
            let userList = e.node.props.dataRef.users
            list = userList
        }

        let status = e.checked
        let userSelectedList = [...this.state.userSelectedList]

        if(status){
            let newList = _.concat(userSelectedList, list)
            this.setState({userSelectedList:newList})
        }else{
            let newList = _.filter(userSelectedList, (obj)=>{return _.findIndex(list, (insideObj)=>{return insideObj.id === obj.id}) === -1 })
            this.setState({userSelectedList:newList})
        }
    }

    onLoadData = treeNode =>
        new Promise(resolve => {
            if (treeNode.props.children) {
                resolve();
                return;
            }
            let key = localStorage.getItem('userName')
            let nodeId = treeNode.props.dataRef.id.split('-')[1]
            let parentId = treeNode.props.dataRef.parentId
            let type = treeNode.props.dataRef.type
            let params = {
                flag: 0,
                nodeId: nodeId,
                parentId: parentId,
                type: type,
                staffId: key
            }
            Http.post('/task/findAssigneeList',params)
                .then(res=>{
                    console.log(res)
                    let list = res.data.assigneeList
                    if(list != null && list.length > 0){
                        let len = list.length
                        for(let i = 0; i < len; i++){
                            list[i].id = `${list[i].type}-${list[i].id}`
                        }
                        treeNode.props.dataRef.children = list
                        this.setState({
                            userList: [...this.state.userList],
                        })
                        resolve()
                    }else{
                        treeNode.props.dataRef.children = null
                        resolve()
                    }
                })
        })

    renderTreeNodes =  data =>
        data.map(item => {
            if (item.children) {
                return (
                    <TreeNode title={item.name} key={item.id} dataRef={item}>
                        {this.renderTreeNodes(item.children)}
                    </TreeNode>
                )
            }
            return <TreeNode title={item.name} key={item.id} dataRef={item}/>
        })

    // 获取审批人员
    getApproveList(type=0,parentId="",nodeId="",currentApproveIdList=[]) {
        let key = localStorage.getItem('userName')
        let params = {
            type: type,
            parentId: parentId,
            nodeId: nodeId,
            flag: 1,
            staffId: key
        }
        Http.post('/task/findAssigneeList', params)
            .then(res=>{
                // console.log(res)
                // 获取请求数据
                let list = res.data.assigneeList

                if(list != null && list.length > 0){
                    if(list[0].type !== 4){
                        let len = list.length
                        for (let i = 0; i < len; i++) {
                            list[i].id = `${list[i].type}-${list[i].parentId}-${list[i].id}`
                            list[i].list = []
                        }
                    }else{
                        let len = list.length
                        for (let i = 0; i < len; i++) {
                            list[i].id = `${list[i].type}-${list[i].parentId}-${list[i].id}`
                            list[i].list = null
                        }
                    }
                    console.log(list)
                    this.updateApproveList(list, currentApproveIdList)
                }else{
                    this.updateApproveList([], currentApproveIdList)
                }
            })
    }

    // 动态加载审批人员
    handleApproveChange(data) {
        let idList = [...data]
        let id = idList.slice(-1)[0]

        let list = [...this.state.alreadyLoadList]
        let index = _.indexOf(list,id)
        if(index === -1){
            list.push(id)
            let type = id.split('-')[0]
            let parentId = id.split('-')[1]
            let nodeId = id.split('-')[2]
            this.setState(
                {alreadyLoadList:list},
                ()=>{
                    this.getApproveList(type, parentId, nodeId, idList)
                }
            )
        }else{
            return
        }
    }

    // 更新审批人tree形数据
    updateApproveList(list,idList){
        console.log(idList)
        let data = this.state.approveList
        if(list.length > 0){
            if(data.length === 0){
                this.setState({approveList:list})
            }else{
                let len = idList.length
                let objList = data
                for(let i = 0; i < len; i++){
                    let newObj = _.find(objList, (item)=>{return item.id === idList[i]})
                    if(i < len - 1){
                        objList = newObj.list
                    }else{
                        objList = newObj
                    }
                }
                objList.list = list
                this.setState({approveList:data})
            }
        }else{
            let len = idList.length
            let objList = data
            for(let i = 0; i < len; i++){
                let newObj = _.find(objList, (item)=>{return item.id === idList[i].id})
                if(i < len - 1){
                    objList = newObj.list
                }else{
                    objList = newObj
                }
            }
            objList.list = null
            this.setState({approveList:data})
        }
    }

    // 成功上传附件
    successUploadFile(res) {
        console.log(res)
        let fileInfo = res.data
        let item = {name:fileInfo.fileName, url:fileInfo.fileUrl}
        let list = this.state.uploadFileList
        list.push(item)
        this.setState({uploadFileList: list})
    }

    // 删除已上传的附件
    deleteUploadedFile(res) {
        console.log(res)
        if(res.response == null){return}
        let fileInfo = res.response.data
        let item = {name:fileInfo.fileName, url:fileInfo.fileUrl}
        let list = this.state.uploadFileList
        let index = _.findIndex(list, (obj)=>{return obj.url === item.url})
        list.splice(index, 1)
        this.setState({uploadFileList: list})
    }

    // 成功上传excel文件
    successUploadExcel(res) {
        let info = {name: res.data.fileName, url: res.data.fileUrl}
        this.setState({uploadExcelInfo:info})
    }

    // 删除已上传的excel文件
    deleteUploadedExcel(res) {
        this.setState({uploadExcelInfo:null})
    }

    // 成功上传通讯录Excel
    successUploadPhone(res) {
        console.log(res)
        if(res.resultCode === 'success'){
            let list = res.data
            console.log(list)
            if(list.length > 0){
                let params = this.state.params
                params.ReqImportClient = list
                this.setState({params:params})
            }else{
                MessageBox.msgbox({
                    title:'提示',
                    message:'您未录入通讯录数据，请录入通讯录数据再上传!',
                    type:'error'
                })
                this.uploadPhone.clearFiles()
            }
        }else{
            MessageBox.msgbox({
                title:'提示',
                message:'请输入固定格式的Excel文件，具体可参考模板!',
                type:'error'
            })
            this.uploadPhone.clearFiles()
        }
    }

    // 删除通讯录Excel
    deleteUploadedPhone(res) {
        console.log(res)
        let params = this.state.params
        params.ReqImportClient = []
        this.setState({uploadExcelPhone:null, params:params})
    }

    // 发布
    mergeParams() {
        this.setState({loading:true})

        let params = this.state.params

        let executeUserIds = []
        _.forEach(this.state.userSelectedList, (obj)=>{executeUserIds.push(obj.id)})
        params.executeUserIds = executeUserIds

        let approve = this.state.finalApproveIdList.splice(-1)[0]
        let approveId
        if(approve != null){
            if(parseInt(approve.split('-')[0]) === 4){
                approveId = approve.split('-')[2]
            }else{
                approveId = null
            }
        }else{
            approveId = null
        }
        params.approveUserIds = approveId != null ? [approveId] : []

        if(!this.state.switchValue){params.score = ""}

        let fileVos = []
        _.forEach(this.state.uploadFileList, (obj)=>{fileVos.push({fileName:obj.name, fileUrl: obj.url})})
        params.fileVos = fileVos

        let template = {}
        if(this.state.uploadExcelInfo != null){
            template.fileName = this.state.uploadExcelInfo.name
            template.fileUrl = this.state.uploadExcelInfo.url
        }else{
            template = null
        }
        params.template = template


        this.validateParams(params)
    }

    validateParams(data) {
        if(data.type !== ""){
            if(this.state.typeInfoList.length > 0 && data.indexTypeId === ""){
                MessageBox.msgbox({
                    title:'提示',
                    message:'请选择指标类型!',
                    type:'error'
                })
                this.setState({loading:false})
                return false
            }else{
                if(this.state.typeInfoList.length > 0 && data.indexValue === ""){
                    MessageBox.msgbox({
                        title:'提示',
                        message:'请选择指标值!',
                        type:'error'
                    })
                    this.setState({loading:false})
                    return false
                }else{
                    if(data.taskStartTime == null || data.taskEndTime == null){
                        MessageBox.msgbox({
                            title:'提示',
                            message:'请设置任务时间!',
                            type:'error'
                        })
                        this.setState({loading:false})
                        return false
                    }else{
                        if(data.title !== ""){
                            if(data.executeUserIds.length > 0){
                                if(data.phone || data.location) {
                                    if(data.ReqImportClient.length > 0){
                                        this.confirm(data)
                                    }else{
                                        MessageBox.msgbox({
                                            title:'提示',
                                            message:'请上传通讯录!',
                                            type:'error'
                                        })
                                        this.setState({loading:false})
                                        return false
                                    }
                                }else{
                                    this.confirm(data)
                                }
                            }else{
                                MessageBox.msgbox({
                                    title:'提示',
                                    message:'请选择指定人员!',
                                    type:'error'
                                })
                                this.setState({loading:false})
                                return false
                            }
                        }else{
                            MessageBox.msgbox({
                                title:'提示',
                                message:'请设置任务内容!',
                                type:'error'
                            })
                            this.setState({loading:false})
                            return false
                        }
                    }
                }
            }
        }else{
            MessageBox.msgbox({
                title:'提示',
                message:'请选择任务类型!',
                type:'error'
            })
            this.setState({loading:false})
            return false
        }
    }

    confirm(data){
        let key = localStorage.getItem('userName')
        let params = _.assign({staffId:key}, data)
        Http.post('/task/start',params)
            .then(res=>{
                console.log(res)
                this.setState({loading:false})
                if(res.resultCode === 'success'){
                    MessageBox.confirm('发布任务成功，前往任务列表!', '提示', {
                        type: 'success'
                    }).then(() => {
                        store.dispatch({type: 'change_Current_flag', value: '2-1-2'})
                    }).catch(() => {
                        store.dispatch({type: 'change_Current_flag', value: '2-1-2'})
                    })
                }else{
                    MessageBox.msgbox({
                        title:'提示',
                        message: res.resultMsg,
                        type:'error'
                    })
                }
            })
            .catch(err=>{
                console.log(err)
                this.setState({loading:false})
            })
    }

    render(){
        return(
            <div className='task-box'>
                <div className="left-block">
                    <div className="left-block-title">基础模块</div>
                    <Loading loading={this.state.loading}>
                        <div className="left-block-box">
                            <Layout.Row className='left-list-item'>
                                <Layout.Col span={3} className='input-label'>任务类型<span className="input-star-badge">*</span></Layout.Col>
                                <Layout.Col span={12} style={{paddingLeft:"40px"}}>
                                    <Select value={this.state.params.type} style={{width:'100%'}} onChange={this.getTypeInfo.bind(this)} placeholder='选择任务类型'>
                                        {
                                            this.state.typeList.map(el=>
                                                <Select.Option key={el.ID} label={el.NAME} value={el.ID}/>
                                            )
                                        }
                                    </Select>
                                </Layout.Col>
                            </Layout.Row>
                            <Layout.Row className='left-list-item' style={this.state.typeInfoList.length > 0 ? {} : {display:'none'}}>
                                <Layout.Col span={3} className='input-label'>指标类型<span className="input-star-badge">*</span></Layout.Col>
                                <Layout.Col span={12} style={{paddingLeft:"40px"}}>
                                    <Select value={this.state.params.indexTypeId} style={{width:'100%'}} placeholder='选择指标类型' onChange={this.selectInsideType.bind(this)}>
                                        {
                                            this.state.typeInfoList.map(el=>
                                                <Select.Option key={el.indexTypeId} label={el.typeName} value={el.indexTypeId}/>
                                            )
                                        }
                                    </Select>
                                </Layout.Col>
                            </Layout.Row>
                            <Layout.Row className='left-list-item' style={this.state.params.indexTypeId === "" ? {display:'none'} : {}}>
                                <Layout.Col span={3} className='input-label'>{_.find(this.state.typeInfoList,(obj)=>{return obj.indexTypeId === this.state.params.indexTypeId}) != null ? _.find(this.state.typeInfoList,(obj)=>{return obj.indexTypeId === this.state.params.indexTypeId}).indexName : null}<span className="input-star-badge">*</span></Layout.Col>
                                <Layout.Col span={12} style={{paddingLeft:"40px"}}>
                                    <Input value={this.state.params.indexValue} placeholder='请输入对应类型的数值' onChange={this.updateMsg.bind(this,'indexValue')} type='text' append={_.find(this.state.typeInfoList,(obj)=>{return obj.indexTypeId === this.state.params.indexTypeId}) != null ? _.find(this.state.typeInfoList,(obj)=>{return obj.indexTypeId === this.state.params.indexTypeId}).unit : null}/>
                                </Layout.Col>
                            </Layout.Row>
                            <Layout.Row className='left-list-item'>
                                <Layout.Col span={3} className='input-label'>开始时间<span className="input-star-badge">*</span></Layout.Col>
                                <Layout.Col span={12} style={{paddingLeft:"40px"}}>
                                    <DatePicker
                                        value={this.state.params.taskStartTime != null ? new Date(this.state.params.taskStartTime) : null}
                                        isShowTime={true}
                                        placeholder="选择日期"
                                        onChange={date=>{
                                            let obj = _.assign({},this.state.params)
                                            if(date != null){
                                                let time = date.getTime()
                                                obj.taskStartTime = time
                                            }else{
                                                obj.taskStartTime = null
                                            }
                                            this.setState({params: obj})
                                        }}
                                        disabledDate={time=>time.getTime() < Date.now() - 8.64e7}
                                    />
                                </Layout.Col>
                            </Layout.Row>
                            <Layout.Row className='left-list-item'>
                                <Layout.Col span={3} className='input-label'>结束时间<span className="input-star-badge">*</span></Layout.Col>
                                <Layout.Col span={12} style={{paddingLeft:"40px"}}>
                                    <DatePicker
                                        value={this.state.params.taskEndTime != null ? new Date(this.state.params.taskEndTime) : null}
                                        isShowTime={true}
                                        placeholder="选择日期"
                                        onChange={date=>{
                                            let obj = _.assign({},this.state.params)
                                            if(date != null){
                                                let time = date.getTime()
                                                obj.taskEndTime = time
                                            }else{
                                                obj.taskEndTime = null
                                            }
                                            this.setState({params: obj})
                                        }}
                                        disabledDate={time=>{
                                            if(this.state.params.taskStartTime != null){
                                                return time.getTime() < this.state.params.taskStartTime + 8.64e7
                                            }else{
                                                return null
                                            }
                                        }}
                                    />
                                </Layout.Col>
                            </Layout.Row>
                            <Layout.Row className='left-list-item'>
                                <Layout.Col span={3} className='input-label'>任务内容<span className="input-star-badge">*</span></Layout.Col>
                                <Layout.Col span={12} style={{paddingLeft:"40px"}}>
                                    <Input value={this.state.params.title} onChange={this.updateMsg.bind(this,'title')} style={{width:'100%'}} placeholder='请输入任务标题'/>
                                </Layout.Col>
                            </Layout.Row>
                            <Layout.Row className='left-list-item'>
                                <Layout.Col span={3} className='input-label'>任务详细</Layout.Col>
                                <Layout.Col span={12} style={{paddingLeft:"40px"}}>
                                    <Input
                                        type="textarea"
                                        style={{height:'138px'}}
                                        value={this.state.params.description}
                                        autosize={{ minRows: 6, maxRows: 10}}
                                        onChange={this.updateMsg.bind(this,'description')}
                                        placeholder="请输入任务内容"
                                    />
                                </Layout.Col>
                            </Layout.Row>
                            <Layout.Row className='left-list-item'>
                                <Layout.Col span={3} className='input-label'>指定人员<span className="input-star-badge">*</span></Layout.Col>
                                <Layout.Col span={12} style={{paddingLeft:"40px"}}>
                                    <Button onClick={this.showTreeDialog.bind(this)} type='primary' size='small' style={{marginTop:'5px'}}>点击批量选择</Button>
                                    <div className='user-list-box' style={this.state.userSelectedList.length > 0 ? {} : {display:'none'}}>
                                        {
                                            this.state.userSelectedList.length > 0
                                            ?
                                            this.state.userSelectedList.map(el=>
                                                <Tag key={el.id} type="primary" style={{marginRight:'10px',marginBottom:'10px'}}>{el.userName}</Tag>
                                            )
                                            :
                                            <div style={{lineHeight:'90px',textAlign:'center',color:'#999999'}}>暂未指定人员</div>
                                        }
                                    </div>
                                </Layout.Col>
                            </Layout.Row>
                            <Layout.Row className='left-list-item'>
                                <Layout.Col span={3} className='input-label'>审批人</Layout.Col>
                                <Layout.Col span={12} style={{paddingLeft:"40px"}}>
                                    <Cascader
                                        value={this.state.finalApproveIdList}
                                        props={this.state.approveOption}
                                        options={this.state.approveList}
                                        activeItemChange={this.handleApproveChange.bind(this)}
                                        onChange={(val)=>{this.setState({finalApproveIdList:val})}}
                                    />
                                </Layout.Col>
                            </Layout.Row>
                            <Layout.Row className='left-list-item'>
                                <Layout.Col span={3} className='input-label'>考核分数</Layout.Col>
                                <Layout.Col span={12} style={{paddingLeft:"40px"}}>
                                    <Input
                                        value={this.state.params.score}
                                        onChange={ this.updateMsg.bind(this, 'score')}
                                        style={{width:'100%'}}
                                        disabled={!this.state.switchValue}
                                        append={
                                            <Switch
                                                value={this.state.switchValue}
                                                onChange={(val)=>{
                                                    this.setState({switchValue:val})
                                                }}
                                                onColor="#13ce66"
                                                offColor="#ff4949"
                                            >
                                            </Switch>
                                        }
                                    />
                                </Layout.Col>
                            </Layout.Row>
                            <Layout.Row className='left-list-item'>
                                <Layout.Col span={3} className='input-label'>上传附件</Layout.Col>
                                <Layout.Col span={12} style={{paddingLeft:"40px"}}>
                                    <Upload
                                        action={`${baseUrl}file/singleUpload`}
                                        headers={{'Authorization': localStorage.getItem('authorization')}}
                                        limit={5}
                                        fileList={this.state.uploadFileList}
                                        onExceed={()=>{
                                            MessageBox.msgbox({
                                                title:'提示',
                                                message:'附件最多只能上传5个!',
                                                type:'error'
                                            })
                                        }}
                                        onSuccess={this.successUploadFile.bind(this)}
                                        onRemove={this.deleteUploadedFile.bind(this)}
                                        onError={(err)=>{
                                            console.log(err)
                                            MessageBox.msgbox({
                                                title:'提示',
                                                message:'上传失败!',
                                                type:'error'
                                            })
                                        }}
                                        tip={<div className="el-upload__tip">附件最多支持上传5个</div>}
                                    >
                                        <Button size="small" type="primary" style={{marginTop:'5px'}}>点击上传</Button>
                                    </Upload>
                                </Layout.Col>
                            </Layout.Row>
                            <Layout.Row className='left-list-item'>
                                <Layout.Col span={3} className='input-label'>上传模板</Layout.Col>
                                <Layout.Col span={12} style={{paddingLeft:"40px"}}>
                                    <Upload
                                        ref={e=>this.upload = e}
                                        action={`${baseUrl}file/singleUpload`}
                                        headers={{'Authorization': localStorage.getItem('authorization')}}
                                        limit={1}
                                        fileList={this.state.uploadExcelInfo == null ? [] : [this.state.uploadExcelInfo]}
                                        beforeUpload={(file)=>{
                                            let str = file.name.substring(file.name.lastIndexOf(".")).toLowerCase()
                                            if(str === '.xlsx' || str === '.xls'){
                                                return true
                                            }else{
                                                MessageBox.msgbox({
                                                    title:'提示',
                                                    message:'请选择Excel文件上传!',
                                                    type:'error'
                                                })
                                                this.upload.clearFiles()
                                                return false
                                            }
                                        }}
                                        onExceed={()=>{
                                            MessageBox.msgbox({
                                                title:'提示',
                                                message:'最多只能上传一个Excel模板!',
                                                type:'error'
                                            })
                                        }}
                                        onSuccess={this.successUploadExcel.bind(this)}
                                        onRemove={this.deleteUploadedExcel.bind(this)}
                                        onError={(err)=>{
                                            console.log(err)
                                            MessageBox.msgbox({
                                                title:'提示',
                                                message:'上传失败!',
                                                type:'error'
                                            })
                                        }}
                                        tip={<div className="el-upload__tip">只支持上传Excel文件</div>}
                                    >
                                        <Button size="small" type="primary" style={{marginTop:'5px'}}>点击上传</Button>
                                    </Upload>
                                </Layout.Col>
                            </Layout.Row>
                            <Layout.Row className='left-list-item'>
                                <Layout.Col span={3} className='input-label'>通话</Layout.Col>
                                <Layout.Col span={12} style={{paddingLeft:"40px"}}>
                                    <Switch
                                        style={{marginTop:'8px'}}
                                        value={this.state.params.phone}
                                        onChange={this.updateMsg.bind(this,'phone')}
                                        onColor="#13ce66"
                                        offColor="#ff4949"
                                    >
                                    </Switch>
                                </Layout.Col>
                            </Layout.Row>
                            <Layout.Row className='left-list-item'>
                                <Layout.Col span={3} className='input-label'>定位</Layout.Col>
                                <Layout.Col span={12} style={{paddingLeft:"40px"}}>
                                    <Switch
                                        style={{marginTop:'8px'}}
                                        value={this.state.params.location}
                                        onChange={this.updateMsg.bind(this,'location')}
                                        onColor="#13ce66"
                                        offColor="#ff4949"
                                    >
                                    </Switch>
                                </Layout.Col>
                            </Layout.Row>
                            <Layout.Row className='left-list-item' style={this.state.params.location || this.state.params.phone ? {} : {display:'none'}}>
                                <Layout.Col span={3} className='input-label'>上传通讯录<span className="input-star-badge">*</span></Layout.Col>
                                <Layout.Col span={12} style={{paddingLeft:"40px"}}>
                                    <Upload
                                        ref={e=>this.uploadPhone = e}
                                        action={`${baseUrl}resolve/upload`}
                                        headers={{'Authorization': localStorage.getItem('authorization')}}
                                        limit={1}
                                        fileList={this.state.uploadExcelPhone == null ? [] : [this.state.uploadExcelPhone]}
                                        beforeUpload={(file)=>{
                                            let str = file.name.substring(file.name.lastIndexOf(".")).toLowerCase()
                                            if(str === '.xlsx' || str === '.xls'){
                                                return true
                                            }else{
                                                MessageBox.msgbox({
                                                    title:'提示',
                                                    message:'请选择Excel文件上传!',
                                                    type:'error'
                                                })
                                                this.uploadPhone.clearFiles()
                                                return false
                                            }
                                        }}
                                        onExceed={()=>{
                                            MessageBox.msgbox({
                                                title:'提示',
                                                message:'最多只能上传一个Excel通讯录!',
                                                type:'error'
                                            })
                                        }}
                                        onSuccess={this.successUploadPhone.bind(this)}
                                        onRemove={this.deleteUploadedPhone.bind(this)}
                                        onError={(err)=>{
                                            console.log(err)
                                            MessageBox.msgbox({
                                                title:'提示',
                                                message:'上传失败!',
                                                type:'error'
                                            })
                                        }}
                                        tip={<div className="el-upload__tip">只支持上传固定格式的Excel文件，可参考模板。（<a download href={`${baseUrl}document/通讯录.xlsx`} className='download-btn'>点击下载模板</a>）</div>}
                                    >
                                        <Button size="small" type="primary" style={{marginTop:'5px'}}>点击上传</Button>
                                    </Upload>
                                </Layout.Col>
                            </Layout.Row>
                        </div>

                        <div className='confirm-btn-block'>
                            <Button type='primary' style={{width:'160px',fontSize: '16px'}} onClick={this.mergeParams.bind(this)}>提交</Button>
                        </div>
                    </Loading>
                </div>
                {/*<div className="right-block">*/}
                    {/*<p className="right-block-title">*/}
                        {/*我的自定义*/}
                        {/*<i className="iconfont icon-bianji"></i>*/}
                    {/*</p>*/}
                    {/*<div className='right-block-container'>*/}
                        {/*<div className="right-add-btn"></div>*/}
                        {/*<p className='right-btn-desc'>您还没有任何自定义组件，赶快去创建把。</p>*/}
                    {/*</div>*/}
                {/*</div>*/}

                <Dialog
                    title="选择指定人员"
                    size="small"
                    visible={ this.state.dialogVisible }
                    onCancel={ () => this.setState({ dialogVisible: false }) }
                    lockScroll={ false }
                >
                    <Dialog.Body>
                        <Loading loading={this.state.treeLoading}>
                            <div className='tree-box'>
                                <Tree
                                    checkable
                                    loadData={this.onLoadData}
                                    onCheck={this.setUserList.bind(this)}
                                >
                                    {this.renderTreeNodes(this.state.userList)}
                                </Tree>
                            </div>
                        </Loading>
                    </Dialog.Body>
                </Dialog>
            </div>
        )
    }
}
export default withRouter(Fabuyingxiaorenwu)