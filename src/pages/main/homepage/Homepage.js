import React, {Component,Fragment} from 'react'
import {withRouter} from "react-router-dom";
import {Button,Checkbox,Slider,Layout,Select,MessageBox,Loading} from 'element-react'
import Mycharts from '../../../components/myChart/Mycharts'
import Http from '../../../utils/http'
import store from "../../../store";
import _ from 'lodash'
import './homepage.scss'

import test from '../../../images/msg.jpg'

class Homepage extends Component{
    constructor(){
        super()
        this.state = {
            topLoading:true, // 业绩loading
            topSearchOption:{
                jgcode:"",
                jgm:"",
                staffId:"",
                productType:""
            },
            companyList:[], // 机构列表
            memberList: [], // 人员列表
            productTypeList:[], // 产品类型列表
            topBlockData:[], // 业绩数据
            chartLoading:true, // 图表loading
            sortIndex:1, // 排名翻页
            chartOption:{
                title:{
                    text:"",
                    top: 20,
                    left:"32%",
                    textStyle:{
                        fontWeight:'bold',
                        fontSize:14,
                        letterSpacing:2,
                        color:'#666666'
                    }
                },
                xAxis: {
                    type: 'category',
                    boundaryGap: false,
                    data:[]
                },
                dataZoom: [
                    {
                        show: true,
                        realtime: true,
                        start: 20,
                        end: 30,
                        xAxisIndex: 0
                    }
                ],
                tooltip: {
                    formatter: '时间：{b}<br/>{a}：{c}元',
                    trigger: 'axis'
                },
                yAxis: {
                    type: 'value',
                    name:'业绩（单位：元）'
                },
                series: [
                    {
                        name:"业绩",
                        data:[],
                        type: 'line',
                        smooth:true,
                        itemStyle:{color:"rgb(13,147,255)",borderColor:"rgb(13,147,255)"},
                        lineStyle:{color:"rgb(13,147,255)"},
                        areaStyle: {color: {
                            type: 'linear',
                            x: 0,
                            y: 0,
                            x2: 0,
                            y2: 1,
                            colorStops: [{
                                offset: 0, color: 'rgba(13,147,255,1)' // 0% 处的颜色
                            }, {
                                offset: 1, color: 'rgba(90,172,227,.2)' // 100% 处的颜色
                            }],
                            global: false // 缺省为 false
                        }}
                    }
                ]
            }, // chart数据


            bannerLoading:false,
            bannerList:[],
            currentBanner:0, // 当前咨询

            intervalReward:null, // 定时器
            intervalBanner:null, // 定时器
        }
        this.intervalReward = this.intervalReward.bind(this)
        this.changeBanner = this.changeBanner.bind(this)
    }

    componentWillUnmount() {
        this.setState = (state, callback) => {
            return
        }
    }

    componentDidMount(){
        let _this = this
        // 获取top搜索项
        this.getTopSearchOption()
        // 获取资讯
        this.getBannerList()
        // 排名翻页
        let intervalReward = setInterval(()=>{this.intervalReward()},5000)
        this.setState({intervalReward:intervalReward})

        // 切换资讯
        let intervalBanner = setInterval(()=>{_this.changeBanner('right')},8000)
        this.setState({intervalBanner:intervalBanner})
    }

    // 业绩翻页
    intervalReward(){
        if(!this.state.topLoading) {
            let n = this.state.sortIndex
            if (n >= 3) {
                this.setState({sortIndex: 1})
            } else {
                this.setState({sortIndex: n + 1})
            }
        }
    }

