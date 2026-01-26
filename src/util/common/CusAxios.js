import axios from "axios";
import { getCookie, setCookieAccessToken, setCookieRefreshToken } from "util/common/Cookies";

export const BASE_URL = "http://localhost:8080";

// axios 인스턴스
export const cusAxios = axios.create({
    baseURL : BASE_URL
    , headers : {
         "Content-Type" : "application/json"
    }
});

let isTokenRefreshing = false;
let refreshSubscribers = [];
let completeRefresh = false;
let refreshTimeout = null;

const onTokenRefreshed = (accessToken) => {
    refreshSubscribers.map((callback) => callback(accessToken));
    delRefreshSubscribers();
};

const addRefreshSubscriber = (callback) => {
    refreshSubscribers.push(callback);
};

const delRefreshSubscribers = () => {
    refreshSubscribers = [];
}; 

// refresh 쿨다운(너 의도 그대로)
const setIsTokenRefreshing = (value) => {
    isTokenRefreshing = value;

    if (value === true) {
        refreshTimeout = setTimeout(() => {
            isTokenRefreshing = false;
            completeRefresh = false;
        }, 20000);
    }
};

/**
 * =========================================================
 * ✅ 인터셉터 중복 등록 방지
 * - dev에서 저장/새로고침/리로드 시 인터셉터가 누적되면 refresh 로직이 꼬임
 * - window에 interceptor id를 저장해두고, 등록 전에 eject 한다.
 * =========================================================
 */
// const INTERCEPTOR_KEY = "__CUSAXIOS_RESPONSE_INTERCEPTOR_ID__";

// if (typeof window !== "undefined" && window[INTERCEPTOR_KEY] != null) {
//     cusAxios.interceptors.response.eject(window[INTERCEPTOR_KEY]);
//     window[INTERCEPTOR_KEY] = null;
// }

const interceptorId = cusAxios.interceptors.response.use(
    // 응답 성공 시 그대로 반환
    (response) => response

    // 에러 처리
    , async (error) => {

        // ✅ 네트워크 에러(CORS/서버다운 등)면 response가 없어서 구조분해가 터질 수 있음
        const originRequest = error?.config;
        const status = error?.response?.status;

        // originRequest 자체가 없으면 더 할 게 없음
        if (!originRequest) {
            return Promise.reject(error);
        }

        // ✅ refresh 요청 자체는 인터셉터로 refresh 처리하면 루프/꼬임 생길 수 있어서 제외
        // (이 한 줄이 “꼬여서 안 풀리는” 케이스를 많이 없애줌)
        if (originRequest?.url?.includes("/refresh")) {
            return Promise.reject(error);
        }

        if (status === 433) {

            if (!isTokenRefreshing) {

                setIsTokenRefreshing(true);

                const refreshToken = getCookie("Refresh");
                const userContext = localStorage.getItem("user_id");

                try {
                    const { data } = await cusAxios.post(
                        "/refresh"
                        , { 
                            "Refresh" : refreshToken || "wqwq"
                            , "User" :  userContext || "not exist context _UserId"
                        }
                    );

                    const { token : newAccessToken, refreshtoken : newRefreshToken } = data;

                    if (!newAccessToken || !newRefreshToken) {
                        const err = new Error("리프레시 실패");
                        err.code = "NO_TOKEN_REFRESH";
                        err.status = 434;
                        throw err;
                    }

                    setCookieAccessToken(newAccessToken);
                    setCookieRefreshToken(newRefreshToken);

                    cusAxios.defaults.headers.common["Authorization"] = `Bearer ${newAccessToken}`;
                    originRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;

                    completeRefresh = true;
                    onTokenRefreshed(newAccessToken);

                    return cusAxios(originRequest);

                } catch (e) {
                    console.error("토큰 갱신 실패:", e);
                    return Promise.reject(e);
                }

            } else {
                // refresh 진행 중이면 대기열로 보내서 refresh 완료 후 재시도
                if (completeRefresh) {
                    originRequest.headers.Authorization = getCookie("Authorization");
                    return cusAxios(originRequest);
                }

                const retryOriginalRequest = new Promise((resolve) => {
                    addRefreshSubscriber((accessToken) => {
                        originRequest.headers.Authorization = "Bearer " + accessToken;
                        resolve(cusAxios(originRequest));
                    });
                });

                return retryOriginalRequest;
            }
        }

        delRefreshSubscribers();
        return Promise.reject(error);
    }
);

// // ✅ 등록된 인터셉터 id 저장 (다음 번 로드/리로드 시 eject 하기 위해)
// if (typeof window !== "undefined") {
//     window[INTERCEPTOR_KEY] = interceptorId;
// }
