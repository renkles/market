import React, {Component, Fragment} from 'react';
import {withRouter} from "react-router-dom";
import {Button, Loading, MessageBox, Pagination} from 'element-react'
import _ from 'lodash'
import Http from '../../../utils/http'
import Circle from '../../../components/circleSVG/Circle'

import './yuyuejinduchaxun.scss'
import '../../../iconfont/iconfont.css'

class Yuyuejinduchaxun extends Component {
    constructor() {
        super()
        this.state = {
            loadingShow: false,
            list:[],
            searchOption: {
                page: 1,
                pageSize: 5
            },
            totalNum:1,
            leftProgress:'0.00',
            rightProgress:'0.00',
            depositFinanceAppointNum:0,
            depositFinanceSuccessNum:0,
            depositFinanceCancelNum:0,
            appointProgress:0,
            successProgress:0,
            cancelProgress:0,
        }
    }

    componentWillUnmount() {
        this.setState = (state, callback) => {
            return
        }
    }

    componentDidMount() {
        this.getList()
    }

    getList(){
        this.setState({loadingShow:true})
        let userName = localStorage.getItem('userName')
        let params = _.assign({staffId: userName},this.state.searchOption)
        Http.post('/appoint/progress/query', params)
            .then(
                res=> {
                    console.log(res)
                    if(res.resultCode === 'success'){
                        let list = res.data.progressVos
                        let leftProgress = res.data.depositFinanceSuccessRate === "" ? '0.00' : res.data.depositFinanceSuccessRate.replace(/%/,'')
                        let rightProgress = res.data.depositFinanceCancelRate === "" ? '0.00' : res.data.depositFinanceCancelRate.replace(/%/,'')
                        let depositFinanceAppointNum = res.data.depositFinanceAppointNum === "" ? 0 : res.data.depositFinanceAppointNum
                        let depositFinanceSuccessNum = res.data.depositFinanceSuccessNum === "" ? 0 : res.data.depositFinanceSuccessNum
                        let depositFinanceCancelNum = res.data.depositFinanceCancelNum === "" ? 0 : res.data.depositFinanceCancelNum
                        console.log(leftProgress,rightProgress)
                        this.setState(
                            {
                                loadingShow:false,
                                list:list,
                                totalNum:res.data.total,
                                leftProgress:leftProgress,
                                rightProgress:rightProgress,
                                depositFinanceAppointNum:depositFinanceAppointNum,
                                depositFinanceSuccessNum:depositFinanceSuccessNum,
                                depositFinanceCancelNum:depositFinanceCancelNum
                            },
                            ()=>{
                                let appointProgress = depositFinanceAppointNum === 0 ? 0 : 100
                                let successProgress = depositFinanceAppointNum === 0 ? 0 : parseInt(depositFinanceSuccessNum / depositFinanceAppointNum * 100)
                                let cancelProgress = depositFinanceAppointNum === 0 ? 0 : parseInt(depositFinanceCancelNum / depositFinanceAppointNum * 100)
                                this.setState({appointProgress:appointProgress,successProgress:successProgress,cancelProgress:cancelProgress})
                            }
                        )
                    }else{
                        console.log('获取数据失败')
                        this.setState({loadingShow:false})
                        MessageBox.msgbox({
                            title:'提示',
                            message:'获取数据失败!',
                            type:'error'
                        })
                    }
                }
            )
            .catch(
                err=> {
                    console.log(err)
                    this.setState({loadingShow:false})
                }
            )
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

    cancelAppoint(id){
        MessageBox.confirm('确认撤销申请? 撤销后不可恢复!', '提示', {
            type: 'warning'
        }).then(() => {
            this.setState({loadingShow:true})
            let params = {
                appointId: id
            }
            Http.post('/appoint/cancel',params)
                .then(
                    res=> {
                        console.log(res)
                        if(res.resultCode === 'success'){
                            this.getList()
                        }else{
                            this.setState({loadingShow:false})
                            MessageBox.msgbox({
                                title:'提示',
                                message:'撤销申请失败!',
                                type:'error'
                            })
                        }
                    }
                )
                .catch(
                    err=> {
                        console.log(err)
                        this.setState({loadingShow:false})
                    }
                )
        }).catch(() => {
            console.log('取消')
        })
    }

    render() {
        return (
            <Fragment>
                <Loading loading={this.state.loadingShow} text='加载中...'>
                    <div className="query-top-block">
                        <div className="query-top-title">预约进度列表</div>
                        <table className='query-table'>
                            <thead>
                            <tr>
                                <td>客户名称</td>
                                <td>客户证件号</td>
                                <td>业务类型</td>
                                <td>预约金额</td>
                                <td>预约日期</td>
                                <td>成功日期</td>
                                <td>状态</td>
                                <td>操作</td>
                            </tr>
                            </thead>
                            <tbody>
                            {
                                this.state.list != null && this.state.list.length > 0
                                ?
                                this.state.list.map((el,index) =>
                                    <tr key={index}>
                                        <td>{el.customerName}</td>
                                        <td>{el.certId}</td>
                                        <td>{el.businessName}</td>
                                        {/*<td>{parseFloat(el.money).toFixed(2)}</td>*/}
                                        <td>{el.businessCode === '01' || el.businessCode === '12' ? parseFloat(el.money).toFixed(2) : '------'}</td>
                                        <td>{`${el.appointDate.slice(0,4)}-${el.appointDate.slice(4,6)}-${el.appointDate.slice(6,8)}`}</td>
                                        <td>{el.successDate === '' ? '------' : `${el.successDate.slice(0,4)}-${el.successDate.slice(4,6)}-${el.successDate.slice(6,8)}`}</td>
                                        <td><Button size='mini' style={el.status === '预约中'?{color:'#FFFFFF',backgroundColor:'#4471FC'}:(el.status === '预约成功'?{color:'#FFFFFF',backgroundColor:'#2FD186'}:(el.status === '取消' ? {color:'#FFFFFF',backgroundColor:'#F1C500'}:{color:'#FFFFFF',backgroundColor:'#F3636A'}))}>{el.status}</Button></td>
                                        <td><i onClick={this.cancelAppoint.bind(this,el.id)} className="iconfont icon-chexiao" style={el.status === '取消'?{display:'none'}:{fontSize:'20px',cursor:'pointer',color:'#9254DE',position:'relative',top:'2px'}}></i></td>
                                    </tr>
                                )
                                :
                                <tr><td colSpan={8}>暂无数据</td></tr>
                            }
                            </tbody>
                        </table>
                        <div className='pagination-box'>
                            <Pagination layout="prev, pager, next" total={this.state.totalNum} pageSize={this.state.searchOption.pageSize} onCurrentChange={this.changePage.bind(this)}/>
                        </div>
                    </div>
                    <div className="query-bottom-block">
                        <div className="query-top-title">存款理财分析——共{parseInt(this.state.depositFinanceAppointNum)}笔</div>
                        <div className="query-bottom-cube">
                            <ul className="bottom-left-cube">
                                {/*<li className="left-cube-item">*/}
                                    {/*<p className="cube-item-desc">存款理财预约笔数 <span style={{float:'right'}}>{parseInt(this.state.depositFinanceAppointNum)}笔</span></p>*/}
                                    {/*<div className="slider-cube">*/}
                                        {/*<div className="progress-slider" style={{backgroundColor:'#4471FC',width:`${this.state.appointProgress}%`}}></div>*/}
                                    {/*</div>*/}
                                {/*</li>*/}
                                <li className="left-cube-item">
                                    <p className="cube-item-desc">存款理财成功笔数 <span style={{float:'right'}}>{parseInt(this.state.depositFinanceSuccessNum)}笔</span></p>
                                    <div className="slider-cube">
                                        <div className="progress-slider" style={{backgroundColor:'#2FD186',width:`${this.state.successProgress}%`}}></div>
                                    </div>
                                </li>
                                <li className="left-cube-item">
                                    <p className="cube-item-desc">存款理财撤销笔数 <span style={{float:'right'}}>{parseInt(this.state.depositFinanceCancelNum)}笔</span></p>
                                    <div className="slider-cube">
                                        <div className="progress-slider" style={{backgroundColor:'#F1C500',width:`${this.state.cancelProgress}%`}}></div>
                                    </div>
                                </li>
                            </ul>
                            <div className="bottom-right-cube">
                                <div className="right-cube-item">
                                    <Circle id={1} size={120} linearColor={['#92ce56','#59ce61']} animationTime={2} progress={this.state.leftProgress}/>
                                    <p style={{lineHeight:'80px'}}>存款理财预约成功率</p>
                                </div>
                                <div className="right-cube-item">
                                    <Circle id={2} size={120} linearColor={['#4471FC','#55B2FC']} animationTime={2} progress={this.state.rightProgress}/>
                                    <p style={{lineHeight:'80px'}}>存款理财预约撤销率</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </Loading>
            </Fragment>
        )
    }
}

export default withRouter(Yuyuejinduchaxun)