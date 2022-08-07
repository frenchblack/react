import styles from  "./Blogheader.module.css";
import { Link, useNavigate } from "react-router-dom"
import { useEffect, useState, useRef } from "react";

function Blogheader() {
    const [scrollposition, setScrollposition] = useState(0);
    const sideRef = useRef();

    //scrollposition update 함수
    const updateScroll = () => {
        //브라우저 따라서 될 수도 안될수도 있어서 여러개 적용
        setScrollposition( window.pageYOffset || document.documentElement.scrollTop );
    } 

    const openSidebar = () => {
        sideRef.current.style.width = "400px";
    }

    const closeSidebar = () => {
        sideRef.current.style.width = 0;
    }

    useEffect(() =>{
        window.addEventListener("scroll", updateScroll);
        //페이지 진입 후 scrollpositon 값 적용
        updateScroll();
    }, []);

    return (
        <div>
            <div className={ styles.main_header }>
                <div className={ styles.main_header_bar }>
                    <Link to="/"><h1 className={ styles.h_h1 }>Blog</h1></Link>
                    <div className={ styles.ect_div }>
                        <div className={ styles.blog_manage } onClick={ openSidebar } >블로그 관리</div>
                    </div>
                </div>
            </div>
            {/* <ul className={ styles.h_body }> */}
            <ul className={ styles.h_body + ' ' + (scrollposition < 400 ? styles.top_heder : '') }>
                <div className={ styles.home }>
                    <Link to="/"><h1 className={ styles.h_h1 }>Blog</h1></Link>
                </div>
            </ul>
            <div className={ styles.sidebar } ref={ sideRef }>
                <div className={ styles.top }>
                    <div className={ styles.close } onClick={ closeSidebar }></div>
                </div>
                <ul>
                    <li>유저 글 카테고리들 받아옴</li>
                    <li>1</li>
                    <li>1</li>
                    <li>1</li>
                </ul>
                <ul>
                    <li>설정등에 필요한 부분</li>
                    <li>1</li>
                    <li>1</li>
                    <li>1</li>
                </ul>
            </div>
        </div>
    );
}
export { Blogheader };