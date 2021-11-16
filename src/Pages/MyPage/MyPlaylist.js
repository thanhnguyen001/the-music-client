import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux';
import Playlist from '../PlaylistPage/Playlist';
import "./MyPage.css"

function MyPlaylist({ match }) {

    const playlistId = match.params.id;
    // console.log(playlistId)
    const playlist = useSelector(state => state.user).playlist;
    const [list, setList] = useState([]);

    useEffect(() => {
        const newList = playlist.find(ele => ele.encodeId === playlistId);
        setList(newList);
    }, [playlist, playlistId])

    return (
        <div className="my-playlist-page" data-id={playlistId}>

            <h3>{`Playlist "${list.title}"`}</h3>
            {list && list.items && list.items.length > 0 && <Playlist list={list.items} />}
            {list && list.items && list.items.length === 0 && <div className="no-song">
                <div className="no-song-wrap">
                    <i className="fas fa-music"></i>
                    <span>Bạn chưa có bài hát nào trong playlist này</span>
                </div>
            </div>}

        </div>
    )
}

export default MyPlaylist
