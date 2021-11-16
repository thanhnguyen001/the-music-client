
const initialState = JSON.parse(localStorage.getItem("user")) || null;

const userReducer = (state = initialState, action) => {
    let newState = { ...state };
    switch (action.type) {
        case "SIGN_IN":
        case "LOG_IN":
            localStorage.setItem("user", JSON.stringify(action.payload));
            newState = action.payload;
            break;
        default:
            // console.error("Invalid action.")
            break;
    }
    return newState
}

export default userReducer;