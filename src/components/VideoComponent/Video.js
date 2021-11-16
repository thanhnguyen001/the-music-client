/* eslint-disable no-restricted-globals */
import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router';
import axiosService from '../../api/axiosClient';
import "./Video.css";

function Video() {

    const dispatch = useDispatch();

    const isActiveVideo = useSelector(state => state.isActiveVideo);
    const wrapVideo = useRef();
    const videoRef = useRef();
    const src = useRef("")

    const [video, setVideo] = useState();
    const [recommends, setRecommends] = useState([])

    const hst = useHistory();

    const prevLink = useRef("/");
    const currentVideo = useRef(0);
    const isFirst = useRef(true);

    useEffect(() => {
        if (!wrapVideo.current) return;
        // console.log(hst.location.pathname);
        if (isActiveVideo.isActive) {
            const indexOfFirst = hst.location.pathname.indexOf("/video-clip");
            if (indexOfFirst > 0) {
                prevLink.current = hst.location.pathname.slice(0, indexOfFirst);
            }
            // console.log(prevLink.current);
        }
        const url = window.location.origin + isActiveVideo.links[0];
        // eslint-disable-next-line no-restricted-globals
        history.pushState({}, null, url);

        const fetchVideo = async () => {
            try {
                const id = isActiveVideo.links[0].split("/")[3].replace(".html", "");
                const { data } = await axiosService.post(`/api/video/${id}`);
                setVideo(data.data);
                if (isFirst.current) {
                    const list = [];
                    list.push(data.data);
                    list.push(...data.data.recommends)
                    setRecommends(list);
                    isFirst.current = false;
                }
            } catch (error) {
                console.log(error.message)
            }
        }
        fetchVideo();
        wrapVideo.current.classList.add("active");
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isActiveVideo.isActive, isActiveVideo.links[0]])

    const handleHideVideo = () => {
        if (wrapVideo.current) {
            wrapVideo.current.classList.remove("active");
            const url = window.location.origin + prevLink.current;
            history.pushState({}, null, url);

            setTimeout(() => {
                dispatch({ type: "disable_video", payload: [] })
            }, 1000)
        }
    }

    const handleProgress = (e) => {
        if (!videoRef.current.buffered) return;
        // console.log(videoRef.current.buffered.end(0))
    }
    const handleChangeVideo = (item, index, e) => {
        currentVideo.current = index;
        e.target.scrollIntoView({
            behavior: "smooth",
            block: "start"
        })
        const fetchVideo = async () => {
            try {
                const { data } = await axiosService.post(`/api/video/${item.encodeId}`);
                setVideo(data.data);
            } catch (error) {
                console.log(error.message)
            }
        }

        fetchVideo();

    }
    const renderList = (list) => {
        return list.map((item, index) => {
            return <div key={index} className={`video-item ${index === currentVideo.current ? "active" : ""}`} onClick={(e) => handleChangeVideo(item, index, e)}>
                <div className="video-item-thumbnail">
                    <img src={item.thumbnail} alt="" />
                    <div className="card-duration">
                        {`0${Math.floor(Number.parseInt(item.duration) / 60)}`.slice(-2)}:{`0${Math.floor(Number.parseInt(item.duration % 60))}`.slice(-2)}
                    </div>
                    {index === currentVideo.current && <div className="is-playing">Đang phát</div>}
                </div>
                <div className="video-item-info">
                    <div className="video-item-title">{item.title}</div>
                    <div className="video-item-artist">{item.artistsNames}</div>
                </div>
            </div>
        })
    }

    const handleGetMp4 = (streaming) => {
        if (streaming.mp4["1080p"]) src.current = streaming.mp4["1080p"];
        else if (streaming.mp4["720p"]) src.current = streaming.mp4["720p"];
        else if (streaming.mp4["480p"]) src.current = streaming.mp4["480p"];
        return src.current;
    }

    const handleEnded = () => {

    }

    return (
        <div id="video" ref={wrapVideo}>
            {video && <div className="video-bg" style={{ backgroundImage: `url(${video.thumbnailM})` }}></div>}
            {video && <div className="video-wrap">
                <div className="video-heading">
                    <div className="video-info">
                        <div className="video-thumbnail">
                            <img src={video.thumbnail} alt="" />
                        </div>
                        <div className="video-text">
                            <div className="video-title">{video.title}</div>
                            <div className="video-artist">{video.artistsNames}</div>
                        </div>
                    </div>

                    <div className="hide-video" onClick={handleHideVideo}>&times;</div>
                </div>
                <div className="video-body">
                    <div className="video-main">
                        <div className="video-main-wrap">
                            <video src={handleGetMp4(video.streaming)} autoPlay controls ref={videoRef}
                                onProgress={handleProgress}
                                onEnded={handleEnded}
                            >
                            </video>
                        </div>
                    </div>
                    <div className="video-recommend">
                        <div className="video-recommend-wrap">
                            <div className="video-recommend-title">
                                <div>Danh Sách Phát</div>
                                <span>Tự động phát <div className="public-btn active" onClick={(e) => e.target.closest(".public-btn").classList.toggle("active")}><div className="public-thumb"></div></div></span>
                            </div>
                            <div className="video-list">
                                {recommends.length > 0 && renderList(recommends)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>}
        </div>
    )
}

export default Video
