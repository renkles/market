import React, {Component, Fragment} from 'react';
import {withRouter} from "react-router-dom";
import {Button, Loading, Menu, Input, DatePicker, MessageBox, Layout} from 'element-react'
import Http from '../../../utils/http'
import _ from 'lodash'
import Validate from '../../../utils/validate'
import store from "../../../store"
import Echarts from '../../../components/myChart/Mycharts'

import './chanpinyulan.scss'
import '../../../iconfont/iconfont.css'
import 'braft-editor/dist/output.css'
import customerHead from '../../../images/user_demo.jpg'

class Chanpinyulan extends Component {
    constructor() {
        super()
        this.state = {
            productLoading: false,
            detailLoading: false,
            chartsLoading: false,
            isChartShow: false,
            userType:null,
            searchText: "",
            productList: [],
            currentSelectedInfo: {
                id: "",
                code: "",
                categoryCode: "",
                categoryName: ""
            }, // 当前选中的产品信息
            currentOpenIndex: [], // 当前展开的产品列表的index
            searchOption: {
                startTime: null,
                endTime: null
            }, // 同类产品搜索配置
            productDetail: null, // 产品详情
            customerList: [], // 已购客户列表（其他人员）
            unCustomerList: [], // 未购客户列表（其他人员）
            pieChartData: {
                color: ['#108EE9', '#7EC2F3'],
                tooltip: {
                    trigger: 'item',
                    formatter: "{b} : {c} ({d}%)"
                },
                series: [
                    {
                        type: 'pie',
                        radius: ['55%', '70%'],
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
            }, // 客户购买占比（其他人员）
            productChartOption:{
                color:["#EAA647","#4B77FF"],
                title: {
                    text: '产品人数统计图（单位:个）',
                    textStyle:{fontSize: 16},
                    left:'left',
                    top: 10
                },
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {
                        type: 'shadow'
                    }
                },
                legend: {
                    data: ['未购买', '已购买'],
                    top: 40,
                },
                toolbox: {
                    right: 0,
                    top: 5,
                    feature: {
                        dataView: {},
                        restore: {},
                        saveAsImage: {}
                    }
                },
                grid: {
                    top: 70,
                    bottom: 10,
                    left: '12%',
                    right: "6%",
                    containLabel: true
                },
                dataZoom: [
                    {
                        show: true,
                        yAxisIndex: 0,
                        filterMode: 'empty',
                        width: "6%",
                        height: 550,
                        showDataShadow: false,
                        left: "4%",
                        start:0,
                        end:100,
                    }
                ],
                xAxis: {
                    type: 'value',
                    minInterval: 1,
                    splitNumber: 5
                },
                yAxis: {
                    type: 'category',
                    data: []
                },
                series: [
                    {
                        name: '未购买',
                        type: 'bar',
                        barMaxWidth: 30,
                        data: []
                    },
                    {
                        name: '已购买',
                        type: 'bar',
                        barMaxWidth: 30,
                        data: []
                    }
                ]
            },// 产品营销柱状图（高管人员）
            emptyCustomer:false, // 产品营销柱状图暂无客户经理
            barChartData: {
                title: {
                    text: '同类产品统计图',
                    x: 'center'
                },
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {
                        animation: false
                    }
                },
                legend: {
                    data: ['金额', '人数'],
                    right: 40,
                    top: 20
                },
                axisPointer: {
                    link: {xAxisIndex: 'all'}
                },
                grid: [
                    {
                        left: 50,
                        right: 50,
                        height: '35%'
                    }, {
                        left: 50,
                        right: 50,
                        top: '55%',
                        height: '35%'
                    }
                ],
                xAxis: [
                    {
                        type: 'category',
                        data: []
                    },
                    {
                        type: 'category',
                        data: [],
                        gridIndex: 1,
                        position: 'top'
                    }
                ],
                yAxis: [
                    {
                        name: '金额(元)',
                        type: 'value',
                    },
                    {
                        name: '人数(个)',
                        type: 'value',
                        gridIndex: 1,
                        inverse: true
                    }
                ],
                series: [
                    {
                        name: '金额',
                        type: 'bar',
                        barWidth: 50,
                        data: []
                    },
                    {
                        name: '人数',
                        type: 'bar',
                        barWidth: 50,
                        xAxisIndex: 1,
                        yAxisIndex: 1,
                        data: []
                    }
                ]
            }, // 同类产品对比图

        }
        this.getChartData = this.getChartData.bind(this)
    }

