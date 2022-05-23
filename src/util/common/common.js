import axios from "axios";
import { removeCookie } from "util/common/Cookies";
import { cusAxios } from "util/common/CusAxios";

export const event_prevent= (event) => {
    event.preventDefault();
}

//커스텀 null체크함수
export const cosIsNull = ( x ) => {
    return (x == undefined || x == null || x == '') ? true : false;
}

//공통 onchage (이벤트, 변경할 스테이트 세터, 추가로 실행할 함수, 추가실행 함수 파라미터({}): 추가실행함수(이벤트, 파라미터{}) 형태로 들어감 )
export const onChange = (e, setter, func, funcObj) => {
    setter(e.target.value);
    
    if( !cosIsNull(func) ) {
        func(e, funcObj);
    }
}

//체크박스 change
export const onChkChange = (e, setter, func, funcObj) => {
    setter(e.target.checked);
    
    if( !cosIsNull(func) ) {
        func(e, funcObj);
    }
}

//로그아웃
export const comm_logout = ( setContext ) => {
    let body = {
        user_id : localStorage.getItem("user_id")
    };
    let result = nonAuthPost("http://localhost:8080/userLogout", body);

    removeCookie("Authorization");
    removeCookie("Refresh");
    setContext(false);
    localStorage.removeItem("user_id");
    cusAxios.defaults.headers.common["Authorization"] = ``;
}

//인증 get
export const authGet = async (uri, setContext, navi) => {
    let result;
    try {
        result = await cusAxios.get(uri); 
    } catch(e) {
        if (e.response.data.code != 433) {
            comm_logout( setContext );

            alert("비밀번호가 만료되었습니다.");

            navi("/login");
        }
        throw e;
    }

    return result;
}

//인증 post
export const authPost = async (uri, body, setContext, navi) => {
    let result;
    try {
        result = await cusAxios.post(uri, body); 
    } catch(e) {
        if (e.response.data.code != 433) {
            comm_logout( setContext );

            alert("비밀번호가 만료되었습니다.");

            navi("/login");
        }
        throw e;
    }

    return result;
}

//미인증 get
export const nonAuthGet = async (uri) => {
    let result;

    try {
        result = await axios.get(uri);
    } catch(e) {
        throw e;
    }

    return result;
}

//미인증 post
export const nonAuthPost = async (uri, body) => {
    let result;

    try {
        result = await axios.post(uri, body);
    } catch(e) {
        throw e;     
    }
    
    return result;
}