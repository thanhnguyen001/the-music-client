import React, { useRef } from 'react'
import LogInForm from './LogInForm';
import './SignForm.css';
import SignInForm from './SignInForm';

function SignForm() {

    const handleChangeMode = (mode) => {
        const separate = document.querySelector(".sign-form--heading-separate");
        const formElement = document.getElementById("form-body");
        if (mode === "log") {
            separate.style.left = "0";
            separate.style.width = "36%";
            formElement.classList.remove("active");
            formElement.style.transform = `translateX(0px)`;
        }
        else {
            separate.style.left = "72%";
            separate.style.width = "28%";
            formElement.classList.add("active");
            formElement.style.transform = `translateX(-100%)`;
        }
    }

    const handleHideForm = (e) => {
        if (e.target.id === "form" || e.target.className.includes("hide-form"))
            document.getElementById("form").style.display = "none";
    }

    const startPoint = useRef(0);
    const directSwipe = useRef("right");
    const prevDirect = useRef("right");
    const space = useRef(0);

    const handleTouchStart = (e) => {
        // console.log(e.touches);
        startPoint.current = e.touches[0].pageX;
    }

    const handleTouchMove = (e) => {
        const formElement = document.getElementById("form-body");

        space.current = e.touches[0].pageX - startPoint.current;
        space.current >= 0 ? directSwipe.current = "right" : directSwipe.current = "left";
        // console.log(Math.abs(space.current))
        if (directSwipe.current !== prevDirect.current) {
            startPoint.current = e.touches[0].pageX;
            space.current = e.touches[0].pageX - startPoint.current;
        }
        prevDirect.current = directSwipe.current;

        if (Math.abs(space.current) > 0 && Math.abs(space.current) <= formElement.clientWidth) {
            if (directSwipe.current === "right" && !formElement.className.includes("active")) return;
            if (directSwipe.current === "left" && formElement.className.includes("active")) return;
            if (directSwipe.current === "right") {
                formElement.style.transform = `translateX(-${Math.floor(formElement.clientWidth - Math.abs(space.current))}px)`;
            }
            else {
                formElement.style.transform = `translateX(-${Math.floor(Math.abs(space.current))}px)`;
            }
        }
    }

    const handleTouchEnd = () => {
        const formElement = document.getElementById("form-body");
        if (space.current === 0) return;
        if (directSwipe.current === "right") {
            if (Math.floor(formElement.clientWidth - Math.abs(space.current)) / formElement.clientWidth > 0.4) {
                handleChangeMode("sign");
                // console.log("right > 0.4")
            }
            else if (Math.floor(formElement.clientWidth - Math.abs(space.current)) / formElement.clientWidth > 0){
                handleChangeMode("log");
                // console.log("right > 0")
            }
        } else {
            if (Math.floor(Math.abs(space.current)) / formElement.clientWidth > 0.4) {
                handleChangeMode("sign");
                // console.log("left > 0.4")

            }
            else if (Math.floor(Math.abs(space.current)) / formElement.clientWidth > 0) {
                handleChangeMode("log");
                // console.log("left > 0")
            }
        }
        directSwipe.current = "right";
        prevDirect.current = "right";
        space.current = 0;
    }

    return (
        <div className="sign-form" id="form" onClick={handleHideForm}>
            <div className="sign-form-wrap">

                <div className="hide-form" onClick={handleHideForm}>&times;</div>
                <div className="sign-form-heading">
                    <div className="sign-form--heading-item" onClick={() => handleChangeMode("log")}>Đăng Nhập</div>
                    <div className="sign-form--heading-item" onClick={() => handleChangeMode("sign")}>Đăng Ký</div>
                    <div className="sign-form--heading-separate"></div>
                </div>

                <div className="form-body-wrap" id="form-body"
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                >
                    <LogInForm />
                    <SignInForm />
                </div>


            </div>



        </div>
    )
}

export default SignForm
