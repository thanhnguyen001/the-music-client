import React, { useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import axiosClient from '../../api/axiosClient';


function SignInForm() {
    const { handleSubmit, formState: { errors }, watch, register } = useForm({ mode: "all" });

    const dispatch = useDispatch();

    const onSubmit = async (data) => {
        // console.log(data);
        const dt = { ...data };
        try {
            const responsive = await axiosClient.post("/api/user/register", dt);
            console.log(responsive);
            if (!responsive.success) {
                const resError = document.querySelector(".responsive-error");
                resError.textContent = responsive.message;
            }
            else {
                dispatch({
                    type: "SIGN_IN",
                    payload: responsive.user
                });
                const form = document.getElementById("form");
                const loginPrompt = document.querySelector(".login-prompt");
                if (form) form.style.display = "none" ;
                if (loginPrompt) loginPrompt.style.display = "none";
                // eslint-disable-next-line no-restricted-globals
                location.reload();
            }


        } catch (error) {
            console.log(error.message)
        }
    }

    const handleValidEmail = (e) => {
        const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        // console.log(e.target.value)
        const isValid = re.test(String(e.target.value).toLowerCase());
        // console.log(isValid);
        const emailE = document.getElementById(`email-group-sign`);
        if (!isValid) {
            emailE.classList.add("error");
            if (e.target.value !== "")
                emailE.querySelector(".sign-error").textContent = "Email không phù hợp"
        }
        else {
            emailE.classList.remove("error");
            emailE.querySelector(".sign-error").textContent = "";
        }
        return isValid;
    }

    const password = useRef(watch("password", ""));
    password.current = watch("password", "");

    return (
        <form className="form" onSubmit={handleSubmit(onSubmit)} id="sign-form">

            <div className="responsive-error"></div>

            <div className="sign-form-body">
                <div className={`sign-group ${errors.username ? "error" : ""}`}>
                    <label htmlFor="">Tên đăng nhập:</label>
                    <input type="text" name="username" id="username" placeholder=""
                        {...register("username", {
                            required: "Vui lòng điền mục này",
                            minLength: { value: 3, message: "Tối thiểu 3 ký tự" },
                            maxLength: { value: 18, message: "Tối đa 18 ký tự" }
                        })}
                    />
                    <div className="sign-error">
                        {errors.username ? errors.username.message : ""}
                    </div>
                </div>

                <div className={`sign-group ${errors.email ? "error" : ""}`} id="email-group-sign">
                    <label htmlFor="">Email:</label>
                    <input type="email" name="email" id="email" placeholder=""
                        {...register("email", {
                            required: "Vui lòng điền mục này",
                            onBlur: handleValidEmail
                        })}
                    />
                    <div className="sign-error">
                        {errors.email ? errors.email.message : ""}
                    </div>
                </div>

                <div className={`sign-group ${errors.password ? "error" : ""}`}>
                    <label htmlFor="">Mật khẩu:</label>
                    <input type="password" name="password" id="password" placeholder=""
                        {...register("password", {
                            required: "Vui lòng điền mục này",
                            minLength: { value: 6, message: "Tối thiểu 6 kí tự" }
                        })}
                    />
                    <div className="sign-error">
                        {errors.password ? errors.password.message : ""}
                    </div>
                </div>

                <div className={`sign-group ${errors.confirm_password ? "error" : ""}`}>
                    <label htmlFor="">Nhập lại mật khẩu:</label>
                    <input type="password" name="confirm_password" id="confirm_password" placeholder=""
                        {...register("confirm_password", {
                            required: "Vui lòng điền mục này",
                            validate: value => value === password.current || "Mật khẩu không trùng khớp"
                        })}
                    />
                    <div className="sign-error">
                        {errors.confirm_password ? errors.confirm_password.message : ""}
                    </div>
                </div>

                <input type="submit" value="Đăng Ký" />

            </div>
        </form>
    )
}

export default SignInForm
