import React, {Component} from 'react'
import {withRouter} from "react-router-dom"
import {HotTable} from '@handsontable/react'
import XLSX from 'xlsx'

import 'handsontable/dist/handsontable.full.css'
import './handsonTable.scss'

class HandsonTable extends Component{
    constructor() {
        super()
        this.state = {
            // settings:{}
        }
    }


    // // 编辑
    // updateData(cell) {
    //     if(cell != null) {
    //         console.log(cell)
    //         // this.props.updateExcel(cell)
    //     }
    // }

    // 关闭excel
    closeExcel() {
        this.props.closeItem(this)
    }

    // 下载excel
    downloadFile() {
        let fileName = this.props.fileName
        let elt = this.refs.tableData
        let wb = XLSX.utils.table_to_book(elt, {raw: true})
        return XLSX.writeFile(wb, fileName)
    }

    render(){
        return(
            <div style={{position:'relative'}}>
                <div className='excel-editor-title'>
                    编辑—{this.props.fileName}
                    <span style={{color:'#F00'}}>{this.props.settings.readOnly != null && this.props.settings.readOnly ? "（只读模式）" : null}</span>
                    <i onClick={this.closeExcel.bind(this)} className="iconfont icon-guanbi close-btn" title='关闭编辑窗口'></i>
                    <i onClick={this.downloadFile.bind(this)} className="iconfont icon-xiazai download-btn" title='下载Excel'></i>
                </div>
                <HotTable cell={this.props.disableTitleList != null ? this.props.disableTitleList : []} data={this.props.data} settings={this.props.settings} licenseKey='non-commercial-and-evaluation'/>
                <table ref='tableData' style={{display:'none'}}>
                    <thead>
                    <tr>
                        {
                            this.props.data[0] != null
                                ?
                                this.props.data[0].map((el,index)=>
                                    <td key={index}>{el}</td>
                                )
                                :
                                null
                        }
                    </tr>
                    </thead>
                    <tbody>
                    {
                        this.props.data.slice(1).length > 0
                            ?
                            this.props.data.slice(1).map((list,index)=>
                                <tr key={index + 1}>
                                    {
                                        list.map((el,insideIndex)=>
                                            <td key={insideIndex}>{el}</td>
                                        )
                                    }
                                </tr>
                            )
                            :
                            null
                    }
                    </tbody>
                </table>
            </div>
        )
    }
}

export default withRouter(HandsonTable)