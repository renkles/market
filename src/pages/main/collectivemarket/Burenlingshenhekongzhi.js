import React, {Component} from 'react';
import {withRouter} from "react-router-dom";
import {Button, Loading, MessageBox, Switch} from 'element-react'
import Http from '../../../utils/http'
import _ from 'lodash'
import store from "../../../store";

import './burenlingshenhekongzhi.scss'
import '../../../iconfont/iconfont.css'

class Burenlingshenhekongzhi extends Component {
    constructor() {
        super()
        this.state = {
            info:{},
            loadingShow:false,
        }
    }

    componentWillUnmount() {
        this.setState = (state, callback) => {
            return
        }
    }

    componentDidMount() {
        this.getInfo()
    }

    getInfo() {
        this.setState({loadingShow:true})
        let userName = localStorage.getItem('userName')
        // let userName = '06100540' // 有权限账号
        let params = {staffId:userName}
        Http.post('/supply/orgInfo/query',params)
            .then(
                res=> {
                    console.log(res)
                    if(res.resultCode === 'success'){
                        if(res.data.orgCode === ""){
                            this.setState({loadingShow:false})
                            MessageBox.confirm('您暂无设置权限，请联系管理员!', '提示', {
                                type: 'warning'
                            }).then(() => {
                                store.dispatch({type: 'change_Current_flag', value: '1-1-1'})
                            }).catch(()=>{
                                store.dispatch({type: 'change_Current_flag', value: '1-1-1'})
                            })
                        }else{
                            this.setState({info:res.data,loadingShow:false})
                        }
                    }else{
                        console.log('获取数据失败')
                        this.setState({loadingShow:false})
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

    confirm() {
        this.setState({loadingShow:true})
        let params = {
            orgCode: this.state.info.orgCode,
            status: this.state.info.status
        }
        console.log()
        Http.post('/supply/approve/open',params)
            .then(
                res=>{
                    console.log(res)
                    if(res.resultCode === 'success'){
                        this.setState(
                            {loadingShow:false},
                            ()=>{
                                this.getInfo()
                                MessageBox.msgbox({
                                    title:'提示',
                                    message:'设置成功',
                                    type:'success'
                                })
                            }
                        )
                    }else{
                        this.setState({loadingShow:false})
                        MessageBox.msgbox({
                            title:'提示',
                            message:'设置失败',
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

    render() {
        return (
            <div className='check-block'>
                <Loading loading={this.state.loadingShow} text='加载中...'>
                    <div className="check-block-item">
                        <span style={{marginRight:'20px'}}>机构名称：</span>
                        {this.state.info.orgName}
                    </div>
                    <div className="check-block-item">
                        <span style={{marginRight:'20px'}}>机构码：</span>
                        {this.state.info.orgCode}
                    </div>
                    <div className="check-block-item">
                        <span style={{marginRight:'20px'}}>是否需要审核：</span>
                        <Switch
                            value={this.state.info.status != null ? parseInt(this.state.info.status) === 1 : false}
                            onColor="#13ce66"
                            offColor="#ff4949"
                            onChange={(val)=>{
                                let obj = _.assign({},this.state.info)
                                obj.status = val ? '1' : '0'
                                this.setState({info:obj})
                            }}
                        />
                    </div>
                    <div className="btn-box">
                        <Button onClick={this.confirm.bind(this)} type='primary' style={{padding:'10px 50px',fontSize:'16px'}}>提交</Button>
                    </div>
                </Loading>
            </div>
        )
    }
}

export default withRouter(Burenlingshenhekongzhi)