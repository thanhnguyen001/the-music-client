import { combineReducers } from "redux";
import PlaySong from "./PlaySong";
import Playlist from "./Playlist";
import pageName from "./pageName";
import user from './userReducer';
import toast from "./toastReducer";
import adjustPl from "./adjustPlaylist";
import isPlay from "./isPlayReducer";
import theme from "./themeReducer";
import isActiveVideo from "./videoReducer";

const rootReducer = combineReducers({
    PlaySong,
    Playlist,
    pageName,
    user,
    toast,
    adjustPl,
    isPlay,
    theme,
    isActiveVideo,
})

export default rootReducer;