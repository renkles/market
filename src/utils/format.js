function formatFileName(str) {
    let fileType = str.substring(str.lastIndexOf(".")).toLowerCase()
    let fileName = str.substring(0,str.lastIndexOf("."))
    if(fileName.split('').length > 8){
        fileName = `${fileName.slice(0,6)}...${fileName.slice(-2)}`
    }
    return `${fileName}${fileType}`
}

function formatTime(str) {
    if(/^\d{13}$/.test(str)){
        let time = new Date(str)
        let year = time.getFullYear()
        let month = parseInt(time.getMonth()) + 1
        let date = parseInt(time.getDate())
        return `${year}-${month}-${date}`
    }else{
        return "------"
    }
}

function formatAllTime(str) {
    if(/^\d{13}$/.test(str)){
        let time = new Date(str).toLocaleString().replace(/\//g,"-")
        return time
    }else{
        return "------"
    }
}

export default {
    formatFileName: formatFileName,
    formatTime: formatTime,
    formatAllTime:formatAllTime
}