    componentWillUnmount() {
        this.setState = (state, callback) => {
            return
        }
    }

    componentDidMount() {
        // 获取用户身份
        let type = localStorage.getItem('productPageType')
        this.setState({userType:type})
        this.getProductList()
    }

    // 获取产品列表
    getProductList() {
        this.setState({productLoading: true})
        Http.post('/product/list')
            .then(
                res => {
                    console.log(res)
                    if (res.resultCode === 'success') {
                        this.setState({productList: res.data, productLoading: false})
                    } else {
                        console.log('获取数据失败')
                        this.setState({productLoading: false})
                    }
                }
            )
            .catch(
                err => {
                    console.log(err)
                    this.setState({productLoading: false})
                }
            )
    }

    // 搜索列表
    showItem(val) {
        if (val !== "") {
            // 展开所有列表
            let list = []
            _.forEach(this.state.productList, (obj) => {
                list.push(obj.id)
            })
            this.setState({currentOpenIndex: list, searchText: val})
        } else {
            let openIndex = []
            if (this.state.currentSelectedInfo.id !== "") {
                _.forEach(this.state.productList, (obj) => {
                    if (obj.children != null && obj.children.length > 0) {
                        let item = _.find(obj.children, (insideObj) => {
                            return insideObj.id === this.state.currentSelectedInfo.id
                        })
                        if (item !== undefined) {
                            openIndex = [item.parentId]
                        }
                    }
                })
            }
            this.setState({currentOpenIndex: openIndex, searchText: val})
        }
    }

    // 选中产品列表内容
    chooseItem(id, code, categoryCode, categoryName) {
        this.setState(
            {
                currentSelectedInfo: {id: id, code: code, categoryCode: categoryCode, categoryName: categoryName},
                isChartShow: false
            },
            () => {
                this.getProductBaseDetail()
                this.getCurrentMonth(this.getChartData)
            }
        )
    }

