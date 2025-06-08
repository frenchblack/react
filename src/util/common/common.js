import axios from "axios";
import { getCookie, removeCookie } from "util/common/Cookies";
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

//메뉴명 찾기
export const getMenuName = (menuList , url) => {
    const menu = menuList?.find((menu)=>menu.menu_url == url);

    return menu?menu["menu_nm"]: null;
}

//메뉴cd 찾기
export const getMenuCd = (menuList , url) => {
    const menu = menuList?.find((menu)=>menu.menu_url == url);

    return menu?menu["menu_cd"]: null;
}

//메뉴cd 찾기
export const utilSetParam = (searchParams, setSearchParams, newParams, defaultParams = {}) => {
    const sParams = new URLSearchParams(searchParams.toString());

    Object.entries(newParams).forEach(([key, value]) => {
        const defaultValue = defaultParams[key];

        if (value === undefined || value === null || value === "" || value === defaultValue) {
            sParams.delete(key); // 기본값이거나 빈 값이면 제거
        } else {
            sParams.set(key, value); // 다르면 추가
        }
    });
    setSearchParams(sParams);
}

//--------------------------------------------------------------------
//Axios
//--------------------------------------------------------------------


//로그아웃
export const comm_logout = ( setContext ) => {
    let body = {
        user_id : localStorage.getItem("user_id")
    };
    let result = nonAuthPost("/userLogout", body);

    removeCookie("Authorization");
    removeCookie("Refresh");
    setContext(false);
    localStorage.removeItem("user_id");
    cusAxios.defaults.headers.common["Authorization"] = ``;
}

//새로고침등으로 헤더가 사라졌을 시 쿠키에 토큰이 남아있다면 헤더에 추가.
const chkAuthorization = () => {
    if(getCookie("Authorization") != null) {
        cusAxios.defaults.headers.common["Authorization"] = getCookie("Authorization");
    }
}

const controlErorr = (status, setContext, navi) => {
    if (status != 433) {
        if (status == 401) {
            comm_logout( setContext );

            alert("접근 권한이 없습니다.");

            navi("/login");
        } else if(status >400 && status < 500) { 
            comm_logout( setContext );

            alert("비밀번호가 만료되었습니다.");

            navi("/login");
        } else if(status > 500) {
            alert("서버에서 오류가 발생하였습니다.");
        }
    }
}

//인증 get
export const authGet = async (uri, setContext, navi, params) => {
    let result;
    chkAuthorization();
    try {
        result = await cusAxios.get(uri, params); 
    } catch(e) {
        //433이 엑세스토큰 만료 에러, 인증되지 않은 사용자 접근은 에러코드 401암 
        controlErorr(e.response.data.status, setContext, navi);
        throw e;
    }

    return result;
}

//인증 post
export const authPost = async (uri, body, setContext, navi) => {
    chkAuthorization();
    let result;
    try {
        result = await cusAxios.post(uri, body); 
    } catch(e) {
        controlErorr(e.response.data.status, setContext, navi);
        throw e;
    }

    return result;
}

//인증 put
export const authPut = async (uri, body, setContext, navi) => {
    chkAuthorization();
    let result;
    try {
        result = await cusAxios.put(uri, body); 
    } catch(e) {
        controlErorr(e.response.data.status, setContext, navi);
        throw e;
    }

    return result;
}

//인증 put
export const authDelete = async (uri, body, setContext, navi) => {
    chkAuthorization();
    let result;
    try {
        result = await cusAxios.delete(uri, { data : body}); 
    } catch(e) {
        controlErorr(e.response.data.status, setContext, navi);
        throw e;
    }

    return result;
}

//미인증 get
export const nonAuthGet = async (uri, params) => {
    let result;

    try {
        result = await cusAxios.get(uri, params);
    } catch(e) {
        throw e;
    }

    return result;
}

//미인증 post
export const nonAuthPost = async (uri, body) => {
    let result;

    try {
        result = await cusAxios.post(uri, body);
    } catch(e) {
        throw e;     
    }
    
    return result;
}