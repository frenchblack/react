import { useEffect, useState, useRef } from 'react';
import { Link } from "react-router-dom"
import styles from  "./Header.module.css";
import axios from "axios";

function Header() {
    const [MenuList, setMenuList] = useState([]);
    const slideRef = useRef();

    const getMenuList = async() => {
        try {
            const menu = await axios.get("http://localhost:8080/getMenuList");
            setMenuList(menu.data);
        } catch(e) {

        }
    }

    const meneMouseenter = (h) => {
        slideRef.current.style.height = h;
    }

    const meneMouseleave = () => {
        slideRef.current.style.height = "0";
    }

    useEffect(() => {
        getMenuList();
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
                    <ul style={{textAlign : "right", right: "0", paddingRight: "40px"} } className={ styles.slideItem }>
                        <li><Link to="/login">로그인</Link></li>
                        <li><Link to="/join">회원가입</Link></li>
                        <li>설정</li>
                    </ul>
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