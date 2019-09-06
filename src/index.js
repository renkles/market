import "core-js"
import 'react-app-polyfill/ie9';
import 'react-app-polyfill/stable';
import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import App from './App'
import * as serviceWorker from './serviceWorker'
import 'element-theme-default'

ReactDOM.render(<App/>, document.getElementById('root'))

serviceWorker.unregister();