    // 获取产品详情
    getProductBaseDetail() {
        this.setState({detailLoading: true})
        let key = localStorage.getItem('userName')
        let params1 = {id: this.state.currentSelectedInfo.id, staffId: key} // 产品详情配置参数
        let params2 = {transName: this.state.currentSelectedInfo.code, staffId: key} // 不同身份用户展示不同模块数据
        switch (parseInt(this.state.userType)) {
            case 1:
                console.log('总行高管')
                Promise.all([Http.post('/product/pc/getDetail', params1), Http.post('/product/subCategoryCustomerDataInHighestOffice', params2)]).then(result=>{
                    let res1 = result[0]
                    let res2 = result[1]
                    console.log(res1)
                    console.log(res2)
                    if (res1.resultCode === 'success' && res2.resultCode === "success") {
                        let html = res1.data.procuctDescripton === "" ? null : res1.data.procuctDescripton
                        let list = res2.data.subBranchDataList
                        let yData = []
                        let xData1 = []
                        let xData2 = []
                        _.forEach(list,(obj)=>{
                            yData.push(obj.jgName)
                            xData1.push(obj.purchaseNum)
                            xData2.push(obj.unPurchaseNum)
                        })
                        let chartData = this.state.productChartOption
                        chartData.yAxis.data = yData
                        chartData.series[0].data = xData2
                        chartData.series[1].data = xData1
                        chartData.dataZoom[0].start = 60
                        chartData.dataZoom[0].end = 80
                        this.setState({
                            detailLoading: false,
                            productDetail: html,
                            productChartOption:chartData,
                            emptyCustomer:false
                        })
                    } else {
                        MessageBox.msgbox({
                            title: '提示',
                            message: '获取产品详情失败',
                            type: 'error'
                        })
                        this.setState({detailLoading: false})
                    }
                }).catch(err => {
                    console.log(err)
                    this.setState({detailLoading: false})
                })
                break;
            case 2:
                console.log('支行行长')
                Promise.all([Http.post('/product/pc/getDetail', params1), Http.post('/product/subCategoryCustomerDataInSubBranchManager', params2)]).then(result=>{
                    let res1 = result[0]
                    let res2 = result[1]
                    console.log(res1)
                    console.log(res2)
                    if (res1.resultCode === 'success' && res2.resultCode === "success") {
                        let html = res1.data.procuctDescripton === "" ? null : res1.data.procuctDescripton
                        let list = res2.data.subBranchDataList
                        if(list.length > 0){
                            let yData = []
                            let xData1 = []
                            let xData2 = []
                            _.forEach(list,(obj)=>{
                                yData.push(this.formatName(obj.branchName).name)
                                xData1.push(obj.purchaseNum)
                                xData2.push(obj.unPurchaseNum)
                            })
                            let chartData = this.state.productChartOption
                            chartData.yAxis.data = yData
                            chartData.series[0].data = xData2
                            chartData.series[1].data = xData1
                            chartData.dataZoom[0].start = 0
                            chartData.dataZoom[0].end = 100
                            this.setState({
                                detailLoading: false,
                                productDetail: html,
                                productChartOption: chartData
                            })
                        }else{
                            this.setState({
                                detailLoading: false,
                                productDetail: html,
                                emptyCustomer: true
                            })
                        }
                    } else {
                        MessageBox.msgbox({
                            title: '提示',
                            message: '获取产品详情失败',
                            type: 'error'
                        })
                        this.setState({detailLoading: false})
                    }
                }).catch(err => {
                    console.log(err)
                    this.setState({detailLoading: false})
                })
                break;
            case 3:
                Promise.all([Http.post('/product/pc/getDetail', params1), Http.post('/product/subCategoryCustomerData', params2)]).then(result => {
                    let res1 = result[0]
                    let res2 = result[1]
                    console.log(res1)
                    console.log(res2)
                    if (res1.resultCode === 'success' && res2.resultCode === "success") {
                        let html = res1.data.procuctDescripton === "" ? null : res1.data.procuctDescripton
                        let customerList = res2.data.customerList
                        let unCustomerList = res2.data.unCustomerList
                        let option = this.state.pieChartData
                        option.series[0].data = [{name: "已购", value: customerList.length}, {
                            name: "未购",
                            value: unCustomerList.length
                        }]
                        this.setState({
                            detailLoading: false,
                            productDetail: html,
                            customerList: customerList,
                            unCustomerList: unCustomerList,
                            pieChartData: option
                        })
                    } else {
                        MessageBox.msgbox({
                            title: '提示',
                            message: '获取产品详情失败',
                            type: 'error'
                        })
                        this.setState({detailLoading: false})
                    }
                }).catch(err => {
                    console.log(err)
                    this.setState({detailLoading: false})
                })
                break;
            default:
                return
        }
    }

    // 获取分类统计图表数据
    getChartData() {
        this.setState({chartsLoading: true})
        let key = localStorage.getItem('userName')
        let params = _.assign({
            categoryCode: this.state.currentSelectedInfo.categoryCode,
            staffId: key
        }, this.state.searchOption)
        Http.post('/product/pc/categoryData', params)
            .then(res => {
                console.log(res)
                if (res.resultCode === "success") {
                    let list = res.data.list
                    let xData = []
                    let countList = []
                    let moneyList = []
                    _.forEach(list,(obj)=>{
                        xData.push(obj.transName)
                        countList.push(obj.count)
                        moneyList.push(obj.money)
                    })
                    let barOption = this.state.barChartData
                    barOption.title.text = `${this.state.currentSelectedInfo.categoryName}类产品统计图`
                    barOption.xAxis[0].data = xData
                    barOption.xAxis[1].data = xData
                    barOption.series[0].data = moneyList
                    barOption.series[1].data = countList
                    this.setState({chartsLoading: false,barChartData:barOption})

                } else {
                    MessageBox.msgbox({
                        title: '提示',
                        message: '获取图表数据失败',
                        type: 'error'
                    })
                    this.setState({chartsLoading: false})
                }
            })
            .catch(err => {
                console.log(err)
                this.setState({chartsLoading: false})
            })
    }

