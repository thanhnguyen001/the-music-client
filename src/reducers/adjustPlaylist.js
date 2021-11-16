const initialState = {};

const adjustPl = (state = initialState, action) => {
    switch (action.type) {
        case "RENAME":
            const newState = { ...action.payload }
            return newState;

        default:
            // console.log("Invalid action");
            return state;
    }
}
export default adjustPl;