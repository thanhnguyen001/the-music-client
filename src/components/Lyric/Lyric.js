import React, { useEffect, useRef, useState } from 'react'
import axiosService from '../../api/axiosClient';
import './Lyric.css';

function Lyric({ id, thumbnail, other }) {
    // console.log(id);
    const [lyrics, setLyrics] = useState(JSON.parse(localStorage.getItem("lyrics")) || null);
    const [isLoaded, setIsLoaded] = useState(other);
    const words = useRef({});

    useEffect(() => {
        const fetchLyrics = async () => {
            try {
                const url = `/api/lyrics/${id}`;
                const { data } = await axiosService.post(url);
                // console.log("ok");
                setLyrics(data.data);
                setIsLoaded(true);
                localStorage.setItem("lyrics", JSON.stringify(data.data))
            } catch (error) {
                console.log(error.message)
            }
        }
        fetchLyrics();

    }, [isLoaded, id]);

    const count = useRef(0);
    useEffect(() => {
        const audio = document.getElementById("audio2");
        const sentences = document.querySelectorAll(".sentences-item");
        if (!lyrics || !lyrics.sentences) return;
        let start = lyrics.sentences[0]?.words[0].startTime;
        let end = lyrics.sentences[0]?.words[lyrics.sentences[0].words.length - 1].endTime;
        const handleTimeUpdate = (e) => {
            const playLyrics = document.querySelector(".play-lyrics.active");

            const time = Math.floor(e.target.currentTime * 1000);
            // console.log(time)
            if (time === 0) count.current = 0;
            // console.log(count.current)
            start = lyrics.sentences[count.current]?.words[0].startTime;
            end = lyrics.sentences[count.current]?.words[lyrics.sentences[count.current].words.length - 1].endTime;

            while (time > end && count.current < sentences.length) {
                // sentences[count.current].classList.remove("active");
                // sentences[count.current].classList.add("over");
                count.current++;

                start = lyrics.sentences[count.current]?.words[0].startTime;
                end = lyrics.sentences[count.current]?.words[lyrics.sentences[count.current].words.length - 1].endTime;
            }
            while (time < start && count.current > 0) {
                // sentences[count.current].classList.remove("active");
                // sentences[count.current].classList.remove("over");

                count.current--;
                start = lyrics.sentences[count.current]?.words[0].startTime;
                end = lyrics.sentences[count.current]?.words[lyrics.sentences[count.current].words.length - 1].endTime;
            }
            if (time >= start && time <= end) {
                if (count.current > 0) {
                    sentences[count.current - 1].classList.remove("active");
                    sentences[count.current - 1].classList.add("over");
                }
                if (count.current < 0) count.current = 0;
                sentences.forEach((item, index) => {
                    item.classList.remove("active")
                    if (index < count.current) {
                        item.classList.add("over");
                    }
                    else if (index > count.current) {
                        item.classList.remove("over")
                    }
                })
                sentences[count.current].classList.add("active");
                if (playLyrics) {
                    sentences[count.current].scrollIntoView({
                        behavior: "smooth",
                        block: "center"
                    })
                };
                count.current++;
            }
            // if (time > end) count.current++;
        }

        if (sentences && lyrics && lyrics.sentences) {
            audio.addEventListener("timeupdate", handleTimeUpdate);
            // console.log("new")
            count.current = 0;
        }

        return () => {
            audio.removeEventListener("timeupdate", handleTimeUpdate);
            // localStorage.clear("lyrics")
        }
    }, [lyrics, id])

    const renderLyrics = (list) => {

        const result = list.map((item, index) => {
            const sentence = item.words.map(element => {
                words.current[`start-${element.startTime}`] = index;
                words.current[`end-${element.endTime}`] = index;
                return element.data;
            }).join(" ");

            return <div key={index} className="sentences-item">
                <p>{sentence}</p>
            </div>
        });
        return result;
    }

    return (
        <div className="lyric">
            <div className="lyric-wrap">
                <div className="lyric-thumbnail">
                    <img src={thumbnail} alt="" />
                </div>
                <div className="lyric-content">
                    <div className="lyric-sentences">
                        {lyrics && lyrics.sentences && renderLyrics(lyrics.sentences)}
                        {lyrics && !lyrics.sentences && <div>Hiện chưa có lời bài hát</div>}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default React.memo(Lyric);
