import React, { useEffect, useRef, useState } from 'react';
import './SearchPage.css';
import useQuery from '../../hooks/useQuery';
import axiosService from '../../api/axiosClient';
import { Link } from 'react-router-dom';
import Playlist from '../PlaylistPage/Playlist';
import Carousel from '../../components/Carousel/Carousel';
import Skeleton from '../../components/Skeleton/Skeleton';
import { useDispatch, useSelector } from 'react-redux';
import noImg from '../../static/img/no-thumbnail.png';
import { addPlaylist, addSong } from '../../actions/actions';


const typeList = {
    "bai-hat": "song",
    "album": "playlist",
    "nghe-si": "artist",
    "mv": "video",
    "tat-ca": "multi"
}

function SearchPage({ match }) {
    // console.log(match)
    const typeSearch = match.params.slug;
    const query = useQuery().get("q");
    // console.log(query)

    const dispatch = useDispatch();

    const currentPlaylist = useSelector(state => state.Playlist);

    const [multi, setMulti] = useState();
    const [list, setList] = useState([]);
    const [counter, setCounter] = useState();
    const [song, setSong] = useState();

    const count = useRef(2);
    const prevCount = useRef(1);

    const fetchSearch = async (slug, type, page) => {
        try {
            const { data } = await axiosService.post(`/api/${slug}`, { q: query, typeSearch: type, page });
            // console.log(data.data);
            if (slug === "multi") {
                setMulti(data.data);
                setList([]);
            }
            else if (slug === "counter") {
                setCounter(data.data);
                setMulti({});
            }
            else {
                if (!data.data.items) return;
                if (page > 1) {
                    setList(prevList => [...prevList, ...data.data.items])
                    count.current++;
                }
                else setList(data.data.items);
                setMulti({});
            }
        } catch (error) {
            console.log(error.message);
        }
    }

    useEffect(() => {
        fetchSearch("counter");
        dispatch({
            type: "PAGE_NAME",
            payload: `Tìm kiếm cho ${query}`
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (!query) return;

        document.title = `Tìm kiếm ${query}`;

        const historySearch = JSON.parse(localStorage.getItem("history_search")) || [];
        const isExist = historySearch.find(item => item.keyword === query);
        if (!isExist) {
            historySearch.unshift({ keyword: query, type: 0 });
            if (historySearch.length >= 10) {
                historySearch.pop();
            }
            localStorage.setItem("history_search", JSON.stringify(historySearch));
        }
        if (typeList[typeSearch] === "multi") fetchSearch("multi");
        else fetchSearch("search", typeList[typeSearch], 1);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [query, typeSearch]);

    // Fetch more page
    useEffect(() => {
        const content = document.querySelector(".content");
        // const song = document.getElementById("song");
        const handleScroll = (e) => {
            if ((content.scrollTop + 20) >= (content.scrollHeight - content.clientHeight)) {
                if (count.current <= prevCount.current)  return;
                else prevCount.current = count.current;

                fetchSearch("search", typeList[typeSearch], prevCount.current);
                // console.log(prevCount.current);
            }
        }
        if (content && typeList[typeSearch] !== "multi") {
            content.addEventListener("scroll", handleScroll)
        }

        return () => content.removeEventListener("scroll", handleScroll)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [typeSearch])

    const handleShowCounter = (total) => {
        if (total >= 10 ** 6) {
            return `${Math.floor(total / 10 ** 6)}M`;
        }
        else if (total >= 1000) return `${Math.floor(total / 1000)}K`;
        else return total;
    }

    const fetchSong = async (id) => {
        try {
            const { data } = await axiosService.post(`/api/song-info/${id}`);
            if (data.data) setSong(data.data);
        } catch (error) {
            console.log(error.message)
        }
    }

    const handleIsSong = (e, id) => {
        const link = e.target.closest(".sp-top-item");
        if (link.href.includes("bai-hat")) {
            e.preventDefault();
            const isAddSong = document.querySelector(".is-add-song");
            if (isAddSong) isAddSong.style.display = "block";
            // console.log(gallery[index]);
            fetchSong(id);
        }
    }

    const handleHide = (e, stt) => {
        if (stt || e.target.className === "is-add-song" || e.target.className === "is-add-song-ignore") {
            document.querySelector(".is-add-song").style.display = "none";
        }
    }
    const handlePlayNow = async (id) => {
        try {
            const { data } = await axiosService.post(`/api/recommend/${id}`);
            // console.log(data.data);
            dispatch(addPlaylist([song, ...data.data.items]));
            dispatch(addSong(song, 0));
            handleHide(null, true);
        } catch (error) {
            console.log(error.message)
        }
    }

    const handleBonusPlaylist = (song) => {
        if (!currentPlaylist) return;
        dispatch(addPlaylist([...currentPlaylist.playlist, song]));
        handleHide(null, true);
    }

    return (
        <div className="search-page">
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

            <div className="sp-wrap">

                {counter && <div className="search-page-heading">
                    <div className="sp-title">Kết Quả tìm Kiếm</div>

                    <div className="sp-items">
                        <div className={`sp-item sp-all ${match.params.slug === "tat-ca" ? "active" : ""}`}>
                            <Link to={`/tim-kiem/tat-ca?q=${query}`}>TẤT CẢ</Link>
                        </div>
                        <div className={`sp-item sp-song ${match.params.slug === "bai-hat" ? "active" : ""}`}>
                            <Link to={`/tim-kiem/bai-hat?q=${query}`}>BÀI HÁT</Link>
                            <span className="sp-total">{handleShowCounter(counter.song)}</span>
                        </div>
                        <div className={`sp-item sp-album ${match.params.slug === "album" ? "active" : ""}`}>
                            <Link to={`/tim-kiem/album?q=${query}`} className="hide-in-mobile">PLAYLIST/ALBUM</Link>
                            <Link to={`/tim-kiem/album?q=${query}`} className="show-in-mobile">PLAYLIST</Link>
                            <span className="sp-total">{handleShowCounter(counter.playlist)}</span>
                        </div>
                        <div className={`sp-item sp-artist ${match.params.slug === "nghe-si" ? "active" : ""}`}>
                            <Link to={`/tim-kiem/nghe-si?q=${query}`}>NGHỆ SĨ</Link>
                            <span className="sp-total">{handleShowCounter(counter.artist)}</span>
                        </div>
                        <div className={`sp-item sp-mv ${match.params.slug === "mv" ? "active" : ""}`}>
                            <Link to={`/tim-kiem/mv?q=${query}`}>MV</Link>
                            <span className="sp-total">{handleShowCounter(counter.video)}</span>
                        </div>
                    </div>

                </div>}

                {multi && multi.top && <div className="sp-multi">
                    <div className="sp-top-result">
                        <div className="sp-title">Top Kết Quả <span>{`"${query.split(' ').map(i => i[0].toUpperCase() + i.slice(1)).join(' ')}"`}</span></div>
                        <div className="sp-top">
                            <div className="sp-top-wrap">
                                <Link to={`${multi.top.link}`} className="sp-top-item" onClick={(e) => handleIsSong(e, multi.top.encodeId)}>
                                    <div className={`sp-top-thumbnail sp-top-${multi.top.objectType}`}>
                                        <img src={multi.top.thumbnail} alt="" />
                                    </div>
                                    <div className="sp-item-info">
                                        <div className="sp-item-name">
                                            {multi.top.objectType === "artist" ? multi.top.name : multi.top.title}
                                        </div>
                                        <div className="sp-item-sub">
                                            {multi.top.objectType === "artist" ? "Nghệ sĩ" : "Bài hát"}
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        </div>
                    </div>

                    {multi.songs && <div className="sp-section sp-section-song">
                        <div className="sp-title">Bài hát <i className="fas fa-chevron-right"></i></div>
                        <Playlist list={multi.songs} />
                    </div>}

                    {multi.playlists && <div className="sp-section sp-section-playlist">
                        <Carousel list={multi.playlists} title="PLAYLIST/ALBUM" index="0" />
                    </div>}
                    {multi.videos && <div className="sp-section sp-section-playlist">
                        <Carousel list={multi.videos} title="MV" index="1" type="video" />
                    </div>}
                    {multi.artists && <div className="sp-section sp-section-playlist">
                        <Carousel list={multi.artists} title="Nghệ sĩ" index="2" type="artist" />
                    </div>}
                </div>}

                {typeSearch === "bai-hat" && <div className="sp-section-songs sp-section-item" id="song">
                    <Playlist list={list} recommend={true} />
                </div>}
                {typeSearch === "album" && <div className="sp-section-playlist sp-section-item" id="playlist">
                    <Carousel list={list} index="0" title="PLAYLIST/ALBUM" isSP={true} />
                </div>}
                {typeSearch === "nghe-si" && <div className="sp-section-artist sp-section-item" id="artist">
                    <Carousel list={list} index="1" title="NGHỆ SĨ" isSP={true} type="artist" />
                </div>}
                {typeSearch === "mv" && <div className="sp-section-mv sp-section-item" id="mv">
                    <Carousel list={list} index="3" title="MV" isSP={true} type="video" />
                </div>}

                <Skeleton />
            </div>

        </div>
    )
}

export default SearchPage

