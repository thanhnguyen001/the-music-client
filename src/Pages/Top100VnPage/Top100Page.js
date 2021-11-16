import React, { useEffect, useState, lazy, Suspense } from 'react';
import './Top100.css';
import axiosClient from '../../api/axiosClient';
// import Carousel from '../../components/Carousel/Carousel';
import { useDispatch, useSelector } from 'react-redux';
const Carousel = lazy(() => import('../../components/Carousel/Carousel'));

// Top100Page.propTypes = {

// };

function Top100Page({ match }) {
    // console.log(match)
    const [list100, setList100] = useState([]);
    const dispatch = useDispatch();

    document.title = "Top 100 | Tuyển tập nhạc hay chọn lọc";

    const theme = useSelector(state => state.theme);

    useEffect(() => {

        dispatch({
            type: "PAGE_NAME",
            payload: "Top 100"
        })
        const fetchTop100 = async () => {
            try {
                const url = `/api/top100`;
                const { data } = await axiosClient.post(url);
                setList100(data.data);
                // console.log(newType);
            } catch (error) {
                console.log(error);
            }
        }

        fetchTop100();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const renderTop100 = (list) => {

        return list.map((item, index) => <Suspense fallback={<div className="">...loading</div>} key={index}>
            <Carousel list={item.items} title={item.genre.name} index={index} />
        </Suspense>)
    }

    return (
        <div className="top100">
            <div className="top100-bg">
                {theme !== "normal" && theme !== "dark" && <div>Top 100</div>}
            </div>
            <div className="popular">
                {list100.length > 0 && renderTop100(list100)}
            </div>
        </div>
    );
}

export default Top100Page;