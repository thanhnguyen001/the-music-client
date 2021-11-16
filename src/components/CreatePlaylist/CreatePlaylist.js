import React, { useEffect, useRef, useState } from 'react';
import axiosService from '../../api/axiosClient';
import "./CreatePlaylist.css";
import { useDispatch, useSelector } from 'react-redux'

function CreatePlaylist(props) {

    const [name, setName] = useState("");
    const btnRef = useRef();
    const dispatch = useDispatch();

    const rename = useSelector(state => state.adjustPl);

    useEffect(() => {
        if (rename.title) {
            setName(rename.title);
        }
    }, [rename])

    const handleHide = (e) => {
        if (e.target.id === "create" || e.target.className === "hide-create") {
            if (name !== "") setName("");
            e.target.closest("#create").style.display = "none";
        }
    }

    const handleMouseEnter = (e) => {
        if (name !== "") e.target.style.cursor = "pointer";
        else e.target.style.cursor = "not-allowed";
    }

    const handleChangeValue = (e) => {
        setName(e.target.value);
        if ((btnRef.current)) {
            if (e.target.value !== "") {
                btnRef.current.style.opacity = 1;
            }
            else {
                btnRef.current.style.opacity = 0.6;
            }
        }
    }

    const handleChangeMode = (e) => {
        const mode = document.querySelector(".public-btn");
        if (mode) mode.classList.toggle("active");
    }

    const handleSendRequest = async (e, stt) => {
        if ((e.which === 13 || e.keyCode === 13 || stt) && name !== "") {
            const action = rename.title ? "UPDATE" : "ADD";
            const url = rename ? `/api/user/update/playlist/${rename.encodeId}` : "/api/user/update/playlist";
            try {
                const responsive = await axiosService.patch(url, { title: name, action });
                // console.log(responsive);
                const createE = document.getElementById("create");
                if (responsive.success) {
                    dispatch({
                        type: "TOAST",
                        payload: `Tạo playlist ${name} thành công`
                    });
                    dispatch({
                        type: "LOG_IN",
                        payload: responsive.user
                    });
                    if (name !== "") setName("");
                    createE.style.display = "none";
                }
                else {
                    dispatch({
                        type: "TOAST",
                        payload: "Tạo playlist không thành công"
                    });
                }
            } catch (error) {
                console.log(error.message);
                dispatch({
                    type: "TOAST",
                    payload: "Tạo playlist không thành công"
                });
            }
        }
    }

    return (
        <div className="create-pl" id="create" onClick={handleHide}>
            <div className="create-pl-wrap">
                <div className="hide-create">&times;</div>
                <div className="create-pl-title">
                    Tạo mới playlist
                </div>
                <input type="text" placeholder="Nhập tên playlist" value={name}
                    onChange={handleChangeValue}
                    onKeyDown={handleSendRequest}
                />
                <div className="public">
                    <div className="public-title">
                        <h3>Công khai</h3>
                        <h4>Mọi người có thể nhìn thấy playlist này</h4>
                    </div>
                    <div className="public-btn active" onClick={handleChangeMode}>
                        <div className="public-thumb"></div>
                    </div>
                </div>
                <div className="btn-create" ref={btnRef}
                    onMouseEnter={handleMouseEnter}
                    onClick={(e) => handleSendRequest(e, true)}>
                    {rename.title ? "Lưu" : "Tạo mới"}
                </div>
                
            </div>
        </div>
    )
}

export default CreatePlaylist
