import axios from "axios";
import { getCookie, setCookie, setCookieAccessToken, setCookieRefreshToken } from "util/common/Cookies"

export const cusAxios = axios.create({
    baseURL : ''
    , headers : {
         "Content-Type" : "application/json"
        // , "Authorization" : ''
        // , "Refesh" : ''
        // , "User" : ''
    }
});

let isTokenRefreshing = false;
let refreshSubscribers = [];

const onTokenRefreshed = (accessToken) => {
    refreshSubscribers.map((callback) => callback(accessToken));
}

const addRefreshSubscriber = (callback) => {
    refreshSubscribers.push(callback);
}

//커스텀 Axios response 인터셉터
cusAxios.interceptors.response.use(
    //응답 성공 시
    (response) => {
        return response;
    }
    , async (error) => {
        const {
            config
            , response : { status }
        } = error;
        const originRequest = config;

        if ( status === 401 ) {
            if ( true ) { //if ( error.response.data.code === 401 ) {
                if ( !isTokenRefreshing ) {
                    isTokenRefreshing = true;

                    //refresh토큰으로 토큰갱신
                    const refreshToken = getCookie("Refresh");
                    console.log("refreshToken" + refreshToken);
                    const { data } = await cusAxios.post(
                        "http://localhost:8080/refresh"
                        , { 
                            "Refresh" : refreshToken || "wqwq"
                            , "User" : "AAA"
                        }
                    );

                    const { token : newAccessToken, refreshtoken : newRefreshToken } = data;
                    
                    setCookieAccessToken(newAccessToken);
                    setCookieRefreshToken(newRefreshToken);

                    isTokenRefreshing = false;

                    cusAxios.defaults.headers.common["Authorization"] = `Bearer ${newAccessToken}`;
                    
                    //지연된 요청 진행
                    onTokenRefreshed(newAccessToken);
                }

                const retryOriginalRequest = new Promise((resolve) => {
                    addRefreshSubscriber((accessToken) => {
                        originRequest.headers.Authorization = "Bearer " + accessToken;
                        resolve(axios(originRequest));
                    });
                });

                return retryOriginalRequest;
            }
        }
        return Promise.reject(error);
    }
);