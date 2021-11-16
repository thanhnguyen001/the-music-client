import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import "./ArtistPage.css";
import axiosClient from '../../api/axiosClient';
import Carousel from '../../components/Carousel/Carousel';
import Playlist from '../PlaylistPage/Playlist';
import Skeleton from '../../components/Skeleton/Skeleton';
import useDimensionWindow from '../../hooks/useDimensionWindow';
import { useDispatch } from 'react-redux';

function ArtistPage({ match }) {

    const artistName = match.params.artist;

    const [isLoaded, setIsLoaded] = useState(false);
    const [artist, setArtist] = useState();
    const dispatch = useDispatch();

    useEffect(() => {
        setIsLoaded(false);
    }, [artistName])

    // Fetch Artist Api
    useEffect(() => {
        const fetchArtist = async () => {
            try {
                const url = `/api/artist/${artistName}`;
                const { data } = await axiosClient.post(url);

                if (data.err === 0) {
                    // console.info(data);
                    setArtist(data.data);
                    setIsLoaded(true);
                    clearInterval(autoFetch);

                    dispatch({
                        type: "PAGE_NAME",
                        payload: data.data.name
                    });

                    document.title = `${data.data.name} - Nhạc ${data.data.name}`
                }

            } catch (error) {
                console.info(error.message);
            }
        }

        fetchArtist();

        const autoFetch = setInterval(() => {
            if (!isLoaded) fetchArtist();
            else clearInterval(autoFetch);
        }, 3000);

        return () => clearInterval(autoFetch)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [artistName])

    const { width: windowWidth } = useDimensionWindow();

    // handle Action Button on mobile mode
    useEffect(() => {
        const latest = document.querySelector(".artist-latest");
        const action = document.querySelector(".artist-action");
        if (latest && action && windowWidth <= 800) {
            latest.classList.remove("hide");
            action.classList.remove("hide");
        }
        else return;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [windowWidth])

    const handleReadMore = (status) => {
        const sortBiography = document.querySelector(".artist-biography .sortBiography");
        // const biography = document.querySelector(".artist-biography .biography");
        const unMore = document.querySelector(".artist-biography .read-unmore");
        const more = document.querySelector(".artist-biography .read-more");
        const latest = document.querySelector(".artist-latest");
        const action = document.querySelector(".artist-action");
        const span = document.getElementById("biography");
        if (!unMore || !more || !latest) return;
        if (status) {
            span.innerHTML = artist.biography;
            latest.classList.add("hide");
            action.classList.add("hide");
            sortBiography.classList.add("hide");
            unMore.classList.remove("hide");
            more.classList.add("hide");
        }
        else {
            span.innerHTML = "";
            latest.classList.remove("hide");
            action.classList.remove("hide");
            sortBiography.classList.remove("hide");
            unMore.classList.add("hide");
            more.classList.remove("hide");
        }
    }

    const handleNavigation = (e, idx) => {
        const biography = document.querySelector(".artist-mobile-biography");
        const items = document.querySelectorAll(".navigation-item");
        console.log("ok");
        [...items].forEach((item, index) => {
            if (index === idx) {
                if (idx === 8) {
                    if (!biography) return;
                    biography.innerHTML = artist.biography;
                }
                else biography.innerHTML = "";
                if (e.target.closest(".navigation-item")) {
                    e.target.closest(".navigation-item").classList.add("active");
                    // console.log(e.target.closest(".navigation-item"))
                }
                else item.classList.add("active");
            }
            else {
                item.classList.remove("active");
            }
        });
    }

    const renderSections = (sections) => {
        return sections.map((item, index) => {
            if (item.sectionType !== 'song' && item.items?.length > 0) {
                return <Carousel
                    key={index}
                    index={index}
                    list={item.items}
                    title={item.title}
                    type={item.sectionType}
                />
            }
            else return false;
        })
    }

    const count = useRef(1);

    // Auto Change Slide
    useEffect(() => {
        const auto = setInterval(() => {
            changeSlide();
        }, 2500);
        return () => clearInterval(auto);
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

    return (
        <div className="zm-artist">

            {isLoaded && <div className="zm-artist-wrap">
                <div className="artist-section-biography">
                    <div className="artist-info-bg" style={{ backgroundImage: `url(${artist.cover})` }}>
                        <img className="img-cover" src={artist.cover} alt="" />
                        <img className="img-thumbnailM" src={artist.thumbnailM} alt="" />
                        <div className="overlay-mobile"></div>
                    </div>

                    <div className="artist-biography-body row no-gutters">
                        <div className="c-7  artist-info">
                            <div className="artist-name">{artist.name}</div>
                            <div className="artist-follow mobile">{Math.floor(artist.follow / 1000)}K quan tâm</div>
                            <div className="artist-biography">
                                <span className="sortBiography">{artist.sortBiography}</span>
                                <span className="read-more" onClick={() => handleReadMore(true)}> ...XEM THÊM</span>
                                <div className="biography">
                                    <span id="biography"></span>
                                </div>
                                <div className="read-unmore hide" onClick={() => handleReadMore(false)}>...Rút gọn</div>
                            </div>

                            <div className="artist-action">
                                <div className="artist-btn play">
                                    <div className="artist-play">
                                        <i className="fas fa-play"></i>
                                        <span>PHÁT NHẠC</span>
                                    </div>
                                </div>
                                <div className="artist-btn follow">
                                    <div className="artist-play">
                                        <i className="fas fa-plus"></i>
                                        <span>QUAN TÂM</span>
                                    </div>
                                </div>
                                <div className="artist-follow">
                                    {artist.follow >= 1000 ? `${Math.floor(artist.follow / 1000)}K` : artist.follow} quan tâm
                                </div>
                            </div>

                            {artist.topAlbum && <div className="artist-latest">
                                <Link to={artist.topAlbum.link} className="artist-latest-wrap">
                                    <div className="artist-latest-thumbnail thumbnail">
                                        <img src={artist.topAlbum.thumbnail} alt="" />
                                    </div>
                                    <div className="artist-latest-info">
                                        <span>MỚI NHẤT</span>
                                        <div className="artist-latest-name">{artist.topAlbum.title}</div>
                                        <div className="artist-latest-release">{artist.topAlbum.releaseDate}</div>
                                    </div>
                                </Link>
                            </div>}
                        </div>
                        <div className="c-5 zm-artist-avatar">
                            <div className="artist-avatar-wrap">
                                <img src={artist.thumbnailM} alt="" />
                            </div>
                            <div className="artist-tablet-follow">{Math.floor(artist.follow / 1000)}K quan tâm</div>
                        </div>
                    </div>

                </div>
                {/* Mobile */}
                {artist.topAlbum && <div className="artist-latest mobile">
                    <div className=""></div>
                    <Link to={artist.topAlbum.link} className="artist-latest-wrap">
                        <div className="artist-latest-thumbnail thumbnail">
                            <img src={artist.topAlbum.thumbnail} alt="" />
                        </div>
                        <div className="artist-latest-info">
                            <span>MỚI NHẤT</span>
                            <div className="artist-latest-name">{artist.topAlbum.title}</div>
                            <div className="artist-latest-release">{artist.topAlbum.releaseDate}</div>
                        </div>
                    </Link>
                </div>}

                <div className="artist-section-navigation">

                    <div className="navigation-wrap">

                        <div className="navigation-item mobile-hide active" onClick={(e) => handleNavigation(e, 0)}>
                            <span>TỔNG QUAN</span>
                        </div>

                        <div className="navigation-item active mobile" onClick={(e) => handleNavigation(e, 1)}>
                            <span>ÂM NHẠC</span>
                        </div>

                        <div className="navigation-item" onClick={(e) => handleNavigation(e, 2)}>
                            <span>HOẠT ĐỘNG</span>
                        </div>

                        <div className="navigation-item" onClick={(e) => handleNavigation(e, 3)}>
                            <span>SỰ KIỆN</span>
                        </div>

                        <div className="navigation-item mobile-hide" onClick={(e) => handleNavigation(e, 4)}>
                            <span onClick={(e) => handleNavigation(e, 4)}>BÀI HÁT</span>
                        </div>

                        <div className="navigation-item mobile-hide" onClick={(e) => handleNavigation(e, 5)}>
                            <span onClick={(e) => handleNavigation(e, 5)}>MV</span>
                        </div>

                        <div className="navigation-item mobile-hide" onClick={(e) => handleNavigation(e, 6)}>
                            <span onClick={(e) => handleNavigation(e, 6)}>RADIO</span>
                        </div>

                        <div className="navigation-item mobile-hide" onClick={(e) => handleNavigation(e, 7)}>
                            <span onClick={(e) => handleNavigation(e, 7)}>TIN TỨC</span>
                        </div>

                        <div className="navigation-item mobile" onClick={(e) => handleNavigation(e, 8)}>
                            <span onClick={(e) => handleNavigation(e, 8)}>TIỂU SỬ</span>
                        </div>

                    </div>

                </div>
                <div className="artist-mobile-biography"></div>
                {artist.sections && artist.sections[0].sectionType === 'song' && <div className="artist-section-songs">
                    <div className="zm-section-title"><h3>{artist.sections[0].title}</h3></div>
                    <div className="artist-song">
                        <div className="artist-song-slide">
                            <ul className="artist-song-slide-wrap">
                                {renderSlider(artist.sections[0].items)}
                            </ul>
                        </div>
                        <div className="artist-song-items">
                            <Playlist list={artist.sections[0].items} />
                        </div>
                    </div>
                </div>}

                {artist.sections && <div className="artist-section-items">
                    {renderSections(artist.sections)}
                </div>}
            </div>}

            {!isLoaded && <Skeleton type="artist" />}
        </div>
    )
}

export default ArtistPage;
