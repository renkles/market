const defaultState = {
    currentFlag: '1-1-1'
}

export default (state = defaultState, action) => {
    switch (action.type) {
        case 'change_Current_flag':
            const newState = Object.assign({},state)
            newState.currentFlag = action.value
            return newState
        default:
            return state
    }
}