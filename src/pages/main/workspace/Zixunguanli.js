import React, {Component} from 'react';
import {withRouter} from "react-router-dom";
import {Button, Loading, Layout, Dialog, Input, Upload, MessageBox, Pagination} from 'element-react'
import Http from '../../../utils/http'
import _ from 'lodash'
import BaseUrl from '../../../utils/api'
import store from "../../../store"
import Validate from '../../../utils/validate'
import Format from '../../../utils/format'

import './zixunguanli.scss'
import axios from "axios/index";

class Zixunguanli extends Component {
    constructor() {
        super()
        this.state = {
            bannerList:[],
            loading:false,
            dialogLoading:false,
            searchOption:{
                page: 1,
                pageSize: 10,
            },
            total:1,
            dialogVisible:0, // 0:关闭 1:添加 2:修改
            currentInfo:{
                id: null,
                title: "",
                content: "",
                attachmentList: []
            },
            currentPictureList:[],
            checkPictureDialog:false,
            currentPicture:""
        }
    }

    componentDidMount() {
        this.getList()
    }


    getList() {
        this.setState({loading:true})
        let key = localStorage.getItem('userName')
        let params = _.assign({staffId:key},this.state.searchOption)
        Http.post('/information/list/query',params)
            .then(res=>{
                console.log(res)
                if(res.resultCode === "success"){
                    let list = res.data.infos
                    let total = res.data.total
                    this.setState({bannerList:list,loading:false,total:total})
                }else{
                    MessageBox.msgbox({
                        title:'提示',
                        message:'获取数据失败!',
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

    changePage(n) {
        let option = _.assign({},this.state.searchOption)
        option.page = n
        this.setState(
            {searchOption:option},
            ()=>{
                this.getList()
            }
        )
    }

    // 展示添加框
    showAddDialog() {
        this.setState({dialogVisible:1},)
    }

    // 打开编辑框
    showEditDialog(id) {
        let currentItem = _.find(this.state.bannerList,(obj)=>{return obj.id === id})
        let currentInfo = this.state.currentInfo
        currentInfo.title = currentItem != null ? currentItem.title : ""
        currentInfo.content = currentItem != null ? currentItem.content : ""
        currentInfo.id = id
        let list = []
        _.forEach(currentItem.fileModels,(obj)=>{list.push({name: obj.fileName, url: obj.fileUrl})})
        this.setState({currentInfo:currentInfo,dialogVisible:2,currentPictureList:list})
    }

    // 删除资讯
    deleteItem(id) {
        let key = localStorage.getItem('userName')
        let params = {ids:[id],staffId:key}
        MessageBox.confirm('确认删除该条资讯，删除后不可恢复!', '提示', {
            type: 'warning'
        }).then(() => {
            this.setState({loading:true})
            Http.post('/information/del',params)
                .then(res=>{
                    if(res.resultCode === "success"){
                        let option = _.assign({},this.state.searchOption)
                        option.page = 1
                        this.setState(
                            {searchOption:option},
                            ()=>{
                                this.getList()
                            }
                        )
                        MessageBox.msgbox({
                            title:'提示',
                            message:'删除成功!',
                            type:'success'
                        })
                    }else{
                        this.setState({loading:false})
                        MessageBox.msgbox({
                            title:'提示',
                            message:'删除失败!',
                            type:'error'
                        })
                    }
                })
        }).catch(() => {
            console.log('用户点击取消')
            this.setState({loading:false})
        })
    }

    closeDialog() {
        this.setState({
            dialogVisible:0,
            currentInfo:{
                id: null,
                title: "",
                content: "",
                attachmentList: [],
            },
            currentPictureList:[]
        })
    }

    // 更新数据
    updateMsg(type,val) {
        let info = this.state.currentInfo
        info[type] = val
        this.setState({currentInfo:info})
    }

    // 上传图片
    handleFileChange(e) {
        const file = e.target.files[0]
        console.log(file)
        if(file.type === "image/jpg" || file.type === "image/jpeg" || file.type === "image/png"){
            const formData = new FormData();
            formData.append('file',file, file.name)
            axios.post(`${BaseUrl}file/singleUpload`, formData, {headers: {'Authorization': localStorage.getItem('authorization')}})
                .then(
                    res=> {
                        console.log(res)
                        let obj = {name:res.data.data.fileName,url:res.data.data.fileUrl}
                        let pictureList = [...this.state.currentPictureList]
                        pictureList.push(obj)
                        this.setState({currentPictureList:pictureList})
                    }
                )
                .catch(
                    err=>{
                        console.log(err)
                        MessageBox.msgbox({
                            title:'提示',
                            message:'上传图片失败',
                            type:'error'
                        })
                    }
                )
        }else{
            MessageBox.msgbox({
                title:'提示',
                message:'请选择图片格式的文件',
                type:'error'
            })
        }
    }

    // 删除图片
    removePicture(index) {
        let pictureList = [...this.state.currentPictureList]
        pictureList.splice(index,1)
        this.setState({currentPictureList: pictureList})
    }

    // 添加或者编辑
    confirm(){
        this.setState({dialogLoading:true})
        // 整合参数
        let params = this.state.currentInfo
        let list = []
        _.forEach(this.state.currentPictureList,(obj)=>{list.push({fileName: obj.name, fileUrl: obj.url})})
        params.attachmentList = list
        if(this.state.dialogVisible === 1){delete params.id}
        let key = localStorage.getItem('userName')
        params.staffId = key
        console.log(params)

        if(Validate.validateNotEmpty(params.title)){
            if(Validate.validateNotEmpty(params.content)){
                Http.post('/information/publish',params)
                    .then(res=>{
                        console.log(res)
                        if(res.resultCode === "success"){
                            MessageBox.msgbox({
                                title:'提示',
                                message:'发布资讯成功!',
                                type:'success'
                            })
                            this.setState(
                                {dialogLoading:false},
                                ()=>{
                                    this.closeDialog()
                                    this.getList()
                                }
                            )
                        }else{
                            this.setState({dialogLoading:false})
                            MessageBox.msgbox({
                                title:'提示',
                                message:'发布资讯失败!',
                                type:'error'
                            })
                        }
                    })
                    .catch(err=>{
                        console.log(err)
                        this.setState({dialogLoading:false})
                    })
            }else{
                this.setState({dialogLoading:false})
                MessageBox.msgbox({
                    title:'提示',
                    message:'请设置资讯内容!',
                    type:'error'
                })
            }
        }else{
            this.setState({dialogLoading:false})
            MessageBox.msgbox({
                title:'提示',
                message:'请设置资讯标题!',
                type:'error'
            })
        }

    }


    render() {
        return  (
            <div style={{position: 'relative'}}>
                <div className="banner-edit-list-block">
                    <Loading loading={this.state.loading} text='加载中...'>
                        <div className="banner-edit-list-title">
                            资讯列表
                            <Button onClick={this.showAddDialog.bind(this)} size='small' style={{float:'right',color:'#FFFFFF',backgroundColor:'#0AB169',marginTop:'11px',marginRight:'20px'}}>发布新资讯</Button>
                        </div>
                        <div className="banner-edit-list-cube">
                            <table className='banner-list-table-style'>
                                <thead>
                                <tr>
                                    <td>标题</td>
                                    <td>创建人员</td>
                                    <td>创建时间</td>
                                    <td>更新人员</td>
                                    <td>更新时间</td>
                                    <td>操作</td>
                                </tr>
                                </thead>
                                <tbody>
                                {
                                    this.state.bannerList != null && this.state.bannerList.length > 0
                                        ?
                                        this.state.bannerList.map(el=>
                                            <tr key={el.id}>
                                                <td>{el.title}</td>
                                                <td>{el.creator}</td>
                                                <td>{Format.formatTime(el.createTime)}</td>
                                                <td>{el.editor != null && el.editor !== "" ? el.editor : "------"}</td>
                                                <td>{Format.formatTime(el.editTime)}</td>
                                                <td>
                                                    <i onClick={this.showEditDialog.bind(this,el.id)} className="iconfont icon-bianji" title="编辑资讯" style={{marginRight:'15px',color:'#0AB169',padding:'5px',cursor:'pointer'}}></i>
                                                    <i onClick={this.deleteItem.bind(this,el.id)} className="iconfont icon-shanchu" title="删除资讯" style={{color:'#FF4949',padding:'5px',cursor:'pointer'}}></i>
                                                </td>
                                            </tr>
                                        )
                                        :
                                        <tr><td colSpan={6}> 暂无数据...</td></tr>
                                }
                                </tbody>
                            </table>
                        </div>
                        <div style={{textAlign:'center',marginTop:'20px'}}>
                            <Pagination layout="prev, pager, next" total={this.state.total} pageSize={this.state.searchOption.pageSize} onCurrentChange={this.changePage.bind(this)}/>
                        </div>
                    </Loading>
                </div>

                {/*弹框*/}
                <Dialog
                    title={this.state.dialogVisible === 1 ? "新增资讯" : "编辑资讯"}
                    size="small"
                    style={{minWidth:'660px'}}
                    visible={ this.state.dialogVisible !== 0 }
                    onCancel={ this.closeDialog.bind(this) }
                    lockScroll={ false }
                >
                    <Dialog.Body>
                        <Loading loading={this.state.dialogLoading}>
                            <div className="dialog-content-block">
                                <Layout.Row className="dialog-content-item">
                                    <Layout.Col span={4} style={{textAlign:'right'}}>标题:</Layout.Col>
                                    <Layout.Col span={16} offset={1}>
                                        <Input value={this.state.currentInfo.title} onChange={this.updateMsg.bind(this,"title")} placeholder='请输入资讯标题' maxLength={18}/>
                                    </Layout.Col>
                                </Layout.Row>
                                <Layout.Row className="dialog-content-item">
                                    <Layout.Col span={4} style={{textAlign:'right'}}>内容:</Layout.Col>
                                    <Layout.Col span={16} offset={1}>
                                        <Input value={this.state.currentInfo.content} onChange={this.updateMsg.bind(this,"content")} type='textarea' autosize={{ minRows: 6, maxRows: 10}} placeholder='请输入资讯内容'/>
                                    </Layout.Col>
                                </Layout.Row>
                                <Layout.Row className="dialog-content-item">
                                    <Layout.Col span={4} style={{textAlign:'right'}}>图片:</Layout.Col>
                                    <Layout.Col span={16} offset={1}>
                                        {
                                            this.state.currentPictureList.map((el,index)=>
                                                <div className="uploaded-img-list" key={index}>
                                                    <img src={el.url} alt="" style={{width:"100%",height:'100%'}}/>
                                                    <div className='uploaded-img-delete-cube'>
                                                        <i onClick={this.removePicture.bind(this,index)} className="iconfont icon-lajixiang delete-img-btn"></i>
                                                    </div>
                                                </div>
                                            )
                                        }
                                        <div className='upload-img-cube'>
                                            <div className="upload-cube-plus"><i className="el-icon-plus add-image-btn"></i></div>
                                            <input
                                                type="file"
                                                value={''}
                                                accept="image/jpeg,image/jpg,image/png"
                                                onChange={this.handleFileChange.bind(this)}
                                            />
                                        </div>
                                    </Layout.Col>
                                </Layout.Row>
                            </div>
                            <div className="dialog-btn-list">
                                <Button onClick={ this.closeDialog.bind(this) } style={{marginRight:'60px'}}>取消</Button>
                                <Button onClick={ this.confirm.bind(this)} type="primary">{this.state.dialogVisible === 1 ? "新增" : "编辑"}</Button>
                            </div>
                        </Loading>
                    </Dialog.Body>
                </Dialog>
            </div>
        )
    }
}

export default withRouter(Zixunguanli)