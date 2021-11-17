/* eslint-disable react/jsx-no-target-blank */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { memo, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addPlaylist, addSong } from '../../actions/actions';
import axiosClient from '../../api/axiosClient';
import './Playlist.css';
import { Link, useLocation } from 'react-router-dom';
import Skeleton from '../../components/Skeleton/Skeleton';
import Carousel from '../../components/Carousel/Carousel';
import useDimensionWindow from '../../hooks/useDimensionWindow';
import LazyLoad from '../../components/LazyLoadImage';
import InfoSong from '../../components/InfoSong/InfoSong';
import { animationFly } from '../../utils';

function Playlist(props) {

    const { match, list, recommend, isMyMusic } = props;

    const location = useLocation();

    const myRef = useRef(null);

    const dispatch = useDispatch();
    const isFirst = useRef(true);
    const isNFirst = useRef(false);

    const user = useSelector(state => state.user) || JSON.parse(localStorage.getItem("user"));

    const [playlist, setPlaylist] = useState([]);
    const [sortMode, setSortMode] = useState('Mặc định');
    const [infoAlbum, setInfoAlbum] = useState();
    const [isLoaded, setIsLoaded] = useState(false);
    const [sectionBottom, setSection] = useState([]);

    const currentSong = useSelector(state => state.PlaySong);
    // const playlistDefault = JSON.parse(localStorage.getItem('DEFAULT_PLAYLIST'));
    const playlistDefault = useRef(JSON.parse(localStorage.getItem('DEFAULT_PLAYLIST')) || { playlist: [] });

    const currentPlaylist = useSelector(state => state.Playlist);
    const isActiveVideo = useSelector(state => state.isActiveVideo);

    const isPlay = useSelector(state => state.isPlay);

    // Handle Rotate Thumbnail Playlist

    useEffect(() => {
        if (!currentPlaylist) return;
        const mainPlaylist = document.querySelector(".main-playlist");
        if (mainPlaylist && mainPlaylist.dataset.id === currentPlaylist.encodeId) {
            handleRotateThumbnail();
        }
        else {
            handleRotateThumbnail(false, true);
        }

    }, [infoAlbum, isPlay, currentPlaylist])

    const handleRotateThumbnail = (stt, stt2) => {

        const songPlay = document.querySelector(".song-item.active");
        // console.log("ok")
        const thumbnail = document.querySelector(".cover-img-overlay");
        const iconPlay = thumbnail?.querySelector("i");
        const cover = document.querySelector(".cover-img-wrap");
        if (thumbnail && cover) {
            const actionCover = cover.querySelector(".action-play");
            if ((isPlay === "play" || stt) && !stt2) {
                // songPlay.classList.add("play");
                actionCover.style.display = "flex";
                thumbnail.style.display = "flex";
                if (iconPlay) iconPlay.style.display = "none";
                cover.style.borderRadius = "50%";
                cover.style.animation = "rotateCd 12s linear infinite";
                isNFirst.current = true;
            }
            else if (isPlay === "pause" || !stt || stt2) {
                // songPlay.classList.remove("play");
                if (!isNFirst.current) return;
                if (!songPlay && !stt2) return;
                actionCover.style.display = "none";
                cover.style.animation = "turnOne 0.3s linear";
                if (iconPlay) iconPlay.style.display = "block";
                setTimeout(() => {
                    thumbnail.style.display = "none";
                    cover.style.borderRadius = "10px";
                }, 300)
            }
        }
    }

    // Fetch Playlist

    useEffect(() => {
        const fetchPlaylist = async () => {
            try {
                let url = "";
                const { albumName, id } = match.params;
                if (albumName) {
                    url = `/api/album/${albumName}/${id.replace(".html", '')}`;
                    let { data } = await axiosClient.post(url);

                    const dt = { ...data }

                    // console.info(dt);
                    if (dt.data.song.items.length > 0) {
                        setPlaylist(dt.data.song.items);
                        playlistDefault.current.playlist = [...dt.data.song.items];
                        localStorage.setItem('DEFAULT_PLAYLIST', JSON.stringify(playlistDefault.current));
                        setIsLoaded(true);
                        clearInterval(autoFetch);
                    }
                    setInfoAlbum({
                        thumbnail: dt.data.thumbnailM || dt.data.thumbnail,
                        release: dt.data.release || dt.data.releaseDate,
                        title: dt.data.title,
                        liked: dt.data.like,
                        artist: dt.data.artist || dt.data.artistsNames,
                        description: dt.data.description,
                        artistsNames: dt.data.artistsNames,
                        total: dt.data.song.total,
                        totalDuration: dt.data.song.totalDuration,
                        listen: dt.data.listen,
                        sortDescription: dt.data.sortDescription,
                        genres: dt.data.genres,
                        encodeId: dt.data.encodeId,
                        link: dt.data.link,
                    });
                    dispatch({
                        type: "PAGE_NAME",
                        payload: dt.data.title
                    })
                    fetchSectionBottom(id);

                    document.title = `${dt.data.title}`;
                }

            } catch (error) {
                console.log(error);
            }
        }
        if (!list) fetchPlaylist();
        const autoFetch = setInterval(() => {
            if (!isLoaded && !list) {
                fetchPlaylist();
            }
            else clearInterval(autoFetch);
        }, 10000);
        if (list) {
            setPlaylist(list);
            setIsLoaded(true);
            playlistDefault.current.playlist = [...list];
            clearInterval(autoFetch);
        }

        return () => {
            clearInterval(autoFetch);
            setIsLoaded(false);
            setInfoAlbum("");
        }

    }, [list, match?.params.albumName, match?.params.id]);

    const { width: windowWidth, height: windowHeight } = useDimensionWindow();

    useEffect(() => {
        if (windowWidth > 600) {
            handleChangeInfoInMobile(false);
        }
    }, [windowWidth]);

    const fetchSectionBottom = async (id) => {
        try {
            const { data } = await axiosClient.post(`/api/section-bottom/${id.replace(".html", '')}`);
            if (data.err === 0) {
                data.data.pop()
                setSection(data.data);
            }
        } catch (error) {
            console.error(error.message);
        }
    }

    const HandleScrollIntoView = (index, encodeId) => {
        // const crs = JSON.parse(localStorage.getItem("CURRENT_SONG"));
        const crplt = JSON.parse(localStorage.getItem("CURRENT_PLAYLIST"));
        if (!currentSong || !playlist || playlist.length <= 0 || !crplt || crplt.playlist.length <= 0) return;

        if (playlist[0]?.encodeId !== crplt.playlist[0]?.encodeId) return;
        if (currentSong.song.index === index) {
            const songElement = document.getElementById(`song-${currentSong.song.index}`);
            const songs = document.querySelectorAll(".song-item");
            // console.log("pok")
            if (songElement) {
                songs[index].classList.add("active");
                if (isFirst.current) {
                    isFirst.current = false;
                    setTimeout(() => {
                        songs[index].scrollIntoView({
                            behavior: 'smooth',
                            block: 'center'
                        }, 300);
                    });
                }
            }
            return `active ${isPlay === "play" ? "play" : ""}`;
        }
        else return "";
    }

    const renderArtist = (list) => {
        return list.map(((item, index) => {
            return <Link key={index} to={item.link.replace("https://zingmp3.vn", '')} >
                {`${item.name}${(list.length === 1 || (list.length > 1 && index === list.length - 1)) ? " " : ", "}`}
            </Link>
        }));
    }

    const handleShowMenu = (index) => {
        const info = document.querySelector(`#song-${index} .info-song`);
        const song = document.getElementById(`song-${index}`);
        if (windowWidth <= 600) {
            if (info.className.includes("active")) {
                info.classList.remove("active");
                info.style.top = "50%";
                info.style.transform = `translateY(0)`;
            }
            else {
                info.classList.add("active");
            }
            return;
        }
        if (info && song) {
            if (info.className.includes("active")) {
                info.classList.remove("active");
                info.style.top = "50%";
                info.style.transform = `translateY(0)`;
            }
            else {
                info.classList.add("active");
            }
            const rect = song.getBoundingClientRect();
            const spaceBottom = Math.floor(windowHeight - rect.top - song.clientHeight / 2 - info.clientHeight);
            // console.log(spaceBottom)

            if (spaceBottom <= 155) {
                const bonus = Math.floor((windowHeight - rect.bottom - 90) / song.clientHeight);
                if (bonus < 3) {
                    info.style.transform = `translateY(-100%)`;
                    info.style.top = "50%";
                }
                else {
                    info.style.transform = `translateY(0)`;
                    info.style.top = `calc(50% - ${100 - spaceBottom}px - ${song.clientHeight * bonus / 2}px)`;
                }
                // console.log(info.getBoundingClientRect())
                if (info.getBoundingClientRect().top < 0) {
                    info.style.transform = `translateY(calc(-100% + ${-1 * info.getBoundingClientRect().top + 150}px))`
                }
                else if (info.getBoundingClientRect().bottom < 0) {
                    info.style.transform = `translateY(calc(-100% + ${-1 * info.getBoundingClientRect().bottom + 150}px))`
                }
            }
        }
    }

    const handleAddToLibrary = async (song, action, index) => {
        if (!user || !user.username) {
            const form = document.getElementById("form");
            if (form) form.style.display = "block";
            return;
        }
        const heart = document.querySelectorAll(`#song-${index} .fa-heart`);
        if (action === "DELETE") {
            heart[0].style.animation = "deleteFromLibrary 0.5s linear";
            setTimeout(() => {
                heart[0].classList.add("hide");
                heart[1].classList.remove("hide");
                dispatch({ type: "TOAST", payload: "Xóa bài hát thành công" });
                if (isMyMusic) {
                    heart[0].classList.remove("hide");
                    heart[1].classList.add("hide");
                }
            }, 500)
        }
        else {
            heart[0].classList.remove("hide");
            heart[1].classList.add("hide");
            dispatch({ type: "TOAST", payload: "Thêm bài hát thành công" });
        }
        try {
            const response = await axiosClient.post("/api/user/update/song", { song, action });
            // console.log(response);
            if (response.success) dispatch({
                type: "LOG_IN",
                payload: response.user
            })
        } catch (error) {
            console.log(error.message)
        }
    }

    const handleActiveVideo = (link) => {
        dispatch({ type: "active_video", payload: [link, ""] });
        dispatch({ type: "pause" })

    }

    const handleMvLink = (link) => {
        if (isActiveVideo.links && isActiveVideo.links.length > 1) {
            return `${isActiveVideo.links[1]}${link}`;
        }
        else return `${location.pathname}${link}`

    }

    const renderSongs = (songs) => {
        let group = "";
        if (user && user.liked && user.liked.length > 0 && songs.length > 0) {
            group = user.liked.reduce((str, item) => {
                return str + item.encodeId + "-";
            }, "");
        }
        function handleLiked(song, index) {
            if (isMyMusic) {
                return (
                    <><i className={`fas fa-heart except`} title="Xóa khỏi thư viện" onClick={() => handleAddToLibrary(song, "DELETE", index)}></i>
                        <i className={`far fa-heart except hide`} title="Thêm vào thư viện" onClick={() => handleAddToLibrary(song, "ADD", index)}></i></>
                )
            }
            if (group.includes(`${song.encodeId}`)) {
                return (
                    <><i className={`fas fa-heart except`} title="Xóa khỏi thư viện" onClick={() => handleAddToLibrary(song, "DELETE", index)}></i>
                        <i className={`far fa-heart except hide`} title="Thêm vào thư viện" onClick={() => handleAddToLibrary(song, "ADD", index)}></i></>
                )
            }
            else return (
                <><i className={`fas fa-heart except hide`} title="Xóa khỏi thư viện" onClick={() => handleAddToLibrary(song, "DELETE", index)}></i>
                    <i className={`far fa-heart except`} title="Thêm vào thư viện" onClick={() => handleAddToLibrary(song, "ADD", index)}></i></>
            )
        }
        return songs.map((song, index) =>
            <div className={`song-item ${HandleScrollIntoView(index, song.encodeId)}`}
                id={`song-${index}`} ref={myRef} key={index}
                onClick={(e) => playSong(song, index, e)}
            >
                <InfoSong song={song} index={index} />

                {!isNaN(song.rakingStatus) && <div className="rank">
                    <div className={`rank-number top-${index + 1}`}>{index + 1}</div>
                    <div className="rank-status">
                        {<div className="rank-stt">{index + 1}</div>}
                        {song.rakingStatus > 0 ?
                            <i className="fas fa-caret-up"></i>
                            : song.rakingStatus === 0 ?
                                <i className="fas fa-minus"></i>
                                : <i className="fas fa-caret-down"></i>}
                        <div className="rank-up-down">{song.rakingStatus !== 0 && Math.abs(song.rakingStatus)}</div>
                    </div>
                </div>}
                <div className="song-item-left">
                    <div className="song-item-left-wrap">
                        <div className="song-item-music-note">
                            <i className="fas fa-music"></i>
                            <i className="far fa-square"></i>
                        </div>
                        <div className="song-item-img" >
                            <div className="song-item-img-overlay">
                                <i className="fas fa-play"></i>
                                <div className="action-play">
                                    <div></div> <div></div> <div></div> <div></div>
                                </div>
                            </div>
                            <div className="song-item-thumb">
                                <i className="fas fa-play"></i>
                                <LazyLoad offsetBottom={150} src={song.thumbnail}>
                                    {/* <img src={song.avatar || song.thumbnail} alt="" /> */}
                                </LazyLoad>
                                <div className={`cd-animate cd-${index}`}>
                                    <LazyLoad offsetBottom={150} src={song.thumbnail}>
                                        {/* <img src={song.avatar || song.thumbnail} alt="" /> */}
                                    </LazyLoad>
                                </div>
                            </div>
                        </div>

                        <div className="song-item-info">
                            <div className="song-item-info-wrap">
                                <div className="song-item-name">
                                    <span className={`${song.streamingStatus === 2 && "is-vip"}`}>{song.title}</span>
                                    {song.streamingStatus === 2 && <span className="vip">VIP</span>}
                                </div>

                                <div className={`song-item-singer ${song.streamingStatus === 2 && "is-vip"}`}><span>{song.creator || (song.artists ? renderArtist(song.artists) : song.artistsNames)}</span></div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="song-item-center">
                    <div className="item-time">{timeSong(song.duration)}</div>
                </div>
                <div className="song-item-right">
                    <div className="item-right-icon">
                        {song.mvlink && <Link to={handleMvLink(song.mvlink)} ><span className="icon-mv except" title="Xem MV" onClick={() => handleActiveVideo(song.mvlink)}>mv</span></Link>}
                        <i className="flaticon-microphone" title="Phát cùng lời bài hát"></i>
                        {/* <i className={`fas fa-heart except`} title="Xóa khỏi thư viện" onClick={() => handleAddToLibrary(song, "DELETE", index)}></i> */}
                        {/* <i className={`far fa-heart except`} title="Thêm vào thư viện" onClick={() => handleAddToLibrary(song, "ADD", index)}></i> */}
                        {handleLiked(song, index)}

                        <i className="fas fa-ellipsis-h except" title="Khác" onClick={() => handleShowMenu(index)}></i>
                    </div>
                </div>
            </div>
        )
    }

    const handlePlayAndPause = () => {
        const mainPlaylist = document.querySelector(".main-playlist");
        if (mainPlaylist && mainPlaylist.dataset.id !== currentPlaylist.encodeId) {
            let i = 0;
            while (playlist[i].streamingStatus === 2) {
                i++;
            }
            playSong(playlist[i], i, null);
            return;
        }

        if (isPlay === "play") dispatch({ type: "pause" });
        else dispatch({ type: "play" });
    }

    const playSong = (song, index, e) => {
        if (e && (e.target.className === "fas fa-ellipsis-h"
            || e.target.closest(".info-song")
            || e.target.className.includes("except")
            || e.target.closest(".song-item-singer"))
        ) return;

        if (song.streamingStatus === 2) {
            document.querySelector(".toast-vip").classList.remove("hide")
            return;
        }
        if (e && e.target.className === "flaticon-microphone") {
            const lyricsE = document.querySelector(".play-lyrics");
            if (lyricsE) lyricsE.classList.add("active");
        }

        if (recommend) {
            const fetchRecommend = async () => {
                try {
                    const { data } = await axiosClient.post(`/api/recommend/${song.encodeId}`);
                    // console.log(data.data);
                    dispatch(addPlaylist([[song, ...data.data.items], infoAlbum.encodeId]));
                    dispatch(addSong(song, 0));
                    dispatch({ type: "play" });

                } catch (error) {
                    console.log(error.message)
                }
            }

            fetchRecommend();
        }
        else {
            if (currentSong && currentSong.song.song.encodeId === song.encodeId) {
                const songPlay = e.target.closest(".song-item");
                if (isPlay === "play") {
                    songPlay.classList.remove("play");
                    dispatch({ type: "pause" });
                }
                else if (isPlay === "pause") {
                    songPlay.classList.add("play");
                    dispatch({ type: "play" });
                }
                return;
            }
            dispatch(addPlaylist([playlist, infoAlbum?.encodeId]));
            dispatch(addSong(song, index));
            dispatch({ type: "play" });
            handleRotateThumbnail(true);
            if (!infoAlbum) return;
            const recently = JSON.parse(localStorage.getItem("recently")) || [];
            const isExist = recently.find(item => item.encodeId === infoAlbum.encodeId);
            if (!isExist) {
                recently.unshift(infoAlbum);
            }
            localStorage.setItem("recently", JSON.stringify(recently));
        }

        // setTimeout(() => {
        //     s.classList.add("active");
        //     s.scrollIntoView({
        //         behavior: 'smooth',
        //         block: "center"
        //     });
        // }, 300);
        const content = document.getElementById("content-1");
        const cd = document.querySelector(`.cd-animate.cd-${index}`);
        animationFly(content, cd);
    }

    const timeSong = (duration) => {
        if (duration) {
            let minute = `0${Math.floor(Number.parseInt(duration) / 60)}`.slice(-2);
            let second = `0${Number.parseInt(duration) % 60}`.slice(-2);
            return `${minute}:${second}`;
        }
        else {
            let minute = Math.ceil(Math.random() * 5);
            while (minute < 3) {
                minute = Math.ceil(Math.random() * 5);
            }
            let second = Math.ceil(Math.random() * 59);
            let secondString = `0${second}`.slice(-2);
            return `0${minute}:${secondString}`;
        }
    }

    const handleSortActive = () => {
        const sortOptionElement = document.querySelector('.sort-options');
        if (sortOptionElement) {
            sortOptionElement.classList.toggle('active');
        }
        const arrowUpElement = document.querySelector('.fas.fa-chevron-up');
        const arrowDownElement = document.querySelector('.fas.fa-chevron-down');
        arrowUpElement.classList.toggle('active');
        arrowDownElement.classList.toggle('active');
    }

    const handleSortPlaylist = (num) => {
        handleSortActive()
        const newSongs = playlist;
        if (num === 1) {
            if (sortMode !== 'Tên bài hát (A - Z)') {
                newSongs.sort((a, b) => {
                    if (a.title.toLowerCase() > b.title.toLowerCase()) return 1;
                    if (a.title.toLowerCase() < b.title.toLowerCase()) return -1;
                    return 0;
                })
                setSortMode('Tên bài hát (A - Z)');
                setPlaylist(newSongs);
            }
        }
        if (num === 2) {
            if (sortMode !== 'Tên ca sỹ (A - Z)') {
                newSongs.sort((a, b) => {
                    if (a.artistsNames.toLowerCase() > b.artistsNames.toLowerCase()) return 1;
                    if (a.artistsNames.toLowerCase() < b.artistsNames.toLowerCase()) return -1;
                    return 0;
                })
                setSortMode('Tên ca sỹ (A - Z)');
                setPlaylist(newSongs);
            }
        }
        if (num === 0) {
            if (sortMode !== 'Mặc định') {
                setSortMode('Mặc định');
                if (playlistDefault.current.playlist.length > 0) {
                    setPlaylist(playlistDefault.current.playlist);
                }
            }
        }

    }

    const showSectionBottom = (list) => {
        return list.map((item, index) => <Carousel key={index} title={item.title} list={item.items}
            type={item.sectionType === "artist" ? "artist" : ""} index={index}
        />)
    }

    const showTotalDuration = (duration) => {
        if (duration >= 3600) {
            const hour = Math.floor(duration / 3600);
            const minute = Math.floor((duration - hour * 3600) / 60);
            return ` ${hour} giờ ${minute} phút`;
        }
        else return ` ${Math.floor(duration / 60)} phút`;
    }

    const handleHideToast = (e) => {
        const toast = document.querySelector(".toast-vip");
        if (e.target.closest(".toast-hide") || e.target.className === "toast-vip") {
            toast.classList.add("hide");
        }
    }
    const movedX = useRef(0);

    const handleChangeInfoInMobile = (status) => {
        const info = document.querySelector(".cover-wrap-level-2");
        const dots = document.querySelectorAll(".dot-wrap .dot");
        if (!info) return;
        if (status) {
            info.style.transform = `translateX(-${info.clientWidth / 2}px)`;
            dots[0].classList.remove("active");
            dots[1].classList.add("active");
            movedX.current = Math.floor(previewAlbum.current.clientWidth / 2);

        }
        else {
            info.style.transform = `translateX(-0px)`;
            dots[0].classList.add("active");
            dots[1].classList.remove("active");
            movedX.current = 0;
        }

    }
    const handleStatistics = (number) => {
        if (number > 1000000) {
            return `${Math.floor(number / 1000000)}M`;
        }
        else if (number > 1000) return `${Math.floor(number / 1000)}K`;
        else return number;
    }

    const previewAlbum = useRef();
    const startPoint = useRef(0);
    const prevPoint = useRef(0);
    const directSwipe = useRef("right");
    const prevDirect = useRef("right");
    const space = useRef(0);

    const handleTouchStart = (e) => {
        startPoint.current = e.touches[0].pageX;
        prevPoint.current = e.touches[0].pageX;
    }
    const handleTouchMove = (e) => {
        if (!previewAlbum.current) return;
        if (windowWidth > 470) return;
        space.current = e.touches[0].pageX - startPoint.current;
        space.current >= prevPoint.current ? directSwipe.current = "right" : directSwipe.current = "left";

        if (directSwipe.current !== prevDirect.current) {
            startPoint.current = e.touches[0].pageX;
            space.current = e.touches[0].pageX - startPoint.current;
        }

        prevDirect.current = directSwipe.current;
        prevPoint.current = space.current;
        if (Math.abs(space.current) <= previewAlbum.current.clientWidth / 2) {
            if (directSwipe.current === "right") {
                if (movedX.current === 0) return;
                movedX.current = Math.floor(Math.abs(previewAlbum.current.clientWidth / 2 - Math.abs(space.current)));
                previewAlbum.current.style.transform = `translateX(-${movedX.current}px)`;
            }
            else {
                if (movedX.current === Math.floor(previewAlbum.current.clientWidth / 2)) return;
                movedX.current = Math.floor(Math.abs(space.current));
                previewAlbum.current.style.transform = `translateX(-${movedX.current}px)`;
            }

        }
    }

    const handleTouchEnd = () => {
        if (directSwipe.current === "left") {
            if (movedX.current > previewAlbum.current.clientWidth * 0.4 / 2) {
                handleChangeInfoInMobile(true);
            }
            else if (movedX.current > 0) {
                handleChangeInfoInMobile(false);
            }
        }
        else {
            if (previewAlbum.current.clientWidth / 2 - movedX.current > previewAlbum.current.clientWidth * 0.4 / 2) {
                handleChangeInfoInMobile(false);
            }
            else if (movedX.current > 0) {
                movedX.current = Math.floor(previewAlbum.current.clientWidth / 2);
                handleChangeInfoInMobile(true);
            }
        }

        directSwipe.current = "right";
        prevDirect.current = "right"
    }

    return (
        <div className="main-playlist" data-id={infoAlbum?.encodeId ? infoAlbum.encodeId : "-1"}>

            <div className="playlist wrap-level-1">
                <div className="playlist-wrap-level-2">
                    {!list && <div className="cover-side-bar">
                        <div className="cover-wrap-level-1">
                            {isLoaded && <div className="cover-wrap-level-2" ref={previewAlbum}
                                onTouchStart={handleTouchStart}
                                onTouchMove={handleTouchMove}
                                onTouchEnd={handleTouchEnd}
                            >
                                <div className="cover-img" onClick={handlePlayAndPause}>
                                    <div className="cover-img-wrap">
                                        <div className="cover-img-overlay">
                                            <i className="fas fa-play"></i>
                                        </div>
                                        <div className="action-play thumbnail">
                                            <div></div> <div></div> <div></div> <div></div>
                                        </div>
                                        <img src={infoAlbum?.thumbnail || ""} alt="" />
                                    </div>
                                </div>

                                <div className="cover-pre">
                                    <div className="cover-text">
                                        <div className="cover-title">
                                            <span>{infoAlbum?.title}</span>
                                        </div>
                                        <div className="cover-people-liked">
                                            <span className="text">Nghệ sĩ: <span>{` ${infoAlbum?.artistsNames}`}</span></span>
                                        </div>
                                        <div className="cover-update">
                                            <span className="text">Cập nhật: <span>{` ${infoAlbum?.release}`}</span></span>
                                        </div>
                                        <div className="cover-people-liked hide-in-mobile">
                                            <span>{`${infoAlbum?.liked} người yêu thích`}</span>
                                        </div>

                                        <div className="cover-sort">
                                            <span className="">{infoAlbum?.sortDescription}</span>
                                        </div>
                                    </div>

                                    <div className="cover-action">
                                        <div className="cover-play">
                                            <div className="cover-play--play">
                                                <i className="fas fa-play"></i>
                                                <span>PHÁT NGẪU NHIÊN</span>
                                            </div>
                                            <div className="cover-play--pause">
                                                <i className="fas fa-pause"></i>
                                                <span>TẠM DỪNG</span>
                                            </div>

                                            <button className="cover-play-btn"></button>
                                        </div>
                                        <div className="cover-like-btn">
                                            <i className="far fa-heart"></i>
                                            <i className="fas fa-ellipsis-h"></i>
                                        </div>
                                    </div>

                                    <div className="cover-like-listen mobile-flex">
                                        <div>
                                            <i className="fas fa-heart"></i>
                                            <span>{infoAlbum?.liked && handleStatistics(infoAlbum.liked)}</span>
                                        </div>
                                        <div>
                                            <i className="fas fa-headphones-alt"></i>
                                            <span>{infoAlbum?.listen && handleStatistics(infoAlbum.listen)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>}

                            <div className="btn-playlist mobile btn-right" onClick={() => handleChangeInfoInMobile(true)}>
                                <i className="fas fa-chevron-right"></i>
                            </div>
                            <div className="btn-playlist mobile btn-left" onClick={() => handleChangeInfoInMobile(false)}>
                                <i className="fas fa-chevron-left"></i>
                            </div>
                            <div className="dot-wrap mobile-flex">
                                <div className="dot dot-right active"></div>
                                <div className="dot dot-left"></div>
                            </div>

                            <div className="play-btn-mobile cover-play-btn mobile-flex">
                                <i className="fas fa-play"></i>
                                <span>PHÁT NGẪU NHIÊN</span>
                            </div>

                        </div>
                    </div>}

                    <div className="playlist-content">
                        <div className="playlist-content-wrap-level-1">

                            {isLoaded && <div className="playlist-content-wrap-level-2">
                                {!list && <div className="playlist-content-title">
                                    <span className="playlist-description"> <span>Lời tựa </span>{`${infoAlbum?.description || "Những ca khúc tuyệt vời ông mặt trời balalaalalala"} `}</span>
                                </div>}

                                <div className="playlist-content-songs">
                                    <div className="list-songs">

                                        {!list && <div className="list-songs-heading">
                                            <div className="list-name-song">
                                                <span>Bài hát</span>
                                            </div>
                                            <div className="list-time-song">
                                                <span>Thời gian</span>
                                            </div>
                                            <div className="list-sort-song">
                                                <div className="sort-default" onClick={handleSortActive}>
                                                    <span>{sortMode}</span>
                                                    <i className="fas fa-chevron-up"></i>
                                                    <i className="fas fa-chevron-down active"></i>
                                                </div>
                                            </div>
                                        </div>}

                                        {!list && <div className="sort-options">
                                            <div className="default-option" onClick={() => handleSortPlaylist(0)}>
                                                <span>Mặc định</span>
                                            </div>
                                            <div className="song-name-option" onClick={() => handleSortPlaylist(1)}>
                                                <span>Tên bài hát (A - Z)</span>
                                            </div>
                                            <div className="singer-name-option" onClick={() => handleSortPlaylist(2)}>
                                                <span>Tên ca sỹ (A - Z)</span>
                                            </div>
                                        </div>}

                                        <div className="list-songs-content">
                                            <div className="songs-wrap-level-1">
                                                {renderSongs(playlist)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>}

                        </div>
                    </div>
                    {!isLoaded && <Skeleton type="songs" />}
                    {/* {!isLoaded && <Skeleton type="thumbnail" />} */}

                </div>

                {isLoaded && infoAlbum?.total && <div className="total-song">
                    <span>{`${infoAlbum?.total} bài hát  `}* {showTotalDuration(infoAlbum?.totalDuration)}</span>
                </div>}

                {/* Section-bottom */}
                {sectionBottom.length > 0 && showSectionBottom(sectionBottom)}

            </div>

            <div className="toast-vip hide" onClick={handleHideToast}>
                <div className="toast-wrap">
                    <div className="toast-hide"><i className="fas fa-times" onClick={handleHideToast}></i></div>
                    <div className="toast-title">DÀNH CHO TÀI KHOẢN VIP</div>
                    <div className="toast-text">Theo yêu cầu của đơn vị sở hữu bản quyền, bạn cần tài khoản VIP để nghe bài hát này.</div>
                    <button className="toast-btn">Truy cập <a target="_blank" href="https://zingmp3.vn">ZingMp3</a> để đăng ký tài khoản!</button>
                </div>
            </div>
        </div>
    );
}

export default memo(Playlist);