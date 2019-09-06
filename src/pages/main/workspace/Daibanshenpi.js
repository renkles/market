import React, {Component} from 'react';
import {withRouter} from "react-router-dom";
import { Pagination, Layout, Loading, Select, Input, Dialog, Tag, Upload, MessageBox, Button} from 'element-react';
import baseUrl from '../../../utils/api'
import XLSX from 'xlsx'
import Http from '../../../utils/http'
import Format from '../../../utils/format'
import _ from 'lodash'
import HandsonTable from '../../../components/handsonTable/HandsonTable'

import './daibanshenpi.scss'
import '../../../iconfont/iconfont.css'

class Daibanshenpi extends Component{
    constructor() {
        super()
        this.state = {
            loading: false,
            detailLoading: false,
            moreUsersDialog: false,
            tableList: [],
            searchOption: {
                page: 1,
                pageSize: 10,
                type: 0
            },
            total: 1,
            currentPageType: 1, // 1: 列表页面 2:详情页面 3:excel页面
            currentId: null, // 任务id
            approveTaskId: null, // 任务的taskId
            currentTaskType: null, // 2：待审批 1：待执行
            taskStatus: null, // 待办任务（0：未查看，1：已查看，2：执行中）
            taskDetail: {}, // 任务详情
            comment: "", // 备注
            editorOptions:{
                colHeaders: true,
                rowHeaders:true,
                readOnly:true,
                minCols: 32,
                minRows: 30,
                width:'100%',
                height: 670,
            }, // excel编辑器配置
            excelData:[[]], // excel数据
            excelName:"", // excel文件名
            alreadyWriteExcelData:[[]], // 已编辑的excel
            titleDisableList:[] // 首行不可编辑
        }
    }

    componentWillUnmount() {
        this.setState = (state, callback) => {
            return
        }
    }

    componentDidMount() {
        this.getTaskList()
        // 初始化首行不可编辑
        let len = this.state.editorOptions.minCols
        let list = []
        for(let i = 0; i < len; i++){
            list.push({col:i,row:0,readOnly:true})
        }
        this.setState({titleDisableList:list})
    }

    getTaskList(){
        this.setState({loading:true})
        let key = localStorage.getItem('userName')
        let params = _.assign({staffId: key}, this.state.searchOption)
        Http.post('/task/myTask/list', params)
            .then(res=>{
                console.log(res)
                if(res.resultCode === 'success'){
                    let list = res.data.tasks
                    let total = res.data.total
                    this.setState({tableList: list, total: total, loading: false})
                }else{
                    console.log('获取苏数据失败')
                    this.setState({loading:true})
                    MessageBox.msgbox({
                        title:'提示',
                        message:'获取数据失败!',
                        type:'error'
                    })
                }
            })
            .catch(err=>{
                console.log(err)
                this.setState({loading:true})
            })
    }

    changeType(val) {
        if(val === this.state.searchOption.type){return}
        let option = _.assign({}, this.state.searchOption)
        option.page = 1
        option.type = val
        this.setState(
            {searchOption:option},
            ()=>{
                this.getTaskList()
            }
        )
    }

    changePage(num) {
        let option = _.assign({}, this.state.searchOption)
        option.page = num
        this.setState(
            {searchOption:option},
            ()=>{
                this.getTaskList()
            }
        )
    }

    // 返回待办列表
    turnBackToList() {
        this.setState({
            currentPageType:1,
            currentId:null,
            approveTaskId:null,
            currentTaskType:null,
            taskStatus:null,
            taskDetail:{},
            comment:"",
            excelData:[[]],
            excelName:"",
            alreadyWriteExcelData:[[]],
        })
    }

    // 根据条件展示详情
    showDetail(id, status, taskId) {
        switch (parseInt(status)) {
            case 1:
                this.setState(
                    {currentId: id, currentTaskType: status, approveTaskId: taskId},
                    ()=>{
                        this.getTaskDetail() // 获取执行任务详情
                    }
                )
                break;
            case 2:
                this.setState(
                    {currentId: id, currentTaskType: status, approveTaskId: taskId},
                    ()=>{
                        this.getAuditDetail() // 获取审批任务详情
                    }
                )
                break;
            default:
                break;
        }
    }

