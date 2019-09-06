import React, {Component} from 'react';
import {withRouter} from "react-router-dom";
import {Button, Loading, Menu, Input, Dialog, MessageBox, Layout} from 'element-react'
import Http from '../../../utils/http'
import Cropper from 'react-cropper'
import axios from 'axios'
import baseUrl from '../../../utils/api'
import Validate from '../../../utils/validate'
import BraftEditor from 'braft-editor'
import _ from 'lodash'

import './chanpinguanli.scss'
import '../../../iconfont/iconfont.css'
import "cropperjs/dist/cropper.css"
import 'braft-editor/dist/index.css'
import 'braft-editor/dist/output.css'


class Chanpinguanli extends Component {
    constructor() {
        super()
        this.state = {
            searchText:"",
            productList: [],
            productLoading: false,
            dialogLoading: false,
            detailLoading:false,
            editorLoading: false,
            cropperLoading: false,
            currentSelectedProduct: {
                id:"",
                parentId:"",
                name:""
            }, // 当前选中产品
            productDialog: 0, // 0:取消 1：添加 2：修改
            dialogProductInfo: {
                fileName: "",
                url: "",
                name:"",
                parentId:"",
                id:""
            }, // 弹框产品详情
            currentOpenIndex:[], // 当前展开的产品列表的index
            isEditBlock:false, // 切换编辑和详情页
            productDetail: null, // 详情html字段
            productEditDetail:null, // 当前编辑内容
            sizeBase: 23.4375 // rem转换基准值
        }
    }

    componentWillUnmount() {
        this.setState = (state, callback) => {
            return
        }
    }

    componentDidMount() {
        this.getProductList()
    }

    // 获取产品列表
    getProductList() {
        this.setState({productLoading:true})
        Http.post('/product/list')
            .then(
                res=> {
                    console.log(res)
                    if(res.resultCode === 'success'){
                        this.setState({productList:res.data,productLoading:false})
                    }else{
                        console.log('获取数据失败')
                        this.setState({productLoading:false})
                    }
                }
            )
            .catch(
                err=>{
                    console.log(err)
                    this.setState({productLoading:false})
                }
            )
    }

    // 搜索列表
    showItem(val) {
        if(val !== ""){
            // 展开所有列表
            let list = []
            _.forEach(this.state.productList,(obj)=>{list.push(obj.id)})
            this.setState({currentOpenIndex:list,searchText:val})
        }else{
            let openIndex = []
            if(this.state.currentSelectedId !== ""){
                _.forEach(this.state.productList, (obj)=>{
                    if(obj.children != null && obj.children.length > 0){
                        let item = _.find(obj.children, (insideObj)=>{return insideObj.id === this.state.currentSelectedProduct.id})
                        if(item !== undefined){openIndex = [item.parentId]}
                    }
                })
            }
            this.setState({currentOpenIndex:openIndex,searchText:val})
        }
    }

    // 添加弹窗
    showAddProductDialog(id,e){
        e.stopPropagation()
        let obj = _.assign({},this.state.dialogProductInfo)
        obj.parentId = id
        this.setState({
            productDialog:1,
            dialogProductInfo:obj,
            currentOpenIndex:[id],
            currentSelectedProduct: {id: "", parentId: "", name: ""},
            isEditBlock:false,
            productDetail:null,
            productEditDetail:BraftEditor.createEditorState(null)
        })
    }

    // 编辑弹框
    showEditProductDialog(id, parentId, url, name, e) {
        e.stopPropagation()
        let obj = _.assign({},this.state.dialogProductInfo)
        obj.id = id
        obj.parentId = parentId
        obj.url = url
        obj.name = name
        this.setState({
            productDialog:2,
            dialogProductInfo:obj,
            currentOpenIndex:[parentId],
            currentSelectedProduct: {id: "", parentId: "", name: ""},
            isEditBlock:false,
            productDetail:null,
            productEditDetail:BraftEditor.createEditorState(null)
        })
    }

