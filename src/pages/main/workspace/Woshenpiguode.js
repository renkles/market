import React, {Component} from 'react';
import {withRouter} from "react-router-dom";
import { Pagination, Loading, Button, Dialog, Tag, MessageBox} from 'element-react';
import Format from '../../../utils/format'
import Http from '../../../utils/http'
import _ from 'lodash'
import HandsonTable from '../../../components/handsonTable/HandsonTable'

import './woshenpiguode.scss'
import '../../../iconfont/iconfont.css'

class Woshenpiguode extends Component{
    constructor() {
        super()
        this.state={
            loading:false,
            detailLoading:false,
            currentPageType: 1, // 1: 列表页面 2:详情页面 3:excel页面
            moreUsersDialog:false,
            list:[],
            searchOption:{
                pageSize:10,
                page:1
            },
            total:1,
            taskDetail:{},
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
        }
    }

    componentWillUnmount() {
        this.setState = (state, callback) => {
            return
        }
    }

    componentDidMount(){
        this.getList()
    }

    getList(){
        this.setState({loading:true})
        let key = localStorage.getItem('userName')
        let params = _.assign({staffId: key},this.state.searchOption)
        Http.post('/task/myAuditHistory/list',params)
            .then(res=>{
                console.log(res)
                if(res.resultCode === 'success'){
                    let list = res.data.tasks
                    let total = res.data.total
                    this.setState({loading:false, list:list, total:total})
                }else{
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

    changePage(num) {
        let option = _.assign({},this.state.searchOption)
        option.page = num
        this.setState(
            {searchOption:option},
            ()=>{
                this.getList()
            }
        )
    }

    showDetail(id) {
        this.setState({currentPageType: 2, detailLoading: true})
        let key = localStorage.getItem('userName')
        let params = {staffId: key, id: id}
        Http.post('/task/audit/taskInfo', params)
            .then(res=>{
                console.log(res)
                if(res.resultCode === 'success'){
                    let detail = res.data.saleTaskDetailModel
                    this.setState({taskDetail: detail, detailLoading: false})
                }else{
                    this.setState({currentPageType: 1, detailLoading: false})
                    MessageBox.msgbox({
                        title:'提示',
                        message:'获取数据失败!',
                        type:'error'
                    })
                }
            })
            .catch(err=>{
                console.log(err)
                this.setState({currentPageType: 1, detailLoading: false})
            })
    }

    turnBackToList() {
        this.setState({
            currentPageType:1,
            taskDetail:{},
            excelData:[[]], // excel数据
            excelName:"", // excel文件名
        })
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

    render(){
        return(
            <div style={{position:'relative'}}>
                {/*列表页*/}
                <div className='approved-list-block' style={parseInt(this.state.currentPageType) === 1 ? {} : {transform:'scale(0)'}}>
                    <div className="approve-list-title">已审批任务</div>
                    <Loading loading={this.state.loading}>
                        <ul className="approved-list">
                            {
                                this.state.list != null && this.state.list.length > 0
                                    ?
                                    this.state.list.map((el,index)=>
                                        <li onClick={this.showDetail.bind(this, el.id)} className="approved-item" key={index}>
                                            <div className="item-icon-cube">
                                                <i className="iconfont icon-bianjiguanli"></i>
                                            </div>
                                            <div className='task-item-info'>
                                                <span style={{fontWeight:'bold'}}>任务名称：{el.title}</span>
                                                <br/>
                                                <span style={{color:'#999999'}}>审批时间：{new Date(el.auditDate).toLocaleString().replace(/\//g,'-')}</span>
                                            </div>
                                            <div className="task-status-icon">
                                                <i style={parseInt(el.status) === 0 ? {fontSize:'18px',lineHeight:'60px',color: "#54D092"} : {display:'none'}} className="el-icon-circle-check"></i>
                                                <i style={parseInt(el.status) === 1 ? {fontSize:'18px',lineHeight:'60px',color: '#F76260'} : {display:'none'}} className="el-icon-circle-close"></i>
                                            </div>
                                        </li>
                                    )
                                    :
                                    <li style={{textAlign:'center',lineHeight:'80px',color:'#999999',borderBottom: '1px solid #EAEAEA'}}>暂无数据...</li>
                            }
                        </ul>
                        <div style={{textAlign:'center'}}>
                            <Pagination layout="prev, pager, next" total={this.state.total} pageSize={this.state.searchOption.pageSize} onCurrentChange={this.changePage.bind(this)}/>
                        </div>
                    </Loading>
                </div>

                {/*详情页面*/}
                <div className="task-detail-block" style={parseInt(this.state.currentPageType) === 2 ? {} : {transform:'scale(0)'}}>
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
                                            &&
                                            <span onClick={this.showReadExcelBlock.bind(this,this.state.taskDetail.excelJson)} className='file-item' title='查看Excel文件'><i className="iconfont icon-excel" style={{color:'#0AB169'}}></i>{Format.formatFileName(JSON.parse(this.state.taskDetail.excelJson).info.fileName)}</span>
                                        }
                                    </div>
                                </div>
                                <div className="task-detail-comment">
                                    备注：{this.state.taskDetail.comment != null && this.state.taskDetail.comment !== "" ? this.state.taskDetail.comment : "无"}
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
            </div>
        )
    }
}
export default withRouter(Woshenpiguode)