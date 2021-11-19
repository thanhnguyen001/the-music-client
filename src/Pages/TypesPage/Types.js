import React, { useEffect, useState, lazy, Suspense, useRef } from 'react';
import { useDispatch } from 'react-redux';
import axiosClient from '../../api/axiosClient';
import './TypePage..css';
import Skeleton from '../../components/Skeleton/Skeleton';

const Carousel = lazy(() => import('../../components/Carousel/Carousel'));

function Types({ match }) {

    const [types, setTypes] = useState([]);
    const [isLoaded, setIsLoaded] = useState(false);
    const dispatch = useDispatch();

    document.title = `Chủ Đề Nhạc Hot | Tuyển tập nhạc hay chọn lọc`;

    useEffect(() => {
        dispatch({
            type: "PAGE_NAME",
            payload: "Thể loại"
        })

        const fetchTop100 = async () => {
            try {
                const { data } = await axiosClient.post('/api/genre');
                // console.info(data)
                setTypes(data.data);

                setIsLoaded(true);
                clearInterval(autoFetch);
                // console.log(newType);
            } catch (error) {
                console.log(error);
            }
        }

        fetchTop100();

        const autoFetch = setInterval(() => {
            if (!isLoaded) fetchTop100();
            else clearInterval(autoFetch);
        }, 15000)

        return () => clearInterval(autoFetch);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isLoaded])

    const renderTypes = (types) => {
        return types.map((item, index) => <Suspense key={index} fallback={<div className="">...Loading</div>}>
            <Carousel list={item.playlists} title={item.title} index={index} />
        </Suspense>)
    }
    const count = useRef(0);

    useEffect(() => {
        const autoChangeBanner = setInterval(() => {
            count.current++;
            changeBanner(types.banners);
        }, 5000);

        return () => clearInterval(autoChangeBanner);
    }, [types.banners])

    const renderBanner = (list) => {
        if (!list) return;
        return list.map((item, index) => <div key={index} className={`banner-item ${index === count.current ? "active" : "wait"}`}>
                <img src={item.cover} alt="" />
            </div>
        );
    }

    const changeBanner = (list) => {
        if (!list) return;
        if (count.current >= list.length) count.current = 0
        let prev = count.current - 1, next = count.current + 1;
        if (count.current === 0) {
            prev = list.length - 1; next = 1;
        }
        if (count.current === list.length - 1) {
            next = 0;
        }
        const items = document.querySelectorAll(".banner-item");
        [...items].forEach((item, index) => {
            if (index === count.current) {
                item.classList.add("active");
                item.classList.remove("prev")
                item.classList.remove("next")
                item.classList.remove("wait")
            }
            else if (index === prev) {
                item.classList.remove("active");
                item.classList.add("prev")
                item.classList.remove("next")
                item.classList.remove("wait")
            }
            else if (index === next) {
                item.classList.remove("active");
                item.classList.remove("prev")
                item.classList.add("next")
                item.classList.remove("wait")
            }
            else {
                item.classList.remove("active");
                item.classList.remove("prev")
                item.classList.remove("next")
                item.classList.add("wait")
            }
        })
    }

    return (
        <div className="type">
            {!isLoaded && <Skeleton type="home"/>}
            <div className="section-banner">
                <div className="banner-wrap">
                    {isLoaded && types.banners.length > 0 && renderBanner(types.banners)}
                </div>
            </div>
            <div className="section-genre">
                <div className="genres">
                    {isLoaded && types.genre.length > 0 && renderTypes(types.genre)}
                </div>
            </div>
        </div>
    );
}

export default Types;