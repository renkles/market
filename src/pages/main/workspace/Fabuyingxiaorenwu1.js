import React, {Component} from 'react';
import {withRouter} from "react-router-dom";
import {Layout, Select, DatePicker, Input, Button, Dialog, Loading, Tree, Cascader, Switch, Upload, MessageBox} from 'element-react';
import baseUrl from '../../../utils/api'
import Http from '../../../utils/http'
import _ from 'lodash'
import store from "../../../store"
import HandsonTable from '../../../components/handsonTable/HandsonTable'
import Echarts from '../../../components/myChart/Mycharts'

import './fabuyingxiaorenwu1.scss'

class Fabuyingxiaorenwu1 extends Component{
    constructor() {
        super()
        this.state={
            userType: null,
            loading: false,
            chartLoading:false,
            productList:[], // 产品列表
            bankList:[], // 机构列表
            searchOption:{
                departmentCode: "",
                productCode: "",
                type: ""
            }, // 查询统计图配置
            cascaderValue: [], // 当前选中的产品
            productChartOption: {
                color:["#4B77FF","#EAA647"],
                title: {
                    text: '产品营销统计图',
                    textStyle:{fontSize: 16},
                    left:'center',
                    top: 10
                },
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {
                        type: 'shadow'
                    }
                },
                legend: {
                    data: ['个数', '总额'],
                    top: 36
                },
                grid: {
                    top: 70,
                    bottom: 10,
                    left: '12%',
                    right: "8%",
                    containLabel: true
                },
                dataZoom: [
                    {
                        show: true,
                        yAxisIndex: 0,
                        filterMode: 'empty',
                        width: "4%",
                        height: 720,
                        showDataShadow: false,
                        left: "4%"
                    }
                ],
                xAxis: [
                    {
                        type: 'value',
                        name: '总额',
                        minInterval: 1,
                        splitNumber: 5
                    },
                    {
                        type: 'value',
                        name: '个数',
                        minInterval: 1,
                        splitNumber: 5
                    }
                ],
                yAxis: {
                    type: 'category',
                    data: []
                },
                series: [
                    {
                        name: '总额',
                        type: 'line',
                        data: []
                    },
                    {
                        name: '个数',
                        type: 'bar',
                        barMaxWidth: 30,
                        data: [],
                        xAxisIndex:1
                    }
                ]
            },// 产品营销统计图
            indexId:"", // 后台新增参数（excelData.info.indexId）
            quotaInfo: "", // 指标单位
            executeList: [], // 指定人员tree型数据
            treeOptions: {
                children: 'children',
                label: 'label'
            }, // tree结构数据配置
            finalApproveIdList:[], // 审批人最终Id列表
            approveOption:{
                value: 'id',
                label: 'name',
                children: 'list'
            }, // 审批人索引配置
            alreadyLoadList:[], // 已加载审批人的id列表
            approveList:[], // 审批人列表
            switchValue: true, // 考核分数开关
            uploadFileList:[], // 上传附件列表
            excelEditorShow:false, // excel编辑框
            excelData:[[]],
            excelName:"",
            editorOptions:{
                colHeaders: true,
                rowHeaders:true,
                minCols: 32,
                minRows: 30,
                width:'100%',
                height: 670,
            }, // excel编辑器配置
            executeShowing:false, // 弹框状态
            params:{
                productCode:"", // 产品
                departmentCode: "", // 机构
                title: "", // 任务标题
                description: "", // 任务描述
                taskStartTime: null, // 开始时间
                taskEndTime: null, // 结束时间
                excelData: {
                    data:[],
                    info:{fileName:null, primary:null, sendTime:null, index:null, indexId:null}
                }, // 任务模板
                approveUserIds: [], // 审批人员id
                score:"", // 考核分数
                fileVos: [], // 上传的附件
                phone:false, // 通话
                location:false // 定位
            },
            disableTitleList:[], // 只读列表
        }
    }

    componentWillUnmount() {
        this.setState = (state, callback) => {
            return
        }
    }

    componentDidMount(){
        // 获取审批人员列表
        this.getApproveList()

        // 初始化身份并获取数据
        let type = localStorage.getItem('taskType')
        this.setState(
            {userType: type},
            ()=>{
                this.getSearchList()
            }
        )

        // 设置禁用列表
        let len = this.state.editorOptions.minCols
        let list = []
        for(let i = 0; i < len; i++){
            list.push({row:0,col:i,readOnly:true})
        }
        this.setState({disableTitleList:list})
    }

    // 获取产品列表和机构列表
    getSearchList(){
        this.setState({loading:true,chartLoading:true})
        let key = localStorage.getItem('userName')
        let params = {staffId:key, type:this.state.userType}
        Promise.all([Http.post('/product/list'),Http.post('/task/jgm',params)]).then(result=>{
            if(result[0].resultCode === "success" && result[1].resultCode === "success"){
                let list1 = result[0].data
                let list2 = result[1].data
                let productList = []
                let bankList = []
                // 遍历list
                _.forEach(list1,(obj)=>{
                    if(obj.children != null && obj.children.length > 0){
                        let childList = []
                        _.forEach(obj.children,(insideObj)=>{
                            childList.push({value:insideObj.productCode,label:insideObj.name})
                        })
                        productList.push({value:obj.productCode,label:obj.name,children:childList})
                    }
                })
                _.forEach(list2,(obj)=>{
                    bankList.push({value:obj.jgm,label:obj.jgmc})
                })
                // 设置初始值
                if(productList.length > 0 && bankList.length > 0){
                    let cascaderValue = [productList[0].value, productList[0].children[0].value]
                    let departmentCode = bankList[0].value
                    let productCode = cascaderValue[1]
                    let type = this.state.userType
                    let searchOption = _.assign({},this.state.searchOption)
                    searchOption.departmentCode = departmentCode
                    searchOption.productCode = productCode
                    searchOption.type = type
                    this.setState(
                        {
                            loading:false,
                            productList:productList,
                            bankList:bankList,
                            cascaderValue:cascaderValue,
                            searchOption:searchOption
                        },
                        ()=>{
                            this.getChartData()
                        }
                    )
                }else{
                    MessageBox.msgbox({
                        title:'提示',
                        message:'列表数据为空!',
                        type:'error'
                    })
                    this.setState({loading:false,chartLoading:true})
                }
            }else{
                MessageBox.msgbox({
                    title:'提示',
                    message:'获取数据失败!',
                    type:'error'
                })
                this.setState({loading:false,chartLoading:true})
            }
        }).catch(err=>{
            console.log(err)
            this.setState({loading:false,chartLoading:true})
        })
    }

    // 切换产品
    changeProduct(arr){
        let val = arr[1]
        if(val !== this.state.searchOption.productCode){
            let searchOption = _.assign({},this.state.searchOption)
            searchOption.productCode = val
            this.setState(
                {cascaderValue:arr,searchOption:searchOption,executeList:[]},
                ()=>{
                    this.getChartData()
                }
            )
        }
    }

    // 切换机构
    changeBank(val) {
        console.log(val)
        if(val !== this.state.searchOption.departmentCode){
            let searchOption = _.assign({},this.state.searchOption)
            searchOption.departmentCode = val
            this.setState(
                {searchOption:searchOption,executeList:[]},
                ()=>{
                    this.getChartData()
                }
            )
        }
    }

    // 获取图表数据
    getChartData(){
        this.setState({chartLoading:true})
        let key = localStorage.getItem('userName')
        let params = _.assign({staffId:key},this.state.searchOption)
        Http.post('/task/productReport',params)
            .then(res=>{
                console.log(res)
                this.setState({chartLoading:false})
                if(res.resultCode === 'success'){
                    let list = res.data.list
                    let info = res.data.taskUnitInfo
                    let productIndexId = res.data.taskUnitInfo.id
                    if(list.length > 0){
                        // 设置echart数据
                        let countList = []
                        let moneyList = []
                        let nameList = []
                        _.forEach(list,(obj)=>{
                            countList.push(obj.count)
                            moneyList.push(obj.money)
                            nameList.push(obj.name)
                        })
                        let option = this.state.productChartOption
                        option.yAxis.data = nameList
                        option.series[0].data = moneyList
                        option.series[1].data = countList
                        // 设置指定人员tree型数据
                        let currentBank = _.find(this.state.bankList,(obj)=>{return obj.value === this.state.searchOption.departmentCode}).label
                        let executeTreeData = [{id:this.state.searchOption.departmentCode,label:currentBank,children:[]}]
                        _.forEach(list,(obj)=>{
                            executeTreeData[0].children.push({id:obj.code,label:obj.name,money:obj.money,count:obj.count})
                        })
                        // 设置指标单位
                        let quotaInfo = `指标${info.indexName}（单位:${info.unit}）`
                        this.setState({
                            productChartOption:option, // chart数据
                            quotaInfo:quotaInfo, // 指标单位
                            executeList:executeTreeData, // 指定人员tree型数据
                            excelData:[[]],
                            excelName:"",
                            indexId:productIndexId, // 后台新增统计图id
                            chartLoading:false
                        })
                    }else{
                        this.setState({
                            quotaInfo:"", // 指标单位
                            executeList:[], // 指定人员tree型数据
                            excelData:[[]],
                            excelName:"",
                            indexId:productIndexId, // 后台新增统计图id
                            chartLoading:false
                        })
                    }
                }
            })
            .catch(err=>{
                console.log(err)
                this.setState({chartLoading:false})
            })
    }

    // 更新数据
    updateMsg(type, val) {
        let obj = _.assign({},this.state.params)
        obj[type] = val
        this.setState({params:obj})
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
        if(fileInfo != null){
            let item = {name:fileInfo.fileName, url:fileInfo.fileUrl}
            let list = this.state.uploadFileList
            list.push(item)
            this.setState({uploadFileList: list})
        }else{

        }
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

    // 展示excel编辑器
    showExcelEditor() {
        this.setState({excelEditorShow:true})
    }

    // 关闭Excel编辑器
    closeExcel() {
        this.setState({excelEditorShow:false})
    }

    // 展示添加指定人员弹框
    showExecuteDialog() {
        this.setState({executeShowing:true})
    }

    // 添加excel人员
    addExecute() {
        if(this.state.executeList.length > 0){
            let list = this.tree.getCheckedNodes(true)
            if(list.length > 0){
                // 生成excel二维数组
                let resultArr = [["序号*","名称","累计人数（个）","累计金额（万元）",this.state.quotaInfo]]
                _.forEach(list,(obj)=>{
                    resultArr.push([obj.id,obj.label,obj.count,obj.money])
                })
                // console.log(resultArr)
                if(this.state.excelName != null && this.state.excelName !== ""){
                    this.setState({executeShowing:false,excelData:resultArr})
                }else{
                    // 获取文件名
                    let sublingList = _.find(this.state.productList,(obj)=>{return obj.value === this.state.cascaderValue[0]}).children
                    let currentProduct = _.find(sublingList,(obj)=>{return obj.value === this.state.cascaderValue[1]}).label
                    let fileName = `${currentProduct}产品.xlsx`
                    // console.log(fileName)
                    this.setState({executeShowing:false,excelName:fileName,excelData:resultArr})
                }
            }else{
                MessageBox.msgbox({
                    title:'提示',
                    message:'请选择接受成员!',
                    type:'warning'
                })
            }
        }
    }

    // 合并数据
    mergeData() {
        this.setState({loading:true})
        let params = this.state.params
        // 合并产品和机构数据
        params.productCode = this.state.searchOption.productCode
        params.departmentCode = this.state.searchOption.departmentCode
        // 合并附件
        let fileVos = []
        _.forEach(this.state.uploadFileList, (obj)=>{fileVos.push({fileName:obj.name, fileUrl: obj.url})})
        params.fileVos = fileVos
        // 设置考核分数状态
        if(!this.state.switchValue){params.score = ""}
        // 合并审批人员
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
        // 合并excel数据
        if(this.state.excelData.length > 0 && this.state.excelData[0].length > 0 && this.state.excelName !== ""){
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
            if(json.length === 0){
                MessageBox.msgbox({
                    title:'提示',
                    message:'模板内容不能为空，请添加内容!',
                    type:'error'
                })
                this.setState({loading:false})
                return
            }
            let time = new Date().getTime()
            let excelInfo = {fileName:this.state.excelName, primary:primary, sendTime:time, index:this.state.quotaInfo, indexId: this.state.indexId}
            params.excelData.data = json
            params.excelData.info = excelInfo
        }else{
            MessageBox.msgbox({
                title:'提示',
                message:'模板内容不能为空，请添加内容!',
                type:'error'
            })
            this.setState({loading:false})
            return
        }

        console.log(params)
        this.validateParams(params)
    }

    // 验证params
    validateParams(params) {
        if(params.title.replace(/^$| /g,'') !== ""){
            if(params.description.replace(/^$| /g,'') !== ""){
                if(params.taskStartTime != null && params.taskEndTime != null){
                    let bool = true
                    _.forEach(params.excelData.data,(obj)=>{
                        _.forEach(obj,(val)=>{
                            bool = bool && val !== ""
                        })
                    })
                    if(bool){
                        if(params.score === "" || /^[0-9]*[1-9][0-9]*$/.test(params.score)){
                            this.confirm(params)
                        }else{
                            MessageBox.msgbox({
                                title:'提示',
                                message:'考核分数格式有误!',
                                type:'error'
                            })
                            this.setState({loading:false})
                        }
                    }else{
                        MessageBox.msgbox({
                            title:'提示',
                            message:'请设置指标值!',
                            type:'error'
                        })
                        this.setState({loading:false})
                    }
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
                    message:'任务描述不能为空，请填写任务描述!',
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
        let key = localStorage.getItem("userName")
        params.staffId = key
        Http.post('/task/startMarketTask',params)
            .then(res=>{
                console.log(res)
                if(res.resultCode === 'success'){
                    this.setState(
                        {
                            loading:false,
                            finalApproveIdList:[],
                            uploadFileList:[],
                            excelData:[[]],
                            excelName:"",
                            params:{
                                productCode:"", // 产品
                                departmentCode: "", // 机构
                                title: "", // 任务标题
                                description: "", // 任务描述
                                taskStartTime: null, // 开始时间
                                taskEndTime: null, // 结束时间
                                excelData: {
                                    data:[],
                                    info:{fileName:null, primary:null, sendTime:null}
                                }, // 任务模板
                                approveUserIds: [], // 审批人员id
                                score:"", // 考核分数
                                fileVos: [], // 上传的附件
                                phone:false, // 通话
                                location:false // 定位
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
                this.setState({loading:false})
                console.log(err)
            })
    }


    render(){
        return(
            <div style={{position:'relative'}} ref='container'>
                <div className='task-box' style={this.state.excelEditorShow ? {transform:"translateX(-120%)"} : {}}>
                    <div className="task-market-title">发布营销任务</div>
                    {/*form表单*/}
                    <div className="task-market-block">
                        <Loading loading={this.state.loading}>
                            <div className="task-market-list">
                                <Layout.Row className='task-market-item' style={{marginTop:'20px'}}>
                                    <Layout.Col span={5} className='input-label'>选择产品<span className="input-star-badge">*</span></Layout.Col>
                                    <Layout.Col span={18} style={{paddingLeft:"40px"}}>
                                        <Cascader
                                            placeholder="请选择产品"
                                            value={this.state.cascaderValue}
                                            options={this.state.productList}
                                            showAllLevels={false}
                                            onChange={this.changeProduct.bind(this)}
                                        />
                                    </Layout.Col>
                                </Layout.Row>
                                <Layout.Row className='task-market-item'>
                                    <Layout.Col span={5} className='input-label'>选择机构<span className="input-star-badge">*</span></Layout.Col>
                                    <Layout.Col span={18} style={{paddingLeft:"40px"}}>
                                        <Select style={{width:'100%'}} value={this.state.searchOption.departmentCode} placeholder="请选择机构" onChange={this.changeBank.bind(this)}>
                                            {
                                                this.state.bankList.map(el => {
                                                    return <Select.Option key={el.value} label={el.label} value={el.value} />
                                                })
                                            }
                                        </Select>
                                    </Layout.Col>
                                </Layout.Row>
                                <Layout.Row className='task-market-item'>
                                    <Layout.Col span={5} className='input-label'>任务标题<span className="input-star-badge">*</span></Layout.Col>
                                    <Layout.Col span={18} style={{paddingLeft:"40px"}}>
                                        <Input maxLength={18} value={this.state.params.title} onChange={this.updateMsg.bind(this,'title')} placeholder='请输入任务标题'/>
                                    </Layout.Col>
                                </Layout.Row>
                                <Layout.Row className='task-market-item'>
                                    <Layout.Col span={5} className='input-label'>任务描述<span className="input-star-badge">*</span></Layout.Col>
                                    <Layout.Col span={18} style={{paddingLeft:"40px"}}>
                                        <Input maxLength={168} value={this.state.params.description} onChange={this.updateMsg.bind(this,'description')} type='textarea' autosize={{ minRows: 2, maxRows: 4}} placeholder='请输入任务描述(不超过168个字)'/>
                                    </Layout.Col>
                                </Layout.Row>
                                <Layout.Row className='task-market-item'>
                                    <Layout.Col span={5} className='input-label'>开始时间<span className="input-star-badge">*</span></Layout.Col>
                                    <Layout.Col span={18} style={{paddingLeft:"40px"}}>
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
                                <Layout.Row className='task-market-item'>
                                    <Layout.Col span={5} className='input-label'>结束时间<span className="input-star-badge">*</span></Layout.Col>
                                    <Layout.Col span={18} style={{paddingLeft:"40px"}}>
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
                                <Layout.Row className='task-market-item'>
                                    <Layout.Col span={5} className='input-label'>任务模板<span className="input-star-badge">*</span></Layout.Col>
                                    <Layout.Col span={18} style={{paddingLeft:"40px",position:"relative"}}>
                                        <Button onClick={this.showExecuteDialog.bind(this)} size='small' style={{marginTop:'5px'}} type='primary'>添加人员</Button>
                                        <div onClick={this.showExcelEditor.bind(this)} className='excel-file-cube' style={this.state.excelName != null && this.state.excelName !== "" ? {} : {display:'none'}}>
                                            <i className="iconfont icon-excel" style={{marginRight:'5px',color:'#0ab169'}}></i>
                                            <span>{this.state.excelName}</span>
                                            <i className="iconfont icon-shanchu excel-delete-btn" title='点击删除'onClick={(e)=>{
                                                e.stopPropagation()
                                                if(!this.state.excelEditorShow){
                                                    this.setState({excelData:[[]],excelName:""})
                                                }
                                            }} ></i>
                                        </div>
                                        <div style={{color:'#97A8BE',lineHeight:'30px'}}>(Excel模板需设定指标值，请设定指标后再发布。)</div>
                                    </Layout.Col>
                                </Layout.Row>
                                <Layout.Row className='task-market-item'>
                                    <Layout.Col span={5} className='input-label'>考核分数</Layout.Col>
                                    <Layout.Col span={18} style={{paddingLeft:"40px"}}>
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
                                <Layout.Row className='task-market-item'>
                                    <Layout.Col span={5} className='input-label'>审批人员</Layout.Col>
                                    <Layout.Col span={18} style={{paddingLeft:"40px"}}>
                                        <Cascader
                                            value={this.state.finalApproveIdList}
                                            props={this.state.approveOption}
                                            options={this.state.approveList}
                                            activeItemChange={this.handleApproveChange.bind(this)}
                                            onChange={(val)=>{this.setState({finalApproveIdList:val})}}
                                        />
                                    </Layout.Col>
                                </Layout.Row>
                                <Layout.Row className='task-market-item'>
                                    <Layout.Col span={5} className='input-label'>上传附件</Layout.Col>
                                    <Layout.Col span={18} style={{paddingLeft:"40px"}}>
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
                                <Layout.Row className='task-market-item'>
                                    <Layout.Col span={5} className='input-label'>通话</Layout.Col>
                                    <Layout.Col span={18} style={{paddingLeft:"40px"}}>
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
                                <Layout.Row className='task-market-item'>
                                    <Layout.Col span={5} className='input-label'>定位</Layout.Col>
                                    <Layout.Col span={18} style={{paddingLeft:"40px"}}>
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
                            </div>
                            <div style={{textAlign:'center',margin:'20px 0'}}><Button onClick={this.mergeData.bind(this)} type='primary' style={{padding:'10px 20px',letterSpacing:'2px'}}>发布任务</Button></div>
                        </Loading>
                    </div>
                    {/*chart图表*/}
                    <div className="task-market-chart">
                        <Loading loading={this.state.chartLoading} text='加载中...'>
                        {
                            this.state.executeList.length > 0
                            ?
                                <div className="task-market-chart-cube">
                                    <Echarts option={this.state.productChartOption} chartsId={2}/>
                                </div>
                            :
                            <div style={{color:'#999999',lineHeight:'720px',textAlign:'center'}}>暂无该产品的营销统计数据</div>
                        }
                        </Loading>
                    </div>
                </div>

                {/*excel编辑器*/}
                <div className="excel-editor-block" style={this.state.excelEditorShow ? {} : {transform:"translateX(-120%)"}}>
                    <HandsonTable
                        data = {this.state.excelData}
                        settings = {this.state.editorOptions}
                        fileName = {this.state.excelName}
                        show = {this.state.excelEditorShow}
                        disableTitleList={this.state.disableTitleList}
                        closeItem = {this.closeExcel.bind(this)}
                    >
                    </HandsonTable>
                </div>

                <Dialog
                    title="生成模板"
                    size="tiny"
                    top="20%"
                    style={{minWidth:'360px'}}
                    visible={ this.state.executeShowing }
                    onCancel={ () => this.setState({ executeShowing: false }) }
                    lockScroll={ true }
                >
                    <Dialog.Body style={{padding:'20px 20px 30px 20px'}}>
                        <Loading loading={this.state.chartLoading} text='加载中...'>
                            <Input onChange={(val)=>{this.tree.filter(val)}} placeholder='键入关键字搜索'/>
                            <div className='execute-tree-block' style={{borderTop:'1px solid #D8E0E9',borderBottom:'1px solid #D8E0E9'}}>
                                {
                                    this.state.executeList.length > 0
                                    ?
                                        <Tree
                                            ref={e=> this.tree = e}
                                            nodeKey="id"
                                            data={this.state.executeList}
                                            options={this.state.treeOptions}
                                            isShowCheckbox={true}
                                            defaultExpandAll={true}
                                            expandOnClickNode={false}
                                            filterNodeMethod={(value, data)=>{
                                                if (!value) return true;
                                                return data.label.indexOf(value) !== -1;
                                            }}
                                        />
                                    :
                                    <div style={{lineHeight:'80px',color:'#999999',textAlign:'center'}}>暂无指定人员数据</div>
                                }
                            </div>
                            <div style={{textAlign:'center',marginTop:'20px'}}>
                                <Button style={{marginRight:'40px'}} onClick={ () => this.setState({ executeShowing: false }) }>取消</Button>
                                <Button type='primary' onClick={this.addExecute.bind(this)}>生成任务模板</Button>
                            </div>
                        </Loading>
                    </Dialog.Body>
                </Dialog>
            </div>
        )
    }
}

export default withRouter(Fabuyingxiaorenwu1)