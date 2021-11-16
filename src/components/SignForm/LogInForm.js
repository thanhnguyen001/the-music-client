import React from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import axiosClient from '../../api/axiosClient';


function LogInForm() {
    const { handleSubmit, formState: { errors }, register } = useForm({ mode: "all" });
    const dispatch = useDispatch();

    const onSubmit = async (data) => {
        // console.log(data)
        const dt = { ...data };
        try {
            const responsive = await axiosClient.post("/api/user/login", dt);
            // console.log(responsive);
            if (!responsive.success) {
                const resError = document.querySelector(".responsive-error");
                resError.textContent = responsive.message;
            }
            else {
                dispatch({
                    type: "LOG_IN",
                    payload: responsive.user
                });
                document.getElementById("form").style.display = "none";
                document.querySelector(".login-prompt").style.display = "none";
                // eslint-disable-next-line no-restricted-globals
                location.reload()
            }


        } catch (error) {
            console.log(error.message)
        }
    }

    return (
        <form className="form" onSubmit={handleSubmit(onSubmit)} id="log-form">
            <div className="responsive-error"></div>

            <div className="sign-form-body">

                <div className={`sign-group ${errors.loginName ? "error" : ""}`}>
                    <label htmlFor="">Tên đăng nhập/Email:</label>
                    <input type="text" name="loginName" placeholder=""
                        {...register("loginName", {
                            required: "Vui lòng điền mục này",
                        })}
                    />
                    <div className="sign-error">
                        {errors.loginName ? errors.loginName.message : ""}
                    </div>
                </div>

                <div className={`sign-group ${errors.password ? "error" : ""}`}>
                    <label htmlFor="">Mật khẩu:</label>
                    <input type="password" name="password" placeholder=""
                        {...register("password", {
                            required: "Vui lòng điền mục này",
                            minLength: { value: 6, message: "Tối thiểu 6 kí tự" }
                        })}
                    />
                    <div className="sign-error">
                        {errors.password ? errors.password.message : ""}
                    </div>
                </div>

                <input type="submit" value="Đăng Nhập" />

            </div>
        </form>
    )
}

export default LogInForm
