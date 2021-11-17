import React, { useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types';
import './Carousel.css';
import useDimensionWindow from '../../hooks/useDimensionWindow';
import LazyLoad from '../LazyLoadImage';
import { Link, useLocation } from 'react-router-dom';
import noThumbnail from '../../static/img/no-thumbnail.png';
import { useDispatch, useSelector } from 'react-redux';


function Carousel(props) {

    const { list, index, title, type, isSP, myPage } = props;

    const location = useLocation();
    const dispatch = useDispatch();
    const isActiveVideo = useSelector(state => state.isActiveVideo);

    const [itemsInScreen, setItemsInScreen] = useState(type === 'video' ? 3 : 5);
    const carouselRef = useRef();

    const { width: windowWidth } = useDimensionWindow();

    // console.log("list: ", list)

    useEffect(() => {
        if (windowWidth >= 1350) {
            if (type === "video") {
                setItemsInScreen(3)
            }
            else setItemsInScreen(5);
        }
        // else if (windowWidth < 450) setItemsInScreen(1);
        else if (windowWidth < 700) setItemsInScreen(2);

        else if (windowWidth < 1024) {
            if (type === 'video') {
                setItemsInScreen(2);
                return;
            }
            setItemsInScreen(4);
        }

    }, [type, windowWidth])

    useEffect(() => {
        handleChangeSlide(false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [windowWidth])

    let count = useRef(0);

    const showLink = (str) => {
        let link = str.replace(".html", "");
        if (type === "artist") {
            if (link.includes("nghe-si")) return link;
            else return `/nghe-si/${link}`.replaceAll("//", "/");
        }
        else if (str.includes("/video-clip")) {
            if (isActiveVideo && isActiveVideo.links && isActiveVideo.links[1]) {
                return `${isActiveVideo.links[1]}${link}`;
            }
            else return `${location.pathname}${link}`
        }
        else return link;
    }

    const handleChangeVideo = (link) => {
        if (link.includes("video-clip")) {
            if (isActiveVideo.links && isActiveVideo.links[1]) {
                dispatch({ type: "active_video", payload: [link, isActiveVideo.links[1]] })
            }
            else dispatch({ type: "active_video", payload: [link, ""] })
        }
    }

    const showCarousel = (carousels) => {
        const result = [];
        if (myPage) {
            result.push(myPage);
            if (carousels.length === 1) return result;
        }
        // console.log(carousels)
        carousels.forEach((item, idx) => {
            result.push(<div className={`zm-carousel-item ${type}`} key={idx} onClick={() => handleChangeVideo(item.link)}>
                <div className="carousel-item-wrap">
                    <div className="zm-card">
                        <div className="card-thumbnail">
                            <Link to={showLink(item.link)} title={item.title} >
                                <div className="card-img">
                                    <LazyLoad src={item.thumbnail || noThumbnail}>
                                        {/* <img src={item.thumbnail} alt="" /> */}
                                    </LazyLoad>
                                </div>
                            </Link>
                            {item.duration && <div className="card-duration">
                                {`0${Math.floor(Number.parseInt(item.duration) / 60)}`.slice(-2)}:{`0${Math.floor(Number.parseInt(item.duration % 60))}`.slice(-2)}
                            </div>}
                            {type !== "artist" && <div className="card-thumbnail-hover">
                                <Link to={showLink(item.link)} className="card-thumbnail-hover">
                                    <i className="far fa-heart"></i>
                                    <i className="fas fa-play"></i>
                                    <i className="fas fa-ellipsis-h"></i>
                                </Link>
                            </div>}
                        </div>
                        {type === 'artist' && <div className="card-artist">
                            <div className="card-artist-name">{item.name}</div>
                            <div className="card-artist-follow">
                                {item.totalFollow >= 1000 ? `${Math.floor(item.totalFollow / 1000)}K` : item.totalFollow} quan tâm
                            </div>
                            <div className="card-artist artist-btn follow">
                                <div className="artist-play">
                                    <i className="fas fa-plus"></i>
                                    <span>QUAN TÂM</span>
                                </div>
                            </div>
                        </div>}

                        <div className="card-info">
                            <a href={item.link} title={item.title}>
                                <div className="card-title">
                                    <h3 className="title">{item.title}</h3>
                                    {!isSP && <h4 className="card-description">{item.sortDescription}</h4>}
                                    {isSP && <h4 className="card-description">{item.artistsNames}</h4>}
                                </div>
                            </a>
                        </div>
                    </div>

                </div>
            </div>)
        });

        return result;
    }

    const showBtnChangeSlide = () => {
        return <div className="zm-btn">
            <button className="zm-btn-prev disabled" tabIndex={index} onClick={() => handleChangeSlide(0)}>
                <i className="fas fa-chevron-left"></i>
            </button>
            <button className="zm-btn-next" tabIndex={index} onClick={() => handleChangeSlide(1)}>
                <i className="fas fa-chevron-right"></i>
            </button>
        </div>
    }

    const handleChangeSlide = (status) => {
        const carousel = document.querySelector(`.zm-carousel[tabindex="${index}"]`);
        const next = document.querySelector(`.zm-btn-next[tabindex="${index}"]`);
        const prev = document.querySelector(`.zm-btn-prev[tabindex="${index}"]`);
        const itemWidth = carousel.querySelector(".zm-carousel-item");
        // console.info(carousel)
        if (!prev || !next) return;
        if (status === 1) {
            prev.classList.remove("disabled");
            if (list.length - count.current - itemsInScreen >= itemsInScreen) {
                count.current += itemsInScreen;
            }
            else if (list.length - count.current - itemsInScreen > 0) {
                const temp = list.length - count.current - itemsInScreen;
                count.current += temp;
            }
            else {
                next.classList.add("disabled");
                // console.info(count.current)
                return;
            }
            // console.info(count.current)
            if (list.length - count.current - itemsInScreen === 0) next.classList.add("disabled");
            carousel.style.transition = "transform 0.5s linear";
            carousel.style.transform = `translateX(-${count.current * itemWidth.clientWidth}px)`;
        }
        else {
            // console.info('ok')
            next.classList.remove("disabled");
            if (count.current >= itemsInScreen) count.current -= itemsInScreen;
            else if (count.current > 0) count.current = 0;
            // console.info(count.current)
            if (count.current === 0) prev.classList.add("disabled");
            carousel.style.transition = "transform 0.5s linear";
            carousel.style.transform = `translateX(-${count.current * itemWidth.clientWidth}px)`
        }
    }

    return (
        <div className={`zm-section ${type ? type : 'playlist'}`} tabIndex={index}>

            <div className="zm-section-wrap">
               <div className="zm-section-title">
                   {title && <h3>{title}<i className="fas fa-angle-double-right"></i> </h3>}
                </div>
                <div className="container">
                    <div className="zm-carousel-wrap" tabIndex={index} ref={carouselRef}>

                        <div className="zm-carousel" tabIndex={index} id={`carousel-${index}`}>
                            {list && list?.length > 0 && showCarousel(list)}
                        </div>

                        {!isSP && list &&list.length > itemsInScreen && showBtnChangeSlide()}
                    </div>
                </div>
            </div>

        </div>
    )
}

Carousel.propTypes = {
    list: PropTypes.array
}

export default Carousel