    // 获取搜索项
    getTopSearchOption() {
        this.setState({topLoading:true})
        let key = localStorage.getItem('userName')
        let userType = localStorage.getItem('homepageType')
        let params1 = {staffId: key, type: userType}
        Promise.all([Http.post('/index/jgm',params1),Http.post('/index/products')]).then(result=>{
            if(result[0].resultCode === 'success' && result[1].resultCode === 'success'){
                let companyList = result[0].data
                let companyFormatList = []
                _.forEach(companyList,(obj)=>{companyFormatList.push({value:obj.jgm,label:obj.jgmc})})

                let productTypeList = result[1].data
                let typeList = []
                _.forEach(productTypeList, (obj)=>{typeList.push({value:obj.categoryCode,label:obj.categoryName})})

                let searchOption = _.assign({},this.state.topSearchOption)
                if(companyFormatList.length > 0){
                    searchOption.jgcode = companyFormatList[0].value
                    searchOption.jgm = companyFormatList[0].label
                }
                if(typeList.length > 0){
                    searchOption.productType  = typeList[0].value
                }
                console.log(typeList)
                this.setState(
                    {
                        topSearchOption:searchOption, // 搜索设置
                        companyList:companyFormatList, // 公司列表
                        productTypeList:typeList, // 产品类型列表
                    },
                    ()=>{
                        this.getMemberList()
                    }
                )
            }else{
                MessageBox.msgbox({
                    title: '提示',
                    message: '获取数据失败',
                    type: 'error'
                })
                this.setState({topLoading:false})
            }
        }).catch(err=>{
            console.log(err)
            this.setState({topLoading:false})
        })
    }

    // 获取搜索项-成员列表
    getMemberList() {
        let userType = localStorage.getItem('homepageType')
        let key = localStorage.getItem('userName')
        let params = {
            departmentCode: this.state.topSearchOption.jgcode,
            userType: userType,
            staffId: key
        }
        Http.post('/index/users',params)
            .then(res=>{
                if(res.resultCode === 'success'){
                    let memberList = res.data
                    let memberFormatList = []
                    _.forEach(memberList,(obj)=>{memberFormatList.push({label: obj.userName, value: obj.staffId})})
                    let searchOption = _.assign({},this.state.topSearchOption)
                    if(memberFormatList.length > 0){
                        searchOption.staffId = memberFormatList[0].value
                    }
                    this.setState(
                        {
                            topSearchOption:searchOption, // 搜索设置
                            memberList: memberFormatList // 人员列表
                        },
                        ()=>{
                            this.getReward()
                            this.getChartData()
                        }
                    )
                }else{
                    MessageBox.msgbox({
                        title: '提示',
                        message: '获取数据失败',
                        type: 'error'
                    })
                    this.setState({topLoading:false})
                }
            })
            .catch(err=>{
                console.log(err)
                this.setState({topLoading:false})
            })
    }

    // 获取业绩
    getReward() {
        let type = localStorage.getItem('homepageType')
        let params = _.assign({permissionType: type},this.state.topSearchOption)
        Http.post('/index/myReward',params)
            .then(res=>{
                console.log(res)
                if(res.resultCode === 'success'){
                    let data = res.data.rewardList
                    this.setState({topBlockData:data,topLoading:false})
                }else{
                    MessageBox.msgbox({
                        title: '提示',
                        message: '获取业绩失败',
                        type: 'error'
                    })
                    this.setState({topLoading:false})
                }
            })
            .catch(err=>{
                console.log(err)
                this.setState({topLoading:false})
            })
    }

    // 获取chart数据
    getChartData() {
        let type = localStorage.getItem('homepageType')
        let params = _.assign({permissionType: type},this.state.topSearchOption)
        Http.post('/index/myRewardReport',params)
            .then(res=>{
                console.log(res)
                if(res.resultCode === 'success'){
                    let productName = this.state.topSearchOption.productType === "" ? "全部产品" : _.find(this.state.productTypeList, (obj)=>{return obj.value === this.state.topSearchOption.productType}).label
                    let personalName = this.state.topSearchOption.staffId !== 'all'? _.find(this.state.memberList, (obj)=>{return obj.value === this.state.topSearchOption.staffId}).label : null
                    let title = `${this.state.topSearchOption.jgm}${personalName != null ? "-"+personalName : ""}近期${personalName != null ? "个人" : ""}业绩折线图-（${productName}）`
                    let list = res.data.rewardList
                    let xData = []
                    let yData = []
                    _.forEach(list,(obj)=>{
                        let xVal = this.formatTime(obj.date)
                        let yVal = obj.reward
                        xData.push(xVal)
                        yData.push(yVal)
                    })
                    let chartOption = this.state.chartOption
                    chartOption.title.text = title
                    chartOption.xAxis.data = xData
                    chartOption.series[0].data = yData
                    this.setState({chartLoading:false,chartOption:chartOption})
                }else{
                    MessageBox.msgbox({
                        title: '提示',
                        message: '获取统计图数据失败',
                        type: 'error'
                    })
                    this.setState({chartLoading:false})
                }
            })
            .catch(err=>{
                console.log(err)
                this.setState({chartLoading:false})
            })
    }

