import axios from "axios";
import { getCookie, setCookie, setCookieAccessToken, setCookieRefreshToken } from "util/common/Cookies";

//axios 인스턴스
export const cusAxios = axios.create({
    baseURL : 'http://localhost:8080'
    , headers : {
         "Content-Type" : "application/json"
        // , "Authorization" : ''
        // , "Refesh" : ''
        // , "User" : ''
    }
});

let isTokenRefreshing = false;
let refreshSubscribers = [];
let completeRefresh = false;
let refreshTimeout = null;

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

//refresh토큰 통신중 자동 false
const setIsTokenRefreshing = (value) => {
  isTokenRefreshing = value;

  if (value === true) {
    // 5초 후 자동 초기화 타이머 시작
    refreshTimeout = setTimeout(() => {
      isTokenRefreshing = false;
      completeRefresh = false;
    }, 20000);
  } 
}

//커스텀 Axios response 인터셉터
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
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
                    // isTokenRefreshing = true;
                    setIsTokenRefreshing(true);

                    

                    //refresh토큰으로 토큰갱신
                    const refreshToken = getCookie("Refresh");
                    let userContext = localStorage.getItem('user_id');

                    //요청 중 오류로 인해 isTokenRefreshing이 false로 돌아가지 못하는 상황을 방지하기위해 예외처리
                    try {
                        const { data } = await cusAxios.post(
                            "/refresh"
                            , { 
                                "Refresh" : refreshToken || "wqwq"
                                , "User" :  userContext || "not exist context _UserId"
                            }
                        );
                        const { token : newAccessToken, refreshtoken : newRefreshToken } = data;

                        if(!newAccessToken || !newRefreshToken) {
                            const err = new Error("리프레시 실패");
                            err.code = "NO_TOKEN_REFRESH";
                            err.status = 434;
                            throw err;
                        }
                        setCookieAccessToken(newAccessToken);
                        setCookieRefreshToken(newRefreshToken);

                        

                        cusAxios.defaults.headers.common["Authorization"] = `Bearer ${newAccessToken}`;
                        originRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;

                        // isTokenRefreshing = false;
                        //지연된 요청 진행
                        completeRefresh = true;
                        onTokenRefreshed(newAccessToken);
                        return cusAxios(originRequest);
                    } catch (e) {
                        console.error("토큰 갱신 실패:", e);
                        return Promise.reject(e);
                    } finally {
                        // 무조건 false로 되돌리기
                        // isTokenRefreshing = false;
                    }
                } else {
                    if(completeRefresh) {
                        originRequest.headers.Authorization = getCookie("Authorization");
                        return cusAxios(originRequest);
                    } else {
                        const retryOriginalRequest = new Promise((resolve) => {
                            addRefreshSubscriber((accessToken) => {
                                originRequest.headers.Authorization = "Bearer " + accessToken;
                                resolve(cusAxios(originRequest));
                            });
                        });
        
                        return retryOriginalRequest;
                    }
                }
            }
        }
        delRefreshSubscribers();
        return Promise.reject(error);
    }
);