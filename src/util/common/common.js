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