    // 获取任务审批详情
    getAuditDetail() {
        this.setState({currentPageType: 2, detailLoading: true})
        let key = localStorage.getItem('userName')
        let params = {staffId:key, id:this.state.currentId}
        Http.post('/task/audit/taskInfo',params)
            .then(res=>{
                console.log(res)
                if(res.resultCode === 'success'){
                    let info = res.data.saleTaskDetailModel
                    this.setState({taskDetail:info,detailLoading:false})
                }else{
                    this.setState({detailLoading:false})
                    MessageBox.msgbox({
                        title:'提示',
                        message:'获取数据失败!',
                        type:'error'
                    })
                }
            })
            .catch(err=>{
                console.log(err)
                this.setState({detailLoading:false})
            })
    }

    // 审批任务
    approveTask(type) {
        this.setState({detailLoading:true})
        let key = localStorage.getItem('userName')
        let params = {
            comment: this.state.comment,
            result: type,
            staffId: key,
            taskId: this.state.approveTaskId
        }
        Http.post('/task/audit',params)
            .then(res=>{
                console.log(res)
                if(res.resultCode === 'success'){
                    let searchOption = _.assign({},this.state.searchOption)
                    searchOption.page = 1
                    this.setState(
                        {detailLoading: false, searchOption: searchOption},
                        ()=>{
                            MessageBox.confirm('您已成功审核该任务!', '提示', {
                                type: 'success'
                            }).then(() => {
                                this.turnBackToList()
                                this.getTaskList()
                            }).catch(() => {
                                this.turnBackToList()
                                this.getTaskList()
                            })
                        }
                    )
                }else{
                    this.setState({detailLoading: false})
                    MessageBox.msgbox({
                        title:'提示',
                        message:'提交数据失败!',
                        type:'error'
                    })
                }
            })
            .catch(err=>{
                console.log(err)
                this.setState({detailLoading: false})
            })
    }

    // 获取任务待办详情
    getTaskDetail() {
        this.setState({currentPageType: 2, detailLoading:true})
        let key = localStorage.getItem('userName')
        let params = {id:this.state.approveTaskId, staffId:key}
        Http.post('/task/taskInfo/query', params)
            .then(res=>{
                console.log(res)
                if(res.resultCode === 'success'){
                    let info = res.data.saleTaskDetailModel
                    let status = res.data.status
                    this.setState({taskDetail:info, detailLoading:false,taskStatus:status})
                }else{
                    this.setState({detailLoading:false})
                    MessageBox.msgbox({
                        title:'提示',
                        message:'获取数据失败!',
                        type:'error'
                    })
                }
            })
            .catch(err=>{
                console.log(err)
                this.setState({detailLoading:false})
            })
    }

    // 接受任务
    acceptTask() {
        this.setState({detailLoading:true})
        let key = localStorage.getItem("userName")
        let params = {id:this.state.approveTaskId, staffId:key}
        Http.post('/task/accept',params)
            .then(res=>{
                console.log(res)
                if(res.resultCode === 'success'){
                    let status = res.data.status
                    this.setState({taskStatus:status, detailLoading:false})
                }else{
                    this.setState({detailLoading:false})
                    MessageBox.msgbox({
                        title:'提示',
                        message:'请求数据失败!',
                        type:'error'
                    })
                }
            })
            .catch(err=>{
                console.log(err)
                this.setState({detailLoading:false})
            })
    }

