import React, { useEffect, useRef } from 'react';
// import PropTypes from 'prop-types';
import './SideBar.css'
import { Link } from 'react-router-dom';
import logo from '../img/logo.png';
import useClickOutSide from '../hooks/useClickOutSide';
import { useHistory, useLocation, useRouteMatch } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import axiosService from '../api/axiosClient';

// SideBar.propTypes = {

// };

function ActiveLink({ label, to, exact, icon }) {
    let match = useRouteMatch({
        path: to,
        exact: exact
    });

    return <li className={`part1__item ${match ? "active" : ""}`}>
        <Link to={to}>
            {icon}
            {label && <span>{label}</span>}
        </Link>
    </li>
}


function SideBar(props) {

    const sideRef = useRef();
    const dispatch = useDispatch();
    const history = useHistory();
    const location = useLocation();

    const user = useSelector(state => state.user);
    // console.log(user)
    useClickOutSide(sideRef);

    useEffect(() => {
        if (!location.pathname.includes("my-music")) {
            document.querySelector(".personal.part1__item").classList.remove("active");
        }
        else document.querySelector(".personal.part1__item").classList.add("active");
    }, [location.pathname])

    const handleClick = (status) => {
        if (status) sideRef.current.style.transform = "translateX(0)";
        else sideRef.current.style.transform = "translateX(-100%)";
    }

    const handleLogin = (e) => {
        if (user && user.username) {
            e.target.closest(".part1__item").classList.add("active");
            history.push("/my-music");
        }
        else {
            const form = document.getElementById("form");
            if (form) form.style.display = "block";
        }
    }

    const handleShowCreate = () => {
        if (!user || !user.username) {
            const form = document.getElementById("form");
            if (form) form.style.display = "block";
            return;
        }
        const create = document.getElementById("create");
        const inputName = document.querySelector("#create input");
        if (create) create.style.display = "block";
        if (inputName) inputName.focus();
    }

    const handleShowPlaylistMenu = (idx) => {
        const menu = document.querySelectorAll(".sidebar-playlist-menu");
        if (!menu) return;
        [...menu].forEach((item, index) => {
            index === idx ? item.classList.toggle("active") : item.classList.remove("active");
        })
    }

    const handleDeletePlaylist = async (playlist) => {
        // eslint-disable-next-line no-restricted-globals
        const isDelete = confirm("Bạn có chắc muốn xóa playlist này?");
        if (!isDelete) {
            handleShowPlaylistMenu(-1);
            return;
        }
        const deleteIndex = user.playlist.findIndex(item => item.encodeId === playlist.encodeId);
        user.playlist.splice(deleteIndex, 1);
        try {
            // eslint-disable-next-line no-unused-vars
            const responsive = await axiosService.patch(`/api/user/update/playlist/${playlist.encodeId}`, { action: "DELETE" });
            // console.log(responsive);
            handleShowPlaylistMenu(deleteIndex);
            dispatch({
                type: "TOAST",
                payload: `Đã xóa playlist "${playlist.title}"`
            })
        } catch (error) {
            console.log(error.message)
        }
    }

    const handleAdjustPl = (playlist) => {
        const create = document.getElementById("create");
        if (!create) return;
        create.style.display = "block";
        dispatch({
            type: "RENAME",
            payload: {
                title: playlist.title,
                encodeId: playlist.encodeId
            }
        })
    }

    const showPlaylist = (list) => {
        return list.map((item, index) => {
            return <li className="part1__item" key={index}>
                <Link to={item.link}>{item.title}</Link>
                <div className="delete-playlist-menu" onClick={() => handleShowPlaylistMenu(index)}>
                    <i className="fas fa-ellipsis-h"></i>
                </div>
                <div className="sidebar-playlist-menu">
                    <div className="playlist-menu-item" onClick={() => handleAdjustPl(item)}>
                        <i className="fas fa-pen"></i>
                        <span>Chỉnh sửa</span>
                    </div>
                    <div className="playlist-menu-item" onClick={() => handleDeletePlaylist(item)}>
                        <i className="fas fa-trash-alt"></i>
                        <span>Xóa</span>
                    </div>
                </div>
            </li>
        })
    }

    const handleScroll = (e) => {
        if (e.target.scrollTop > 0) e.target.classList.add("on-scroll");
        else e.target.classList.remove("on-scroll");
        const menu = document.querySelectorAll(".sidebar-playlist-menu.active");
        if (!menu) return;
        [...menu].forEach(item => item.classList.remove("active"));

    }

    return (
        <div className="navbar">

            <div className="side-bar" ref={sideRef}>
                <div className="side-bar__part1 sidebar-section1">
                    <Link to="/" className="part1__title">
                        <span className="letter-1">The</span>
                        <span className="letter-2">Mu</span>
                        <span className="letter-3">sic</span>
                    </Link>

                    <ul className="part1__list">

                        <li className="part1__item personal" onClick={handleLogin}>
                            <i className="fab fa-napster"></i>
                            <span>Cá nhân</span>
                        </li>

                        <ActiveLink label={"Khám phá"} to="/" exact={true} icon={<i className="fas fa-record-vinyl"></i>} />

                        <li className="part1__item">
                            <Link to="/top100">
                                <i className="fas fa-chart-line"></i>
                                <span>#zingchart</span>
                            </Link>
                        </li>
                        <li className="part1__item">
                            <Link to="/top100">
                                <i className="fas fa-radiation-alt"></i>
                                <span>Radio</span>
                            </Link>
                        </li>
                        <li className="part1__item">
                            <Link to="/top100">
                                <i className="fas fa-eye"></i>
                                <span>Theo dõi</span>
                            </Link>
                        </li>
                    </ul>
                </div>

                <hr />

                <div className="side-bar__part1 side-bar__part2" onScroll={handleScroll}>

                    <ul className="part1__list sidebar-section2-list">

                        <ActiveLink label={"Nhạc mới"} to="/nhac-moi" exact={true} icon={<i className="fas fa-music"></i>} />
                        <ActiveLink label={"Thể loại"} to="/genres" exact={true} icon={<i className="fas fa-icons"></i>} />
                        <ActiveLink label={"Top 100"} to="/top100" exact={true} icon={<i className="far fa-star"></i>} />
                        <ActiveLink label={"MV"} to="/video" exact={true} icon={<i className="fab fa-youtube"></i>} />

                    </ul>


                    {user && user.username && <div className="part2__title">THƯ VIỆN</div>}
                    {user && user.username && <ul className="part1__list user-playlists">
                        <li className="part1__item different">
                            <i className="fas fa-file-audio"></i>
                            <span>Bài hát</span>
                        </li>
                        <li className="part1__item different">
                            <i className="fas fa-sliders-h"></i>
                            <span>Playlist</span>
                        </li>
                        <li className="part1__item different">
                            <i className="far fa-clock"></i>
                            <span>Gần đây</span>
                        </li>
                        {showPlaylist(user.playlist)}
                    </ul>}

                    {!Object.keys(user).length > 0 && <div className="login-prompt">
                        <div className="login-prompt-wrap">
                            <div> Đăng nhập để khám phá playlist dành riêng cho bạn</div>
                            <button className="active-sign-form" onClick={handleLogin}>ĐĂNG NHẬP</button>
                        </div>
                    </div>}

                </div>

                <div className="side-bar__part1 create-playlist hide-in-tablet">
                    <ul className="part1__list">
                        <li className="part1__item" onClick={handleShowCreate}>
                            <i className="fas fa-plus"></i>
                            <span>Tạo Playlist mới</span>
                        </li>
                    </ul>
                </div>
                <div className="extend-bar show-in-tablet" onClick={() => handleClick(false)}>
                    <i className="fas fa-chevron-left"></i>
                </div>

            </div>

            <div className="tab-mobile">
                <Link to="/">
                    <img src={logo} alt="logo" className="logo-img" />
                </Link>
                <ul>
                    <li className="part1__item pd-l-19">
                        <Link to="/">
                            <i className="fab fa-napster"></i>
                        </Link>
                    </li>
                    <li className="part1__item pd-l-19">
                        <Link to="">
                            <i className="fas fa-record-vinyl"></i>
                        </Link>
                    </li>
                    <li className="part1__item pd-l-19">
                        <Link to="">
                            <i className="fas fa-chart-line"></i>
                        </Link>
                    </li>
                    <li className="part1__item pd-l-19">
                        <Link to="">
                            <i className="fas fa-radiation-alt"></i>
                        </Link>
                    </li>
                    <li className="part1__item pd-l-19">
                        <Link to="">
                            <i className="fas fa-eye"></i>
                        </Link>
                    </li>
                </ul>
                <hr />
                <div className="lib">
                    <ul>
                        <li className="part1__item pd-l-19">
                            <Link to="/nhac-moi">
                                <i className="fas fa-music"></i>
                            </Link>
                        </li>
                        <li className="part1__item pd-l-19">
                            <Link to="/genres">
                                <i className="fas fa-icons"></i>
                            </Link>
                        </li>
                        <li className="part1__item pd-l-19">
                            <Link to="/top100">
                                <i className="far fa-star"></i>
                            </Link>
                        </li>
                        <li className="part1__item pd-l-19">
                            <Link to="/">
                                <i className="fab fa-youtube"></i>
                            </Link>
                        </li>
                        <li className="part1__item pd-l-19">
                            <Link to="/">
                                <i className="fas fa-file-audio"></i>
                            </Link>
                        </li>
                        <li className="part1__item pd-l-19">
                            <Link to="/">
                                <i className="fas fa-sliders-h"></i>
                            </Link>
                        </li>
                        <li className="part1__item pd-l-19">
                            <Link to="/">
                                <i className="far fa-clock"></i>
                            </Link>
                        </li>

                    </ul>
                </div>

                <div className="extend-bar" onClick={() => handleClick(true)}>
                    <i className="fas fa-chevron-right"></i>
                </div>

            </div>


        </div>
    );
}

export default SideBar;