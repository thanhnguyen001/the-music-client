import React, { useEffect, useRef, memo } from 'react';
// import { useDispatch } from 'react-redux';
// import { addCountry100 } from '../actions/actions';
// import axiosClient from '../api/axiosClient';
// import * as urls from '../constants/url';
import Routes from '../routes';
import './Content.css';
import useDimensionWindow from '../hooks/useDimensionWindow';
import { useLocation } from 'react-router';
import Search from './Search/Search';
import { useSelector } from 'react-redux';


function Content() {
    // console.log(audioRef);
    // const dispatch = useDispatch();
    const location = useLocation();
    // console.log(location)

    const { width: windowWidth } = useDimensionWindow();

    useEffect(() => {
        // Handle search box
        const searchBg = document.querySelector(".bg-search");
        const searchBox = document.querySelector(".search-box");

        if (windowWidth < 600) {
            if (searchBg) searchBg.style.opacity = 1;
        }
        else {
            if (searchBg) searchBg.style.opacity = 0;

        }
        const currentPath = location.pathname;
        // console.log(currentPath);
        // Handle search box at home Page
        if (currentPath === '/') {
            searchBox.style.transform = "translateY(0%)";
            searchBox.style.backgroundColor = "var(--search-bg)";
            const icons = document.querySelectorAll(".search-group i");
            if (windowWidth < 470) {
                icons[0].style.display = "block";
                icons[1].style.display = "none";
                icons[2].style.display = "none";
            }
            else {
                icons[0].style.display = "none";
                icons[1].style.display = "block";
                icons[2].style.display = "block";
            }
            return;
        }
        const contentE = document.querySelector(".content");
        if (contentE) contentE.scrollTo(0, 0);

        handleScroll();

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.pathname, windowWidth, location.search])

    const timeOut = useRef(null);
    const isUp = useRef(0);
    const currentSong = useSelector(state => state.PlaySong);

    const handleScroll = () => {
        const contentE = document.querySelector(".content");
        const infoSong = document.querySelector(".info-song.active");
        const icons = document.querySelectorAll(".search-group i");

        if (infoSong) infoSong.classList.remove("active");

        if (!contentE) return;
        const scrollTop = contentE.scrollTop;
        const scrollHeight = currentSong ? contentE.scrollHeight - 90 : contentE.scrollHeight;
        const contentHeight = currentSong ? contentE.clientHeight - 90 : contentE.clientHeight;
        const thumbVertical = document.querySelector(".vertical-thumb");
        const trackVertical = document.querySelector(".vertical-track");
        // Handle Thumb Vertical
        if (scrollTop > 0) {
            clearTimeout(timeOut.current);
            trackVertical.style.opacity = "1";
            timeOut.current = setTimeout(() => {
                trackVertical.style.opacity = '0';
            }, 2500)
        }

        if (scrollHeight > contentHeight) {
            thumbVertical.style.height = `${Math.floor(contentHeight * (contentHeight / scrollHeight))}px`;
        }

        thumbVertical.style.transform = `translateY(${scrollTop * (contentHeight / scrollHeight)}px)`;

        // Handle Search Box
        const searchBox = document.querySelector(".search-box");
        const searchBg = document.querySelector(".bg-search");
        const inputG = document.querySelector(".input-search");

        if (windowWidth > 599) {
            if (scrollTop > 0) {
                searchBox.style.backgroundColor = "var(--search-bg)";
                searchBox.style.boxShadow = "0 3px 5px rgba(255, 255, 255, 0.2)"
            }
            else {
                searchBox.style.background = "none";
                searchBox.style.boxShadow = "none"
                searchBg.style.opacity = 0;
            }
        }
        else {
            if (scrollTop === 0) {

                icons[0].style.display = "block";
                icons[1].style.display = "none";
                icons[2].style.display = "none";

                isUp.current = 0;
                // searchBox.style.background = "none";
                searchBg.style.opacity = 1;
                searchBg.style.background = "none";
                searchBg.style.boxShadow = "none";
                if (inputG.className.includes("active")) return;
                searchBox.style.transform = "translateY(-100%)";
                searchBox.style.boxShadow = "none"
                return;
            }
            else {
                searchBg.style.opacity = 1;
                searchBg.style.background = "var(--head-bg-mobile)";
                searchBg.style.boxShadow = "var(--head-bg-mobile-shadow)";
            }
            if (scrollTop > isUp.current) {
                isUp.current = scrollTop;
                if (inputG.className.includes("active")) return;
                searchBox.style.transform = "translateY(-100%)";
                searchBox.style.boxShadow = "none"
                // searchBg.style.opacity = 1;
                if (!icons) return;
                icons[0].style.display = "block";
                icons[1].style.display = "none";
                icons[2].style.display = "none";
            }
            else {
                isUp.current = scrollTop;
                searchBox.style.transform = "translateY(0px)";
                searchBox.style.backgroundColor = "var(--search-bg)";
                searchBox.style.boxShadow = "0 3px 5px rgba(255, 255, 255, 0.2)";
                // searchBg.style.opacity = 0;
                if (!icons) return;
                icons[0].style.display = "none";
                icons[1].style.display = "block";
                icons[2].style.display = "block";
            }
        }
    }

    const handleShowPlaylistMenu = (idx) => {
        const menu = document.querySelectorAll(".sidebar-playlist-menu");
        if (!menu) return;
        [...menu].forEach((item, index) => {
            index === idx ? item.classList.toggle("active") : item.classList.remove("active");
        })
    }

    return (
        <div className="content" id="content-1"
            onScroll={handleScroll}
            onClick={handleShowPlaylistMenu}
        >
            {/* Search Box */}
            <Search />
            {/* Routers */}
            <Routes />

            
        </div>
    );
}

export default memo(Content);