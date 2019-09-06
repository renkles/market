import React, {Component} from 'react';
import {withRouter} from "react-router-dom";
import {Button, Loading, DateRangePicker, Table} from 'element-react'
import Http from '../../../utils/http'
import _ from 'lodash'
import store from "../../../store"

import './gongju.scss'

class Gongju extends Component {
    constructor() {
        super()
        this.state = {
        }
    }

    render() {
        return  (
            <div>
                工具
            </div>
        )
    }
}

export default withRouter(Gongju)