

const initialState = localStorage.getItem("theme") || "normal";

const themeReducer = (state = initialState, action) => {
    switch (action.type) {
        case "THEME":
            localStorage.setItem("theme", action.payload)
            return state = action.payload;
        default:
            return state;
    }
}

export default themeReducer;

