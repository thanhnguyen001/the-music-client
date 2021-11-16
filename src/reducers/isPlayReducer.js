const initialState = "pause"

const isPlay = (state = initialState, action) => {
    switch (action.type) {
        case 'play':
            return "play";
        case "pause":
            return "pause";
        default:
            return state;
    }
}

export default isPlay;