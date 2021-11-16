import axios from 'axios';
// import queryString from 'query-string'

const BASE_URL = process.env.NODE_ENV !== 'production' ? "http://localhost:1368" : process.env.MY_WEB;

const versionDefault = {
    key: "zmp3_app_version.1",
    value: 148
}

const axiosService = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        // "Access-Control-Allow-Origin": "*",
    },
    
});

axiosService.interceptors.request.use(async (config) => {
    // Do something before request is sent
    const token = localStorage.getItem("token");
    const zmp3 = JSON.parse(localStorage.getItem('zmp3_rqid'));
    const version = JSON.parse(localStorage.getItem('version'));
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        // console.log(token)
        localStorage.setItem('token', token);
    }
    if (zmp3) {
        const dt = {...config.data}
        // console.log(config.data)
        config.data = { zmp3, version, ...dt }
        // console.log(config.data)

    }

    return config;

}, (error) => {
    // Do something with request error
    return Promise.reject(error);
});

axiosService.interceptors.response.use((response) => {
    // Any status code that lie within the range of 2xx cause this function to trigger
    // Do something with response data
    if (response && response.data) {
        if (!response.data.success) {
            localStorage.setItem("version", JSON.stringify(versionDefault));
        }
        if (response.data.data && response.data.data.version && response.data.data.zmp3) {
            // console.log(response.data)
            localStorage.setItem("version", JSON.stringify(response.data.data.version));
            localStorage.setItem("zmp3_rqid", JSON.stringify(response.data.data.zmp3));
        }
        const accessToken = response.data.accessToken;
        if (accessToken) {
            localStorage.setItem("token", accessToken);
            localStorage.setItem("user", JSON.stringify(response.data.user));
        }
        return response.data;
    }

}, (error) => {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    // Do something with response error
    return Promise.reject(error);
});

export default axiosService;
