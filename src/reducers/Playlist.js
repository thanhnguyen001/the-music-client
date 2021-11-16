const initialState = JSON.parse(localStorage.getItem("CURRENT_PLAYLIST")) || null;


const Playlist = (state = initialState, action) => {
    switch (action.type) {
        case 'ADD_PLAYLIST':
            const newState = {
                ...state,
                playlist: action.payload[0],
                encodeId: action.payload[1]
            };
            localStorage.setItem("CURRENT_PLAYLIST", JSON.stringify(newState));
            return newState;
            
        default:
            return state;
    }
}

export default Playlist;