    // 删除弹框
    showDeleteProductDialog(id, parentId, e) {
        e.stopPropagation()
        this.setState({
            currentOpenIndex:[parentId],
            currentSelectedProduct: {id: "", parentId: "", name: ""},
            isEditBlock:false,
            productDetail:null,
            productEditDetail:BraftEditor.createEditorState(null)
        })
        if(parentId === 0){
            // 判断该分类下有无子产品
            let targetObj = _.find(this.state.productList,(obj)=>{return obj.id === id})
            if(targetObj != null){
                if(targetObj.children != null && targetObj.children.length > 0){
                    MessageBox.msgbox({
                        title:'提示',
                        message:'该分类下存有产品,暂且不能删除!',
                        type:'error'
                    })
                }else{
                    MessageBox.confirm('确认删除该分类，删除后不可恢复!', '提示', {
                        type: 'error'
                    }).then(() => {
                        this.deleteItem(id)
                    }).catch(() => {
                        console.log('取消')
                    })
                }
            }else{
                console.log('不存在该分类')
            }
        }else{
            MessageBox.confirm('确认删除该产品，删除后不可恢复!', '提示', {
                type: 'error'
            }).then(() => {
                this.deleteItem(id)
            }).catch(() => {
                console.log('取消')
            })
        }
    }

    // 删除产品或分类
    deleteItem(id){
        let params = {id: id}
        Http.post('/product/delete',params)
            .then(
                res=> {
                    console.log(res)
                    if(res.resultCode === 'success'){
                        this.getProductList()
                    }else{
                        MessageBox.msgbox({
                            title:'提示',
                            message:'删除失败!',
                            type:'error'
                        })
                    }
                }
            )
            .catch(
                err=> {
                    console.log(err)
                }
            )
    }

    // 关闭添加编辑弹窗
    closeAddDialog() {
        this.setState({
            productDialog: 0,
            dialogProductInfo: {
                fileName: "",
                url: "",
                name:"",
                parentId:"",
                id:""
            }
        })
    }

    // 选择产品类型图片
    handleFileChange(e) {
        const file = e.target.files[0]
        if(file.type === "image/jpg" || file.type === "image/jpeg" || file.type === "image/png"){
            // 获取图片base64编码
            const fileReader = new FileReader()
            fileReader.readAsDataURL(file)
            fileReader.onload = (item) => {
                const dataURL = item.target.result
                let info = _.assign({},this.state.dialogProductInfo)
                info.fileName = file.name
                this.setState(
                    {dialogProductInfo: info},
                    ()=> {
                        this.cropper.replace(dataURL)
                    }
                )
            }
        }else{
            MessageBox.msgbox({
                title:'提示',
                message:'请选择图片格式的文件',
                type:'error'
            })
        }
    }

    // 裁剪图片
    handleSubmit() {
        if(this.state.dialogProductInfo.fileName === "") {
            MessageBox.msgbox({
                title:'提示',
                message:'请选择需要裁剪的图片',
                type:'error'
            })
            return
        }

        if(this.cropper.getCroppedCanvas() == null) {return}
        this.cropper.getCroppedCanvas({fillColor:'#FFFFFF'}).toBlob(async blob => {
            if(blob == null){
                MessageBox.msgbox({
                    title:'提示',
                    message:'请合理裁剪图片',
                    type:'error'
                })
                return
            }
            blob.name = this.state.dialogProductInfo.fileName
            const fileData = new FormData()
            fileData.append('file', blob, blob.name)

            this.setState({cropperLoading:true})

            axios.post(`${baseUrl}file/singleUpload`, fileData, {headers: {'Authorization': localStorage.getItem('authorization')}})
                .then(
                    res => {
                        console.log(res)
                        let imgUrl = res.data.data.fileUrl
                        let dialogProductInfo = _.assign({},this.state.dialogProductInfo)
                        dialogProductInfo.url = imgUrl
                        dialogProductInfo.fileName = ""
                        this.setState({dialogProductInfo:dialogProductInfo,cropperLoading:false})
                    }
                )
                .catch(
                    err => {
                        console.log(err)
                        this.setState({cropperLoading:false})
                    }
                )
        },"image/jpeg")

    }