    // 完成任务
    finishTask() {
        this.setState({detailLoading:true})

        let excelData = {}
        // 判断任务类型上传excel数据
        if(parseInt(this.state.taskDetail.type) === 3) {
            console.log('报表')

            // 获取文件名
            let excelFileName = ""
            if(this.state.taskDetail.excelJson != null){
                let excelData = JSON.parse(this.state.taskDetail.excelJson)
                excelFileName = excelData.info.fileName
            }

            // 二维数组转json
            let data = this.state.alreadyWriteExcelData
            let keyArr = data[0]
            if(keyArr.length > 0){
                let keyIndex = 0
                for(let i = 0; i < keyArr.length; i++){
                    if(keyArr[i] != null){
                        if(keyArr[i].toString().indexOf('*') !== -1){
                            keyIndex = i
                        }
                    }
                }
                let primary = keyArr[keyIndex] != null && keyArr[keyIndex] !== "" ? keyArr[keyIndex] : "*" // 主键
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
                if(json.length === 0){
                    MessageBox.msgbox({
                        title:'提示',
                        message:'模板内容不能为空!',
                        type:'error'
                    })
                    this.setState({detailLoading:false})
                    return
                }
                // 判断内容是否完整
                let isNotEmpty = true
                _.forEach(json,(obj)=>{
                    _.forEach(obj,(val)=>{
                        if(val == null || val === ""){
                            isNotEmpty = false
                        }
                    })
                })
                if(isNotEmpty){
                    let sendTime = new Date().getTime()
                    excelData.data = json
                    excelData.info = {sendTime:sendTime,fileName:excelFileName,primary:primary}
                }else{
                    MessageBox.msgbox({
                        title:'提示',
                        message:'模板内容不全!',
                        type:'error'
                    })
                    this.setState({detailLoading:false})
                    return
                }
            }else{
                MessageBox.msgbox({
                    title:'提示',
                    message:'请先编辑任务模板在提交完成!',
                    type:'error'
                })
                this.setState({detailLoading:false})
                return
            }
        }else{
            console.log('营销或普通任务')
        }

        // console.log(excelData)

        let key = localStorage.getItem('userName')
        let params = {
            comment: this.state.comment,
            excelData:excelData,
            staffId: key,
            taskId: this.state.approveTaskId
        }
        Http.post('/task/complete', params)
            .then(res=>{
                console.log(res)
                if(res.resultCode === 'success'){
                    let searchOption = _.assign({},this.state.searchOption)
                    searchOption.page = 1
                    this.setState(
                        {detailLoading: false, searchOption: searchOption},
                        ()=>{
                            MessageBox.confirm('您已成功提交该任务!', '提示', {
                                type: 'success'
                            }).then(() => {
                                this.turnBackToList()
                                this.getTaskList()
                            }).catch(() => {
                                this.turnBackToList()
                                this.getTaskList()
                            })
                        }
                    )
                }else{
                    this.setState({detailLoading:false})
                    MessageBox.msgbox({
                        title:'提示',
                        message:'提交数据失败!',
                        type:'error'
                    })
                }
            })
            .catch(err=>{
                console.log(err)
                this.setState({detailLoading:false})
            })
    }

    // 展示只读Excel
    showReadExcelBlock(data) {
        let excelData = JSON.parse(data)
        let json = excelData.data
        let fileName = excelData.info.fileName
        let primary = excelData.info.primary

        // json 转 二维数组 并 设置主键
        let resultArr = []
        if(json.length > 0){
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
        }else{
            MessageBox.msgbox({
                title:'提示',
                message:'模板数据有误!',
                type:'error'
            })
            return
        }

        // 设置只读模式
        let editorOptions = _.assign({},this.state.editorOptions)
        editorOptions.readOnly = true

        this.setState({
            currentPageType: 3,
            excelName: fileName,
            excelData :resultArr,
            editorOptions:editorOptions
        })
    }

    // 展示编辑Excel
    showWriteExcelBlock(data) {
        // 设置非只读模式
        let editorOptions = _.assign({},this.state.editorOptions)
        editorOptions.readOnly = false

        let resultArr = []
        let fileName = this.state.excelName

        if(_.isEqual(this.state.alreadyWriteExcelData, [[]])) {
            let excelData = JSON.parse(data)
            let json = excelData.data
            fileName = excelData.info.fileName
            let primary = excelData.info.primary

            // json 转 二维数组 并 设置主键
            if(json.length > 0){
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
            }else{
                MessageBox.msgbox({
                    title:'提示',
                    message:'模板数据有误!',
                    type:'error'
                })
                return
            }
        }else{
            _.forEach(this.state.alreadyWriteExcelData,(list)=>{
                resultArr.push([...list])
            })
            console.log(resultArr)
        }

        this.setState({
            currentPageType: 3,
            excelName: fileName,
            excelData :resultArr,
            editorOptions:editorOptions
        })
    }

    // 关闭excel
    closeExcel() {
        if(this.state.editorOptions.readOnly){
            this.setState({currentPageType:2}) // 只读模式
        }else{
            let newData = []
            _.forEach(this.state.excelData,(list)=>{
                newData.push([...list])
            })
            this.setState({currentPageType:2,alreadyWriteExcelData:newData}) // 非只读模式
        }
    }

