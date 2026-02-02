import { useState, useEffect, useContext } from "react";
import { event_prevent, onChange, onChkChange, cosIsNull, AuthContext, cusAxios, nonAuthPost, getCookie, setCookie, removeCookie, setCookieAccessToken, setCookieRefreshToken } from "util"
import { Link, useNavigate } from "react-router-dom";
import styles from "./Login.module.css";

function Login() {
    const [id, setId] = useState("");
    const [pw, setPw] = useState("");
    const [saveId, setSaveId] = useState(false);
    const [loginLabel, setLoginLabel] = useState("");

    const [isId, setisId] = useState(false);
    const [isPw, setIsPw] = useState(false);
    
    const navigator = useNavigate();

    const { _setIsAuthorizationHandler } = useContext(AuthContext);

    useEffect(() => {
        if ( getCookie("saveId") != undefined ) {
            setId(getCookie("saveId"));
            setSaveId(true);
            setisId(true);
        }
    },[]);

    //로그인
    const submitHandler = async (event) => {
        event_prevent(event)  
 
        let result;
        let body = {
            user_id : id
            , user_pw : pw
        };
        
        try {
            result = await nonAuthPost("/login", body);

            setCookieAccessToken(result.data.token);
            setCookieRefreshToken(result.data.refreshtoken);
            _setIsAuthorizationHandler(true);
            localStorage.setItem('user_id', body.user_id);
            localStorage.setItem('role_cd', result.data.role_cd);
            // cusAxios.defaults.headers.common["Authorization"] = `Bearer ${result.data.token}`; //이제 인증get, post에서 체크하기때문에 없어도 됨.
            if ( saveId ) {
                setCookie("saveId", id, { maxAge : (60 * 60 * 24 * 30) });
            } else {
                removeCookie("saveId");
            }
            navigator("/");

            // result = await axios.get("http://localhost:8080/getUserMenu?user_id=aaa");
        } catch(e) {
            setLoginLabel(e.response.data.message); 
            // alert(e.response.data.message);
        }
    } 

    //ID 변경
    const idOnChange = (e) => {
        if ( cosIsNull(e.target.value) ) {
            setisId(false);
        } else {
            setisId(true);
        }
    }

    //PW 변경
    const pWOnChange = (e) => {        
        if ( cosIsNull(e.target.value) ) {
            setIsPw(false);
        } else {
            setIsPw(true);
        }
    }

    //회원가입 클릭
    const joinOnClick = () => {
        navigator("/join");
    }

    return (
        <div className={ [ "container", styles.login ].join(' ') }>
            <form className={ styles.login_box } onSubmit={ submitHandler }>
                <input spellCheck="false" className={ styles.id } placeholder='아이디' value={ id } onChange={ (e) => onChange(e, setId, idOnChange) } />
                <input type="password" className={ styles.pw } placeholder='비밀번호' value={ pw } onChange={ (e) => onChange(e, setPw, pWOnChange) } />
                <label><input type="checkbox" className={ styles.save_id } checked={ saveId } onChange={ (e) => onChkChange(e, setSaveId) }/>아이디 저장</label>
                <div className={ styles.label_div }>
                    <label className={ styles.notice }>{ loginLabel }</label>
                </div>
                <div className={ styles.button_div }>
                    <button type="submit" className={ styles._button } disabled={ ( isId && isPw ) ? false : true } >로그인</button>
                    <button type="button" className={ styles._button } onClick={ joinOnClick }>회원가입</button>
                </div>
            </form>
        </div>
    );
}

export default Login