    // 编辑器上传图片
    uploadImage(param) {
        let imageData = param.file
        console.log(imageData.type)
        if(!/image\/\w+/.test(imageData.type)){
            MessageBox.msgbox({
                title:'提示',
                message:'请选择图片格式文件!',
                type:'error'
            })
            return
        }else{
            const formData = new FormData();
            formData.append('file',imageData, param.file.name)

            axios.post(`${baseUrl}file/singleUpload`, formData, {headers: {'Authorization': localStorage.getItem('authorization')}})
                .then(
                    res=> {
                        console.log(res)
                        let url = res.data.data.fileUrl
                        param.success({
                            url: url,
                            meta: {title: '产品图片', alt: '图片'}
                        })
                    }
                )
                .catch(
                    err=>{
                        console.log(err)
                    }
                )
        }
    }

    // 添加更新产品或分类
    handleUpdateProduct() {
        let type = this.state.productDialog
        let userName = localStorage.getItem('userName')
        switch (type) {
            case 1:
                let parentId = this.state.dialogProductInfo.parentId
                let params = {
                    name: this.state.dialogProductInfo.name,
                    creatorId: userName,
                    editorId: userName,
                    parentId: parentId
                }
                if (parentId === 0) { // 添加分类
                    let params1 = _.assign({imgAddress: this.state.dialogProductInfo.url}, params)
                    if (this.checkProduct(params1)) {
                        this.setState({dialogLoading: true})
                        Http.post('/product/insert', params1)
                            .then(
                                res => {
                                    console.log(res)
                                    if (res.resultCode === 'success') {
                                        this.setState(
                                            {dialogLoading: false},
                                            () => {
                                                this.closeAddDialog()
                                                this.getProductList()
                                            }
                                        )
                                    } else {
                                        console.log('添加分类失败')
                                        this.setState({dialogLoading: false})
                                    }
                                }
                            )
                            .catch(
                                err => {
                                    console.log(err)
                                    this.setState({dialogLoading: false})
                                }
                            )
                    }
                } else { // 添加产品
                    if (this.checkProduct(params)) {
                        this.setState({dialogLoading: true})
                        Http.post('/product/insert', params)
                            .then(
                                res => {
                                    console.log(res)
                                    if (res.resultCode === 'success') {
                                        this.setState(
                                            {dialogLoading: false, isEditBlock: true, editorLoading: true},
                                            () => {
                                                let parentId = params.parentId
                                                this.closeAddDialog()
                                                this.getProductList()
                                                this.chooseProduct(res.data, parentId, params.name)
                                            }
                                        )
                                    } else {
                                        console.log('添加产品失败')
                                        this.setState({dialogLoading: false})
                                    }
                                }
                            )
                            .catch(
                                err => {
                                    console.log(err)
                                    this.setState({dialogLoading: false})
                                }
                            )
                    }
                }

                break
            case 2:
                let parentId2 = this.state.dialogProductInfo.parentId
                let params2 = {
                    editorId: userName,
                    id: this.state.dialogProductInfo.id,
                    imgAddress: this.state.dialogProductInfo.url,
                    name: this.state.dialogProductInfo.name,
                    parentId: parentId2,
                }
                if (this.checkProduct(params2)) {
                    this.setState({dialogLoading: true})
                    Http.post('/product/edit', params2)
                        .then(
                            res => {
                                console.log(res)
                                if (res.resultCode === 'success') {
                                    this.setState(
                                        {dialogLoading: false},
                                        () => {
                                            this.closeAddDialog()
                                            this.getProductList()
                                        }
                                    )
                                } else {
                                    console.log('添加分类失败')
                                    this.setState({dialogLoading: false})
                                }
                            }
                        )
                        .catch(
                            err => {
                                console.log(err)
                                this.setState({dialogLoading: false})
                            }
                        )
                }
                break
            default:
                break
        }
    }

