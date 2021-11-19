import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux';
import axiosService from '../../api/axiosClient'
import Skeleton from '../../components/Skeleton/Skeleton';
import Playlist from '../PlaylistPage/Playlist'
import './NewSongPage.css';

function NewSongPage({ match }) {

    const [list, setList] = useState([]);

    document.title = "Nhạc mới | #zingchart tuần, #zingchart";  

    const dispatch = useDispatch();

    useEffect(() => {
        const fetchNewRelease = async () => {
            try {
                const { data } = await axiosService.post("/api/newrelease");
                setList(data.data.items);
                // console.log(data.data.items)
            } catch (error) {
                console.log(error.message)
            }
        }

        fetchNewRelease();
    }, [])

    useEffect(() => {
        dispatch({
            type: "PAGE_NAME",
            payload: "Mới phát hành"
        })
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <div className="newrelease">
            <div className="newrelease-wrap">
                <div className="newrelease-title">Mới Phát Hành</div>
                {list.length > 0 && <Playlist list={list} />}
                {list.length <= 0 && <Skeleton type="newSong" />}
            </div>
        </div>
    )
}

export default NewSongPage
