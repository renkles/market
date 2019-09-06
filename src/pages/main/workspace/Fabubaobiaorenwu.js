import React, {Component, Fragment} from 'react';
import {withRouter} from "react-router-dom";
import {Layout, Input, DatePicker, Button, Loading, Pagination, MessageBox, Cascader, Switch, Radio} from 'element-react'
import Http from '../../../utils/http'
import _ from 'lodash'
import store from "../../../store"
import XLSX from 'xlsx'
import HandsonTable from '../../../components/handsonTable/HandsonTable'

import './fabubaobiaorenwu.scss'
import '../../../iconfont/iconfont.css'

class Fabubaobiaorenwu extends Component {
    constructor(props) {
        super(props)
        this.state = {
            userType:null, // 用户身份
            params: {
                title: "",
                description: "",
                taskStartTime: null,
                taskEndTime: null,
                excelJson: {
                    data:[],
                    info:{fileName:null, primary:null, sendTime:null, taskTitle:null}
                },
                presidentType: "1",
                approveUserIds: [],
                score: ""
            }, // 发布任务参数
            loading:false,
            approveOption:{
                value: 'id',
                label: 'name',
                children: 'list'
            }, // 获取审批人列表配置
            approveList:[], // 审批人列表
            finalApproveIdList:[], // 审批人最终Id列表
            alreadyLoadList:[], // 已加载审批人的id列表
            switchValue:false, // 考核分数开关
            excelEditorShow:false, // 编辑器窗口
            editorOptions:{
                colHeaders: true,
                rowHeaders:true,
                minCols: 32,
                minRows: 30,
                width:'100%',
                height: 670,
            }, // excel编辑器配置
            excelData:[[]], // excel数据
            excelName:"", // 模板文件名称
            historyBlockShow:false, // 历史模板窗口
            templateLoading:false,
            historyTemplate:null, // 历史模板列表
            historyOption:{
                page: 1,
                pageSize: 10
            } , // 历史模板分页查询
            listTotal:1,
            radioStatus:false, // radio框状态
        }
    }

    componentDidMount() {
        let userType = localStorage.getItem('homepageType')
        this.setState({userType:userType})
        console.log(userType)
        this.getApproveList()
    }

    // 更新数据
    updateMsg(type, val) {
        let obj = this.state.params
        obj[type] = val
        this.setState({params:obj})
    }

    // 选取任务模板
    handleFileChange(e) {
        if(this.state.excelName != null && this.state.excelName !== ""){
            MessageBox.msgbox({
                title:'提示',
                message:'最多只能上传一个任务模板!',
                type:'error'
            })
        }else {
            let _this = this
            let file = e.target.files[0]
            let str = file.name.substring(file.name.lastIndexOf(".")).toLowerCase()
            if (str === '.xlsx' || str === '.xls') {
                const Reader = new FileReader()
                Reader.onload = function (e) {
                    let data = e.target.result
                    let workbook = XLSX.read(data, {type: 'binary'})
                    let sheetNames = workbook.SheetNames // 工作表名称集合
                    let worksheet = workbook.Sheets[sheetNames[0]] // 读取第一张sheet
                    let dataArray = XLSX.utils.sheet_to_json(worksheet,{header:1}) // 获取二维数组
                    let merges = worksheet['!merges']

                    // 重组合并的单元格
                    if(merges != null){
                        for(let i = 0; i < merges.length; i++){
                            let startC = merges[i].s.c
                            let startR = merges[i].s.r

                            let val = dataArray[startR][startC]

                            let endC = merges[i].e.c
                            let endR = merges[i].e.r

                            for(let j = startC; j < endC + 1; j++){
                                for(let k = startR; k < endR + 1; k++){
                                    console.log(k,j)
                                    dataArray[k][j] = val
                                }
                            }
                        }
                    }

                    // 剔除无key的数据
                    for(let i = 1; i < dataArray.length; i++){
                        let len = dataArray[0].length
                        let result = dataArray[i].slice(0,len)

                        let isEmpty = true
                        _.forEach(result,(val)=>{
                            if(val != null){
                                isEmpty = false
                            }
                        })

                        if(isEmpty){
                            dataArray.splice(i,1)
                            --i
                        }else{
                            dataArray[i] = result
                        }
                    }

                    if(dataArray.length > 0){
                        console.log(dataArray)
                        _this.setState({excelData:dataArray,excelName:file.name})
                    }else{
                        MessageBox.msgbox({
                            title: '提示',
                            message: 'excel数据为空!',
                            type: 'error'
                        })
                    }
                }
                Reader.readAsBinaryString(file)
            } else {
                MessageBox.msgbox({
                    title: '提示',
                    message: '请选择Excel类型的文件!',
                    type: 'error'
                })
            }
        }
    }