    // 检测产品参数
    checkProduct(obj){
        if(Validate.validateNotEmpty(obj.name)){
            if(obj.parentId === 0){
                if(obj.imgAddress !== ""){
                    return true
                }else{
                    MessageBox.msgbox({
                        title:'提示',
                        message:'请添加图片!',
                        type:'error'
                    })
                    return false
                }
            }else{
                return true
            }
        }else{
            MessageBox.msgbox({
                title:'提示',
                message:'分类名称不能为空',
                type:'error'
            })
            return false
        }
    }

    // 选择产品
    chooseProduct(id,parentId,name,e) {
        if(id === this.state.currentSelectedProduct.id){return} // 排除选择相同产品
        if(e){e.stopPropagation()}
        this.setState(
            {
                currentSelectedProduct: {id: id, parentId: parentId, name: name},
                detailLoading: true,
                editorLoading: true,
                isEditBlock: false,
                productDetail:null,
                productEditDetail:null,
            },
            ()=>{
                this.showProductDetail()
            }
        )
    }

    // 展示产品详情
    showProductDetail(){
        let key = localStorage.getItem('userName')
        let params={
            id: this.state.currentSelectedProduct.id,
            staffId: key
        }
        Http.post('/product/pc/getDetail',params)
            .then(
                res=> {
                    console.log(res)
                    if(res.resultCode === 'success'){
                        let html = res.data.procuctDescripton === "" ? null : res.data.procuctDescripton
                        let braftHtml = BraftEditor.createEditorState(html)
                        this.setState({
                            detailLoading:false,
                            editorLoading:false,
                            productDetail:html,
                            productEditDetail:braftHtml,
                        })
                    }else{
                        MessageBox.msgbox({
                            title:'提示',
                            message:'获取产品详情失败',
                            type:'error'
                        })
                        console.log('获取详情失败')
                        this.setState({
                            detailLoading:false,
                            editorLoading:false,
                            productDetail:null,
                            productEditDetail:BraftEditor.createEditorState(null)
                        })
                    }
                }
            )
            .catch(
                err=> {
                    console.log(err)
                    this.setState({detailLoading:false, editorLoading:false,productDetail:null,productEditDetail:BraftEditor.createEditorState(null)})
                }
            )
    }

    // 编辑器更新内容
    updateProductDetail(html) {
        this.setState({productEditDetail:html})
    }

    // 上传产品编辑详情
    confirmProductDetail() {
        let userName = localStorage.getItem('userName')
        let newDesc = this.state.productEditDetail.toHTML()
        let params = {
            editorId: userName,
            id: this.state.currentSelectedProduct.id,
            name: this.state.currentSelectedProduct.name,
            parentId: this.state.currentSelectedProduct.parentId,
            description: newDesc,
        }
        this.setState({editorLoading:true})
        Http.post('/product/edit',params)
            .then(
                res=>{
                    console.log(res)
                    if(res.resultCode === 'success'){
                        this.setState({isEditBlock:false,productDetail:newDesc,editorLoading:false})
                    }else{
                        console.log('编辑失败')
                        MessageBox.msgbox({
                            title:'提示',
                            message:'编辑产品详情失败',
                            type:'error'
                        })
                        let oldHtml = this.state.productDetail
                        this.setState({productEditDetail:BraftEditor.createEditorState(oldHtml),editorLoading:false})
                    }
                }
            )
            .catch(
                err=> {
                    console.log(err)
                    let oldHtml = this.state.productDetail
                    this.setState({productEditDetail:BraftEditor.createEditorState(oldHtml),editorLoading:false})
                }
            )
    }

    // 显示编辑页面
    showEditBlock() {
        if(this.state.currentSelectedProduct.id === ""){
            MessageBox.msgbox({
                title:'提示',
                message:'您还未选择产品',
                type:'error'
            })
        }else{
            this.setState({isEditBlock:true})
        }
    }