    // 外部导入可编辑的二维数组
    fileInExcel(e){
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

                    // 当前模板key列表
                    if(_this.state.taskDetail.excelJson != null){
                        let excelData = JSON.parse(_this.state.taskDetail.excelJson)
                        let currentJson = excelData.data
                        let currentKeyArray = _.keys(currentJson[0]).sort()
                        console.log("当前模板",currentKeyArray)

                        let targetKeyArray = [...dataArray[0]].sort()
                        console.log("导入模板",targetKeyArray)

                        if(_.isEqual(currentKeyArray,targetKeyArray)){
                            MessageBox.msgbox({
                                title: '提示',
                                message: '导入成功!',
                                type: 'success'
                            })
                            _this.setState({alreadyWriteExcelData:dataArray})
                        }else{
                            MessageBox.msgbox({
                                title: '提示',
                                message: '导入内容列标不一致，任务模板禁止修改列标!',
                                type: 'error'
                            })
                        }
                    }else{
                        MessageBox.msgbox({
                            title: '提示',
                            message: '该任务不支持载入模板!',
                            type: 'error'
                        })
                    }
                }else{
                    MessageBox.msgbox({
                        title: '提示',
                        message: 'excel文件数据为空!',
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

    render(){
        return(
            <div style={{position: 'relative'}}>
                {/*列表页面*/}
                <div className='message-list-block' style={parseInt(this.state.currentPageType) === 1 ? {} : {transform:'translateX(120%)'}}>
                    <div className="message-list-title">
                        执行事项列表
                        <div className='select-btn'>
                            <Select size='small' value={this.state.searchOption.type} onChange={this.changeType.bind(this)}>
                                <Select.Option label='全部' value={0}/>
                                <Select.Option label='待审批' value={2}/>
                                <Select.Option label='待执行' value={1}/>
                            </Select>
                        </div>
                    </div>
                    <Loading loading={this.state.loading}>
                        <table className="table-style">
                            <thead>
                            <tr>
                                <td>任务类型</td>
                                <td>任务标题</td>
                                <td>创建人</td>
                                <td>创建时间</td>
                                <td>执行时间</td>
                                <td>积分</td>
                                <td>状态</td>
                            </tr>
                            </thead>
                            <tbody>
                            {
                                this.state.tableList != null && this.state.tableList.length > 0
                                    ?
                                    this.state.tableList.map((el,index)=>
                                        <tr key={index} style={{cursor:'pointer'}} title='点击查看详情'>
                                            <td>{el.taskType}</td>
                                            <td>{el.title}</td>
                                            <td>{el.publisher}</td>
                                            <td>{Format.formatTime(el.publishDate)}</td>
                                            <td>{`${Format.formatTime(el.startDate)}~${Format.formatTime(el.endDate)}`}</td>
                                            <td style={{color:'#F59E53'}}><i className="iconfont icon-jifen" style={{marginRight:'10px'}}></i>{el.score != null && el.score !== "" ? el.score : "--无--"}</td>
                                            <td><Button onClick={this.showDetail.bind(this, el.id, el.type, el.taskId)} size="small" type={el.type === 2 ? 'primary' : 'warning'}>{el.type === 1 ? '待完成' : el.type === 2 ? '待审批' : '未知'}</Button></td>
                                        </tr>
                                    )
                                    :
                                    <tr><td colSpan={6}>暂无数据</td></tr>
                            }
                            </tbody>
                        </table>
                        <div style={{textAlign:'center'}}>
                            <Pagination layout="prev, pager, next" total={this.state.total} pageSize={this.state.searchOption.pageSize} onCurrentChange={this.changePage.bind(this)}/>
                        </div>
                    </Loading>
                </div>

                {/*详情页面*/}
                <div className="message-item-detail" style={parseInt(this.state.currentPageType) === 2 ? {} : {transform:'translateX(-120%)'}}>
                    <div className="task-detail-box">
                        <p className="task-detail-title">任务详情 <i onClick={this.turnBackToList.bind(this)} className="iconfont icon-guanbi return-list-btn" title='返回任务列表'></i></p>
                        <Loading loading={this.state.detailLoading} text='加载中...'>
                            <div className="detail-content-box">
                                <p className="task-title-cube">
                                    <span className='task-title-item'>标题：{this.state.taskDetail.title}</span>
                                    <Button size='mini' type={this.state.taskDetail.type != null && parseInt(this.state.taskDetail.type) === 4 ? "warning" : "primary"} className='task-type-cube'>{this.state.taskDetail.type != null && parseInt(this.state.taskDetail.type) === 4 ? this.state.taskDetail.productName : (parseInt(this.state.taskDetail.type) === 3 ? "填报类型" : "普通任务")}</Button>
                                </p>
                                <p className="task-detail-content">
                                    详细：{this.state.taskDetail.description != null && this.state.taskDetail.description !== "" ? this.state.taskDetail.description : '无'}
                                </p>
                                <p className="task-time">
                                    <span className="icon-cube">始</span>
                                    <span className='task-time-item'>{Format.formatTime(this.state.taskDetail.startTime)}</span>
                                    <span className="icon-cube">终</span>
                                    <span className='task-time-item'>{Format.formatTime(this.state.taskDetail.endTime)}</span>
                                </p>
                                <div className="user-item-cube">
                                    <div>
                                        <i className="iconfont icon-chuangjianren" title='任务创建人员' style={{fontWeight:'bold'}}></i>
                                        <span style={{marginLeft:'5px',marginRight:'20px'}} title='任务创建人员'>{this.state.taskDetail.creator != null && this.state.taskDetail.creator !== "" ? this.state.taskDetail.creator : '无'}</span>
                                        <i className="iconfont icon-shijian" title='任务创建时间' style={{fontWeight:'bold'}}></i>
                                        <span title='任务创建时间' style={{marginLeft:'5px'}}>{Format.formatAllTime(this.state.taskDetail.createTime)}</span>
                                    </div>
                                    <div title='任务接受人员' style={this.state.currentTaskType === 2 ? {} : {display:'none'}}>
                                        <i className="iconfont icon-kehu icon-show-more-btn" onClick={()=>{this.setState({moreUsersDialog:true})}} title='查看更多' style={{fontWeight:'bold'}}></i>
                                        {
                                            this.state.taskDetail.executors != null && this.state.taskDetail.executors.length>0
                                                ?
                                                this.state.taskDetail.executors.map((item,index)=>
                                                    <span key={index} style={{marginLeft:'5px'}}>{item}、</span>
                                                )
                                                :
                                                <span style={{marginLeft:'5px'}}>无</span>
                                        }
                                    </div>
                                </div>
                                <div className="template-list-cube">
                                    <div>
                                        <span style={{color:'#999999'}}>附件：</span>
                                        {
                                            this.state.taskDetail.fileVos != null && this.state.taskDetail.fileVos.length > 0
                                                ?
                                                this.state.taskDetail.fileVos.map((el, index)=>
                                                    <a download href={el.fileUrl} target='_blank' className='file-item' key={index} title='下载附件'><i className="iconfont icon-wenjianxiazai"></i>{Format.formatFileName(el.fileName)}</a>
                                                )
                                                :
                                                <span style={{color:'#999999'}}>无</span>
                                        }
                                    </div>
                                    <div style={parseInt(this.state.taskStatus) === 2 && parseInt(this.state.taskDetail.type) === 3 ? {display:'none'} : {}}>
                                        <span style={{color:'#999999'}}>模板：</span>
                                        {
                                            this.state.taskDetail.excelJson != null && this.state.taskDetail.excelJson !== ""
                                            &&
                                            <span onClick={this.showReadExcelBlock.bind(this,this.state.taskDetail.excelJson)} className='file-item' title='查看Excel文件'><i className="iconfont icon-excel" style={{color:'#0AB169'}}></i>{Format.formatFileName(JSON.parse(this.state.taskDetail.excelJson).info.fileName)}</span>
                                        }
                                    </div>
                                </div>

                                {/*审批任务*/}
                                <div className="task-comment-cube" style={this.state.currentTaskType === 2 ? {} : {display:'none'}}>
                                    <p className="task-comment-title">审批意见：</p>
                                    <Input
                                        type="textarea"
                                        value={this.state.comment}
                                        onChange={(val)=>{this.setState({comment:val})}}
                                        autosize={{ minRows: 4, maxRows: 6}}
                                        placeholder="输入审批意见(非必填)"
                                    />
                                    <div style={{textAlign:'center',marginTop:'20px'}}>
                                        <Button onClick={this.approveTask.bind(this, 1)} type='danger' style={{marginRight:'80px'}}>不通过</Button>
                                        <Button onClick={this.approveTask.bind(this, 0)} type='success'>通过</Button>
                                    </div>
                                </div>

                                {/*执行任务*/}
                                <div className="task-user-cube" style={this.state.currentTaskType === 1 ? {} : {display:'none'}}>
                                    <Button onClick={this.acceptTask.bind(this)} size='small' style={parseInt(this.state.taskStatus) === 1 || parseInt(this.state.taskStatus) === 0 ? {paddingLeft:'20px',paddingRight:'20px',backgroundColor:'#0AB169',color:'#FFFFFF'} : {display:'none'}}>接受任务</Button>
                                    <div style={parseInt(this.state.taskStatus) === 2 ? {} : {display:'none'}}>
                                        <p className="task-comment-title">备注：</p>
                                        <Input
                                            type="textarea"
                                            value={this.state.comment}
                                            maxLength={50}
                                            onChange={(val)=>{this.setState({comment:val})}}
                                            autosize={{ minRows: 4, maxRows: 6}}
                                            placeholder="请输入任务备注(非必填,不超过50字)"
                                        />
                                        {/*填报类型任务模板*/}
                                        <Layout.Row style={parseInt(this.state.taskDetail.type) === 3 ? {marginTop:'20px'} :{display:'none'}}>
                                            <Layout.Col span={24} style={{lineHeight:'36px'}}>
                                                <span style={{fontSize:'15px',fontWeight:'bold'}}>任务模板：</span>
                                                {
                                                    this.state.taskDetail.excelJson != null && this.state.taskDetail.excelJson !== ""
                                                    &&
                                                    <span onClick={this.showWriteExcelBlock.bind(this,this.state.taskDetail.excelJson)} className='file-item' title='编辑Excel文件'><i className="iconfont icon-excel" style={{color:'#0AB169'}}></i>{Format.formatFileName(JSON.parse(this.state.taskDetail.excelJson).info.fileName)}</span>
                                                }
                                                {/*导入文件按钮*/}
                                                <div className="upload-excel-block">
                                                    <Button type='primary' size='mini'>导入本地Excel</Button>
                                                    <input type="file" value="" accept=".xlsx" onChange={this.fileInExcel.bind(this)}/>
                                                </div>
                                            </Layout.Col>
                                        </Layout.Row>

                                        <div style={{textAlign:'center',marginTop:'20px'}}>
                                            <Button onClick={this.finishTask.bind(this)} type='success'>完成任务</Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Loading>
                    </div>
                </div>


                {/*excel编辑器*/}
                <div className="excel-editor-block" style={parseInt(this.state.currentPageType) === 3 ? {} : {transform:"translateX(-120%)"}}>
                    <HandsonTable
                        data = {this.state.excelData}
                        settings = {this.state.editorOptions}
                        fileName = {this.state.excelName}
                        closeItem = {this.closeExcel.bind(this)}
                        disableTitleList={this.state.titleDisableList}
                        // updateExcel = {this.updateExcel.bind(this)}
                    >
                    </HandsonTable>
                </div>

                {/*更多*/}
                <Dialog
                    title="任务接受人员"
                    size="tiny"
                    top='30%'
                    visible={ this.state.moreUsersDialog }
                    onCancel={ () => this.setState({ moreUsersDialog: false }) }
                    lockScroll={ false }
                >
                    <Dialog.Body>
                        <div className='dialog-more-user'>
                            {
                                this.state.taskDetail.executors != null && this.state.taskDetail.executors.length > 0
                                    ?
                                    this.state.taskDetail.executors.map((item, index)=>
                                        <Tag key={index} type="primary" style={{marginRight:'10px',marginBottom:'10px'}}>{item}</Tag>
                                    )
                                    :
                                    <div style={{textAlign:'center',lineHeight:'40px',color:'#999999'}}>暂无更多...</div>
                            }
                        </div>
                    </Dialog.Body>
                </Dialog>
            </div>
        )
    }
}
export default withRouter(Daibanshenpi)