    // 切换机构名
    changeCompanyName(val) {
        if(val !== this.state.topSearchOption.jgcode) {
            let currentCompany = _.find(this.state.companyList, (obj) => {
                return obj.value === val
            })
            if (currentCompany != null) {
                let option = _.assign({},this.state.topSearchOption)
                option.jgcode = currentCompany.value
                option.jgm = currentCompany.label
                this.setState(
                    {topSearchOption: option, topLoading: true, chartLoading: true},
                    () => {
                        this.getMemberList()
                    }
                )
            }
        }
    }

    // 切换人员
    changePerson(val) {
        if(val !== this.state.topSearchOption.staffId){
            let option = _.assign({},this.state.topSearchOption)
            option.staffId = val
            this.setState(
                {topSearchOption: option, topLoading: true, chartLoading: true},
                ()=>{
                    this.getReward()
                    this.getChartData()
                }
            )
        }
    }

    // 切换类型
    changeProductType(val) {
        console.log(val)
        if(val !== this.state.topSearchOption.productType){
            let option = _.assign({},this.state.topSearchOption)
            option.productType = val
            this.setState(
                {topSearchOption:option,topLoading:true, chartLoading:true},
                ()=>{
                    this.getReward()
                    this.getChartData()
                }
            )
        }
    }

    // 获取广告
    getBannerList() {
        this.setState({bannerLoading:true})
        let key = localStorage.getItem('userName')
        let params = {staffId:key,page:1,pageSize:10}
        Http.post('/information/list/query',params)
            .then(res=>{
                console.log(res)
                if(res.resultCode === "success"){
                    let list = res.data.infos
                    this.setState({bannerList:list,bannerLoading:false})
                }else{
                    MessageBox.msgbox({
                        title:'提示',
                        message:'获取数据失败!',
                        type:'error'
                    })
                    this.setState({bannerLoading:false})
                }
            })
            .catch(err=>{
                this.setState({bannerLoading:false})
                console.log(err)
            })
    }





    // 格式化时间
    formatTime(str){
        let year = str.slice(0,4)
        let month = str.slice(4,6)
        let day = str.slice(6,8)
        return `${year}-${month}-${day}`
    }



    // 切换新闻
    changeBanner(str){
        let tag = this.state.currentBanner
        switch (str) {
            case 'left':
                if(tag <= 0){
                    let result = this.state.bannerList.length - 1
                    this.setState({currentBanner:result})
                }else{
                    let result = tag - 1
                    this.setState({currentBanner:result})
                }
                break;
            case 'right':
                if(tag >= this.state.bannerList.length - 1){
                    this.setState({currentBanner:0})
                }else{
                    let result = tag + 1
                    this.setState({currentBanner:result})
                }
                break;
            default:
                return
        }
    }

    // 获取图片
    getImg(list) {
        if(list != null && list.length > 0){
            return list[0].fileUrl
        }else{
            return test
        }
    }



