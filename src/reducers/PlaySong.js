

const initialState =JSON.parse(localStorage.getItem("CURRENT_SONG")) || null;


const PlaySong = (state = initialState, action) => {
    switch (action.type) {
        case 'PLAY_SONG':
            const newState = {
                ...state,
                song: action.payload
            };
            localStorage.setItem("CURRENT_SONG", JSON.stringify(newState));
            return newState;
        default:
            return state;
    }
}

export default PlaySong;