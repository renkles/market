import React, {Component, Fragment} from 'react';
import {withRouter} from "react-router-dom";
import {Pagination, Loading, Button, Dialog, Tag, MessageBox, Collapse} from 'element-react';
import Http from '../../../utils/http'
import baseUrl from '../../../utils/api'
import Echarts from '../../../components/myChart/Mycharts'
import Format from '../../../utils/format'
import HandsonTable from '../../../components/handsonTable/HandsonTable'
import { Map, Marker, InfoWindow } from 'react-amap'
import _ from 'lodash'

import './wofabuguode.scss'
import '../../../iconfont/iconfont.css'

class Wofabuguode extends Component{
    constructor() {
        super()
        this.state={
            loading:false,
            detailLoading:false,
            userListLoading:false,
            getMoreBtnLoading:false,
            currentPageType: 1, // 1: 列表页面 2:详情页面 3:excel页面
            showUserList:false,
            canGetMoreUsers:true,
            moreUsersDialog:false,
            list:[],
            currentTaskId: null,
            taskDetail:{},
            taskProcessModel:{},
            searchOption:{
                page: 1,
                pageSize: 6
            },
            total:1,
            userSearchOption:{
                page: 1,
                pageSize: 10,
            },
            userList:[],
            chartData:{
                color: ['#108EE9','#FF964E'],
                title : {
                    text: '任务完成情况统计饼图',
                    bottom: 0,
                    x:'center',
                    textStyle:{fontSize:14, color:'#999'}
                },
                tooltip : {
                    trigger: 'item',
                    formatter: "{b} : {c} ({d}%)"
                },
                series : [
                    {
                        type: 'pie',
                        radius : '50%',
                        center: ['50%', '50%'],
                        data: [],
                        itemStyle: {
                            emphasis: {
                                shadowBlur: 10,
                                shadowOffsetX: 0,
                                shadowColor: 'rgba(0, 0, 0, 0.5)'
                            }
                        }
                    }
                ]
            },
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
            userProgressDialog: false, // 用户记录弹框
            currentUserCustomerInfo:{}, // 用户任务详情
            currentCustomerInfo:{
                list:[],
                index:null
            }, // 当前客户跟踪记录
            currentOpenIndex: null,
            tailInformation:{
                type:null,
                html:"<div>hello world</div>",
                location: {latitude:31,longitude:120},
            }, // 当前展开的信息
            userProgressListOption:{pageSize:4,page:1,total:1}, // 分页选项
        }
    }

    componentWillUnmount() {
        this.setState = (state, callback) => {
            return
        }
    }

    componentDidMount(){
        this.getTaskList()
    }

    getTaskList() {
        this.setState({loading:true})
        let key = localStorage.getItem('userName')
        let params = _.assign({staffId: key}, this.state.searchOption)
        Http.post('/task/findTasks',params)
            .then(res=>{
                console.log(res)
                if(res.resultCode === 'success'){
                    let list = res.data.tasks
                    let total = res.data.total != null ? res.data.total : 1
                    this.setState({list: list, total: total, loading: false})
                }else{
                    console.log('获取数据失败')
                    this.setState({loading:false})
                    MessageBox.msgbox({
                        title:'提示',
                        message:'获取数据失败!',
                        type:'error'
                    })
                }
            })
            .catch(err=>{
                console.log(err)
                this.setState({loading:false})
            })
    }

    formatStatus(str){
        switch (parseInt(str)) {
            case 0:
                return {color:'#FF964E',label:'未查看',canGetUsers:false};
            case 1:
                return {color:'#20A0FF',label:'已通过',canGetUsers:true};
            case 2:
                return {color:'#FC7C71',label:'未通过',canGetUsers:false};
            case 3:
                return {color:'#FF964E',label:'审批中',canGetUsers:false};
            case 4:
                return {color:'#20A0FF',label:'处理中',canGetUsers:true};
            case 5:
                return {color:'#59D064',label:'已完成',canGetUsers:true};
            case 6:
                return {color:'#999A9A',label:'已撤销',canGetUsers:false};
            default:
                return {color:'#FC7C71',label:'未知',canGetUsers:false};
        }
    }

