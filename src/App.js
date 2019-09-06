import React, {Component} from 'react';
import {BrowserRouter as Router, Switch, Redirect, Route} from 'react-router-dom';
// import routeMap from './routermap'

// 异步路由
function asyncComponent(importComponent) {
    class AsyncComponent extends React.Component {
        constructor(props) {
            super(props);
            this.state = {
                component: null
            };
        }

        async componentDidMount() {
            const {default: component} = await importComponent();
            this.setState({
                component: component
            });
        }

        render() {
            const C = this.state.component;
            return C ? <C {...this.props} /> : null;
        }
    }

    return AsyncComponent;
}

// 路由守卫
class AuthorizedRoute extends Component {
    render() {
        const {component: Component, ...rest} = this.props
        const isLogged = localStorage.getItem('authorization') != null ? true : false // 判断条件
        return (
            <Route
                {...rest}
                render={
                    props => {
                        return isLogged ? <Component {...props} /> : <Redirect to="/login"/>
                    }
                }
            />
        )
    }
}

// 引入组件
const Login = asyncComponent(()=>import('./pages/login/Login'))
const Main = asyncComponent(() => import('./pages/main/Main'))

class App extends Component {

    render() {
        return (
            <Router>
                <Switch>
                    <Route path='/login' component={Login}/>
                    <Route path="/" render={() =>
                        <Main>
                            {/*主页*/}
                            <AuthorizedRoute path='/index' component={asyncComponent(() => import('./pages/main/homepage/Homepage'))}/>
                            {/*工作台*/}
                            <AuthorizedRoute path='/fabubaobiaorenwu' component={asyncComponent(() => import('./pages/main/workspace/Fabubaobiaorenwu'))}/>
                            <AuthorizedRoute path='/fabuyingxiaorenwu' component={asyncComponent(() => import('./pages/main/workspace/Fabuyingxiaorenwu1'))}/>
                            <AuthorizedRoute path='/wofabuguode' component={asyncComponent(() => import('./pages/main/workspace/Wofabuguode'))}/>
                            <AuthorizedRoute path='/wowanchenguode' component={asyncComponent(() => import('./pages/main/workspace/Wowanchenguode'))}/>
                            <AuthorizedRoute path='/woshenpiguode' component={asyncComponent(() => import('./pages/main/workspace/Woshenpiguode'))}/>
                            <AuthorizedRoute path='/daibanshenpi' component={asyncComponent(() => import('./pages/main/workspace/Daibanshenpi'))}/>
                            <AuthorizedRoute path='/zixunguanli' component={asyncComponent(() => import('./pages/main/workspace/Zixunguanli'))}/>
                            <AuthorizedRoute path='/zixunyulan' component={asyncComponent(() => import('./pages/main/workspace/Zixunyulan'))}/>
                            <AuthorizedRoute path='/gongju' component={asyncComponent(() => import('./pages/main/workspace/Gongju'))}/>
                            <AuthorizedRoute path='/changyonggongneng' component={asyncComponent(() => import('./pages/main/workspace/Changyonggongneng'))}/>
                            {/*产品*/}
                            <AuthorizedRoute path='/chanpinguanli' component={asyncComponent(() => import('./pages/main/product/Chanpinguanli'))}/>
                            <AuthorizedRoute path='/chanpinyulan' component={asyncComponent(() => import('./pages/main/product/Chanpinyulan'))}/>
                            {/*客户*/}
                            <AuthorizedRoute path='/wodeheku' component={asyncComponent(() => import('./pages/main/customer/Wodekehu'))}/>
                            {/*全员营销*/}
                            <AuthorizedRoute path='/yewuyuyueshenqing' component={asyncComponent(() => import('./pages/main/collectivemarket/Yewuyuyueshenqing'))}/>
                            <AuthorizedRoute path='/yuyuejinduchaxun' component={asyncComponent(() => import('./pages/main/collectivemarket/Yuyuejinduchaxun'))}/>
                            <AuthorizedRoute path='/faqiburenlingshensu' component={asyncComponent(() => import('./pages/main/collectivemarket/Faqiburenlingshensu'))}/>
                            <AuthorizedRoute path='/burenlingjinduchaxun' component={asyncComponent(() => import('./pages/main/collectivemarket/Burenlingjinduchaxun'))}/>
                            <AuthorizedRoute path='/shensujinduchaxun' component={asyncComponent(() => import('./pages/main/collectivemarket/Shensujinduchaxun'))}/>
                            <AuthorizedRoute path='/wodeyingxiaojiangli' component={asyncComponent(() => import('./pages/main/collectivemarket/Wodeyingxiaojiangli'))}/>
                            <AuthorizedRoute path='/benhangyuangongyingxiaojiangli' component={asyncComponent(() => import('./pages/main/collectivemarket/Benhangyuangongyingxiaojiangli'))}/>
                            <AuthorizedRoute path='/quanhangyuangongTOP20' component={asyncComponent(() => import('./pages/main/collectivemarket/QuanhangyuangongTOP20'))}/>
                            <AuthorizedRoute path='/quanhangyuangongyingxiaojiangli' component={asyncComponent(() => import('./pages/main/collectivemarket/Quanhangyuangongyingxiaojiangli'))}/>
                            <AuthorizedRoute path='/quanyuanyingxiaohuizongbaobiao' component={asyncComponent(() => import('./pages/main/collectivemarket/Quanyuanyingxiaohuizongbaobiao'))}/>
                            <AuthorizedRoute path='/burenlingshenhe' component={asyncComponent(() => import('./pages/main/collectivemarket/Burenlingshenhe'))}/>
                            <AuthorizedRoute path='/shensushenhe' component={asyncComponent(() => import('./pages/main/collectivemarket/Shensushenhe'))}/>
                            <AuthorizedRoute path='/burenlingshenhekongzhi' component={asyncComponent(() => import('./pages/main/collectivemarket/Burenlingshenhekongzhi'))}/>
                            <AuthorizedRoute path='/daikuanxuqiushenqing' component={asyncComponent(() => import('./pages/main/collectivemarket/Daikuanxuqiushenqing'))}/>
                            <AuthorizedRoute path='/daikuanxuqiuchaxun' component={asyncComponent(() => import('./pages/main/collectivemarket/Daikuanxuqiuchaxun'))}/>
                            <AuthorizedRoute path='/daikuanyingxiaotaizhang' component={asyncComponent(() => import('./pages/main/collectivemarket/Daikuanyingxiaotaizhang'))}/>
                            {/*营销板块*/}
                            <AuthorizedRoute path='/chuangjianyingxiaohuodong' component={asyncComponent(() => import('./pages/main/marketsector/Chuangjianyingxiaohuodong'))}/>
                            <AuthorizedRoute path='/yingxiaohuodongzhixing' component={asyncComponent(() => import('./pages/main/marketsector/Yingxiaohuodongzhixing'))}/>
                            <AuthorizedRoute path='/yingxiaohuodongguanli' component={asyncComponent(() => import('./pages/main/marketsector/Yingxiaohuodongguanli'))}/>
                            <AuthorizedRoute path='/yingxiaohuodongjiankongjipingjia' component={asyncComponent(() => import('./pages/main/marketsector/Yingxiaohuodongjiankongjipingjia'))}/>
                            <AuthorizedRoute path='/guoduyingxiaokongzhi' component={asyncComponent(() => import('./pages/main/marketsector/Guoduyingxiaokongzhi'))}/>
                            {/*out of nav*/}
                            <AuthorizedRoute path='/authority' component={asyncComponent(() => import('./pages/main/otherPages/SetAuthority'))}/>
                            <AuthorizedRoute path='/editauthority' component={asyncComponent(() => import('./pages/main/otherPages/EditAuthority'))}/>
                        </Main>
                    }/>
                </Switch>
            </Router>
        );
    }
}

export default App;