import React, { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import useClickOutSide2 from '../../hooks/useClickOutside2';
import "./InfoSong.css";
import { UtilChangeToAlpha } from '../../utils';
import axiosService from '../../api/axiosClient';
import { addPlaylist, addSong } from '../../actions/actions';
import useDimensionWindow from '../../hooks/useDimensionWindow';

function InfoSong(props) {

    const { song, index } = props;

    const dispatch = useDispatch();

    const infoRef = useRef();
    useClickOutSide2(infoRef, index);

    const currentPlaylist = useSelector(state => state.Playlist) || JSON.parse(localStorage.getItem("CURRENT_PLAYLIST")) || {
        playlist: []
    };

    const { width: windowWidth } = useDimensionWindow();

    const currentSong = useSelector(state => state.PlaySong) || JSON.parse(localStorage.getItem("CURRENT_SONG"));

    const user = useSelector(state => state.user);

    const [playlists, setPlaylists] = useState(user.playlist || []);

    useEffect(() => {
        setPlaylists(user.playlist);
    }, [user])

    const updateToServer = async (activePlaylist, payload) => {
        try {
            const responsive = await axiosService.patch(`/api/user/update/playlist/${activePlaylist.encodeId}`,
                { action: "UPDATE", items: [...activePlaylist.items] });
            // console.log(responsive);
            if (responsive.success) {
            }
            if (infoRef) {
                infoRef.current.classList.remove("active");
                dispatch({
                    type: "TOAST",
                    payload
                })
            }
        } catch (error) {
            console.log(error.message)
        }
    }

    const handleAddToPlaylist = async (item) => {
        const activePlaylist = user.playlist.find(ele => ele.encodeId === item.encodeId);
        const isExist = activePlaylist.items.find(ele => ele.encodeId === song.encodeId);
        if (isExist) {
            dispatch({
                type: "TOAST",
                payload: `Bài hát đã có trong playlist "${activePlaylist.title}"`
            });
            return;
        }
        activePlaylist.items.unshift(song);
        // console.log(activePlaylist);
        updateToServer(activePlaylist, `Thêm bài hát ${song.title} vào playlist ${activePlaylist.title} thành công`);
    }

    const showPlaylist = (list) => {
        return list.map((item, index) => {
            return <li className="playlist-item" key={index} onClick={() => handleAddToPlaylist(item)}>
                <i className="flaticon-musical-note"></i>
                <span>{item.title}</span>
            </li>
        })
    }

    const handleFindPlaylist = (e) => {
        const value = UtilChangeToAlpha(e.target.value);
        if (!e.target.value) {
            setPlaylists(user.playlist);
            return;
        };
        const filterList = playlists.filter(item => UtilChangeToAlpha(item.title).includes(value));
        setPlaylists(filterList);
    }

    const handleShowCreate = () => {
        if (!user || !user.username) {
            const form  = document.getElementById("form");
            if (form) form.style.display = "block";
            return;
        }
        const create = document.getElementById("create");
        const inputName = document.querySelector("#create input");
        if (create) create.style.display = "block";
        if (inputName) inputName.focus();
    }

    const handleDeleteSong = async () => {
        const myPlaylist = document.querySelector(".my-playlist-page");
        if (myPlaylist) {
            // console.log(myPlaylist.dataset);
            const encodeId = myPlaylist.dataset.id;
            const activePlaylist = user.playlist.find(ele => ele.encodeId === encodeId);
            activePlaylist.items.splice(index, 1);
            updateToServer(activePlaylist, `Đã xóa bài hát ${song.title} ra khỏi playlist ${activePlaylist.title}`);
        }
    }

    const handleAddToCurrentPlaylist = (stt) => {

        if (infoRef) infoRef.current.classList.remove("active");
        const content = document.getElementById("content-1")
        const cd = document.querySelector(`.cd-animate.cd-${index}`);
        // console.log(cd.getBoundingClientRect());
        const rect = cd.getBoundingClientRect()
        // console.log(content.clientHeight, content.clientWidth)
        const bottom = {
            top: content.clientHeight - rect.bottom,
            right: content.clientWidth - rect.right + 240
        }
        cd.style.zIndex = 1200;
        cd.animate([
            {
                top: 0,
                right: 0,
                opacity: 1,
                transform: "scale(1.5)",
            },
            {
                top: "-60px",
                right: "-60px",
                opacity: 0.8,
                transform: "scale(1.2)",
            },
            {
                top: "-60px",
                right: "-100px",
                opacity: 0.6,
                transform: "scale(1)",
            },
            {
                top: "-60px",
                right: "-150px",
                opacity: 0.6,
                transform: "scale(1)",
            },
            {
                top: `${bottom.top - 100}px`,
                right: `-${bottom.right - 100}px`,
                opacity: 0.5,
                transform: "scale(1)",
            },
            {
                top: `${bottom.top}px`,
                right: `-${bottom.right}px`,
                opacity: 0,
                transform: "scale(1)",
            }
        ], {
            duration: 1000,
            easing: "linear"
        });

        if (currentPlaylist.playlist) {
            if (stt === "push") currentPlaylist.playlist.push(song);
            else if (stt === "next") {
                currentPlaylist.playlist.unshift(song);
                dispatch(addSong(currentSong.song.song, currentSong.song.index + 1));
            }
            dispatch(addPlaylist(currentPlaylist.playlist));
        }
    }

    const handleHide = (e) => {
        if (e.target.className === "info-song active") {
            infoRef.current.classList.remove("active");
        }
    }

    const handleDeleteSongFromLibrary = async () => {
        try {
            const response = await axiosService.post("/api/user/update/song", { action: "DELETE", index: index });
            if (response.success) {
                dispatch({
                    type: "LOG_IN",
                    payload: response.user
                })
            }
        } catch (error) {
            console.log(error.message)
        }
    }
    const wrapRef = useRef();
    const startPoint = useRef(0);
    const directSwipe = useRef("down");
    const prevDirect = useRef("down");
    const space = useRef(0);
    const prevSpace = useRef(0);
    const moveDown = useRef(0);
    const moveUp = useRef(0);
    const handleTouchStart = (e) => {
        startPoint.current = e.touches[0].clientY;
        prevSpace.current = startPoint.current;
    }

    const handleTouchMove = (e) => {
        if (windowWidth > 600) return;
        if (!wrapRef.current) return;
        space.current = e.touches[0].clientY - startPoint.current;
        space.current >= prevSpace.current ? directSwipe.current = "down" : directSwipe.current = "up";
        if (directSwipe.current !== prevDirect.current) {
            startPoint.current = e.touches[0].clientY;
            space.current = e.touches[0].clientY - startPoint.current;

            // console.log(directSwipe.current, prevDirect.current)
        }
        prevDirect.current = directSwipe.current;
        prevSpace.current = space.current;
        // console.log(directSwipe.current)

        if (Math.abs(space.current) > 0 && Math.abs(space.current) <= wrapRef.current.clientHeight) {
            if (directSwipe.current === "down") {
                moveDown.current = moveUp.current + Math.floor(Math.abs(space.current));
                if (moveDown.current >= wrapRef.current.clientHeight) {
                    moveDown.current = wrapRef.current.clientHeight;
                }
                wrapRef.current.style.transform = `translateY(${moveDown.current}px)`;
            }
            else if (directSwipe.current === "up") {
                moveUp.current = moveDown.current - Math.floor(Math.abs(space.current));
                if (moveUp.current < 0) {
                    moveUp.current = 0;
                }
                wrapRef.current.style.transform = `translateY(${moveUp.current}px)`;
            }
        }
    }

    const handleTouchEnd = (e) => {
        if (!wrapRef) return;
        if (moveDown.current >= wrapRef.current.clientHeight * 0.3 && directSwipe.current === "down") {
            wrapRef.current.style.transform = "translateY(100%)";
            setTimeout(() => {
                infoRef.current.classList.remove("active");
                wrapRef.current.style.transform = "translateY(27%)";
            }, 500)
        }
        else if (moveDown.current < wrapRef.current.clientHeight * 0.3 && directSwipe.current === "down") {
            wrapRef.current.style.transform = "translateY(27%)";
        }

        if (moveUp.current >= wrapRef.current.clientHeight * 0.2 && directSwipe.current === "up") {
            wrapRef.current.style.transform = "translateY(0%)";
        }
        // else if (moveUp.current < wrapRef.current.clientHeight * 0.3 && directSwipe.current === "up") {
        //     wrapRef.current.style.transform = "translateY(27%)";
        // }
        moveDown.current = 0;
        moveUp.current = 0;
    }

    return (
        <div className="info-song" ref={infoRef} onClick={handleHide}>
            <div className="info-song-wrap" ref={wrapRef}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                <div className="info-title">
                    <div className="info-thumbnail">
                        <img src={song.thumbnail} alt="" />
                    </div>
                    <div className="info-name">
                        <div className="info-name-inner">{song.title}</div>
                        <div className="info-artist">{song.artistsNames}</div>
                    </div>
                </div>

                <ul className="info-group-menu">
                    <li className="info-group-item">
                        <i className="fas fa-download"></i>
                        <div>Tải xuống</div>
                    </li>
                    <li className="info-group-item">
                        <i className="flaticon-microphone"></i>
                        <div>Lời bài hát</div>
                    </li>
                    <li className="info-group-item">
                        <i className="fas fa-ban"></i>
                        <div>Chặn</div>
                    </li>
                </ul>

                <ul className="info-menu-list">


                    <li className="info-menu-item" onClick={() => handleDeleteSongFromLibrary()}>
                        <i className="fas fa-trash-alt"></i>
                        <span>Xóa khỏi thư viện</span>
                    </li>

                    <li className="info-menu-item" onClick={() => handleAddToCurrentPlaylist('push')}>
                        <i className="fas fa-play"></i>
                        <span>Thêm vào danh sách phát</span>
                    </li>
                    <li className="info-menu-item" onClick={() => handleAddToCurrentPlaylist('next')}>
                        <i className="fas fa-reply"></i>
                        <span>Phát tiếp theo</span>
                    </li>
                    <li className="info-menu-item add-to-playlist">
                        <i className="fas fa-plus-circle"></i>
                        <span>Thêm vào playlist</span>
                        <i className="fas fa-chevron-right"></i>

                        <div className="show-playlists">
                            <div className="show-playlists-wrap">

                                <input type="text" placeholder="Tìm playlist" onChange={handleFindPlaylist} />

                                <div className="show-playlists-create" onClick={handleShowCreate}>
                                    <i className="fas fa-plus-square"></i>
                                    <span>Tạo playlist mới</span>
                                </div>

                                <ul className="playlist-menu">
                                    {playlists && playlists.length > 0 && showPlaylist(playlists)}
                                </ul>

                            </div>
                        </div>
                    </li>

                    <li className="info-menu-item">
                        <i className="fas fa-radiation-alt"></i>
                        <span>Radio</span>
                    </li>
                    <li className="info-menu-item">
                        <i className="fas fa-comments"></i>
                        <span>Bình luận</span>
                    </li>
                    <li className="info-menu-item">
                        <i className="fas fa-link"></i>
                        <span>Sao chép link</span>
                    </li>
                    <li className="info-menu-item">
                        <i className="fas fa-share-alt"></i>
                        <span>Chia sẻ</span>
                    </li>
                    <li className="info-menu-item delete-song" onClick={handleDeleteSong}>
                        <i className="fas fa-trash-alt"></i>
                        <span>Xóa khỏi playlist này</span>
                    </li>

                    <li className="info-menu-item hide-in-large">
                        <i className="fas fa-download"></i>
                        <div>Tải xuống</div>
                    </li>
                    <li className="info-menu-item hide-in-large">
                        <i className="flaticon-microphone"></i>
                        <div>Lời bài hát</div>
                    </li>
                    <li className="info-menu-item hide-in-large">
                        <i className="fas fa-ban"></i>
                        <div>Chặn</div>
                    </li>

                </ul>
            </div>
        </div>
    )
}

export default InfoSong
