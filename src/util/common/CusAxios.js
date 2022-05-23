import axios from "axios";
import { getCookie, setCookie, setCookieAccessToken, setCookieRefreshToken } from "util/common/Cookies";

//axios 인스턴스
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

    delRefreshSubscribers();
}

const addRefreshSubscriber = (callback) => {
    refreshSubscribers.push(callback);
}

const delRefreshSubscribers = () => {
    refreshSubscribers = [];
}

const expirationAuth = () => {
    
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

        
        if ( status === 433 ) {
            if ( true ) { //if ( error.response.data.code === 401 ) {
                if ( !isTokenRefreshing ) {
                    isTokenRefreshing = true;

                    //refresh토큰으로 토큰갱신
                    const refreshToken = getCookie("Refresh");
                    let userContext = localStorage.getItem('user_id');
                   
                    const { data } = await cusAxios.post(
                        "http://localhost:8080/refresh"
                        , { 
                            "Refresh" : refreshToken || "wqwq"
                            , "User" :  userContext || "not exist context _UserId"
                        }
                    );

                    const { token : newAccessToken, refreshtoken : newRefreshToken } = data;
                    
                    setCookieAccessToken(newAccessToken);
                    setCookieRefreshToken(newRefreshToken);

                    isTokenRefreshing = false;

                    cusAxios.defaults.headers.common["Authorization"] = `Bearer ${newAccessToken}`;
                    originRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
                    
                    //지연된 요청 진행
                    onTokenRefreshed(newAccessToken);

                    return axios(originRequest);
                } else {
                    const retryOriginalRequest = new Promise((resolve) => {
                        addRefreshSubscriber((accessToken) => {
                            originRequest.headers.Authorization = "Bearer " + accessToken;
                            resolve(axios(originRequest));
                        });
                    });
    
                    return retryOriginalRequest;
                }
            }
        }
        delRefreshSubscribers();
        return Promise.reject(error);
    }
);