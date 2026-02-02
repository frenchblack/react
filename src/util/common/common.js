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

//메뉴명 찾기 (하위 경로 포함)
export const getMenuName = (menuList , url) => {
    const menu = menuList
        ?.filter((m) => m?.menu_url)
        ?.sort((a, b) => (b.menu_url.length - a.menu_url.length)) // 긴 URL 우선
        ?.find((m)=> url.startsWith(m.menu_url));

    return menu ? menu["menu_nm"] : null;
}

//메뉴cd 찾기 (하위 경로 포함)
export const getMenuCd = (menuList , url) => {
    const menu = menuList
        ?.filter((m) => m?.menu_url)
        ?.sort((a, b) => (b.menu_url.length - a.menu_url.length))
        ?.find((m)=> url.startsWith(m.menu_url));

    return menu ? menu["menu_cd"] : null;
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

// 시간 변경
export function formatRelativeTime(dateStr) {
  const now = new Date();
  const date = new Date(dateStr);
  const diff = Math.floor((now - date) / 1000); // 초 단위 차이

  if (diff < 60) {
    return `${diff}초 전`;
  } else if (diff < 60 * 60) {
    const minutes = Math.floor(diff / 60);
    return `${minutes}분 전`;
  } else if (diff < 60 * 60 * 24) {
    const hours = Math.floor(diff / 3600);
    return `${hours}시간 전`;
//   } else if (diff < 60 * 60 * 24 * 30) {
    // const days = Math.floor(diff / (3600 * 24));
    // return `${days}일 전`;
  } else {
    return dateStr;
    // return date.toLocaleDateString("ko-KR"); // 한 달 이상은 날짜로
  }
}

//클라이언트 내 로그인 중인지 확인.
export const isLogin = (context) => {
    const token = getCookie("Authorization");
    const id = localStorage.getItem("user_id");
    if(token != null && token != "" && token != undefined
        && id != null && id != "" && id != undefined
        && context
    ) {
        return true;
    }
}

export const chkLogin = async (setContext, navi) => {
    try {
        await authGet("/chkLogin", setContext , navi);
    } catch(e) {
        controlErorr(e.response.data.status, setContext, navi);
        throw e;
    }
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
    localStorage.removeItem("role_cd");
    cusAxios.defaults.headers.common["Authorization"] = ``;
}

//새로고침등으로 헤더가 사라졌을 시 쿠키에 토큰이 남아있다면 헤더에 추가.
const chkAuthorization = () => {
    if(getCookie("Authorization") != null) {
        cusAxios.defaults.headers.common["Authorization"] = getCookie("Authorization");
    }
}



//cusAxios Error처리
const controlErorr = (status, setContext, navi) => {
    if (status != 433) {
        if (status == 401) {
            comm_logout( setContext );

            alert("접근 권한이 없습니다.");

            navi("/login");
        } else if(status == 404) {
            alert("페이지를 찾을 수 없습니다.");
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

export const autMultipartPatch = async (uri, formData, setContext, navi) => {
    chkAuthorization();
    let result;
    try {
        result = await cusAxios.patch(uri, formData
            // , { data : formData
        //   , headers: {
        //         "Content-Type": "multipart/form-data"
        //     }}
        ); 
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