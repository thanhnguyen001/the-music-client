import React, { useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import "./Toast.css";

function Toast() {

    const toast = useSelector(state => state.toast);
    const dispatch = useDispatch()
    const timeout = useRef();
    useEffect(() => {
        const toastElement = document.getElementById("toast");

        if (toastElement && toast !== "") {
            if (toast.includes("không")) {
                toastElement.style.backgroundColor = "red";
            }
            toastElement.classList.add("active");
            timeout.current = setTimeout(() => {
                toastElement.classList.remove("active");
                dispatch({
                    type: "TOAST",
                    payload: ""
                });
            }, 3000)
        }

        return () => clearTimeout(timeout.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [toast])

    return (
        <div className="toast" id="toast">
            <div className="toast-mess-wrap">
                <span>{toast}</span>
            </div>
        </div>
    )
}

export default Toast
