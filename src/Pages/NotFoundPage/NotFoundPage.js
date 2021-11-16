import React from 'react';
import "./NotFound.css";

function NotFoundPage() {

    document.title = "404 - Not Found";

    return (
        <div className="not-found">
            <h2 className="not-found-text">404 Not Found (+_+)</h2>
            <div>
                <h2 className="not-update">Hiện trang web chưa cập nhật chức năng này. Truy cập 
                    <a href="https://zingmp3.vn" target="_blank" rel='noreferrer'> ZingMp3 </a>
                    để trải nghiệm đầy đủ tính năng
                </h2>
            </div>
        </div>
    )
}

export default NotFoundPage
