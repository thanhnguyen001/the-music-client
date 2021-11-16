import React, { useEffect, useRef, useState } from 'react'
import axiosClient from '../../api/axiosClient'
import Carousel from '../../components/Carousel/Carousel';
import Gallery from '../../components/Gallery/Gallery';
import './Home.css';
import Skeleton from '../../components/Skeleton/Skeleton';
import { useDispatch } from 'react-redux';

function Home() {

    const dispatch = useDispatch();

    document.title = "The Music | Nghe tải nhạc chất lượng";

    const [gallery, setGallery] = useState([]);
    const [playlist, setPlaylist] = useState([]);
    const [isLoaded, setIsLoaded] = useState(false);
    const [moreList, setMoreList] = useState([]);

    useEffect(() => {
        dispatch({
            type: "PAGE_NAME",
            payload: "Home"
        })

        const fetchSlide = async (page = 1) => {
            try {
                let { data } = await axiosClient.post('/api/home', { page });
                // console.info(data)
                if (data.err === 0) {
                    // console.info(data.zmp3);
                    setIsLoaded(true);
                    clearInterval(autoGet);
                    setGallery(data.data.items[0].items);
                    setPlaylist(data.data.items.slice(3));
                }
            } catch (error) {
                console.log(error)
            }
        }

        fetchSlide();

        const autoGet = setInterval(() => {
            if (!isLoaded) fetchSlide();
        }, 10000);

        if (isLoaded) clearInterval(autoGet);

        return () => {
            clearInterval(autoGet);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isLoaded]);

    const count = useRef(2);
    const prevCount = useRef(1);

    const fetchHomeMore = async (page = 1) => {
        try {
            const { data } = await axiosClient.post('/api/home', { page });
            // console.info(data)
            if (data.err === 0) {
                if (data.data.items) {
                    setMoreList(prevList => [...prevList, ...data.data.items]);
                    count.current++;
                }
            }
        } catch (error) {
            console.log(error)
        }
    }
    // Fetch data when scroll down
    useEffect(() => {
        const content = document.querySelector(".content");
        // const song = document.getElementById("song");

        const handleScroll = (e) => {
            // console.log(content.scrollTop);
            if ((content.scrollTop + 20) >= (content.scrollHeight - content.clientHeight)) {
                if (count.current <= prevCount.current) return;
                else prevCount.current = count.current;
                fetchHomeMore(prevCount.current);
                // console.log(prevCount.current);
            }
        }
        if (content) {
            content.addEventListener("scroll", handleScroll)
        }

        return () => content.removeEventListener("scroll", handleScroll)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])


    const showPlaylist = (playlist) => {
        const result = [];
        const recently = JSON.parse(localStorage.getItem("recently")) || [];
        if (recently.length > 0) { result.unshift(<Carousel list={recently} title={"Nghe gần đây"} key={-1} index={-1} />); }
        playlist.forEach((item, index) => {
            result.push(<Carousel list={item.items} title={item.title} key={index} index={index} />)
        });

        return result;
    }

    useEffect(() => {
        const contentE = document.querySelector(".content");
        const scrollHeight = contentE.scrollHeight;
        const contentHeight = contentE.clientHeight - 100;
        const thumbVertical = document.querySelector(".vertical-thumb");
        thumbVertical.style.transform = "translateY(0px)";
        thumbVertical.style.height = `${Math.floor(contentHeight * (contentHeight / (scrollHeight + 333)))}px`;
    }, [])

    const showMorePlaylist = (list) => {
        const result = [];
        list.forEach((item, index) => {
            if (item.sectionType === "playlist" || item.sectionType === "artistSpotlight") {
                result.push(<Carousel list={item.items}
                    title={item.title || (item.sectionType === "artistSpotlight" && "Nghệ Sĩ")}
                    key={index} index={index + 5} type={item.sectionType === "artistSpotlight" ? "artist" : ""}
                />)
            }
        });
        return result;
    }

    return (
        <div className="home">

            {gallery.length > 0 && <Gallery gallery={gallery} />}

            {playlist.length > 0 && showPlaylist(playlist)}

            {moreList.length > 0 && showMorePlaylist(moreList)}

            {!isLoaded && <Skeleton type="home" />}

        </div>
    )
}

export default Home
