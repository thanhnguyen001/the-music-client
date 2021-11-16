

export const addSong = (song, index) => {
    return {
        type: 'PLAY_SONG',
        payload: {
            song,
            index
        }
    }
}

export const addPlaylist = (playlist) => {
    return {
        type: 'ADD_PLAYLIST',
        payload: playlist
    }
}