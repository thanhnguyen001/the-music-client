import React from 'react';
import Shimmer from './Shimmer';
import './Skeleton.css';

function Skeleton({ type }) {

    const showListSong = (num) => {
        const result = [];
        for (let i = 1; i <= num; i++) {
            result.push(<div className="sk-song" key={i}>
                <div className="sk-song-thumbnail skeleton-wrap"><Shimmer /></div>
                <div className="sk-song-info">
                    <div className="sk-song-title skeleton-wrap"><Shimmer /></div>
                    <div className="sk-song-artist skeleton-wrap"><Shimmer /></div>
                </div>
                <div className="sk-song-duration">
                    <div className="skeleton-wrap"><Shimmer /></div>
                </div>
            </div>)
        }
        return result;
    }

    return (
        <div className="skeleton">
            {/* <div className={`skeleton-wrap`}>
                <div className={`skeleton-${type}`}></div>
                <Shimmer />
            </div> */}
            {type === "home" && <div className="sk-home">
                <div className="sk-home-slide">
                    <div className={`skeleton-wrap`}><Shimmer /></div>
                    <div className={`skeleton-wrap`}><Shimmer /></div>
                    <div className={`skeleton-wrap`}><Shimmer /></div>
                </div>
                <div className="sk-title-playlist skeleton-wrap"><Shimmer /></div>
                <div className="sk-playlist">
                    <div className={`skeleton-wrap`}><Shimmer /></div>
                    <div className={`skeleton-wrap`}><Shimmer /></div>
                    <div className={`skeleton-wrap`}><Shimmer /></div>
                    <div className={`skeleton-wrap`}><Shimmer /></div>
                </div>
            </div>}

            {type === "songs" && <div className="sk-songs">
                <div className="sk-songs-thumbnail skeleton-wrap"><Shimmer /></div>
                <div className="sk-songs-item">
                    {showListSong(15)}
                </div>
            </div>}

            {type === "artist" && <div className="sk-artist">
                <div className="sk-biography">
                    <div className="sk-biography-detail">
                        <div className="sk-text-name skeleton-wrap"><Shimmer /></div>
                        <div className="sk-text skeleton-wrap"><Shimmer /></div>
                        <div className="sk-text skeleton-wrap"><Shimmer /></div>
                        <div className="sk-text skeleton-wrap"><Shimmer /></div>
                        <div className="sk-song">
                            <div className="sk-song-thumbnail skeleton-wrap"><Shimmer /></div>
                            <div className="sk-song-info">
                                <div className="sk-song-title skeleton-wrap"><Shimmer /></div>
                                <div className="sk-song-artist skeleton-wrap"><Shimmer /></div>
                                <div className="sk-song-artist skeleton-wrap"><Shimmer /></div>
                            </div>
                        </div>
                    </div>
                    <div className="sk-artist-thumbnail skeleton-wrap"><Shimmer /></div>
                </div>
                <div className="sk-title-playlist skeleton-wrap"><Shimmer /></div>
                <div className="sk-playlist">
                    <div className={`skeleton-wrap`}><Shimmer /></div>
                    <div className={`skeleton-wrap`}><Shimmer /></div>
                    <div className={`skeleton-wrap`}><Shimmer /></div>
                    <div className={`skeleton-wrap`}><Shimmer /></div>
                </div>
            </div>}

            <div className="sk-sp-all">
                
            </div>

        </div>
    )
}

export default Skeleton
