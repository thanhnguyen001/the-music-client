import React, { useEffect, useRef, useState } from 'react';
import './App.scss';
import Play from './components/Play';
import SideBar from './components/SideBar';
import Content from './components/Content';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import SignForm from './components/SignForm/SignForm';
import CreatePlaylist from './components/CreatePlaylist/CreatePlaylist';
import Toast from './components/Toast/Toast';
import AudioComponent from './components/AudioComponent';
import Theme from './components/Theme/Theme';
import { useSelector } from 'react-redux';
import VideoComponent from './components/VideoComponent/Video';

function App() {

    const isActiveVideo = useSelector(state => state.isActiveVideo);

    // useEffect(() => {
    //     if (!isActiveVideo.isActive) return;

    //     const url = window.location.origin + isActiveVideo.link;
    //     // eslint-disable-next-line no-restricted-globals
    //     history.pushState({}, null, url);
    // }, [isActiveVideo.isActive, isActiveVideo.link])

    const isDown = useRef(false);
    const scrollTop = useRef(0);
    const startPoint = useRef(0);
    const space = useRef(0);
    const prevSpace = useRef(0);
    const direct = useRef("down");
    const prevDirect = useRef("down");
    const moveDown = useRef(0);
    const moveUp = useRef(0);

    const handleMouseDown = (e) => {
        if (e.target.className === "vertical-thumb") {
            isDown.current = true;
            const content = document.getElementById("content-1");
            if (!content) return;
            scrollTop.current = content.scrollTop;
            startPoint.current = e.clientY;
        }
    }
    const handleMouseMove = (e) => {
        if (isDown.current) {
            const content = document.getElementById("content-1");
            // console.log(scrollTop.current)
            const scrollHeight = content.scrollHeight - 90;
            const contentHeight = content.clientHeight - 90;

            space.current = e.clientY - startPoint.current;
            space.current >= prevSpace.current ? direct.current = "down" : direct.current = "up";
            if (direct.current !== prevDirect.current) {
                startPoint.current = e.clientY;
                space.current = 0;
                scrollTop.current = content.scrollTop;
            }
            prevDirect.current = direct.current;
            prevSpace.current = space.current;

            if (Math.abs(space.current) > 0) {
                if (direct.current === "down") {
                    moveDown.current = Math.floor(scrollTop.current + Math.abs(space.current) / (contentHeight / scrollHeight));
                    content.scrollTo(0, moveDown.current);
                }
                else {
                    moveUp.current = Math.floor(scrollTop.current - Math.abs(space.current) / (contentHeight / scrollHeight));
                    content.scrollTo(0, Math.abs(moveUp.current));
                }
            }
        }
    }
    const handleMouseUp = (e) => {
        isDown.current = false;
    }
    const appRef = useRef();

    const audioRef = useRef();
    const [audioPlay, setAudioPlay] = useState();

    const theme = useSelector(state => state.theme);

    useEffect(() => {
        const currentTheme = localStorage.getItem("current_theme");
        if (!currentTheme) localStorage.setItem("current_theme", "normal");
    }, [])

    useEffect(() => {
        if (appRef.current) {
            document.body.dataset.theme = theme;
            if (theme === "normal") {
                appRef.current.style.backgroundPosition = "50% 10%";
            }
            else appRef.current.style.backgroundPosition = "initial";
        }

        setAudioPlay(audioRef.current)
    }, [theme])

    return (
        <Router
        // getUserConfirmation={(message, callback) => {
        //     const allowTransition = window.confirm(message);
        //     callback(allowTransition);
        // }}
        >
            <div className="App" ref={appRef}
                onMouseDownCapture={handleMouseDown}
                onMouseMoveCapture={handleMouseMove}
                onMouseUpCapture={handleMouseUp}
            >
                <SignForm />
                <CreatePlaylist />
                <Toast />
                <Theme />
                <div className="row-no-wrap">
                    {/* Side Bar */}
                    <SideBar />

                    <Content />

                    {/* track vertical */}
                    <div className="vertical-track">
                        <div className="vertical-thumb"></div>
                    </div>
                </div>

                {/* Play Group */}
                {audioPlay && <Play audioRef={audioPlay} />}
                <AudioComponent ref={audioRef} />
                {isActiveVideo.isActive && <Switch>
                    <Route path={`*/video-clip/:name/:id`} >
                        <VideoComponent />
                    </Route>
                </Switch>}
            </div>
        </Router >
    );
}

export default App;
