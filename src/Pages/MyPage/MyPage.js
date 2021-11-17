import React, { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import "./MyPage.css";
import Playlist from '../PlaylistPage/Playlist';
import newList from '../../static/img/createPlaylist.jpg';
import Carousel from '../../components/Carousel/Carousel';
import useClickOutSide2 from '../../hooks/useClickOutside2';
import no_user from '../../static/img/no-user.png';
import { useHistory } from 'react-router';
import axios from 'axios';

function MyPage() {

    const user = useSelector(state => state.user) || JSON.parse(localStorage.getItem("user"));

    const history = useHistory();
    const dispatch = useDispatch();

    if (!user || !user.username) history.push("/");

    const handleCreatePlaylist = () => {
        const create = document.getElementById("create");
        const inputName = document.querySelector("#create input");
        if (create) create.style.display = "block";
        if (inputName) inputName.focus();
    }
    const createItem = <div className="zm-carousel-item my-page-create" key={-1} onClick={handleCreatePlaylist}>
        <div className="carousel-item-wrap" style={{ backgroundImage: `url(${newList})` }}>
            <i className="fas fa-plus"></i>
            <div className="zm-card">
                <div className="card-thumbnail">
                    <div className="card-img">
                        <img src={newList} alt="" />
                    </div>
                </div>

                <div className="card-info">
                    <div className="card-title">
                        <h3 className="title">Tạo playlist</h3>
                    </div>
                </div>
            </div>

        </div>
    </div>

    const [playlist, setPlaylist] = useState([]);

    useEffect(() => {
        const newList = user.playlist;
        document.title = "The Music | My Music - Nghe nhạc chất lượng cao"
        setPlaylist(newList);
    }, [user])

    const logoutRef = useRef();
    useClickOutSide2(logoutRef);
    const handleShowLoOutBtn = () => {
        const logout = document.querySelector(".log-out");
        if (logout) logout.classList.toggle("active");
    }
    const handleLogOut = () => {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        // eslint-disable-next-line no-restricted-globals
        location.href = "/";
    }

    const handleShowInterface = () => {
        const theme = document.querySelector(".theme");
        if (theme) theme.classList.add("active");
    }

    const count = useRef(1);

    // Auto Change Slide
    useEffect(() => {
        dispatch({ type: "PAGE_NAME", payload: "My music" })
        const auto = setInterval(() => {
            changeSlide();
        }, 2500);
        return () => clearInterval(auto);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const renderSlider = (list) => {
        return list.map((item, index) => {
            return <li className={`slider-item ${(index === 0 ? "first" : (index === 1 ? "second" : "third"))}`} key={index}>
                <img src={item.thumbnailM} alt="" />
            </li>
        })
    }

    const changeSlide = () => {
        const sliders = document.querySelectorAll(".slider-item");
        let first = count.current, second = count.current + 1;
        if (count.current >= sliders.length) {
            count.current = 0; first = 0; second = 1;
        }
        else if (count.current === sliders.length - 1) {
            second = 0;
        }

        [...sliders].forEach((item, index) => {
            if (index === first) {
                item.classList.add("first");
                item.classList.remove("second");
                item.classList.remove("third");
            }
            else if (index === second) {
                item.classList.remove("first");
                item.classList.add("second");
                item.classList.remove("third");
            }
            else {
                item.classList.remove("first");
                item.classList.remove("second");
                item.classList.add("third");

            }
        });

        count.current++;
    }

    const handleUpdateAvatar = async (e) => {
        const formData = new FormData();
        if (e.target.files[0].size > 100000) {
            dispatch({ type: "TOAST", payload: "Vui lòng không chọn ảnh kích cỡ lớn hơn 100K" });
            e.target.value = null;
            return;
        }
        formData.append("file", e.target.files[0], "megazord.jpg");

        axios({
            method: "POST",
            url: `${process.env.MY_WEB ? process.env.MY_WEB : "http://localhost:1368"}/api/user/update/avatar`,
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token") || "not-found"}`,
                'Content-Type': 'multipart/form-data boundary=' + Math.random().toString().substr(2),
            },
            data: formData
        }).then(res => {
            if (res.data.success) {
                dispatch({ type: "LOG_IN", payload: res.data.user })
            }
        }).catch(err => {
            console.log(err.message)
        })
    }

    return (

        <div className="my-page">

            {user && user.username && <div className="my-page-wrap">
                <div className="my-info">
                    <div className="my-avatar">
                        <img src={user.avatar ? `data:${user.avatar.contentType};base64,${Buffer.from(user.avatar.data).toString('base64')}` : no_user} alt="" />
                        <div className="update-avatar">
                            <input type="file" name="file" className="update-avatar-input" onChange={handleUpdateAvatar} />
                        </div>
                        <i className="fas fa-camera-retro camera"></i>
                    </div>
                    <div className="my-name">{user.username}</div>
                    <i className="fas fa-ellipsis-h log-out-dots" onClick={handleShowLoOutBtn}></i>
                    <div className="log-out" ref={logoutRef} >
                        <div className="log-out-wrap" onClick={handleShowInterface}>
                            <i className="fas fa-tshirt"></i>
                            <span>Giao diện</span>
                        </div>
                        <div className="log-out-wrap" onClick={handleLogOut}>
                            <i className="fas fa-sign-out-alt"></i>
                            <span>Đăng xuất</span>
                        </div>
                    </div>
                </div>
                <div className="my-music">

                    <div className="artist-section-songs">
                        <div className="zm-section-title"><h3 className="my-music-title">Bài hát</h3></div>
                        {user && user.liked.length > 0 && <div className="artist-song">
                            <div className="artist-song-slide">
                                <ul className="artist-song-slide-wrap">
                                    {renderSlider(user.liked)}
                                </ul>
                            </div>
                            <div className="artist-song-items">
                                {<Playlist list={user.liked} isMyMusic={true} />}
                            </div>
                        </div>}

                        {user && !user.liked.length > 0 && <div className="no-song">
                            <div className="no-song-wrap">
                                <i className="fas fa-music"></i>
                                <span>Bạn chưa có bài hát nào trong thư viện</span>
                            </div>
                        </div>}
                    </div>

                    <div className="my-playlist">
                        <Carousel list={playlist} index="0" title="Playlist" myPage={createItem} />
                    </div>
                </div>
            </div>}

        </div>
    )
}

export default MyPage
