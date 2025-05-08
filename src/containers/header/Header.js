import { useEffect, useState, useRef, useContext } from 'react';
import { Link, useNavigate } from "react-router-dom"
import styles from  "./Header.module.css";
import { AuthContext, getCookie, nonAuthGet, authGet, comm_logout } from "util"; 

function Header() {
    const [menuList, setMenuList] = useState([]);
    const [childMenuList, setChildMenuList] = useState([]);
    
    
    const slideRef = useRef();
    const { _isAuthorization, _setIsAuthorizationHandler } = useContext(AuthContext);

    const navigator = useNavigate();
 
    //메뉴 리스트 불러오기
    const getMenuList = async () => {
        try {
            const menu = await nonAuthGet("/getMenuList");
            setMenuList(menu.data);
        } catch(e) {

        }
    }

    const getChildMenuList = async () => {
        try {
            const menu = await nonAuthGet("/getChildMenuList");
            return menu.data;
        } catch(e) {

        }
    }

    useEffect(() => {
        getMenuList(); 

        if ( getCookie("Authorization") != undefined ) { 
            _setIsAuthorizationHandler(true);
        }
    }, [])

    useEffect(async() => {
        const childObj = {};
        const childList = await getChildMenuList();
        menuList
          ?.forEach(menu => {
            const parent = menu.menu_cd; 
            if (!childObj[parent]) {
                childObj[parent] = [];
            }

            childObj[parent].push(...childList?.filter((child)=>child.p_cd == parent));
          });
        
        setChildMenuList(childObj);
      }, [menuList]);

    //로그아웃
    const logoutOnClick = async () => {
        comm_logout(_setIsAuthorizationHandler);
        
        alert("로그아웃 되었습니다.");

        navigator("/login");
    }

    //슬라이더 드랍
    const meneMouseenter = (h) => {
        slideRef.current.style.height = h;
    }

    const meneMouseleave = () => { 
        slideRef.current.style.height = "0";
    }

    return (
        <div>
            <ul className={`${styles.h_body}`}>
                <div className={ styles.home }>
                    <Link to="/"><h1 className={ styles.h_h1 }>React</h1></Link>
                </div>
                <div className={ styles.menuList }>

                    
                    {menuList.map((menu) => ( 
                        <div className={ styles.slide } onMouseEnter={ () => { meneMouseenter("200px") } } onMouseLeave={ meneMouseleave } >
                            {/* ------------lvl1--------------- */}
                            <li key={ menu.menu_cd } className={ [styles.h_list, 'increaseOpacity'].join(' ') } ><h4><Link to="/">{ menu.menu_nm }</Link></h4></li>
                            <ul style={{left: "0" } }className={ styles.slideItem }>
                                {/* ------------lvl2--------------- */}
                                {childMenuList[menu.menu_cd]?.map( (child)=>(
                                    <li key={child.menu_cd}><Link to={child.menu_url || ''}>{child.menu_nm}</Link></li>
                                    // <li key={child.menu_cd}>{child.menu_nm}</li>
                                ))}
                                
                            </ul>
                        </div>
                    ))}
                </div>
                <div className={ styles.slide } onMouseEnter={ () => { meneMouseenter("160px") } } onMouseLeave={ meneMouseleave } >
                    <div className={ styles.ect }></div>
                    { _isAuthorization ? (
                        <ul style={{textAlign : "right", right: "0", paddingRight: "40px"} } className={ styles.slideItem }>
                            <li key="auth_1">프로필</li>
                            <li key="auth_2" onClick={ logoutOnClick }>로그아웃</li>
                            <li key="auth_3"><Link to={ "/blog/" + localStorage.getItem("user_id") }>내 블로그</Link></li>
                            <li key="auth_4"><Link to="/menu">메뉴관리</Link></li>
                        </ul>
                    ) : (
                        <ul style={{textAlign : "right", right: "0", paddingRight: "40px"} } className={ styles.slideItem }>
                            <li key="nonauth_1"><Link to="/login">로그인</Link></li>
                            <li key="nonauth_2"><Link to="/join">회원가입</Link></li>
                            <li key="nonauth_3">설정</li>
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