    formatApproveStatus(str){
        switch (parseInt(str)) {
            case 0:
                return {color:'#FF964E',label:'未处理'};
            case 1:
                return {color:'#59D064',label:'已通过'};
            case 2:
                return {color:'#FC7C71',label:'已拒绝'};
            default:
                return {color:'#FF964E',label:'未知'};
        }
    }

    formatName(str) {
        if(str == null || str === ""){return {name:"",lastName:""}}
        let newStr = str.replace(/\(/g,'（')
        let index = newStr.lastIndexOf("（")
        let name = index !== -1 ? str.substring(0,index) : str
        let lastName = name.slice(-1)
        if(name.split('').length > 4){
            name = `${name.slice(0,3)}...`
        }
        return {name:name,lastName:lastName}
    }

    returnTask(id, status, time) {
        let limit = 30 * 60 * 1000  // 半小时之内可撤销
        let now = new Date().getTime()
        if(parseInt(status) === 0){
            if(now - time > limit){
                MessageBox.msgbox({
                    title:'提示',
                    message:'该任务发布已超过30分钟，不能撤销!',
                    type:'error'
                })
                return
            }else {
                let key = localStorage.getItem('userName')
                let params = {staffId: key, id: id}
                this.setState({loading:true})
                Http.post('/task/finalPublishTask',params)
                    .then(res=>{
                        console.log(res)
                        if(res.resultCode === 'success'){
                            this.getTaskList()
                        }else{
                            MessageBox.msgbox({
                                title:'提示',
                                message:'撤销任务失败!',
                                type:'error'
                            })
                            this.setState({loading:false})
                        }
                    })
                    .catch(err=>{
                        console.log(err)
                    })
            }
        }else{
            MessageBox.msgbox({
                title:'提示',
                message:'该任务不是未查看状态，不能撤销!',
                type:'error'
            })
            return
        }
    }

    changePage(num) {
        let option = _.assign({},this.state.searchOption)
        option.page = num
        this.setState(
            {searchOption:option},
            ()=>{
                this.getTaskList()
            }
        )
    }

    turnBackToList() {
        let searchOption = _.assign({},this.state.userSearchOption)
        searchOption.page = 1
        this.setState({
            taskDetail:{},
            currentTaskId:null,
            userSearchOption:searchOption,
            taskProcessModel:{},
            canGetMoreUsers:true,
            currentPageType:1,
            showUserList: false
        })
    }

    showTaskDetail(id, status){
        let showUserList = this.formatStatus(status).canGetUsers
        this.setState(
            {showUserList:showUserList,currentTaskId:id},
            ()=>{
                this.getTaskDetail(status)
                if(showUserList){this.getUserList()}
            }
        )
    }

    getTaskDetail(status) {
        this.setState({currentPageType:2,detailLoading:true})

        let key = localStorage.getItem('userName')
        let params = {id:this.state.currentTaskId, staffId:key}
        Http.post('/task/findTaskDetails', params)
            .then(res=>{
                console.log(res)
                if(res.resultCode === 'success'){
                    let info = res.data.saleTaskDetailModel
                    info.taskStatus = status
                    let taskProcessModel = res.data.taskProcessModel
                    this.setState({taskDetail:info,taskProcessModel:taskProcessModel, detailLoading:false})
                }else{
                    this.setState({detailLoading:false,currentPageType:1})
                    MessageBox.msgbox({
                        title:'提示',
                        message:'获取数据失败!',
                        type:'error'
                    })
                }
            })
            .catch(err=> {
                console.log(err)
                this.setState({detailLoading: false, currentPageType: 1})
            })
    }

    getUserList() {
        this.setState({userListLoading:true,})

        let params = _.assign({id:this.state.currentTaskId},this.state.userSearchOption)
        Http.post('/task/findAcceptors',params)
            .then(res=>{
                console.log(res)
                if(res.resultCode === 'success'){
                    let data = res.data
                    let chartData = this.state.chartData
                    let list = data.progressVoList
                    let canGetMore = true
                    if(list.length < this.state.userSearchOption.pageSize){canGetMore = false}
                    let pieData = [{name:'已完成',value:data.completionNum},{name:'未完成',value:data.inCompletionNum}]
                    chartData.series[0].data = pieData
                    this.setState({userList:list,chartData:chartData,canGetMoreUsers:canGetMore,userListLoading:false })
                }else{
                    console.log('获取数据失败')
                    MessageBox.msgbox({
                        title:'提示',
                        message:'获取用户数据失败!',
                        type:'error'
                    })
                    this.setState({userListLoading:false})
                }
            })
            .catch(err=>{
                console.log(err)
                this.setState({userListLoading:true})
            })
    }

    getMoreUsers() {
        if(this.state.canGetMoreUsers && !this.state.getMoreBtnLoading){
            this.setState(
                {getMoreBtnLoading:true},
                ()=>{
                    let searchOption = _.assign({},this.state.userSearchOption)
                    searchOption.page = parseInt(this.state.userSearchOption.page) + 1
                    let params = _.assign({id:this.state.currentTaskId}, searchOption)
                    Http.post('/task/findAcceptors',params)
                        .then(res=>{
                            console.log(res)
                            if(res.resultCode === 'success'){
                                let userList = this.state.userList
                                let list = res.data.progressVoList
                                let newList = _.concat(userList,list)
                                let canGetMore = true
                                if(list.length < this.state.userSearchOption.pageSize){canGetMore = false}
                                this.setState({userList:newList,canGetMoreUsers:canGetMore,userSearchOption:searchOption,getMoreBtnLoading:false})
                            }else{
                                console.log('获取数据失败')
                                MessageBox.msgbox({
                                    title:'提示',
                                    message:'获取用户数据失败!',
                                    type:'error'
                                })
                                this.setState({getMoreBtnLoading:false})
                            }
                        })
                        .catch(err=>{
                            console.log(err)
                            this.setState({getMoreBtnLoading:false})
                        })
                }
            )
        }else{
            return
        }
    }

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

        this.setState({
            currentPageType: 3,
            excelName: fileName,
            excelData :resultArr,
        })
    }

