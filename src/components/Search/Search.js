/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router';
import { Link } from 'react-router-dom';
import axiosService from '../../api/axiosClient';
import useDimensionWindow from '../../hooks/useDimensionWindow';
import no_user from '../../static/img/no-user.png';
import "./Search.css";
import useClickOutSide2 from '../../hooks/useClickOutside2';
import { addPlaylist, addSong } from '../../actions/actions';

function Search() {

    const history = useHistory();
    const dispatch = useDispatch();
    const user = useSelector(state => state.user) || JSON.parse(localStorage.getItem("user"));

    const { width: windowWidth } = useDimensionWindow();

    const name = useSelector(state => state.pageName);
    // const currentPlaylist = useSelector(state => state.Playlist);
    const isPlay = useSelector(state => state.isPlay);
    const currentSong = useSelector(state => state.PlaySong);

    const [pageName, setPageName] = useState("Home");
    const [keyword, setKeyword] = useState("");
    const [suggest, setSuggest] = useState([]);

    const inputRef = useRef();
    useClickOutSide2(inputRef)

    useEffect(() => {
        setPageName(name);
    }, [name])

    useEffect(() => {
        if (windowWidth > 470) {
            const sidebar = document.querySelector(".side-bar");
            if (sidebar) sidebar.style.transform = "translateX(-100%)";
        }
    }, [windowWidth])

    const handleActiveSidebar = () => {
        const sidebar = document.querySelector(".side-bar");
        if (sidebar) sidebar.style.transform = "translateX(0)";
    }

    const fetchSearch = async (q, url) => {
        try {
            const { data } = await axiosService.post(url, { q });
            // console.log(data.data);
            if (data.data.items) {
                setSuggest(data.data.items);
            }
            else {
                setSuggest([])
            }
            return true;
        } catch (error) {
            console.log(error.message)
        }
    }
    const handleActiveInput = (e) => {
        if (e.target.closest(".fas.fa-times") || e.target.closest(".suggest-item")) return;
        const inputG = document.querySelector(".input-search");
        if (e.target.closest(".fas.fa-arrow-left")) {
            inputG.classList.remove("active");
            return;
        }
        inputG.classList.add("active");
        if (e.target.closest(".input-search input")) {
            if (e.target.value !== "") fetchSearch(e.target.value, '/api/suggest')
        }
    }

    const handleChangeInput = (e) => {
        setKeyword(e.target.value);
        if (e.target.value === "") setSuggest([]);
    }
    const point = useRef(-1);

    const handleKeyPress = (e) => {
        // console.log(e.which || e.keyCode);
        const isEnter = e.which || e.keyCode;
        if (isEnter === 13 && keyword !== "") {
            handleChangePageOrPlay(e, true);
            history.push(`/tim-kiem/tat-ca?q=${keyword}`)
        }
        else if (isEnter === 40 || isEnter === 38) {
            const items = document.querySelectorAll(".suggest-item");
            isEnter === 40 ? point.current++ : point.current--;
            if (point.current < 0) point.current = items.length - 1;
            else if (point.current >= items.length) point.current = 0;
            items.forEach((item, index) => {
                index === point.current ? item.classList.add("active") : item.classList.remove("active");
                if (index === point.current) {
                    const text = item.querySelector(".suggest-text")?.textContent;
                    if (text) setKeyword(text)
                }
            })
        }

    }

    const handleFetchData = (e) => {
        // console.log(e.target.value);
        const key = e.keyCode || e.which;
        if (key === 40 || key === 38) return;
        if (e.target.value !== "") fetchSearch(e.target.value, '/api/suggest');
    }

    const handleChangePageOrPlay = (item, status) => {
        const inputG = document.querySelector(".input-search");
        if (item.type !== 1) {
            inputG.classList.remove("active");
        }
        if (status) return;
        if (item.type === 0) {
            setKeyword(item.keyword);
            history.push(`/tim-kiem/tat-ca?q=${item.keyword}`)
        }
        else if (item.type === 1) {
            const fetchRecommend = async () => {
                try {
                    item.encodeId = item.id;
                    item.thumbnail = item.thumb;
                    item.thumbnailM = item.thumb;
                    item.artistsNames = item.artists.map(ele => ele.name).join(" ,").slice(0, -2);
                    const { data } = await axiosService.post(`/api/recommend/${item.encodeId}`);
                    // console.log(data.data);
                    dispatch(addPlaylist([[item, ...data.data.items], item.encodeId]));
                    dispatch(addSong(item, 0));
                    dispatch({ type: "play" });
                } catch (error) {
                    console.log(error.message)
                }
            }
            if (currentSong?.song.song.encodeId === item.id) {
                if (isPlay === "play") dispatch({ type: "pause" });
                else dispatch({ type: "play" });
                return;
            }
            else fetchRecommend();

        }
        // setKeyword("");
    }

    const renderSuggestText = (list) => {
        return list.map((item, index) => {
            return <div className="suggest-item" key={index} onClick={() => handleChangePageOrPlay(item)}>
                <Link to="#">
                    <i className="fas fa-search"></i>
                    <div className="suggest-text">{item.keyword}</div>
                </Link>
            </div>
        })
    }
    const showSinger = (item) => {
        if (item.type === 4) {
            return `Nghệ sĩ • ${item.followers >= 1000 ? Math.floor(item.followers / 1000) + "K" : item.followers}`;
        }
        else if (item.type === 1) {
            const artists = item.artists.map(ele => ele.name).join(", ").slice(0, -2);
            return artists;
        }
    }
    const renderSuggestLink = (list) => {
        const result = [];
        list.forEach((item, index) => {
            if (item.type === 4 || item.type === 1) result.push(
            <div className={`suggest-item ${currentSong?.song.song.encodeId === item.id ? "play" :""}`} key={index} onClick={() => handleChangePageOrPlay(item)}>
                {item.type === 4 && <Link to={`/nghe-si/${item.aliasName}`}>
                    <div className="song-item-left">
                        <div className="song-item-left-wrap">
                            <div className="song-item-img" >
                                <div className={`song-item-thumb ${item.type === 4 ? "is-artist" : ""}`}>
                                    <img src={item.thumb || item.avatar || item.thumbVideo} alt="" />
                                </div>
                            </div>

                            <div className="song-item-info">
                                <div className="song-item-info-wrap">
                                    <div className="song-item-name">
                                        <span className="suggest-text">{item.name || item.title}</span>
                                    </div>
                                    <div className={`song-item-singer`}><span>{showSinger(item)}</span></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </Link>}
                {item.type === 1 && <div className="song-item-left">
                    <div className="song-item-left-wrap">
                        <div className={`song-item-img ${currentSong?.song.song.encodeId === item.id ? "playing" :""}`} >
                            <div className="song-item-img-overlay">
                                {((currentSong?.song.song.encodeId !== item.id) || isPlay === "pause") && <i className="fas fa-play"></i>}
                                {isPlay === "play" && <div className="action-play">
                                    <div></div> <div></div> <div></div> <div></div>
                                </div>}
                            </div>
                            <div className={`song-item-thumb ${item.type === 4 ? "is-artist" : ""}`}>
                                {/* <i className="fas fa-play"></i> */}
                                <img src={item.thumb || item.avatar || item.thumbVideo} alt="" />
                            </div>
                        </div>

                        <div className="song-item-info">
                            <div className="song-item-info-wrap">
                                <div className="song-item-name">
                                    <span className="suggest-text">{item.name || item.title}</span>
                                </div>
                                <div className={`song-item-singer`}><span>{showSinger(item)}</span></div>
                            </div>
                        </div>
                    </div>
                </div>}
            </div>)
        })
        return result;
    }

    const handleDeleteKeyword = () => {
        const inputE = document.querySelector(".input-search input");
        if (inputE) inputE.focus();
        setKeyword("");
        setSuggest([])
    }

    const handleDeleteHistory = () => {
        localStorage.removeItem("history_search");
        const inputE = document.querySelector(".input-search input");
        if (inputE) inputE.focus();
        setKeyword("");
        setSuggest([])
    }

    const handleLogin = (e) => {
        if (user && user.username) {
            history.push("/my-music");
            return;
        }
        else {
            const form = document.getElementById("form");
            if (form) form.style.display = "block";
        }
    }

    const handleShowTheme = () => {
        const theme = document.querySelector(".theme");
        if (theme) {
            theme.classList.add("active");
        }
    }

    return (
        <div className="row no-gutters search">
            <div className="l-12 m-12 c-12 search-box">
                <div className="search-header"></div>
                <div className="search-group">
                    <i className="fas fa-bars" onClick={handleActiveSidebar}></i>
                    <i className="fas fa-arrow-left" onClick={() => history.goBack()}></i>
                    <i className="fas fa-arrow-right" onClick={() => history.goForward()}></i>
                    <div className="input-search" ref={inputRef} onClick={handleActiveInput}>
                        <i className="fas fa-search"></i>
                        <i className="fas fa-arrow-left"></i>

                        <input type="text" name="q" autoComplete="off" placeholder="Nhập gì đó vào đây" value={keyword}
                            onChange={handleChangeInput}
                            onKeyPress={handleKeyPress}
                            onKeyUp={handleFetchData}
                            onKeyDown={handleKeyPress}
                        />

                        <i className="fas fa-times" onClick={handleDeleteKeyword}></i>

                        <div className="result-search">
                            <div className="result-suggest-text">
                                {suggest && suggest.length > 0 && suggest[0].keywords && renderSuggestText(suggest[0].keywords)}
                                {keyword === "" &&
                                    <div className="history-search">
                                        <div className="history-search-title">
                                            <span>Lịch sử tìm kiếm </span>
                                            <span className="delete-history" onClick={handleDeleteHistory}>Xóa</span>
                                        </div>
                                        {renderSuggestText(JSON.parse(localStorage.getItem("history_search")) || [])}
                                    </div>
                                }
                            </div>
                            <div className="result-suggest-link">
                                {suggest && suggest.length > 1 && suggest[1].suggestions && renderSuggestLink(suggest[1].suggestions)}
                            </div>
                        </div>

                    </div>
                </div>

                <div className="setting-group">
                    <div className="icon-setting" onClick={handleShowTheme}>
                        <i className="fas fa-tshirt"></i>
                    </div>
                    <div className="icon-setting">
                        <i className="fas fa-cogs"></i>
                    </div>

                    <div className="avatar-user" onClick={handleLogin}>
                        <img src={user.avatar ? `data:${user.avatar.contentType};base64,${Buffer.from(user.avatar.data).toString('base64')}` : no_user} alt="" />
                    </div>

                </div>
            </div>
            <div className="bg-search">
                <i className="fas fa-bars" onClick={handleActiveSidebar}></i>
                <span>{pageName}</span>
            </div>
        </div>
    )
}

export default Search
