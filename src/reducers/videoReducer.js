const initialState = JSON.parse(localStorage.getItem("video")) || {
    isActive: false,
    link: ""
}

const videoReducer = (state = initialState, action) => {

    let newState = null;

    switch (action.type) {
        case "active_video":
            newState = {
                isActive: true,
                links: action.payload
            };
            break;
        case "disable_video":
            newState = {
                isActive: false,
                links: action.payload
            };
            break;
        default:
            newState = { ...state };
    }

    localStorage.setItem("video", JSON.stringify(newState));

    return newState;

}

export default videoReducer;