    // 获取默认时间
    getCurrentMonth(callback) {
        let now = new Date()
        let currentYear = now.getFullYear()
        let currentMonth = now.getMonth()
        let currentDay = now.getDate()
        let targetYear
        let targetMonth
        if (currentMonth === 0) {
            targetYear = currentYear - 1
            targetMonth = 11
        } else {
            targetYear = currentYear
            targetMonth = currentMonth - 1
        }
        let startTime = new Date(targetYear, targetMonth, currentDay).getTime() - 24 * 60 * 60 * 1000
        let endTime = new Date(currentYear, currentMonth, currentDay).getTime()
        this.setState(
            {searchOption: {startTime: startTime, endTime: endTime}},
            () => {
                callback()
            }
        )
    }

    // 根据时间获取chart数据
    getChartDataByTime() {
        if(this.state.searchOption.startTime == null || this.state.searchOption.endTime == null){
            this.getCurrentMonth(this.getChartData)
        }else{
            this.getChartData()
        }
    }

    // 切换展示图表
    toggleBlockShow() {
        if (this.state.currentSelectedInfo.id === "") {
            MessageBox.msgbox({
                title: '提示',
                message: '请先选择左侧列表中的产品',
                type: 'warning'
            })
        } else {
            this.setState({isChartShow: !this.state.isChartShow})
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

    render() {
        let text = this.state.searchText
        return (
            <div style={{position: 'relative'}}>
                {/*左侧产品列表*/}
                <div className="product-check-cube-left">
                    <Loading loading={this.state.productLoading} text='加载中...'>
                        <div style={{padding: '10px 20px'}}>
                            <Input placeholder='搜索...' value={this.state.searchText}
                                   onChange={this.showItem.bind(this)}/>
                        </div>
                        <div className="product-cube-title">所有产品</div>
                        <div className="product-list-menu">
                            <Menu defaultOpeneds={this.state.currentOpenIndex} onOpen={(index) => {
                                this.setState({currentOpenIndex: [index]})
                            }}>
                                {
                                    this.state.productList.map((el, index) =>
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
                                                            _.find(el.children, (obj) => {
                                                                return obj.name.indexOf(text) !== -1
                                                            }) != null
                                                                ?
                                                                {}
                                                                :
                                                                {display: 'none'}
                                                            :
                                                            {display: 'none'}
                                                        :
                                                        {}
                                                    :
                                                    {}
                                            }
                                            title={
                                                <div>
                                                    <img src={el.imgUrl} alt="" style={{
                                                        width: '36px',
                                                        height: '36px',
                                                        borderRadius: '50%',
                                                        marginRight: '10px'
                                                    }}/>
                                                    {el.name}
                                                    <span style={{
                                                        position: 'relative',
                                                        top: "-2px"
                                                    }}>（{el.children != null ? el.children.length : 0}）</span>
                                                </div>
                                            }
                                        >
                                            {
                                                el.children != null && el.children.length > 0
                                                    ?
                                                    el.children.map((item, insideIndex) =>
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
                                                                            {display: 'none'}
                                                                    :
                                                                    {}
                                                            }
                                                        >
                                                            <div
                                                                onClick={this.chooseItem.bind(this, item.id, item.productCode, el.productCode, el.name)}
                                                                style={this.state.currentSelectedInfo.id === item.id ? {color: '#0D93FF'} : {color: '#48576A'}}
                                                            >
                                                                {item.name}
                                                                <i className="iconfont icon-sanjiao"
                                                                   style={this.state.currentSelectedInfo.id === item.id ? {
                                                                       position: 'absolute',
                                                                       right: '20px',
                                                                       top: '-2px'
                                                                   } : {display: 'none'}}></i>
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

                {/*右侧产品详情*/}
                <div className='product-check-cube-right'
                     style={this.state.isChartShow ? {transform: "translateX(120%)"} : {}}>
                    <div className="product-title">
                        产品基本信息
                        <span onClick={this.toggleBlockShow.bind(this)} title='查看同类产品统计图' style={{
                            float: 'right',
                            marginRight: '20px',
                            fontSize: '15px',
                            color: '#5AC18D',
                            letterSpacing: '0',
                            cursor: 'pointer'
                        }}>
                            同类产品分析
                            <i className='iconfont icon-zoushi1' style={{fontSize: '15px', marginLeft: '10px'}}></i>
                        </span>
                    </div>
                    <Loading loading={this.state.detailLoading} text='加载中'>
                        {
                            this.state.currentSelectedInfo.id !== ""
                                ?
                                <Fragment>
                                    <div className="html-check-box">
                                        {
                                            this.state.productDetail == null
                                                ?
                                                <div style={{
                                                    textAlign: 'center',
                                                    lineHeight: '600px',
                                                    color: '#999999'
                                                }}>
                                                    该产品暂无详情，请等待管理员编辑!
                                                </div>
                                                :
                                                <div className='braft-output-content'
                                                     dangerouslySetInnerHTML={{__html: this.state.productDetail}}/>
                                        }
                                    </div>
                                    <div className="customer-chart-amount-block">
                                        {/*柱形统计图*/}
                                        {
                                            !this.state.emptyCustomer
                                            ?
                                            <div style={parseInt(this.state.userType) === 1 || parseInt(this.state.userType) === 2 ? {} : {display:'none'}}>
                                                <div className="product-list-chart-cube">
                                                    <Echarts option={this.state.productChartOption} chartsId={2}/>
                                                </div>
                                            </div>
                                            :
                                            <div className="empty-customer-bar-chart">暂无客户经理数据...</div>
                                        }

                                        {/*饼图和客户列表*/}
                                        <div style={parseInt(this.state.userType) === 3 ? {} : {display:'none'}}>
                                            <div className="customer-buy-chart-box">
                                                <div className="customer-buy-title">客户购买统计</div>
                                                <div className="customer-pie-chart">
                                                    <Echarts option={this.state.pieChartData} chartsId={3}/>
                                                </div>
                                            </div>
                                            <div className="customer-buy-amount-list">
                                                <div className="customer-buy-title">已购客户</div>
                                                <ul className="customer-amount-list-cube" style={{maxHeight: "180px"}}>
                                                    {
                                                        this.state.customerList != null && this.state.customerList.length > 0
                                                            ?
                                                            this.state.customerList.map((el, index) =>
                                                                <li className="customer-amount-item" key={index}>
                                                                    <div className="customer-header">{el.name}</div>
                                                                    {el.name}
                                                                    <div className="customer-cash-right">
                                                                        {
                                                                            el.money != null && el.money !== ""
                                                                                ?
                                                                                `${el.money}元`
                                                                                :
                                                                                null
                                                                        }
                                                                        <i className="iconfont icon-xiangyou"></i>
                                                                    </div>
                                                                </li>
                                                            )
                                                            :
                                                            <li className='customer-item-empty'>暂无已购客户...</li>
                                                    }
                                                </ul>
                                            </div>
                                            <div className="customer-buy-amount-list">
                                                <div className="customer-buy-title">未购客户</div>
                                                <ul className="customer-amount-list-cube"
                                                    style={this.state.customerList.length === 1 ? {maxHeight: '300px'} : this.state.customerList.length === 2 ? {maxHeight: "240px"} : {maxHeight: '180px'}}>
                                                    {
                                                        this.state.unCustomerList != null && this.state.unCustomerList.length > 0
                                                            ?
                                                            this.state.unCustomerList.map((el, index) =>
                                                                <li className="customer-amount-item" key={index}>
                                                                    <div className="customer-header">{el.name}</div>
                                                                    {el.name}
                                                                    <div className="customer-cash-right">
                                                                        <i className="iconfont icon-xiangyou"></i>
                                                                    </div>
                                                                </li>
                                                            )
                                                            :
                                                            <li className='customer-item-empty'>暂无未购客户...</li>
                                                    }
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </Fragment>
                                :
                                <div style={{lineHeight: '670px', textAlign: 'center', color: '#999999'}}>您还未选择左侧列表中的产品，请先选择某一产品查看!</div>
                        }
                    </Loading>
                </div>

                {/*右侧统计图*/}
                <div className="product-check-right-chart" style={this.state.isChartShow ? {} : {transform: "translateX(120%)"}}>
                    <div className="product-chart-title">
                        {this.state.currentSelectedInfo.categoryName !== "" ? `${this.state.currentSelectedInfo.categoryName}类` : null}
                        产品统计图
                        <span onClick={this.toggleBlockShow.bind(this)} title='查看产品详情' style={{
                            float: 'right',
                            marginRight: '20px',
                            fontSize: '15px',
                            color: '#5AC18D',
                            letterSpacing: '0',
                            cursor: 'pointer'
                        }}>
                            查看产品详情
                            <i className='iconfont icon-bianjiguanli' style={{fontSize: '15px', marginLeft: '10px'}}></i>
                        </span>
                    </div>
                    {
                        this.state.currentSelectedInfo.id !== ""
                        ?
                        <Loading loading={this.state.chartsLoading} text='加载中...'>
                            <div className='product-chart-cube'>
                                <div className="search-by-time-block">
                                    <span style={{marginRight: '10px'}}>起始时间:</span>
                                    <DatePicker
                                        value={this.state.searchOption.startTime != null ? new Date(this.state.searchOption.startTime) : null}
                                        placeholder="选择日期"
                                        onChange={date => {
                                            let option = _.assign({}, this.state.searchOption)
                                            if (date != null) {
                                                option.startTime = date.getTime()
                                            } else {
                                                option.startTime = null
                                            }
                                            this.setState({searchOption: option})
                                        }}
                                        disabledDate={time => {
                                            let limitTime = this.state.searchOption.endTime != null ? this.state.searchOption.endTime - 8.64e7 : Date.now() - 8.64e7
                                            return time.getTime() > limitTime
                                        }}
                                    />
                                    <span style={{marginRight: '10px', marginLeft: '30px'}}>结束时间:</span>
                                    <DatePicker
                                        value={this.state.searchOption.endTime != null ? new Date(this.state.searchOption.endTime) : null}
                                        placeholder="选择日期"
                                        onChange={date => {
                                            let option = _.assign({}, this.state.searchOption)
                                            if (date != null) {
                                                option.endTime = date.getTime()
                                            } else {
                                                option.endTime = null
                                            }
                                            this.setState({searchOption: option})
                                        }}
                                        disabledDate={time => {
                                            let limitTime = this.state.searchOption.startTime != null ? this.state.searchOption.startTime : Date.now()
                                            return time.getTime() > limitTime
                                        }}
                                    />
                                    <Button onClick={this.getChartDataByTime.bind(this)} type='primary' style={{marginLeft: '40px'}}>查询</Button>
                                </div>
                                <div className="product-chart-item">
                                    <Echarts option={this.state.barChartData} chartsId={1}/>
                                </div>
                            </div>
                        </Loading>
                        :
                        <div style={{lineHeight:'600px',color:'#999999',textAlign:'center'}}>暂无数据</div>
                    }
                </div>
            </div>
        )
    }
}

export default withRouter(Chanpinyulan)