
import React, { memo, useEffect, useRef, useState } from 'react';
import './Play.css';
import { useDispatch, useSelector } from 'react-redux';
import { Fragment } from 'react';
import axiosService from '../api/axiosClient';
import { addSong } from '../actions/actions';
import Lyric from './Lyric/Lyric';
import LazyLoad from './LazyLoadImage';
// import { Prompt } from 'react-router-dom';

const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const lr = ['songs', 'lyrics', 'karaoke'];

function Play({ audioRef }) {

    const dispatch = useDispatch();

    const isFirstLoad = useRef(true);

    const repeatAll = useRef(JSON.parse(localStorage.getItem('REPEAT_ALL')) ?? false);
    const repeat1 = useRef(JSON.parse(localStorage.getItem('REPEAT_1')) ?? false);
    const repeatDefault = useRef(JSON.parse(localStorage.getItem('REPEAT_DEFAULT')) ?? true);
    const isRandom = useRef(JSON.parse(localStorage.getItem('IS_RANDOM')) ?? false);

    const [volume, setVolume] = useState(localStorage.getItem('volume') || 1);
    const [isRotate, setIsRotate] = useState(false);
    const [currentPercent, setCurrentPercent] = useState(0);
    const [lyricsMode, setLyricsMode] = useState('songs');


    // eslint-disable-next-line no-unused-vars
    const [currentPlaylist, setCurrentPlaylist] = useState(JSON.parse(localStorage.getItem('CURRENT_PLAYLIST')));
    const [currentSong, setCurrentSong] = useState(JSON.parse(localStorage.getItem('CURRENT_SONG')) || "");

    const newSong = useSelector(state => state.PlaySong);

    const newPlaylist = useSelector(state => state.Playlist);

    const isPlay = useSelector(state => state.isPlay);

    window.onbeforeunload = (event) => {
        const e = event || window.event;
        // Cancel the event
        if (isRotate) {
            e.preventDefault();
            if (e) {
                e.returnValue = ''; // Legacy method for cross browser support
            }
            return ''; // Legacy method for cross browser support
        }
    };
    const user = useSelector(state => state.user);

    // Add played songs
    const waitingSongs = useRef([]);
    const defaultPlaylist = useRef([]);
    useEffect(() => {
        if (!newPlaylist) return;
        defaultPlaylist.current = [];
        newPlaylist.playlist.forEach((item, index) => {
            return defaultPlaylist.current.push({
                encodeId: item.encodeId,
                index: index
            })
        });
        waitingSongs.current = [...defaultPlaylist.current];
        // console.log(waitingSongs.current)

    }, [newPlaylist])
    // Handle liked songs
    const isLiked = useRef(false);
    useEffect(() => {
        if (!user || !user.liked || !newSong) return;
        const str = user.liked.reduce((str, item) => {
            return str + item.encodeId + "-";
        }, "");
        isLiked.current = str.includes(`${newSong.encodeId}`);
    }, [user, newSong])

    // Play and Pause
    useEffect(() => {
        if (isPlay === "pause") playAndPauseSong(false);
        else playAndPauseSong(true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isPlay])

    //Is Playing ????
    useEffect(() => {
        if (!currentSong) document.getElementById("play-group").classList.remove("playing");
        else document.getElementById("play-group").classList.add("playing");
    }, [currentSong])

    // Fetch /api/song/:id
    useEffect(() => {
        if (isFirstLoad.current) {
            isFirstLoad.current = false;
            return;
        }
        // console.log("ok")
        if (!audioRef) return;
        audioRef.pause();
        audioRef.src = null;
        const time_left = $$('.time-left');
        if (time_left) time_left.textContent = "00:00";
        if (Object.keys(newSong).length !== 0) {
            const audioPlay = async () => {
                setCurrentSong(newSong);
                // console.log('newSong: ', newSong);
                // console.log('current-song: ', currentSong);

                localStorage.setItem('CURRENT_SONG', JSON.stringify(newSong));
                const fetchAudio = async () => {
                    try {
                        const url = `/api/song/${newSong.song.song.encodeId}`;
                        const { data } = await axiosService.post(url);
                        if (data.data["320"] !== "VIP") {
                            audioRef.src = data.data["320"];
                        }
                        else audioRef.src = data.data["128"];

                        return audioRef.play();

                    } catch (error) {
                        // console.log(error.message);
                    }
                }
                fetchAudio();
                // playAndPauseSong(true);
                // await audioRef.play();
                setIsRotate(true);
            }
            audioPlay();
        }
        if (Object.keys(newPlaylist).length !== 0) {
            setCurrentPlaylist(newPlaylist);
            localStorage.setItem('CURRENT_PLAYLIST', JSON.stringify(newPlaylist));
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [newSong]);

    //Handle audio update time
    useEffect(() => {
        const time_left = $$('.time-left');

        function calculateTime(timeText) {
            const first = `0${Math.floor(timeText / 60)}`;
            const last = `0${timeText - first * 60}`.slice(-2);
            const fullTime = `${first}:${last}`;
            if (time_left[0]) {
                time_left[0].innerHTML = fullTime;
                if (time_left[1]) time_left[1].innerHTML = fullTime;
            }
        }

        if (!audioRef) return;
        audioRef.ontimeupdate = () => {
            if (audioRef.duration) {
                const progressPercent = Math.floor(audioRef.currentTime * 100 / audioRef.duration);
                setCurrentPercent(progressPercent);
                const timeText = Math.floor(audioRef.currentTime);
                calculateTime(timeText);
                if (audioRef.currentTime === audioRef.duration) {
                    const indexOf = waitingSongs.current.findIndex(item => item.encodeId === newSong.song.song.encodeId);
                    waitingSongs.current.splice(indexOf, 1);
                    if (waitingSongs.current.length <= 0) waitingSongs.current = [...defaultPlaylist.current];
                    playNextAndPrev(1);
                }
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [newSong])

    const handleProgressChange = async (e) => {
        if (audioRef.duration) {
            const seekTime = audioRef.duration * e.target.value / 100;
            audioRef.currentTime = seekTime;

            await audioRef.play();
            const playElement = $$('.fa-play-circle');
            const pauseElement = $$('.fa-pause-circle');
            playElement[0]?.classList.remove('active');
            playElement[1]?.classList.remove('active');
            pauseElement[0]?.classList.add('active');
            pauseElement[1]?.classList.add('active');
        }
    }

    const playAndPauseSong = (isPlay) => {
        const playElement = $$('.fa-play-circle');
        const pauseElement = $$('.fa-pause-circle');
        // if (playElement.length <= 0 || pauseElement.length <= 0) return;
        if (isPlay) {
            playElement[0]?.classList.remove('active');
            playElement[1]?.classList.remove('active');
            pauseElement[0]?.classList.add('active');
            pauseElement[1]?.classList.add('active');
            setIsRotate(true);

            dispatch({ type: "play" });

            const playPromise = audioRef.play();
            if (playPromise !== undefined) {
                playPromise.then(_ => {
                    // Automatic playback started!
                    // Show playing UI.
                })
                    .catch(error => {
                        // Auto-play was prevented
                        // Show paused UI.
                        const fetchAudio = async () => {
                            try {
                                const currentAudio = JSON.parse(localStorage.getItem('CURRENT_SONG')).song.song.encodeId;
                                const url = `/api/song/${currentAudio}`;
                                const { data } = await axiosService.post(url);
                                audioRef.src = data.data["128"];

                                return audioRef.play();

                            } catch (error) {
                                console.log(error.message);
                            }
                        }

                        fetchAudio();
                    });
            }
            else {
                audioRef.play();
            }
        }
        else {
            pauseElement[0]?.classList.remove('active');
            pauseElement[1]?.classList.remove('active');
            playElement[0]?.classList.add('active');
            playElement[1]?.classList.add('active');
            audioRef.pause();
            setIsRotate(false);
            dispatch({ type: "pause" });
        }
    }

    const playNextAndPrev = (temp) => {
        // console.log("before", newSong);
        let index = newSong.song.index + temp;
        // console.log("normal", index);

        //Random
        if (isRandom.current) {
            // console.log(waitingSongs.current)
            const idx = Math.floor(Math.random() * (waitingSongs.current.length - 1));
            index = waitingSongs.current[idx].index
        }
        // Repeat
        else if (repeat1.current) {
            index = newSong.song.index;
        }
        // Repeat All

        if (index < 0) {
            if (repeatAll.current) index = newPlaylist.playlist.length - 1;
            else index = 0;
        }
        else if (index > newPlaylist.playlist.length - 1) {
            index = 0;
            if (repeatAll.current) index = 0;
            else index = newPlaylist.playlist.length - 1;
        }

        while (newPlaylist.playlist[index].streamingStatus === 2) {
            if (temp === -1) {
                index--;
                if (index === 0) index = newPlaylist.playlist.length - 1;
            }
            else index++;
            if (index > newPlaylist.playlist.length) {
                index = 0;
            }
        }
        // console.log('index: ', index);
        const nextSong = {
            song: {
                song: newPlaylist.playlist[index],
                index: index
            }
        }
        // console.log("after", index);
        // return;
        // localStorage.setItem('CURRENT_SONG', JSON.stringify(nextSong));
        dispatch(addSong(newPlaylist.playlist[index], index));
        setCurrentSong(nextSong);
        const playElement = $('.fa-play-circle');
        const pauseElement = $('.fa-pause-circle');
        playElement.classList.remove('active');
        pauseElement.classList.add('active');
        setIsRotate(true);

        const playPromise = audioRef.play();
        if (playPromise !== undefined) {
            playPromise.then(_ => {
                // Automatic playback started!
                // Show playing UI.
            })
                .catch(err => {
                    const fetchAudio = async () => {

                        try {
                            const currentAudio = newPlaylist.playlist[index].encodeId;
                            const url = `/api/song/${currentAudio}`;
                            const { data } = await axiosService.post(url);
                            audioRef.src = data.data["128"];

                            return audioRef.play();

                        } catch (error) {
                            // console.log(error.message);
                        }
                    }

                    fetchAudio();
                })
        }

    }

    const changeMode = (num) => {
        const notRandom = $$('.fa-random.default');
        const random = $$('.fa-random.random');
        if (num === 1) {
            isRandom.current = true;
            notRandom[0].classList.remove('active');
            notRandom[1].classList.remove('active');
            random[0].classList.add('active');
            random[1].classList.add('active');
        }
        else {
            isRandom.current = false;
            random[0].classList.remove('active');
            random[1].classList.remove('active');
            notRandom[0].classList.add('active');
            notRandom[1].classList.add('active');
        }
        localStorage.setItem('IS_RANDOM', JSON.stringify(isRandom.current));
    }
    const changeMode1 = (e) => {
        e.target.classList.remove('active');
        const next = $$('.flaticon-repeat-button.red');
        next[0].classList.add('active');
        next[1].classList.add('active');

        repeatAll.current = true;
        localStorage.setItem('REPEAT_ALL', JSON.stringify(repeatAll.current));

        repeat1.current = false;
        localStorage.setItem('REPEAT_1', JSON.stringify(repeat1.current));

        repeatDefault.current = false;
        localStorage.setItem('REPEAT_DEFAULT', JSON.stringify(repeatDefault.current));
    }
    const changeMode2 = (e) => {
        e.target.classList.remove('active');
        const next = $$('.flaticon-repeat');
        next[0].classList.add('active');
        next[1].classList.add('active');

        repeat1.current = true;
        localStorage.setItem('REPEAT_1', JSON.stringify(repeat1.current));

        repeatAll.current = false;
        localStorage.setItem('REPEAT_ALL', JSON.stringify(repeatAll.current));
    }
    const changeMode3 = (e) => {
        e.target.classList.remove('active');
        const next = $$('.flaticon-repeat-button.default');
        next[0].classList.add('active');
        next[1].classList.add('active');

        repeat1.current = false;
        localStorage.setItem('REPEAT_1', JSON.stringify(repeat1.current));

        repeatDefault.current = true;
        localStorage.setItem('REPEAT_DEFAULT', JSON.stringify(repeatDefault.current));
    }
    const handleVolumeMute = (e) => {
        const mute = $$('.media-volume');
        if (e.target.className.includes('mute')) {
            audioRef.volume = Number.parseFloat(localStorage.getItem('previousVolume'));
            localStorage.setItem('volume', audioRef.volume);
            setVolume(audioRef.volume);
            mute[0].classList.remove('mute');
        }
        else if (e.target.className.includes('up')) {
            mute[0].classList.add('mute');
            audioRef.volume = 0;
            localStorage.setItem('previousVolume', volume);
            setVolume(0);
            localStorage.setItem('volume', 0);
        }
    }
    const handleVolume = (e) => {
        const mute = $$('.media-volume');

        localStorage.setItem('volume', Number(e.target.value));
        if (Number(e.target.value) === 0) {
            mute[0].classList.add('mute');
        }
        else {
            mute[0].classList.remove('mute');
        }
        audioRef.volume = Number.parseFloat(e.target.value);
        setVolume(Number(e.target.value));
    }

    const setTimeRight = (duration) => {
        const minute = `0${Math.floor(duration / 60)}`.slice(-2);
        const second = `0${Math.floor(duration % 60)}`.slice(-2);
        return `${minute}:${second}`
    }

    // Lyrics ===================================================================================================
    // const [isLyrics, setIsLyrics] = useState(false);
    const handleActiveLyricsMode = (e) => {
        const lyricsE = $(".play-lyrics");

        if (e.target.id.includes("play-mode-right")
            || e.target.id.includes("play-mode-center")
            || e.target.id.includes("play-mode-left")
            || e.target.className.includes("media-more")
            || e.target.closest(".media-left")
            || e.target.closest(".media-content")
            || e.target.closest(".songs-list")
        ) {


            if (lyricsE) lyricsE.classList.add("active");

        }
        else if (e.target.closest(".scroll-down-btn")) {
            lyricsE.classList.remove("active");

        }
    }
    // eslint-disable-next-line no-unused-vars
    const [itemWidth, setItemWidth] = useState(332);

    const count = useRef(0);

    useEffect(() => {
        const items = $$(".lyrics-item");
        const wrap = $(".lyrics-list");
        if (items && wrap) {
            const idx = [...items].findIndex(item => item.className.includes("active"));
            count.current = idx;
            wrap.style.transform = `translateX(-${itemWidth * count.current + itemWidth / 2}px)`;
        }
    }, [itemWidth, lyricsMode, currentSong])

    const handleChangeSlide = (status) => {
        const wrap = $(".lyrics-list");
        const items = $$(".lyrics-item");
        if (wrap && items[0]) {
            if (status) {
                count.current++;
            }
            else {
                count.current--;
            }
            if (count.current >= items.length) count.current = items.length - 1;
            if (count.current <= 0) count.current = 0;
            wrap.style.transform = `translateX(-${items[0].clientWidth * count.current + 100}px)`;
            items.forEach((item, index) => {
                if (index === count.current) item.classList.add("pointer");
                else item.classList.remove("pointer");
            })
        }
    }
    const handleChangeMode = (num) => {
        const items = $$(".play-lyrics .navigation-item");
        [...items].forEach((item, index) => {
            if (index === num) item.classList.add("active");
            else item.classList.remove("active");
        });
        if (num === 2) {
            const lyricThumbnail = document.querySelector(".lyric-thumbnail");
            if (lyricThumbnail) lyricThumbnail.style.display = "none";
            return;
        }
        else if (num === 1) {
            const thmb = document.querySelector(".lyric-thumbnail");
            if (thmb) thmb.style.display = "block";
            // return;
        }
        setLyricsMode(lr[num]);
        count.current = 0;
    }
    const renderLyricSongs = (list) => {
        return list.map((item, index) => <div className={`lyrics-item ${index === 0 ? "pointer" : ""} ${index === currentSong.song.index ? "active" : ""}`} key={index}>
            <div className="lyrics-item-wrap" onClick={(e) => playSong(item, index, e)}>
                <div className="lyrics-thumbnail">
                    <LazyLoad src={item.thumbnailM} threshold={50} />
                    <div className="lyrics-overlay"></div>
                    <div className="lyrics-play">
                        <i className="fas fa-play"></i>
                    </div>
                </div>
                <div className={`lyrics-info`}>
                    <div className={`song-name ${item.streamingStatus === 2 && "is-vip"}`}>{item.title} {item.streamingStatus === 2 ? <span className="vip">VIP</span> : ""}</div>
                    <div className="song-artist">{item.artistsNames}</div>
                </div>
            </div>
        </div>)
    }

    const playSong = (song, index, e) => {
        if (song.streamingStatus === 2) {
            const toastVip = document.querySelector(".toast-vip");
            if (toastVip) toastVip.classList.remove("hide")
            return;
        }
        dispatch(addSong(song, index));
    }

    return (
        <Fragment>
            <div className="play-group playing" id="play-group" onClick={handleActiveLyricsMode} >
                {/* <Prompt when={isRotate} message="Are you sure you want to leave?" /> */}

                <div className={`player-container level ${(!currentSong || (!currentSong.song.song.avatar && !currentSong.song.song.thumbnail)) && "hide"}`}>
                    <div className="player-left" >
                        <div className="player-media level">
                            <div className="media" id="play-mode-left">
                                <div className="media-left" >
                                    <div className="media-left-avatar" style={{
                                        backgroundImage: `url(${currentSong && currentSong.song.song.thumbnail})`,
                                        animationPlayState: isRotate ? "running" : "paused"
                                    }}></div>
                                    <div className="musical-animate">
                                        <i className="flaticon-music" style={{ animationPlayState: isRotate ? "running" : "paused" }}></i>
                                        <i className="flaticon-musical-note" style={{ animationPlayState: isRotate ? "running" : "paused" }}></i>
                                        <i className="flaticon-music" style={{ animationPlayState: isRotate ? "running" : "paused" }}></i>
                                        <i className="flaticon-musical-note" style={{ animationPlayState: isRotate ? "running" : "paused" }}></i>
                                    </div>
                                </div>
                                <div className="media-content">
                                    <div className="media-song-info">
                                        <div className="media-song-name">
                                            <span>{currentSong && currentSong.song.song.title ? currentSong.song.song.title : 'Song'}</span>

                                        </div>
                                        <div className="media-song-singer">
                                            <span>{currentSong && currentSong.song.song.artistsNames}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="media-right">
                                    <div className="level media-right-wrap">
                                        <div className="media-reaction">
                                            {!isLiked.current && <span className="media-line-heart"><i className="far fa-heart"></i></span>}

                                            {isLiked.current && <span className="media-fill-heart"><i className="fas fa-heart"></i></span>}
                                        </div>
                                        <div className="wrap-dots">
                                            <div className="media-more-dots">
                                                <span><i className="fas fa-ellipsis-h"></i></span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                            </div>

                        </div>
                    </div>

                    <div className="player-control">
                        <div className="media-control" id="play-mode-center">
                            <div className="icon-control">
                                <div className="icon-random">
                                    <i className={`fas fa-random default ${isRandom.current ? '' : 'active'}`}
                                        onClick={() => changeMode(1)} >
                                    </i>
                                    <i className={`fas fa-random random ${isRandom.current ? 'active' : ''}`}
                                        onClick={() => changeMode(0)} >
                                    </i>
                                </div>
                                <div className="icon-prev" onClick={() => playNextAndPrev(-1)}>
                                    <i className="fas fa-step-backward" ></i>
                                </div>
                                <div className="icon-play-pause">
                                    <i className="far fa-play-circle active" onClick={() => playAndPauseSong(true)}></i>
                                    <i className="far fa-pause-circle" onClick={() => playAndPauseSong(false)}></i>
                                </div>
                                <div className="icon-next" onClick={() => playNextAndPrev(1)}>
                                    <i className="fas fa-step-forward" ></i>
                                </div>
                                <div className="icon-repeat">
                                    <i className={`flaticon-repeat-button default ${repeatDefault.current ? 'active' : ''}`}
                                        onClick={changeMode1}>
                                    </i>
                                    <i className={`flaticon-repeat-button red ${repeatAll.current ? 'active' : ''}`}
                                        onClick={changeMode2}>
                                    </i>
                                    <i className={`flaticon-repeat ${repeat1.current ? 'active' : ''}`}
                                        onClick={changeMode3}>
                                    </i>
                                </div>
                            </div>
                        </div>

                        <div className="media-range">
                            <span className="time-left">00:00</span>
                            <input type="range" name="play-time" min="0" max="100" id="play-music" step="1" value={currentPercent} onChange={(e) => handleProgressChange(e)} />
                            <span className="time-right">{currentSong ? setTimeRight(currentSong.song.song.duration) : "00:00"}</span>
                        </div>
                    </div>

                    <div className="player-right" id="play-mode-right">
                        <div className="media-more">
                            <div className="about-song">
                                <div className="media-mv">
                                    <i className="fas fa-photo-video"></i>
                                </div>
                                <div className="media-micro">
                                    <i className="flaticon-microphone"></i>
                                </div>
                                <div className="media-volume">
                                    <i className="fas fa-volume-up" onClick={handleVolumeMute}></i>
                                    <i className="fas fa-volume-mute" onClick={handleVolumeMute}></i>
                                    <div className="input-volume-wrap">
                                        <input type="range" name="volume" id="volume"
                                            min="0" step="0.01" max="1" value={volume}
                                            onChange={handleVolume}
                                        />
                                    </div>
                                </div>
                                <div className="media-expand">
                                    <i className="fas fa-expand-alt"></i>
                                </div>
                                <div className="separate-line">

                                </div>
                                <div className="songs-list">
                                    <i className="fas fa-stream"></i>
                                </div>
                            </div>


                        </div>
                    </div>

                </div>

            </div>
            {/* Lyrics */}

            {<div className="play-lyrics" >
                {currentSong && <div className="lyrics-img" style={{ backgroundImage: `url(${currentSong.song.song.thumbnailM})` }}></div>}
                <div className="lyrics-bg" ></div>
                <div className="lyrics-body">
                    <div className="scroll-down-btn" onClick={handleActiveLyricsMode}><i className="fas fa-chevron-circle-down"></i></div>
                    <div className="navigation">
                        <div className="navigation-wrap">
                            <div className="navigation-item active" onClick={() => handleChangeMode(0)}><span>Danh sách phát</span></div>
                            <div className="navigation-item" onClick={() => handleChangeMode(1)}><span>Lời bài hát</span></div>
                            <div className="navigation-item" onClick={() => handleChangeMode(2)}><span>Karaoke</span></div>
                        </div>
                    </div>

                    {lyricsMode === "songs" && <div className="playlist-lyrics">
                        <div className="lyrics-list">
                            {currentPlaylist && renderLyricSongs(currentPlaylist.playlist)}
                        </div>

                        <div className="zm-btn">
                            <button className="zm-btn-prev" onClick={() => handleChangeSlide(false)}>
                                <i className="fas fa-chevron-left"></i>
                            </button>
                            <button className="zm-btn-next" onClick={() => handleChangeSlide(true)}>
                                <i className="fas fa-chevron-right"></i>
                            </button>
                        </div>
                    </div>}

                    {lyricsMode === "lyrics" && <Lyric other={false} id={newSong.song.song.encodeId} thumbnail={newSong.song.song.thumbnailM} />}

                    <div className="player-control lyrics">
                        <div className="media-control">
                            <div className="icon-control">
                                <div className="icon-random">
                                    <i className={`fas fa-random default ${isRandom.current ? '' : 'active'}`}
                                        onClick={() => changeMode(1)} >
                                    </i>
                                    <i className={`fas fa-random random ${isRandom.current ? 'active' : ''}`}
                                        onClick={() => changeMode(0)} >
                                    </i>
                                </div>
                                <div className="icon-prev" onClick={() => playNextAndPrev(-1)}>
                                    <i className="fas fa-step-backward" ></i>
                                </div>
                                <div className="icon-play-pause">
                                    <i className="far fa-play-circle active" onClick={() => playAndPauseSong(true)}></i>
                                    <i className="far fa-pause-circle" onClick={() => playAndPauseSong(false)}></i>
                                </div>
                                <div className="icon-next" onClick={() => playNextAndPrev(1)}>
                                    <i className="fas fa-step-forward" ></i>
                                </div>
                                <div className="icon-repeat">
                                    <i className={`flaticon-repeat-button default ${repeatDefault.current ? 'active' : ''}`}
                                        onClick={changeMode1}>
                                    </i>
                                    <i className={`flaticon-repeat-button red ${repeatAll.current ? 'active' : ''}`}
                                        onClick={changeMode2}>
                                    </i>
                                    <i className={`flaticon-repeat ${repeat1.current ? 'active' : ''}`}
                                        onClick={changeMode3}>
                                    </i>
                                </div>
                            </div>
                        </div>

                        <div className="media-range">
                            <span className="time-left">00:00</span>
                            <input type="range" name="play-time" min="0" max="100" id="play-music" step="1" value={currentPercent} onChange={(e) => handleProgressChange(e)} />
                            <span className="time-right">{currentSong ? setTimeRight(currentSong.song.song.duration) : "00:00"}</span>
                        </div>
                    </div>

                </div>
            </div>}

        </Fragment>

    )




}

export default memo(Play);