    closeExcel() {
        this.setState({currentPageType:2})
    }


    // 展示接收者任务跟踪弹框
    showUserProgress(obj) {
        this.setState(
            {userProgressDialog: true, currentUserCustomerInfo: obj, currentCustomerInfo:{list:[],index:null}},
            ()=>{
                if(obj.actionInfoModelList != null && obj.actionInfoModelList.length > 0){
                    this.updateActionList(0)
                }
            }
        )
    }

    // 针对当前客户展示跟踪情况
    updateActionList(index) {
        if(index !== this.state.currentCustomerInfo.index){
            // 初始化记录
            let list = this.state.currentUserCustomerInfo.actionInfoModelList[index].actionModelList
            let newList = []
            if(list != null && list.length > 0){
                _.forEach(list,(obj)=>{newList.push(_.assign({},obj))})
            }

            // 初始化分页数据
            let len = newList.length
            let option = _.assign({},this.state.userProgressListOption)
            option.total = len
            option.page = 1


            this.setState(
                {currentCustomerInfo:{index:index,list:newList},userProgressListOption:option,currentOpenIndex:null},
                ()=>{
                    if(newList.length > 0){this.initFailInformation(0,true)} // 初始化详情
                }
            )
        }
    }

    // 初始化跟踪记录信息
    initFailInformation(index,isPageChange = false) {
        let num = index % this.state.userProgressListOption.pageSize
        if(this.state.currentOpenIndex === num && !isPageChange){
            this.setState({currentOpenIndex:null})
        }else{
            console.log("更新记录")
            this.setState(
                {currentOpenIndex:num},
                ()=>{
                    let currentInfo = this.state.currentCustomerInfo.list[index]
                    if(currentInfo != null){
                        let type = parseInt(currentInfo.type)
                        let obj = _.assign({},this.state.tailInformation)
                        obj.type = type
                        if(type === 2){
                            let html = `<div style="background-color: #FFFFFF; border: 1px solid #D1DBE5; padding: 10px; width: 260px; border-radius: 5px">${currentInfo.address}</div>`
                            let location = {latitude:currentInfo.latitude,longitude:currentInfo.longitude}
                            obj.html = html
                            obj.location = location
                            this.setState({tailInformation:obj})
                        }else if(type === 1){
                            console.log("电话记录详情")
                        }else{
                            console.log("记录类型错误",type)
                        }
                    }
                }
            )
        }
    }