    // 打开excel编辑器
    showExcelEdit() {
        if(!this.state.excelEditorShow) {
            this.setState(
                {excelEditorShow:true},
                // ()=>{
                //     console.log(this.state.excelData)
                // }
            )
        }
    }

    // 关闭excel编辑器
    closeExcel(){
        this.setState({excelEditorShow:false})
    }

    // // 编辑excel模板
    // updateExcel(cell) {
    //     let row = cell[0][0]
    //     let col = cell[0][1]
    //     let val = cell[0][3]
    //     let excelData = this.state.excelData
    //     excelData[row][col] = val === "" ? null : val
    //     this.setState({excelData:excelData})
    // }

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

    // 整合发布参数
    mergeParams() {
        this.setState({loading:true})
        let params = this.state.params


        // 设置优先配置
        if(!this.state.radioStatus){params.presidentType = "1"}
        // 设置审批人
        let approve = [...this.state.finalApproveIdList].splice(-1)[0]
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

        // 设置考核分数
        if(!this.state.switchValue){params.score = ""}

        // 设置excel数据
        if(this.state.excelData.length > 0 && this.state.excelData[0].length > 0  && this.state.excelName !== ""){
            let data = this.state.excelData
            let keyArr = data[0]
            let keyIndex = 0
            for(let i = 0; i < keyArr.length; i++){
                if(keyArr[i] != null){
                    if(keyArr[i].toString().indexOf('*') !== -1){
                        keyIndex = i
                    }
                }
            }
            let primary = keyArr[keyIndex] != null && keyArr[keyIndex] !== "" ? keyArr[keyIndex] : "*" // 主键

            // 二维数组转json
            let json = []
            for(let i = 1; i < data.length; i++){
                let item = {}
                for(let j = 0; j < data[0].length; j++){
                    let key = data[0][j]
                    if(key != null && key !== ""){
                        if(j === keyIndex){
                            if(key === ""){key = "*"}
                        }
                        if(key != null && key !== ""){
                            let itemVal = data[i][j] == null ? "" : data[i][j]
                            item[key] = itemVal
                        }
                    }
                }
                json.push(item)
            }
            // 剔除空数据
            for(let i = 0; i < json.length; i++){
                let isEmpty = true
                _.forEach(json[i],(val)=>{
                    if(val != null && val !== ""){
                        isEmpty = false
                    }
                })
                if(isEmpty){
                    json.splice(i, 1)
                    --i
                }
            }
            let title = this.state.params.title
            let time = new Date().getTime()
            let excelInfo = {fileName:this.state.excelName, primary:primary, sendTime:time, taskTitle:title}

            params.excelJson.data = json
            params.excelJson.info = excelInfo
            console.log(json)
            if(json.length === 0){
                MessageBox.msgbox({
                    title:'提示',
                    message:'模板内容不能为空，请添加内容!',
                    type:'error'
                })
                this.setState({loading:false})
                return
            }
        }else{
            MessageBox.msgbox({
                title:'提示',
                message:'模板内容不能为空，请添加内容!',
                type:'error'
            })
            this.setState({loading:false})
            return
        }

        this.validateParams(params)
    }

    // 验证发布任务参数
    validateParams(params) {
        if(params.title.replace(/^$| /g,'') !== ""){
            if(params.description.replace(/^$| /g,'') !== ""){
                if(params.taskStartTime != null && params.taskEndTime != null){
                    this.confirm(params)
                }else{
                    MessageBox.msgbox({
                        title:'提示',
                        message:'请设置任务时间!',
                        type:'error'
                    })
                    this.setState({loading:false})
                }
            }else{
                MessageBox.msgbox({
                    title:'提示',
                    message:'任务内容不能为空，请填写内容!',
                    type:'error'
                })
                this.setState({loading:false})
            }
        }else{
            MessageBox.msgbox({
                title:'提示',
                message:'任务标题不能为空，请填写标题!',
                type:'error'
            })
            this.setState({loading:false})
        }
    }

