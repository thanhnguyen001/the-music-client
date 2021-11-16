const initialState = "";

const toast = (state = initialState, action) => {
    switch(action.type) {
        case "TOAST":
            return state = action.payload;
        default: 
            return state;
    }
   
}
export default toast;