    render(){
        return(
            <Fragment>
                {/*顶部业绩*/}
                <Loading loading={this.state.topLoading} text='加载中...'>
                    <div className="top-detail-cube">
                        <Layout.Row>
                            <Layout.Col span={8} className="top-detail-search-cube">
                                机构名:
                                <Select style={{width:'68%',marginLeft:'20px'}} value={this.state.topSearchOption.jgcode} onChange={this.changeCompanyName.bind(this)}>
                                    {
                                        this.state.companyList.map(el => {
                                            return <Select.Option key={el.value} label={el.label} value={el.value} />
                                        })
                                    }
                                </Select>
                            </Layout.Col>
                            <Layout.Col span={8} className="top-detail-search-cube">
                                人员:
                                <Select style={{width:'70%',marginLeft:'20px'}} value={this.state.topSearchOption.staffId} onChange={this.changePerson.bind(this)}>
                                    {
                                        this.state.memberList.map(el => {
                                            return <Select.Option key={el.value} label={el.label} value={el.value} />
                                        })
                                    }
                                </Select>
                            </Layout.Col>
                            <Layout.Col span={8} className="top-detail-search-cube">
                                类型:
                                <Select style={{width:'70%',marginLeft:'20px'}} value={this.state.topSearchOption.productType} onChange={this.changeProductType.bind(this)}>
                                    {
                                        this.state.productTypeList.map(el => {
                                            return <Select.Option key={el.value} label={el.label} value={el.value} />
                                        })
                                    }
                                </Select>
                            </Layout.Col>
                        </Layout.Row>
                        <div className="cube-item">
                            <div className="cube-item-left">
                                <i className="iconfont icon-zoushi4 cube-item-icon"></i>
                            </div>
                            <div className="cube-item-right">
                                <span>
                                    {
                                        this.state.topBlockData.length > 0
                                        ?
                                            _.find(this.state.topBlockData,(obj)=>{return obj.type === 'MONTH'}) != null
                                            ?
                                                _.find(this.state.topBlockData,(obj)=>{return obj.type === 'MONTH'}).reward !== "" && _.find(this.state.topBlockData,(obj)=>{return obj.type === 'MONTH'}).reward != null
                                                ?
                                                _.find(this.state.topBlockData,(obj)=>{return obj.type === 'MONTH'}).reward
                                                :
                                                "------"
                                            :
                                            "------"
                                        :
                                        "------"
                                    }
                                </span>
                                <br/>
                                <span>本月业绩(元)</span>
                            </div>
                        </div>
                        <div className="cube-item">
                            <div className="cube-item-left">
                                <i className="iconfont icon-zoushi2 cube-item-icon"></i>
                            </div>
                            <div className="cube-item-right">
                                <span>
                                    {
                                        this.state.topBlockData.length > 0
                                            ?
                                            _.find(this.state.topBlockData,(obj)=>{return obj.type === 'QUARTER'}) != null
                                                ?
                                                _.find(this.state.topBlockData,(obj)=>{return obj.type === 'QUARTER'}).reward !== "" && _.find(this.state.topBlockData,(obj)=>{return obj.type === 'QUARTER'}).reward != null
                                                    ?
                                                    _.find(this.state.topBlockData,(obj)=>{return obj.type === 'QUARTER'}).reward
                                                    :
                                                    "------"
                                                :
                                                "------"
                                            :
                                            "------"
                                    }
                                </span>
                                <br/>
                                <span>本季度业绩(元)</span>
                            </div>
                        </div>
                        <div className="cube-item">
                            <div className="cube-item-left">
                                <i className="iconfont icon-zoushi3 cube-item-icon"></i>
                            </div>
                            <div className="cube-item-right">
                                <span>
                                    {
                                        this.state.topBlockData.length > 0
                                            ?
                                            _.find(this.state.topBlockData,(obj)=>{return obj.type === 'YEAR'}) != null
                                                ?
                                                _.find(this.state.topBlockData,(obj)=>{return obj.type === 'YEAR'}).reward !== "" && _.find(this.state.topBlockData,(obj)=>{return obj.type === 'YEAR'}).reward != null
                                                    ?
                                                    _.find(this.state.topBlockData,(obj)=>{return obj.type === 'YEAR'}).reward
                                                    :
                                                    "------"
                                                :
                                                "------"
                                            :
                                            "------"
                                    }
                                </span>
                                <br/>
                                <span>本年度业绩(元)</span>
                            </div>
                        </div>
                        <div className="cube-item" onMouseEnter={()=>{clearInterval(this.state.intervalReward)}} onMouseLeave={()=>{
                                let intervalReward = setInterval(()=>{
                                    this.intervalReward()
                                },5000)
                                this.setState({intervalReward:intervalReward})
                            }
                        }>
                            <div className="cube-item-left">
                                <i className="iconfont icon-zoushi1 cube-item-icon"></i>
                            </div>
                            <div className="cube-item-right">
                                <div className="cube-item-list-all" style={{transform:`translateY(-${90*(this.state.sortIndex - 1)}px)`}}>
                                    <div className="cube-item-list-one">
                                        <span>
                                            {
                                                this.state.topBlockData.length > 0
                                                    ?
                                                    _.find(this.state.topBlockData,(obj)=>{return obj.type === 'MONTH'}) != null
                                                        ?
                                                        _.find(this.state.topBlockData,(obj)=>{return obj.type === 'MONTH'}).rank !== "" && _.find(this.state.topBlockData,(obj)=>{return obj.type === 'MONTH'}).rank != null
                                                            ?
                                                            _.find(this.state.topBlockData,(obj)=>{return obj.type === 'MONTH'}).rank
                                                            :
                                                            "------"
                                                        :
                                                        "------"
                                                    :
                                                    "------"
                                            }
                                        </span><br/>
                                        <span>本月排名</span>
                                    </div>
                                    <div className="cube-item-list-one">
                                        <span>
                                            {
                                                this.state.topBlockData.length > 0
                                                    ?
                                                    _.find(this.state.topBlockData,(obj)=>{return obj.type === 'QUARTER'}) != null
                                                        ?
                                                        _.find(this.state.topBlockData,(obj)=>{return obj.type === 'QUARTER'}).rank !== "" && _.find(this.state.topBlockData,(obj)=>{return obj.type === 'QUARTER'}).rank != null
                                                            ?
                                                            _.find(this.state.topBlockData,(obj)=>{return obj.type === 'QUARTER'}).rank
                                                            :
                                                            "------"
                                                        :
                                                        "------"
                                                    :
                                                    "------"
                                            }
                                        </span><br/>
                                        <span>本季度排名</span>
                                    </div>
                                    <div className="cube-item-list-one">
                                        <span>
                                            {
                                                this.state.topBlockData.length > 0
                                                    ?
                                                    _.find(this.state.topBlockData,(obj)=>{return obj.type === 'YEAR'}) != null
                                                        ?
                                                        _.find(this.state.topBlockData,(obj)=>{return obj.type === 'YEAR'}).rank !== "" && _.find(this.state.topBlockData,(obj)=>{return obj.type === 'YEAR'}).rank != null
                                                            ?
                                                            _.find(this.state.topBlockData,(obj)=>{return obj.type === 'YEAR'}).rank
                                                            :
                                                            "------"
                                                        :
                                                        "------"
                                                    :
                                                    "------"
                                            }
                                        </span><br/>
                                        <span>本年度排名</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </Loading>

                <div className="second-block">
                    {/*统计图*/}
                    <div className="chart-block">
                        <p className="chart-block-control">
                            业绩趋势统计图
                            <i className="iconfont icon-shuaxin chart-control-btn" title='刷新'></i>
                        </p>
                        {/*<ul className="chart-change-list">*/}
                            {/*<li className="chart-change-btn">年度</li>*/}
                            {/*<li className="chart-change-btn">季度</li>*/}
                            {/*<li className="chart-change-btn" style={true?{borderBottom:'2px solid #967CC6',color:'#967CC6'}:null}>月度</li>*/}
                        {/*</ul>*/}
                        <div className="chart-cube">
                            <Loading loading={this.state.chartLoading} text='加载中...' style={{height:'100%'}}>
                                <Mycharts option={this.state.chartOption} chartsId={1}/>
                            </Loading>
                        </div>
                    </div>

                    {/*广告*/}
                    <div className="banner-block" onMouseEnter={()=>{clearInterval(this.state.intervalBanner)}} onMouseLeave={()=>{
                            let intervalBanner = setInterval(()=>{
                                this.changeBanner('right')
                            },8000)
                            this.setState({intervalBanner:intervalBanner})
                        }
                    }>
                        <div className="banner-window">
                            {
                                this.state.bannerList != null && this.state.bannerList.length > 0
                                ?
                                <ul className="banner-film" style={{transform:`translateX(-${this.state.currentBanner * 10}%)`}}>
                                    {
                                        this.state.bannerList.map((el,index)=>
                                            <li className="banner-item" key={index}>
                                                <p className='banner-item-type'>资讯</p>
                                                <p className='banner-item-time'>{el.createTime != null && el.createTime !== "" ? new Date(el.createTime).toLocaleString() : null}</p>
                                                {/*<img src={this.getImg(el.fileModels)} alt="" className="banner-item-image"/>*/}
                                                <div className="banner-item-image">
                                                    <div className='banner-check-item-img' style={{backgroundImage:`url(${this.getImg(el.fileModels)})`}}></div>
                                                </div>
                                                <h3 className='banner-item-title'>{el.title}</h3>
                                                <p className="banner-item-content">{el.content}</p>
                                            </li>
                                        )
                                    }
                                </ul>
                                :
                                <div style={{textAlign:'center',color:'#FFFFFF',lineHeight:'30px',marginTop:'160px',marginBottom:'320px'}}>
                                    暂无资讯... <br/>
                                    (请等待管理员发布)
                                </div>
                            }
                        </div>
                            <span className="banner-btn" style={this.state.bannerList != null && this.state.bannerList.length > 0 ? {left:'10px'} : {display:'none'}} onClick={this.changeBanner.bind(this,'left')}>
                                <i className="iconfont icon-xiangzuo banner-btn-icon"></i>
                            </span>
                            <span className="banner-btn" style={this.state.bannerList != null && this.state.bannerList.length > 0 ? {right:'10px'} : {display:'none'}} onClick={this.changeBanner.bind(this,'right')}>
                                <i className="iconfont icon-xiangyou banner-btn-icon"></i>
                            </span>
                            <Button onClick={()=>{store.dispatch({type: 'change_Current_flag', value: "2-2-2"})}} style={this.state.bannerList != null && this.state.bannerList.length > 0 ? {} : {display:'none'}} className='banner-bottom-btn'>查看全部</Button>
                    </div>
                </div>

                <div className="last-block">
                    <div className="last-block-title">
                        待办事项清单
                        <i className="iconfont icon-shuaxin refresh-btn" title='刷新'></i>
                    </div>
                    <ul className="task-list">
                        {
                            [{},{}].map((el,index)=>
                                <li className="task-item" key={index}>
                                    <Checkbox className='task-checkbox'></Checkbox>
                                    <div className="task-info">
                                        <p className="task-info-desc">这是一条待办事项内容，具体内容如下：组织一场理财唱片的线下推广活动，达到预期目标。组织一场理财唱片的线下推广活动，达到预期目标。组织一场理财唱片的线下推广活动，达到预期目标。</p>
                                        <div>
                                            <div style={{width:'320px',display:'inline-block'}}>
                                                <Slider value={13}/>
                                            </div>
                                            <span style={{display:'inline-block',lineHeight:'40px',margin:'0 20px'}}>{parseFloat(13/100).toFixed(2) *100}%</span>
                                        </div>
                                    </div>
                                    <ul className="task-btn-list">
                                        <li className='task-btn-item'>
                                            <i className="iconfont icon-bianji"></i>
                                        </li>
                                        <li className='task-btn-item'>
                                            <i className="iconfont icon-shanchu"></i>
                                        </li>
                                    </ul>
                                </li>
                            )
                        }
                    </ul>
                </div>
            </Fragment>
        )
    }
}
export default withRouter(Homepage)