    // 发布任务
    confirm(params){
        let key = localStorage.getItem('userName')
        params.staffId = key
        Http.post('/reportTask/start',params)
            .then(res=>{
                console.log(res)
                if(res.resultCode === 'success'){
                    this.setState(
                        {
                            loading:false,
                            excelData:[[]], // excel数据
                            excelName:"", // 模板文件名称
                            finalApproveIdList:[],
                            historyTemplate:null,
                            listTotal:1,
                            params: {
                                title: "",
                                description: "",
                                taskStartTime: null,
                                taskEndTime: null,
                                excelJson: {
                                    data:[],
                                    info:{fileName:null, primary:null, sendTime:null, taskTitle:null}
                                },
                                approveUserIds: [],
                                score: ""
                            }
                        },
                        ()=>{
                            MessageBox.confirm('发布任务成功，前往任务列表!', '提示', {
                                type: 'success'
                            }).then(() => {
                                store.dispatch({type: 'change_Current_flag', value: '2-1-3'})
                            }).catch(() => {
                                console.log('用户点击取消')
                            })
                        }
                    )
                }else{
                    MessageBox.msgbox({
                        title:'提示',
                        message:res.resultMsg,
                        type:'error'
                    })
                    this.setState({loading:false})
                }
            })
            .catch(err=>{
                console.log(err)
                this.setState({loading:false})
            })
    }


    // 展示历史模板
    showExcelTemplate(e) {
        e.stopPropagation()
        if(this.state.historyTemplate != null){
            this.setState({historyBlockShow:true})
        }else{
            this.setState(
                {historyBlockShow:true},
                ()=>{
                    this.getHistoryTemplate()
                }
            )
        }
    }

    // 获取历史模板
    getHistoryTemplate() {
        this.setState({templateLoading:true})
        let key = localStorage.getItem('userName')
        let params = _.assign({staffId:key},this.state.historyOption)
        Http.post('/reportTask/getTempleteExcels',params)
            .then(res=>{
                console.log(res)
                if(res.resultCode === 'success'){
                    let total = res.data.total
                    let list = res.data.templeteExcels
                    this.setState({templateLoading:false,listTotal:total,historyTemplate:list})
                }else{
                    this.setState({templateLoading:false})
                    MessageBox.msgbox({
                        title:'提示',
                        message:'获取历史模板失败!',
                        type:'error'
                    })
                }
            })
            .catch(err=>{
                console.log(err)
                this.setState({templateLoading:false})
            })
    }

    // 导入历史模板
    updateTemplateByHistory(id) {
        // console.log(id)
        MessageBox.confirm('确定导入历史Excel模板作为当前任务模板!', '提示', {
            type: 'info'
        }).then(() => {
            let currentItem = _.find(this.state.historyTemplate,(obj)=>{return obj.id === id})
            if(currentItem != null){
                let dataObj = JSON.parse(currentItem.excelJson)
                let json = dataObj.data
                let info = dataObj.info
                // map结构转二维数组
                let resultArr = []
                let keyArr = _.keys(json[0])
                resultArr.push(keyArr)
                for(let i = 0; i < json.length; i++){
                    let childArr = []
                    _.forEach(json[i],(val,key)=>{
                        let valIndex = _.indexOf(keyArr,key)
                        if(valIndex !== -1){
                            childArr[valIndex] = val
                        }
                    })
                    resultArr.push(childArr)
                }
                let fileName = info.fileName
                this.setState({excelData: resultArr, excelName: fileName, historyBlockShow:false})
            }else{
                MessageBox.msgbox({
                    title:'提示',
                    message:'导入模板内容失败!',
                    type:'error'
                })
            }
        }).catch(() => {
            console.log('取消')
        })
    }

    // 删除当前模板
    deleteHistoryTemplate(id) {
        let _this = this
        MessageBox.confirm('确定删除该历史Excel模板!', '提示', {
            type: 'error'
        }).then(()=>{
            _this.setState(
                {templateLoading:true},
                ()=>{
                    let key = localStorage.getItem('userName')
                    let params = {staffId: key, templeteId: id}
                    Http.post('/reportTask/delTempleteExcel',params)
                        .then(res=>{
                            console.log(res)
                            if(res.resultCode === "success"){
                                MessageBox.msgbox({
                                    title:'提示',
                                    message:'成功删除历史模板!',
                                    type:'success'
                                })
                                _this.getHistoryTemplate()
                            }else{
                                _this.setState({templateLoading:false})
                                MessageBox.msgbox({
                                    title:'提示',
                                    message:'删除历史模板失败!',
                                    type:'error'
                                })
                            }
                        })
                        .catch(err=>{
                            console.log(err)
                            _this.setState({templateLoading:false})
                        })
                }
            )
        }).catch(() => {
            console.log('取消')
        })

    }

    // 切换页面
    changeHistoryListPage(num) {
        console.log(num)
        let searchOption = _.assign({},this.state.historyOption)
        searchOption.page = num
        this.setState(
            {historyOption:searchOption},
            ()=>{
                this.getHistoryTemplate()
            }
        )
    }

