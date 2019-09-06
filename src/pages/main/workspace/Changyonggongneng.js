import React, {Component} from 'react';
import {withRouter} from "react-router-dom";
import {Button, Loading, DateRangePicker, Table} from 'element-react'
import Http from '../../../utils/http'
import _ from 'lodash'
import store from "../../../store"

import './changyonggongneng.scss'

class Changyonggongneng extends Component {
    constructor() {
        super()
        this.state = {
        }
    }

    render() {
        return  (
            <div>
                常用功能
            </div>
        )
    }
}

export default withRouter(Changyonggongneng)