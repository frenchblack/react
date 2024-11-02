import { useEffect, useState, useContext } from 'react';
import styles from "./Menu.module.css";
import { useNavigate } from "react-router-dom"
import { AuthContext ,authGet ,nonAuthGet ,getCookie } from "util"

function Menu() {
  const [menuList, setMenuList] = useState([]);
  const { _isAuthorization, _setIsAuthorizationHandler } = useContext(AuthContext);

  const navigator = useNavigate();

  //메뉴 리스트 불러오기
  const getMenuList = async () => {
    try {
        const menu = await authGet("http://localhost:8080/getManageMenuList" ,_setIsAuthorizationHandler ,navigator);
        // const menu = await nonAuthGet("http://localhost:8080/getManageMenuList");
        setMenuList(menu.data);
        console.log("getMenuList");
        console.log(menu.data);
        console.log("menuList");
        console.log(menuList);
    } catch(e) {

    }
  }

  useEffect(() => {
      console.log("Menu useEffect");
      getMenuList();

      if ( getCookie("Authorization") != undefined ) { 
          _setIsAuthorizationHandler(true);
      }
  }, [])

  return (
    <div className={`${ styles.Home } container`}>
      <h1 className={ styles.menu_nm }>
        메뉴관리
      </h1>
      <div>
        
      </div>
  
    </div>
  );
}

export default Menu;