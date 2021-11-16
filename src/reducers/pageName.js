const initialState = "Home"

const pageName = (state = initialState, action) => {
    switch (action.type) {
        case 'PAGE_NAME':
            return action.payload;
        default:
            return state;
    }
}

export default pageName;