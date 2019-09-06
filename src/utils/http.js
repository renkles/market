import axios from 'axios'
import qs from 'qs'
import baseUrl from './api'
import {MessageBox} from 'element-react'

axios.defaults.baseURL = baseUrl

// 拦截请求
axios.interceptors.request.use(function (config) {
    return config
})

// 拦截相应
axios.interceptors.response.use(function (config) {
    let status = config.status
    console.log("status:"+status)
    if(status === 401){
        MessageBox.confirm('您的登录已过期，请重新登录!', '提示', {
            type: 'error'
        }).then(() => {
            localStorage.clear()
            window.location = '/login'
        }).catch(() => {
            localStorage.clear()
            window.location = '/login'
        })
    }else if(status === 400){
        console.log('账号或者密码错误!')
        return config
    }else{
        return config
    }
})

export default class Http {
    static get(url, params) {
        let token = localStorage.getItem('authorization')
        return new Promise((resolve, reject) => {
            axios.get(url, {
                params: params,
                headers: {'Authorization': token},
                validateStatus:(status)=>{return status === 401 || 200 || 400}
            }).then(res => {
                resolve(res.data)
            }).catch(err => {
                reject(err)
            })
        })
    }

    static post(url, params) {
        let data = url === '/oauth/token' ? qs.stringify(params) : qs.parse(params)
        let token = localStorage.getItem('authorization')
        console.log(data)
        return new Promise((resolve, reject) => {
            axios.post(url, data, {
                headers: {
                    'Content-Type': url === '/oauth/token'?'application/x-www-form-urlencoded':'application/json',
                    'Authorization': url === '/oauth/token'?'Basic Y2hqOmNoalNlY3JldA==':token
                },
                validateStatus:(status)=>{return status === 401 || 200 || 400}
            }).then(res => {
                resolve(res.data)
            }).catch(err => {
                // reject(err)
                console.error(err);
                if(url !== '/oauth/token'){
                    MessageBox.msgbox({
                        title:'提示',
                        message:'连接已断开，请检查网络是否连接!',
                        type:'error'
                    })
                }
            })
        })
    }
}