    // 隐藏编辑页面
    hideEditBlock() {
        let html = this.state.productDetail
        let braftHtml = BraftEditor.createEditorState(html)
        this.setState({isEditBlock:false, productEditDetail:braftHtml})
    }

    render() {
        let text = this.state.searchText
        // 编辑器组件
        const editorControls = ['undo', 'redo', 'separator',
            'font-size', 'line-height', 'letter-spacing', 'separator',
            'text-color', 'bold', 'italic', 'underline', 'strike-through', 'separator',
            'superscript', 'subscript', 'remove-styles',  'separator', 'text-indent', 'text-align', 'separator',
            'headings', 'list-ul', 'list-ol', 'blockquote', 'separator',
            'link', 'separator', 'hr', 'separator',
            'media', 'separator',
            'clear']

        // 编辑器尺寸转换（输入）
        const unitImportFn = (unit, type, source)=> {
            // 此函数的返回结果，需要过滤掉单位，只返回数值
            if (unit.indexOf('rem')) {
                return parseFloat(unit, 10) * this.state.sizeBase
            } else {
                return parseFloat(unit, 10)
            }

        }

        // 编辑器尺寸转换（输出）
        const unitExportFn = (unit, type, target)=> {
            // 输出行高时不添加单位
            if (type === 'line-height') {
                return unit
            }
            // target的值可能是html或者editor，对应输出到html和在编辑器中显示这两个场景
            if (target === 'html') {
                // 只在将内容输出为html时才进行转换
                return unit / this.state.sizeBase + 'rem'
            } else {
                // 在编辑器中显示时，按px单位展示
                return unit + 'px'
            }
        }

        // hooks
        const hooks = {
            'set-image-size': (data) => {
                console.log(data)
                return data
            }
        }

        return (
            <div style={{position: 'relative'}}>
                {/*左侧产品列表*/}
                <div className="product-cube-left">
                    <Loading loading={this.state.productLoading} text='加载中...'>
                        <div style={{padding:'10px 20px'}}>
                            <Input placeholder='搜索...' value={this.state.searchText} onChange={this.showItem.bind(this)}/>
                        </div>
                        <div className="product-cube-title">所有产品<i onClick={this.showAddProductDialog.bind(this,0)} className='iconfont icon-tianjia icon-style' title='添加产品分类'></i></div>
                        <div className="product-list-menu">
                            <Menu defaultOpeneds={this.state.currentOpenIndex} onOpen={(index)=>{this.setState({currentOpenIndex:[index]})}}>
                                {
                                    this.state.productList.map((el, index)=>
                                        <Menu.SubMenu
                                            key={index}
                                            index={el.id}
                                            style={
                                                this.state.searchText !== ""
                                                ?
                                                    el.name.indexOf(text) === -1
                                                    ?
                                                        el.children != null && el.children.length > 0
                                                        ?
                                                            _.find(el.children,(obj)=>{return obj.name.indexOf(text) !== -1}) != null
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
                                                <div>
                                                    <img src={el.imgUrl} alt="" style={{width:'36px',height:'36px',borderRadius:'50%',marginRight:'10px'}}/>
                                                    {el.name}
                                                    <span style={{position:'relative',top:"-2px"}}>（{el.children != null ? el.children.length : 0}）</span>
                                                    <i onClick={this.showEditProductDialog.bind(this, el.id, 0, el.imgUrl, el.name)} className='iconfont icon-bianji menu-icon-style' style={{marginRight:'25px'}} title='修改分类名称'></i>
                                                    <i onClick={this.showDeleteProductDialog.bind(this, el.id, 0)} className='iconfont icon-lajixiang menu-icon-style' title='删除该分类'></i>
                                                    <i onClick={this.showAddProductDialog.bind(this,el.id)} className='iconfont icon-tianjia menu-icon-style' title='添加产品'></i>
                                                </div>
                                            }
                                        >
                                            {
                                                el.children != null && el.children.length > 0
                                                    ?
                                                    el.children.map((item, insideIndex)=>
                                                        <Menu.Item
                                                            key={insideIndex}
                                                            index={item.id}
                                                            style={
                                                                this.state.searchText !== ""
                                                                    ?
                                                                    el.name.indexOf(text) !== -1
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
                                                                onClick={this.chooseProduct.bind(this, item.id, el.id, item.name)}
                                                                style={this.state.currentSelectedProduct.id === item.id ? {color:'#0D93FF'}:{color:'#48576A'}}
                                                            >
                                                                {item.name}
                                                                <i onClick={this.showEditProductDialog.bind(this, item.id, el.id, "", item.name)} className='iconfont icon-bianji menu-icon-style' title='修改产品名称' style={this.state.currentSelectedProduct.id === item.id ? {color:'#0D93FF'}:{}}></i>
                                                                <i onClick={this.showDeleteProductDialog.bind(this, item.id, el.id)} className='iconfont icon-lajixiang menu-icon-style' title='删除该产品' style={this.state.currentSelectedProduct.id === item.id ? {color:'#0D93FF'}:{}}></i>
                                                                <i className="iconfont icon-sanjiao" style={this.state.currentSelectedProduct.id === item.id ? {position:'absolute',right:'20px',top:'-2px'} : {display:'none'}}></i>
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

                {/*右侧产品基本信息*/}
                <div className="product-cube-right" style={this.state.isEditBlock ? {transform: 'translateX(120%)'} : {}}>
                    <p className="product-title">
                        产品基本信息{this.state.currentSelectedProduct.name === "" ? null : `  —  ${this.state.currentSelectedProduct.name}`}
                        <span onClick={this.showEditBlock.bind(this)} style={{float:'right',marginRight:'20px',fontSize:'15px',color:'#5AC18D',letterSpacing:'0',cursor:'pointer'}}>自定义 <i className='iconfont icon-bianjiguanli' style={{fontSize:'15px'}}></i></span>
                    </p>
                    {
                        this.state.currentSelectedProduct.id === ''
                        ?
                        <div style={{lineHeight:'640px',textAlign:'center',color:'#999999'}}>您还未从左侧列表选择展示产品详情</div>
                        :
                        <Loading loading={this.state.detailLoading} text='加载中...'>
                            <div className="html-box">
                                {
                                    this.state.productDetail == null
                                        ?
                                        <div style={{textAlign:'center',lineHeight:'600px',color:'#999999'}}>该产品暂无详情 <span onClick={this.showEditBlock.bind(this)} style={{color:'#0D93FF',cursor:'pointer'}}>去编辑</span></div>
                                        :
                                        <div className='braft-output-content' dangerouslySetInnerHTML={{ __html: this.state.productDetail }} />
                                }
                            </div>
                    </Loading>
                    }
                </div>

                {/*右侧编辑产品*/}
                <div className="product-cube-edit" style={this.state.isEditBlock ? {} : {transform: 'translateX(120%)'}}>
                    <Loading loading={this.state.editorLoading}>
                        <BraftEditor
                            className="my-editor"
                            placeholder="请编辑产品详情"
                            value={this.state.productEditDetail}
                            converts={{ unitImportFn, unitExportFn }}
                            onChange={this.updateProductDetail.bind(this)}
                            controls={editorControls}
                            hooks={hooks}
                            media={{
                                uploadFn: this.uploadImage.bind(this),
                                accepts:{image: 'image/png,image/jpeg,image/jpg', video: false, audio: false}
                            }}
                        />
                    </Loading>
                    <div className='edit-btn-list'>
                        <Button onClick={this.hideEditBlock.bind(this)}>取消</Button>
                        <Button type='primary' onClick={this.confirmProductDetail.bind(this)}>确定</Button>
                    </div>
                </div>

                {/*添加编辑弹框*/}
                <Dialog
                    title={
                        this.state.productDialog === 1
                        ?
                        this.state.dialogProductInfo.parentId === 0 ? '添加分类' : '添加产品'
                        :
                        this.state.dialogProductInfo.parentId === 0 ? '编辑分类' : '编辑产品'
                    }
                    size="small"
                    top='20%'
                    style={{width:'600px'}}
                    visible={ this.state.productDialog !== 0 }
                    onCancel={ this.closeAddDialog.bind(this) }
                    lockScroll={ true }
                >
                    <Dialog.Body style={{padding:'10px 20px 30px 20px'}}>
                        <Loading loading={this.state.dialogLoading}>
                            <Layout.Row style={{lineHeight:'36px',padding:'15px 0',textAlign:'center'}}>
                                <Layout.Col span={6}>
                                    {this.state.dialogProductInfo.parentId === 0 ? '产品分类:' : '产品名称:'}
                                </Layout.Col>
                                <Layout.Col span={16}>
                                    <Input
                                        value={this.state.dialogProductInfo.name}
                                        placeholder='请输入名称'
                                        onChange={(val)=>{
                                                let obj = _.assign({},this.state.dialogProductInfo)
                                                obj.name = val
                                                this.setState({dialogProductInfo:obj})
                                            }
                                        }/>
                                </Layout.Col>
                            </Layout.Row>
                            <Layout.Row style={this.state.dialogProductInfo.parentId === 0 ? {lineHeight:'36px',padding:'15px 0',textAlign:'center'}: {display:'none'}}>
                                <Layout.Col span={6}>{this.state.productDialog === 1 ? '分类图片' : '产品图片'}:</Layout.Col>
                                <Layout.Col span={16} style={{textAlign:'left'}}>
                                    <div className='add-image-btn' title='点击上传图片'>
                                        <i className='el-icon-plus' style={{cursor:'pointer'}}></i>
                                        <input
                                            type="file"
                                            value={''}
                                            accept="image/jpeg,image/jpg,image/png"
                                            onChange={this.handleFileChange.bind(this)}
                                        />
                                        <img className='result-image' style={this.state.dialogProductInfo.url === "" ? {display: 'none'} : {}} src={this.state.dialogProductInfo.url} alt=""/>
                                    </div>
                                </Layout.Col>
                            </Layout.Row>

                            {/*图片裁剪区*/}
                            <div style={this.state.dialogProductInfo.fileName !== "" ? {marginBottom:'20px'} : {display:'none'}}>
                                <Loading loading={this.state.cropperLoading}>
                                    <div style={{display:'inline-block',verticalAlign:'top',width: '360px',height:'280px',border:'1px solid #CCCCCC',marginLeft:'30px',marginRight:'20px'}}>
                                        {
                                            this.state.dialogProductInfo.fileName !== ""
                                            &&
                                            <Cropper
                                                ref={cropper => this.cropper = cropper}
                                                style={{ width: '360px',height:'280px'}}
                                                viewMode={1} // 限制裁剪框不超过画布的大小
                                                zoomable={true} // 是否开启缩放
                                                aspectRatio={1/1} // 裁剪区域比例
                                                guides={false} // 不显示裁剪框虚线
                                                preview=".cropper-preview"
                                            />
                                        }
                                    </div>
                                    <div style={{display:'inline-block',width:'120px',height:'280px',textAlign:'center',paddingTop:'10px'}}>
                                        <span style={{color:'#999999'}}>预览</span>
                                        <div className='cropper-preview' style={{display:'inline-block',width:'120px',height:'120px',border:'1px solid #CCCCCC',overflow:'hidden',marginTop:'20px'}}></div>
                                        <Button type='primary' style={{marginTop:'60px'}} onClick={this.handleSubmit.bind(this)}>裁剪</Button>
                                    </div>
                                </Loading>
                            </div>

                            <div style={{textAlign:'center'}}>
                                <Button onClick={ this.closeAddDialog.bind(this) }>取消</Button>
                                <Button type="primary" onClick={this.handleUpdateProduct.bind(this)}>确定</Button>
                            </div>
                        </Loading>
                    </Dialog.Body>
                </Dialog>

            </div>
        )
    }
}

export default withRouter(Chanpinguanli)