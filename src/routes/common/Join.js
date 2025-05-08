import styles from "./Join.module.css"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { onChange, event_prevent, cosIsNull, nonAuthPost } from "util"

function Join() {
    const [id, setId] = useState("");
    const [pw, setPw] = useState("");
    const [rwPw, setRePw] = useState("");
    const [name, setName] = useState("");
    const [f_mail, setf_Mail] = useState("");
    const [l_mail, setl_Mail] = useState("");
    const [idLabel, setIdLabel] = useState("아이디를 입력하세요.");
    const [pwLabel, setPwLabel] = useState("비밀번호를 입력하세요.");
    const [nmLabel, setNmLabel] = useState("이름은 두 글자 이상 입력해야 합니다.");
    const navigator = useNavigate();
    
    //중복확인 여부 및 버튼 활성화에 사용
    const [chkId, setChkId] = useState(false);
    //패스워드와 재입력이 같은지 비교
    const [isSamePw, setIsSamePw] = useState(false);
    //이름 유효성검사
    const [isNm, setIsNm] = useState(false);

    //회원가입 POST
    const submitHandler = async ( event ) => {
        event_prevent(event);
        if ( !chkJoin ) return;      

        let result;
        let boby = {
            user_id : id
            , user_pw : pw
            , user_nm : name
            , mail : f_mail + l_mail
        };

        try {
            result = await nonAuthPost("/signup", boby);
            alert("회원가입이 완료되었습니다.");
            navigator("/login");
        } catch(e) {

        }
        
    }

    //중복확인 POST
    const checkId = async () => {
        if ( cosIsNull(id) ) {
            setIdLabel("아이디를 입력하세요.");
            return;
        }     
    
        let result;
        let boby = {
            user_id : id
        }

        try {
            result = await nonAuthPost("/checkId", boby);

            if ( result.data.result == 0) {
                setIdLabel("사용가능한 아이디입니다.");
                setChkId(true);
            } else {
                setIdLabel("이미 사용중인 아이디입니다. ");
            }
            
        } catch(e) {
        }
    }

    //id변경 후 함수
    const idOnChange = (e) => {
        if ( !cosIsNull(e.target.value) ) {
            setChkId(false);
            setIdLabel("아이디 중복확인이 필요합니다.");
        } else {
            setIdLabel("아이디를 입력하세요.");
        }
    }

    //패스워드 변경 후 함수
    const pWOnChange = ( e, { oValue } ) => {
        let value = e.target.value;
        setIsSamePw(false);

        if( cosIsNull(value) && cosIsNull(oValue) ) {
            setPwLabel("비밀번호를 입력하세요.");
        } else {
            if ( value == oValue ) {
                setIsSamePw(true);
                setPwLabel("비밀번호가 일치합니다.");
            } else {
                setPwLabel("비밀번호가 일치하지 않습니다.");
            }
        }

    }

    //이름 변경 후 함수
    const nmOnChange = (e) => {
        if ( e.target.value.length < 2 ) {
            setIsNm(false);
            setNmLabel("이름은 두 글자 이상 입력해야 합니다.");
        } else {
            setIsNm(true);
            setNmLabel("유효한 이름입니다.");
        }        
    }

    //회원가입 필수사항 체크 
    const chkJoin = () => {
        if ( chkId && isSamePw && isNm ) {
            return true;
        } else {
            return false;
        }
    }

    return (
        <div className={ ["container", styles.join].join(' ') }>
            <form className={ styles.join_form } onSubmit={ submitHandler }>
                <h1>회원가입</h1>
                <div className={ [styles.dv_box, 'required'].join(' ') }>
                    <div className={ styles.id_div }>
                        <input spellCheck="false" className={ styles.id } placeholder='아이디' value={ id } onChange={(e) => onChange(e, setId, idOnChange)} />
                        <button type="button" onClick={ checkId } disabled={ chkId }>중복확인</button>
                    </div> 
                    <label className={ styles.notice }>{ idLabel }</label>
                </div>
                <div className={ [styles.dv_box, 'required'].join(' ') }>
                    <input type="password" className={ styles.pw } placeholder='비밀번호' value={ pw } onChange={(e) => onChange(e, setPw, pWOnChange, { oValue : rwPw })}/>
                    <input type="password" className={ styles.pw } placeholder='비밀번호 재입력' value={ rwPw } onChange={(e) => onChange(e, setRePw, pWOnChange, { oValue : pw })}/>
                    <label className={ styles.notice }>{ pwLabel }</label>
                </div>
                <div className={ [styles.dv_box, 'required'].join(' ') }>
                    <input spellCheck="false" className={ styles.name } placeholder='이름' value={ name } onChange={(e) => onChange(e, setName, nmOnChange)}/>
                    <label className={ styles.notice }>{ nmLabel }</label>
                </div>
                <div className={ styles.dv_box }>
                    <input style={{ width : "200px" }} spellCheck="false" className={ styles.mail } placeholder='이메일' value={ f_mail }  onChange={(e) => onChange(e, setf_Mail)}/>@
                    <input style={{ width : "200px" }} spellCheck="false" className={ styles.mail } value={ l_mail } onChange={(e) => onChange(e, setl_Mail)}/>
                </div>
                <button type="submit" disabled={ !(chkId && isSamePw && isNm) } className={ styles.join_btn }>회원가입</button>
            </form>
        </div>
    );
}

export default Join;