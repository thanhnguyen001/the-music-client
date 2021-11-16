import React, { useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types';
import './Gallery.css';
import { Link } from 'react-router-dom';
import axiosService from '../../api/axiosClient';
import { addPlaylist, addSong } from '../../actions/actions';
import { useDispatch, useSelector } from 'react-redux';
import noImg from '../../static/img/no-thumbnail.png';
import Skeleton from '../Skeleton/Skeleton';


function Gallery(props) {

    const { gallery } = props;
    const dispatch = useDispatch();
    const timeout = useRef(null);
    const [isPause, setIsPause] = useState(false);
    const [song, setSong] = useState();

    const [list, setList] = useState([
        "previous", "first", "second", "third", "next", "waiting"
    ]);

    const currentPlaylist = useSelector(state => state.Playlist);

    function resetTimeout() {
        if (timeout.current) {
            clearTimeout(timeout.current)
        }
    }

    useEffect(() => {
        resetTimeout();

        timeout.current = setTimeout(() => {
            if (!isPause) handleChangeSlide(true)
        }, 3000)

        return () => clearTimeout(timeout.current);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isPause])

    const handleChangeSlide = (status) => {
        setIsPause(true);
        clearTimeout(timeout.current);
        const prevList = [...list];
        if (status) {
            const last = prevList.pop();
            setList([last, ...prevList]);
        }
        else {
            const first = prevList.shift();
            setList([...prevList, first]);
        }
        timeout.current = setTimeout(() => setIsPause(false), 2000);
    }

    const showLink = (str) => {
        const link = str.replace(".html", "");
        return link;
    }

    const fetchSong = async (id) => {
        try {
            const { data } = await axiosService.post(`/api/song-info/${id}`);
            if (data.data) setSong(data.data);
        } catch (error) {
            console.log(error.message)
        }
    }

    useEffect(() => {
        const galleries = document.querySelectorAll(".gallery-item a");
        [...galleries].forEach((item, index) => {
            item.onclick = (e) => {
                const link = e.target.closest("a");
                if (link.href.includes("bai-hat")) {
                    e.preventDefault();
                    const isAddSong = document.querySelector(".is-add-song");
                    if (isAddSong) isAddSong.style.display = "block";
                    // console.log(gallery[index]);
                    fetchSong(gallery[index].encodeId);
                }
            }
        })
    }, [gallery])

    const handleHide = (e, stt) => {
        if (stt || e.target.className === "is-add-song" || e.target.className === "is-add-song-ignore") {
            document.querySelector(".is-add-song").style.display = "none";
        }
    }

    const showGalleries = (list) => {
        const result = [];
        let j = 0, i = 0;

        while (i < gallery.length) {
            if (j >= list.length) j = 5;
            let add = list[j];
            result.push(<div className={`gallery-item gallery-${add}`} key={i}>
                <Link to={showLink(gallery[i].link)}>
                    <div className="gallery-item-img">
                        <img src={gallery[i].banner} alt="gallery" />
                    </div>
                </Link>
            </div>);

            i++; j++;
        }
        if (j < list.length) {
            i = 0;
            while (j < list.length) {
                let add = list[j];
                result.push(<div className={`gallery-item gallery-${add}`} key={i}>
                    <Link to={showLink(gallery[i].link)}>
                        <div className="gallery-item-img">
                            <img src={gallery[i].banner} alt="gallery" />
                        </div>
                    </Link>
                </div>);

                i++; j++;
            }
        }
        return result;
    }

    const handlePlayNow = async (id) => {
        try {
            const { data } = await axiosService.post(`/api/recommend/${id}`);
            // console.log(data.data);
            dispatch(addPlaylist([[song, ...data.data.items]]));
            dispatch(addSong(song, 0));
            handleHide(null, true);
        } catch (error) {
            console.log(error.message)
        }
    }

    const handleBonusPlaylist = (song) => {
        if (!currentPlaylist) return;
        dispatch(addPlaylist([[...currentPlaylist.playlist, song], currentPlaylist.encodeId]));
        handleHide(null, true);
    }

    return (
        <div className="galleries">

            <div className="is-add-song" onClick={handleHide}>
                <div className="is-add-song-wrap">
                    <div className="is-add-song-notice">Bạn có muốn phát bài hát này? Danh sách phát hiện tại sẽ bị thay thế.</div>
                    <div className="is-add-song-thumbnail">
                        <img src={song ? song.thumbnailM : noImg} alt="" />
                    </div>
                    <div className="is-add-song-title">{song ? song.title : <Skeleton type="title" />}</div>
                    <div className="is-add-song-artists">{song ? song.artistsNames : <Skeleton type="title" />}</div>

                    {song && <div className="is-add-song-play" onClick={() => handlePlayNow(song.encodeId)}>
                        <i className="fas fa-play"></i>
                        PHÁT BÀI HÁT
                    </div>}
                    {song && <div className="is-add-song-add" onClick={() => handleBonusPlaylist(song)}>
                        THÊM VÀO DANH SÁCH PHÁT
                    </div>}

                    {!song && <div className="is-add-song-play">
                        <i className="fas fa-play"></i>
                        PHÁT BÀI HÁT
                    </div>}
                    {!song && <div className="is-add-song-add">
                        THÊM VÀO DANH SÁCH PHÁT
                    </div>}

                    <div className="is-add-song-ignore" onClick={handleHide}>BỎ QUA</div>

                </div>
            </div>

            <div className="galleries-wrap">
                {showGalleries(list)}

                <div className="gallery-btn btn-prev" onClick={() => handleChangeSlide(false)}>
                    <i className="fas fa-chevron-left"></i>
                </div>
                <div className="gallery-btn btn-next" onClick={() => handleChangeSlide(true)}>
                    <i className="fas fa-chevron-right"></i>
                </div>
            </div>
        </div>
    )
}

Gallery.propTypes = {
    gallery: PropTypes.array
}

export default Gallery