    // 关闭弹框
    hideUserProgress() {
        this.setState({userProgressDialog:false})
    }

    // 切换记录分页
    changeActionListPage(n) {
        let pageOption = _.assign({},this.state.userProgressListOption)
        pageOption.page = n
        this.setState(
            {userProgressListOption:pageOption},
            ()=>{
                let num = this.state.userProgressListOption.pageSize * n
                this.initFailInformation(num, true)
            }
        )
    }

    render(){
        return(
            <div style={{position:'relative'}}>
                {/*任务列表*/}
                <div className='task-box' style={parseInt(this.state.currentPageType) === 1 ? {} : {transform:'translateX(120%)'}}>
                    <p className="task-title">我发布的任务</p>
                    <Loading loading={this.state.loading} text='加载中...'>
                        <ul className="task-list">
                            {
                                this.state.list != null && this.state.list.length > 0
                                    ?
                                    this.state.list.map((el,index)=>
                                        <li className="list-item" key={index}>
                                            <div className="item-icon-cube">
                                                <i className="iconfont icon-bianjiguanli"></i>
                                            </div>
                                            <div className='task-item-info'>
                                                <span style={{fontWeight:'bold'}}>{el.taskTitle}</span>
                                                <br/>
                                                <span style={{color:'#999999',marginRight:'40px'}}>发起人：{el.creator}</span>
                                                <span style={{color:'#999999'}}>创建时间：{new Date(el.createTime).toLocaleString().replace(/\//g,"-")}</span>
                                            </div>
                                            <div className="task-status-cube" style={{border: `1px solid ${this.formatStatus(el.taskStatus).color}`}}>
                                                <div
                                                    style={{color: `${this.formatStatus(el.taskStatus).color}`,borderTop: `1px solid ${this.formatStatus(el.taskStatus).color}`, borderBottom: `1px solid ${this.formatStatus(el.taskStatus).color}`}}
                                                    className='task-status-text'
                                                >
                                                    {this.formatStatus(el.taskStatus).label}
                                                </div>
                                            </div>
                                            <div className="task-btn-list">
                                                <i onClick={this.returnTask.bind(this, el.id, el.taskStatus, el.createTime)} className="iconfont icon-chexiao task-return-btn" title='撤销该任务'></i>
                                                <i onClick={this.showTaskDetail.bind(this, el.id, el.taskStatus)} className="iconfont icon-chakan task-detail-btn" title='查看任务详情'></i>
                                            </div>
                                        </li>
                                    )
                                    :
                                    <li style={{textAlign:'center', color: '#999999',lineHeight:'60px'}}>暂无已发布任务</li>
                            }
                        </ul>
                        <div style={{textAlign:'center'}}>
                            <Pagination layout="prev, pager, next" total={this.state.total} pageSize={this.state.searchOption.pageSize} onCurrentChange={this.changePage.bind(this)}/>
                        </div>
                    </Loading>
                </div>

                {/*任务详情*/}
                <div className='task-detail-block' style={parseInt(this.state.currentPageType) === 2 ? {} : {transform:'translateX(-120%)'}}>

                    <div className="task-detail-box">
                        <p className="task-detail-title">任务详情 <i onClick={this.turnBackToList.bind(this)} className="iconfont icon-guanbi return-list-btn" title='返回任务列表'></i></p>
                        <Loading loading={this.state.detailLoading} text='加载中...'>
                            <div className="detail-content-box">
                                <div className="task-title-cube">
                                    <span className='task-title-item'>标题：{this.state.taskDetail.title}</span>
                                    <Button size='mini' type={this.state.taskDetail.type != null && parseInt(this.state.taskDetail.type) === 4 ? "warning" : "primary"} className='task-type-cube'>{this.state.taskDetail.type != null && parseInt(this.state.taskDetail.type) === 4 ? this.state.taskDetail.productName : (parseInt(this.state.taskDetail.type) === 3 ? "填报类型" : "普通任务")}</Button>
                                </div>
                                <div className="task-detail-content">
                                    {this.state.taskDetail.description != null && this.state.taskDetail.description !== "" ? `详细：${this.state.taskDetail.description}` : '详细：无'}
                                </div>
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
                                    <div title='任务接受人员'>
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
                                    <div>
                                        <span style={{color:'#999999'}}>模板：</span>
                                        {
                                            this.state.taskDetail.excelJson != null && this.state.taskDetail.excelJson !== ""
                                            ?
                                            <span onClick={this.showReadExcelBlock.bind(this,this.state.taskDetail.excelJson)} className='file-item' title='查看Excel文件'><i className="iconfont icon-excel" style={{color:'#0AB169'}}></i>{Format.formatFileName(JSON.parse(this.state.taskDetail.excelJson).info.fileName)}</span>
                                            :
                                            "无"
                                        }
                                    </div>
                                </div>
                                <div className="task-detail-status-cube" style={{border: `1px solid ${this.formatStatus(this.state.taskDetail.taskStatus).color}`}}>
                                    <div
                                        style={{color: `${this.formatStatus(this.state.taskDetail.taskStatus).color}`,borderTop: `1px solid ${this.formatStatus(this.state.taskDetail.taskStatus).color}`, borderBottom: `1px solid ${this.formatStatus(this.state.taskDetail.taskStatus).color}`}}
                                        className="task-detail-status-text"
                                    >
                                        {this.formatStatus(this.state.taskDetail.taskStatus).label}
                                    </div>
                                </div>
                            </div>
                        </Loading>
                    </div>

                    <div className="task-progress-block" style={this.state.taskProcessModel.auditor == null || this.state.taskProcessModel.auditor === "" ? {display:'none'} : {}}>
                        <p className="task-progress-title">审批流转<i onClick={this.turnBackToList.bind(this)} className="iconfont icon-guanbi return-list-btn" title='返回任务列表'></i></p>
                        <div className="task-progress-list-cube">
                            <div className="task-progress-item-cube">
                                <div className="task-creator-img-cube">{this.formatName(this.state.taskProcessModel.applier).lastName}</div>
                                <br/>
                                <p style={{color:'#999999',marginBottom:'0',lineHeight:'20px'}}>发起人：{this.formatName(this.state.taskProcessModel.applier).name}</p>
                                <p style={{color:'#999999',marginBottom:'0',lineHeight:'20px'}}>发起时间：{Format.formatAllTime(this.state.taskProcessModel.applyDate)}</p>
                            </div>
                            <div className="middle-dotted-cube" style={this.state.taskProcessModel.auditor == null || this.state.taskProcessModel.auditor === "" ? {display:'none'}:{}}></div>
                            <div className="task-progress-item-cube" style={this.state.taskProcessModel.auditor == null || this.state.taskProcessModel.auditor === "" ? {display:'none'}:{}}>
                                <div className="task-creator-img-cube">{this.formatName(this.state.taskProcessModel.auditor).lastName}</div>
                                <br/>
                                <p style={{color:'#999999',marginBottom:'0',lineHeight:'20px'}}>审核人：{this.formatName(this.state.taskProcessModel.auditor).name}</p>
                                <p style={{color:'#999999',marginBottom:'0',lineHeight:'20px'}}>
                                    <i className="el-icon-information" style={parseInt(this.state.taskProcessModel.result) === 0 ? {marginRight:'5px',color: `${this.formatApproveStatus(this.state.taskProcessModel.result).color}`} : {display:'none'}}></i>
                                    <i className="el-icon-circle-check" style={parseInt(this.state.taskProcessModel.result) === 1 ? {marginRight:'5px',color: `${this.formatApproveStatus(this.state.taskProcessModel.result).color}`} : {display:'none'}}></i>
                                    <i className="el-icon-circle-close" style={parseInt(this.state.taskProcessModel.result) === 2 ? {marginRight:'5px',color: `${this.formatApproveStatus(this.state.taskProcessModel.result).color}`} : {display:'none'}}></i>
                                    {this.formatApproveStatus(this.state.taskProcessModel.result).label}
                                    {this.state.taskProcessModel.auditDate != null ? `（${Format.formatAllTime(this.state.taskProcessModel.auditDate)}）` : null}
                                </p>
                            </div>
                        </div>
                        <div className="task-progress-comment" style={parseInt(this.state.taskProcessModel.result) === 1 || parseInt(this.state.taskProcessModel.result) === 2 ? {} : {display:'none'}}>
                            <div style={{display:'inline-block'}}>审批备注：</div>
                            <div className="task-progress-comment-content">
                                {this.state.taskProcessModel.comment != null && this.state.taskProcessModel.comment !== "" ? this.state.taskProcessModel.comment : "无"}
                            </div>
                        </div>
                    </div>

                    <div className="task-user-box" style={this.state.showUserList ? {} : {display:'none'}}>
                        <p className="task-detail-title">完成进度 <i onClick={this.turnBackToList.bind(this)} className="iconfont icon-guanbi return-list-btn" title='返回任务列表'></i></p>
                        <Loading loading={this.state.userListLoading} text='加载中...'>
                            <div style={{paddingRight:'20px'}}>
                                <div className="task-user-left-cube">
                                    <div className="task-user-left-title">任务接受人员</div>
                                    <ul className="task-user-left-list">
                                        {
                                            this.state.userList != null && this.state.userList.length > 0
                                                ?
                                                this.state.userList.map((el, index)=>
                                                    <li key={index} className="task-user-left-item" title="点击查看该人员的完成情况" onClick={this.showUserProgress.bind(this,el)}>
                                                        <div className="task-user-img-cube">
                                                            <div className="task-user-img">{this.formatName(el.userName).lastName}</div>
                                                        </div>
                                                        <span className="task-user-cube-name">{this.formatName(el.userName).name}</span>
                                                        <i className="iconfont icon-naozhong tell-user-btn" title={el.status === 3 ? null : `通知${el.userName}`} style={el.status === 3 ? {} : {color: '#FEC400',cursor: 'pointer'}}></i>
                                                        <div className="task-progress-cube">
                                                            <div className="task-progress-bar" style={{width: `${el.process}`}}></div>
                                                            <span className='task-progress-text'>{el.process}</span>
                                                            <span className='task-progress-time-text' style={el.status === 3 ? {} : {display:"none"}}>{Format.formatAllTime(el.completeDate)}<span style={{marginLeft:'5px'}}>完成</span></span>
                                                        </div>
                                                    </li>
                                                )
                                                :
                                                <li className='empty-user-item'>暂无人员</li>
                                        }
                                        <li onClick={this.getMoreUsers.bind(this)} className='search-more-btn' style={this.state.userList.length > 0 && this.state.canGetMoreUsers ? {} : {display:'none'}}>
                                            <Loading loading={this.state.getMoreBtnLoading}>
                                                查看更多
                                            </Loading>
                                        </li>
                                    </ul>
                                </div>
                                <div className='chart-task-block'>
                                    <Echarts option={this.state.chartData} chartsId={1} size={[360,360]}/>
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
                
                {/*执行记录详情*/}
                <Dialog
                    title={`${this.state.currentUserCustomerInfo.departmentName}${this.state.currentUserCustomerInfo.jobName}——${this.state.currentUserCustomerInfo.userName}`}
                    size="small"
                    style={{width:'720px'}}
                    visible={ this.state.userProgressDialog }
                    onCancel={ this.hideUserProgress.bind(this) }
                    lockScroll={ false }
                >
                    <Dialog.Body style={{padding:'10px 20px 30px 20px'}}>
                        <div className="dialog-task-comment" style={parseInt(this.state.currentUserCustomerInfo.status) === 3 ? {} : {display:'none'}}>
                            <div style={{display:'inline-block'}}>完成备注：</div>
                            <div className="task-progress-comment-content">
                                {this.state.currentUserCustomerInfo.comment != null && this.state.currentUserCustomerInfo.comment !== "" ? this.state.currentUserCustomerInfo.comment : "无"}
                            </div>
                        </div>
                        {
                            this.state.currentUserCustomerInfo.actionInfoModelList != null && this.state.currentUserCustomerInfo.actionInfoModelList.length > 0
                            ?
                            <div className="user-action-tails-block">

                                {/*客户列表*/}
                                <div className="user-action-border-right"></div>
                                <ul className="user-customer-nav-list">
                                    {
                                        this.state.currentUserCustomerInfo.actionInfoModelList.map((el,index)=>
                                            <li onClick={this.updateActionList.bind(this,index)} className={this.state.currentCustomerInfo.index === index ? "user-customer-nav-item active" : "user-customer-nav-item"} key={index}>
                                                {el.name}
                                            </li>
                                        )
                                    }
                                </ul>

                                {/*跟踪记录*/}
                                <div className="tail-list-block">
                                    {
                                        this.state.currentCustomerInfo.list != null && this.state.currentCustomerInfo.list.length > 0
                                        ?
                                        <ul className="tail-list-cube">
                                        {
                                            this.state.currentCustomerInfo.list.slice(this.state.userProgressListOption.pageSize * (this.state.userProgressListOption.page - 1), this.state.userProgressListOption.pageSize * this.state.userProgressListOption.page).map((el,index)=>
                                                <Fragment key={index}>
                                                    <li className="tail-list-cube-item" onClick={this.initFailInformation.bind(this,(this.state.userProgressListOption.pageSize * this.state.userProgressListOption.page  - 4 + index), false)} key={`1-${index}`}>
                                                        {this.state.userProgressListOption.pageSize * this.state.userProgressListOption.page  - 3 + index}、
                                                        <i className={el.type === 2 ? "iconfont icon-dignwei" : "iconfont icon-dianhua"} style={el.type === 2 ? {color:'#9266F9',margin:'0 5px',fontWeight:"bold"} : {color:'#16C2C2',margin:'0 5px'}}></i>
                                                        {el.type === 2 ? "定位记录" : "电话记录"}
                                                        <i className={index === this.state.currentOpenIndex ? "iconfont icon-xiangxia" : "iconfont icon-xiangyou"} style={{float:'right'}}></i>
                                                        <span style={{float:'right',marginRight:'10px'}}>{Format.formatAllTime(el.startTime)}</span>
                                                    </li>
                                                    <li className="tail-list-cube-info" style={index === this.state.currentOpenIndex?{display:'block'}:{}} key={`2-${index}`}></li>
                                                </Fragment>
                                            )
                                        }
                                            <li className="map-block" style={this.state.currentOpenIndex != null ? {top:`${this.state.currentOpenIndex * 42 + 42}px`} : {display:'none'}}>
                                                <div className="map-cube">
                                                    <Map
                                                        amapkey={"4e7e8c9006c507bd2e84095c7ca53b5e"}
                                                        center={this.state.tailInformation.location}
                                                        zoom={16}
                                                    >
                                                        <InfoWindow
                                                            position={this.state.tailInformation.location}
                                                            isCustom={true}
                                                            visible={true}
                                                            content={this.state.tailInformation.html}
                                                            size={{width: 200, height: 80}}
                                                            offset={[5,0]}
                                                            anchor={"middle-left"}
                                                        />
                                                        <Marker position={this.state.tailInformation.location}/>
                                                    </Map>
                                                </div>
                                            </li>
                                        </ul>
                                        :
                                        <div style={{textAlign:'center',lineHeight:'200px',color:'#999'}}>暂无该客户的跟踪记录..</div>
                                    }
                                    <div style={{position:'absolute',bottom:'15px',left:'0',width:'100%',textAlign:'center'}}>
                                        <Pagination layout="prev, pager, next" total={this.state.userProgressListOption.total} pageSize={this.state.userProgressListOption.pageSize} onCurrentChange={this.changeActionListPage.bind(this)}/>
                                    </div>
                                </div>

                            </div>
                            :
                            <div style={{textAlign:'center',lineHeight:'200px',color:'#999'}}>该任务暂无跟踪记录...</div>
                        }
                    </Dialog.Body>
                </Dialog>
            </div>
        )
    }
}
export default withRouter(Wofabuguode)