    render() {
        return  (
            <div style={{position:'relative'}} onClick={()=>{this.setState({historyBlockShow:false})}}>
                {/*发布任务*/}
                <div className="form-task-block" style={this.state.excelEditorShow ? {transform:"translateX(-120%)"} : {}}>
                    <Loading loading={this.state.loading} text='提交...'>
                        <div className="form-task-title">发布填报任务</div>
                        <div className="form-task-content">
                            <Layout.Row className='form-task-item'>
                                <Layout.Col span={3} className='input-label'>标题<span className="input-star-badge">*</span></Layout.Col>
                                <Layout.Col span={12} style={{paddingLeft:"40px"}}>
                                    <Input maxLength={18} placeholder='请填写任务标题' onChange={this.updateMsg.bind(this,'title')} value={this.state.params.title}/>
                                </Layout.Col>
                            </Layout.Row>
                            <Layout.Row className='form-task-item'>
                                <Layout.Col span={3} className='input-label'>内容<span className="input-star-badge">*</span></Layout.Col>
                                <Layout.Col span={12} style={{paddingLeft:"40px"}}>
                                    <Input maxLength={168} type='textarea' placeholder='请输入任务描述(不超过168个字)' onChange={this.updateMsg.bind(this,'description')} value={this.state.params.description} autosize={{ minRows: 2, maxRows: 4}}/>
                                </Layout.Col>
                            </Layout.Row>
                            <Layout.Row className='form-task-item'>
                                <Layout.Col span={3} className='input-label'>开始日期:<span className="input-star-badge">*</span></Layout.Col>
                                <Layout.Col span={12} style={{paddingLeft:"40px"}}>
                                    <DatePicker
                                        value={this.state.params.taskStartTime != null ? new Date(this.state.params.taskStartTime) : null}
                                        placeholder="选择日期"
                                        onChange={date=>{
                                            let params = this.state.params
                                            if(date == null){
                                                params.taskStartTime = null
                                            }else{
                                                let val = date.getTime()
                                                params.taskStartTime = val
                                            }
                                            this.setState({params:params})
                                        }}
                                        disabledDate={time=>{
                                            let endTime = this.state.params.taskEndTime
                                            if(endTime == null){
                                                return time.getTime() < Date.now() - 8.64e7
                                            }else{
                                                return time.getTime() < Date.now() - 8.64e7 || time.getTime() > endTime
                                            }
                                        }}
                                    />
                                </Layout.Col>
                            </Layout.Row>
                            <Layout.Row className='form-task-item'>
                                <Layout.Col span={3} className='input-label'>结束日期:<span className="input-star-badge">*</span></Layout.Col>
                                <Layout.Col span={12} style={{paddingLeft:"40px"}}>
                                    <DatePicker
                                        value={this.state.params.taskEndTime != null ? new Date(this.state.params.taskEndTime) : null}
                                        placeholder="选择日期"
                                        onChange={date=>{
                                            let params = this.state.params
                                            if(date == null){
                                                params.taskEndTime = null
                                            }else{
                                                let val = date.getTime()
                                                params.taskEndTime = val
                                            }
                                            this.setState({params:params})
                                        }}
                                        disabledDate={time=>{
                                            let startTime = this.state.params.taskStartTime
                                            if(startTime == null){
                                                return time.getTime() < Date.now() - 8.64e7
                                            }else {
                                                return time.getTime() < startTime
                                            }
                                        }}
                                    />
                                </Layout.Col>
                            </Layout.Row>
                            <Layout.Row className='form-task-item'>
                                <Layout.Col span={3} className='input-label'>任务模板:<span className="input-star-badge">*</span></Layout.Col>
                                <Layout.Col span={12} style={{paddingLeft:"40px"}}>
                                    <div className="upload-excel-block">
                                        <Button disabled={this.state.excelName != null && this.state.excelName !== ""} type='primary' size='small'>添加任务模板</Button>
                                        <input disabled={this.state.excelName != null && this.state.excelName !== ""} type="file" value="" accept=".xlsx" onChange={this.handleFileChange.bind(this)}/>
                                    </div>
                                    <span onClick={this.showExcelTemplate.bind(this)} className='check-history-btn'>查看历史模板</span>
                                    <div style={parseInt(this.state.userType) === 1 ? {color:'#97A8BE',lineHeight:'30px'} : {display:'none'}}>
                                        <Button onClick={()=>{this.setState({radioStatus:!this.state.radioStatus})}} size='mini' style={{marginRight:'5px'}} type={this.state.radioStatus ? "warning" : "success"}>{this.state.radioStatus ? "关闭" : "开启"}</Button>
                                        设置机构任务优先权：
                                        <Radio value="1" checked={this.state.params.presidentType === "1"} disabled={!this.state.radioStatus} onChange={this.updateMsg.bind(this,'presidentType')}>支行行长</Radio>
                                        <Radio value="2" checked={this.state.params.presidentType === "2"} disabled={!this.state.radioStatus} onChange={this.updateMsg.bind(this,'presidentType')}>内勤行长</Radio>
                                    </div>
                                    <div style={{color:'#97A8BE',lineHeight:'20px'}}>(Excel模板默认第一列为任务接受者，若不在第一列请以*注明)</div>
                                    <div onClick={this.showExcelEdit.bind(this)} className="excel-file-item" title='点击编辑excel' style={this.state.excelName != null && this.state.excelName !== "" ? {} : {display: 'none'}}>
                                        <i className="iconfont icon-excel" style={{marginRight:'10px',color:'#0AB169'}}></i>
                                        <span>{this.state.excelName}</span>
                                        <i className="iconfont icon-shanchu excel-delete-btn" title='点击删除'onClick={(e)=>{
                                            e.stopPropagation()
                                            if(!this.state.excelEditorShow){
                                                this.setState({excelData:[[]],excelName:""})
                                            }
                                        }} ></i>
                                    </div>
                                </Layout.Col>
                            </Layout.Row>
                            <Layout.Row className='form-task-item'>
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
                                                    this.setState({switchValue:!val})
                                                }}
                                                onColor="#13ce66"
                                                offColor="#ff4949"
                                            >
                                            </Switch>
                                        }
                                    />
                                </Layout.Col>
                            </Layout.Row>
                            <Layout.Row className='form-task-item'>
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
                        </div>
                        <Layout.Row>
                            <Layout.Col span={15} className='confirm-btn-block'>
                                <Button type='primary' style={{width:'160px',fontSize: '16px'}} onClick={this.mergeParams.bind(this)}>发布</Button>
                            </Layout.Col>
                        </Layout.Row>
                    </Loading>
                </div>

                {/*excel编辑器*/}
                <div className="excel-editor-block" style={this.state.excelEditorShow ? {} : {transform:"translateX(-120%)"}}>
                    <HandsonTable
                        data = {this.state.excelData}
                        settings = {this.state.editorOptions}
                        fileName = {this.state.excelName}
                        show = {this.state.excelEditorShow}
                        closeItem = {this.closeExcel.bind(this)}
                        // updateExcel = {this.updateExcel.bind(this)}
                    >
                    </HandsonTable>
                </div>

                {/*历史任务模板*/}
                <div onClick={(e)=>{e.stopPropagation()}} className='history-template-block' style={this.state.historyBlockShow ? {} : {transform:"translateX(120%)"}}>
                    <Loading loading={this.state.templateLoading} text='加载中..'>
                        <ul className="history-template-list">
                            {
                                this.state.historyTemplate != null && this.state.historyTemplate.length > 0
                                ?
                                this.state.historyTemplate.map((obj,index)=>
                                    <li className="history-template-item" key={index}>
                                        <div className="history-template-info">
                                            <div className="history-template-title">任务：{JSON.parse(obj.excelJson).info.taskTitle}</div>
                                            <div className="history-template-excel">
                                                <i className="iconfont icon-excel excel-template-history"></i>
                                                {JSON.parse(obj.excelJson).info.fileName}
                                            </div>
                                            <div className="history-template-time">
                                                发布时间：{new Date(JSON.parse(obj.excelJson).info.sendTime).toLocaleString().replace(/\//g,"-")}
                                            </div>
                                        </div>
                                        <i onClick={this.updateTemplateByHistory.bind(this,obj.id)} className="iconfont icon-daoru update-btn" title='导入该模板到当前模板中'></i>
                                        <i onClick={this.deleteHistoryTemplate.bind(this,obj.id)} className="iconfont icon-shanchu delete-template-btn" title='删除该条历史模板'></i>
                                    </li>
                                )
                                :
                                <li className='no-history-template'>暂无历史模板...</li>
                            }
                        </ul>
                        <div style={{width:'100%',position:"absolute",bottom:"10px",left:"0",textAlign:'center'}}>
                            <Pagination layout="prev, pager, next" total={this.state.listTotal} pageSize={this.state.historyOption.pageSize} onCurrentChange={this.changeHistoryListPage.bind(this)} small={true}/>
                        </div>
                    </Loading>
                </div>
            </div>
        )
    }
}

export default withRouter(Fabubaobiaorenwu)