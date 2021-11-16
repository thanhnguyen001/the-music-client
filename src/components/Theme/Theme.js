import React from 'react'
import './Theme.css';
import theme from '../../static/img';
import { useDispatch, useSelector } from 'react-redux';

function Theme() {

    const dispatch = useDispatch();

    const themeOption = useSelector(state => state.theme);

    const showOption = (list) => {
        return list.map((item, index) => {
            return <div className="theme-item" key={index}>
                <div className="theme-thumbnail" onClick={() => handleUseTheme(item.slug)}>
                    <img src={item.thumbnail} alt="" />
                </div>
                <div className="theme-item-title">{item.title}</div>
                <div className="theme-btn">
                    <div className="theme-use" onClick={() => handleUseTheme(item.slug)}>Áp dụng</div>
                    <div className="theme-preview" onClick={() => handlePreviewTheme(item.slug)}>Xem trước</div>
                </div>

            </div>
        })
    }

    const handleUseTheme = (slug) => {
        dispatch({ type: `THEME`, payload: slug });
        localStorage.setItem("current_theme", slug);
        document.querySelector(".theme").classList.remove("active");
    }

    const handlePreviewTheme = (slug) => {
        dispatch({ type: `THEME`, payload: slug });
    }


    const handleHide = (e) => {
        if (e.target.className === "theme active" || e.target.className === "hide-theme") {
            const currentTheme = localStorage.getItem("current_theme");
            if (themeOption !== currentTheme) {
                dispatch({ type: "THEME", payload: currentTheme });
            }
            e.target.closest(".theme").classList.remove("active");
        }
    }

    return (
        <div className="theme" onClick={handleHide}>
            <div className="theme-wrap">
                <div className="theme-title">Giao diện <span className="hide-theme" onClick={handleHide}>&times;</span></div>
                <div className="theme-option">
                    <div className="theme-option-title">Chủ Đề</div>

                    <div className="theme-items">
                        {showOption(theme)}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Theme
