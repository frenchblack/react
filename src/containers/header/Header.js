import { useEffect, useState, useRef, useContext } from 'react';
import { Link } from "react-router-dom"
import styles from  "./Header.module.css";
import axios from "axios";
import { useCookies } from "react-cookie";
import { AuthContext } from "util"; 

function Header() {
    const [MenuList, setMenuList] = useState([]);
    
    const slideRef = useRef();
    const [cookis,setCookie, removeCookie] = useCookies("Authorization"); 
    const { _isAuthorization, _setIsAuthorizationHandler } = useContext(AuthContext);
 
    //메뉴 리스트 불러오기
    const getMenuList = async() => {
        try {
            const menu = await axios.get("http://localhost:8080/getMenuList");
            setMenuList(menu.data);
        } catch(e) {

        }
    }

    //로그아웃
    const logoutOnClick = () => {
        removeCookie("Authorization");
        _setIsAuthorizationHandler(false);
        axios.defaults.headers.common["Authorization"] = ``;
    }

    //슬라이더 드랍
    const meneMouseenter = (h) => {
        slideRef.current.style.height = h;
    }

    const meneMouseleave = () => {
        slideRef.current.style.height = "0";
    }

    useEffect(() => {
        getMenuList(); 

        if ( cookis.Authorization != undefined ) {
            _setIsAuthorizationHandler(true);
        }
    }, [])

    return (
        <div>
            <ul className={`${styles.h_body}`}>
                <div className={ styles.home }>
                    <Link to="/"><h1 className={ styles.h_h1 }>React</h1></Link>
                </div>
                <div className={ styles.menuList }>
                    {MenuList.map((menu) => ( 
                        <div className={ styles.slide } onMouseEnter={ () => { meneMouseenter("200px") } } onMouseLeave={ meneMouseleave } >
                            <li className={ [styles.h_list, 'increaseOpacity'].join(' ') } ><h4><Link to="/">{ menu.menu_nm }</Link></h4></li>
                            <ul style={{left: "0" } }className={ styles.slideItem }>
                                <li>자유게시판</li>
                                <li>자유게시판</li>
                                <li>자유게시판</li>
                                <li>자유게시판</li>
                                <li>자유게시판</li>
                            </ul>
                        </div>
                    ))}
                </div>
                <div className={ styles.slide } onMouseEnter={ () => { meneMouseenter("160px") } } onMouseLeave={ meneMouseleave } >
                    <div className={ styles.ect }></div>
                    { _isAuthorization ? (
                        <ul style={{textAlign : "right", right: "0", paddingRight: "40px"} } className={ styles.slideItem }>
                            <li>프로필</li>
                            <li onClick={ logoutOnClick }>로그아웃</li>
                            <li>내 블로그</li>
                        </ul>
                    ) : (
                        <ul style={{textAlign : "right", right: "0", paddingRight: "40px"} } className={ styles.slideItem }>
                            <li><Link to="/login">로그인</Link></li>
                            <li><Link to="/join">회원가입</Link></li>
                            <li>설정</li>
                        </ul>
                    ) }

                </div>
            </ul>
            <div className={ styles.menuSlide } ref={ slideRef }>
                {/* <ul className={ styles.slideItem }>
                    <li>로그인</li>
                    <li>회원가입</li>
                    <li>설정</li>
                </ul> */}
            </div>
        </div>
    );
}
export { Header };