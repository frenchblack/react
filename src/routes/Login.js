import { useState } from "react";
import { event_prevent, onChange, cosIsNull } from "util"
import { Link, useNavigate } from "react-router-dom";
import styles from "./Login.module.css";
import axios from "axios";

function Login() {
    const [id, setId] = useState("");
    const [pw, setPw] = useState("");
    const [loginLabel, setLoginLabel] = useState("");

    const [isId, setisId] = useState(false);
    const [isPw, setIsPw] = useState(false);
    
    const navigator = useNavigate();


    const submitHandler = async (event) => {
        event_prevent(event)

        let result;
        let boby = {
            user_id : id
            , user_pw : pw
        };


        
        try {
            result = await axios.post("http://localhost:8080/authenticate", boby);
            console.log("aaa" + result);
            console.log(result);
            // alert("회원가입이 완료되었습니다.");
            // navigator("/login");
            console.log(result.data.token);

            let token = `Bearer ${result.data.token}`;
            let eAxios = axios.create({
                baseURL: '',
                headers: {
                    Authorization : token
                }
            });;
            result = await eAxios.get("http://localhost:8080/getUserMenu?user_id=aaa");
            console.log(result);
        } catch(e) {
            // alert(e.response.data.message);
            console.log(e);
        }

        try {
            
            console.log(result); 
        } catch(e) {
            
        }
    } 

    const idOnChange = (e) => {
        if ( cosIsNull(e.target.value) ) {
            setisId(false);
        } else {
            setisId(true);
        }
    }

    const pWOnChange = (e) => {        
        if ( cosIsNull(e.target.value) ) {
            setIsPw(false);
        } else {
            setIsPw(true);
        }
    }

    const moveJoin = () => {
        navigator("/join");
    }

    return (
        <div className={ [ "container", styles.login ].join(' ') }>
            <form className={ styles.login_box } onSubmit={ submitHandler }>
                <input spellCheck="false" className={ styles.id } placeholder='아이디' value={ id } onChange={ (e) => onChange(e, setId, idOnChange) } />
                <input type="password" className={ styles.pw } placeholder='비밀번호' value={ pw } onChange={ (e) => onChange(e, setPw, pWOnChange) } />
                <label><input type="checkbox" className={ styles.save_id } />아이디 저장</label>
                <div className={ styles.label_div }>
                    <label className={ styles.notice }>{ loginLabel }</label>
                </div>
                <div className={ styles.button_div }>
                    <button type="submit" className={ styles._button } disabled={ ( isId && isPw ) ? false : true } >로그인</button>
                    <button type="button" className={ styles._button } onClick={ moveJoin }>회원가입</button>
                </div>
            </form>
        </div>
    );
}

export default Login