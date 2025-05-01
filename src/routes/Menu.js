import { useEffect, useState, useContext } from 'react';
import styles from "./Menu.module.css";
import { useNavigate } from "react-router-dom"
import { AuthContext ,authGet ,nonAuthGet ,getCookie } from "util"

function Menu() {
  const [menuList, setMenuList] = useState([]);
  const [selectMenu, setSelectMenu] = useState(null); //현재 선택된 메뉴
  const { _isAuthorization, _setIsAuthorizationHandler } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    menu_cd: '',
    menu_nm: '',
    menu_lvl: '',
    p_cd: '',
    s_ord: '',
    use_yn: ''
  });

  const navigator = useNavigate();

  //메뉴 리스트 불러오기
  const getMenuList = async () => {
    try {
        const amenu = await authGet("http://localhost:8080/getManageMenuList" ,_setIsAuthorizationHandler ,navigator);
        // const menu = await nonAuthGet("http://localhost:8080/getManageMenuList");
        setMenuList(amenu.data);
        console.log("getMenuList");
        console.log(amenu.data);
        console.log("menuList");
        console.log(menuList);
    } catch(e) {
      console.log("에러입니다.");
    }
  }

  useEffect(() => {
      console.log("Menu useEffect");
      getMenuList();

      if ( getCookie("Authorization") != undefined ) { 
          _setIsAuthorizationHandler(true);
      }
  }, []);

  //메뉴 클릭시 상세메뉴 표시
  const handleMenuClick = (menu) => {
    setSelectMenu(menu);
  }

  //입력 onchange
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className={`${ styles.Home } container`}>
      <h1 className={ styles.menu_nm }>
        메뉴관리
      </h1>
      <div className={ styles.munu_container }>
        <div className={ styles.grind_div }>
          <div className = { styles.header_div }>
            <div className = { [styles.item1, styles.header ].join(' ') }>{ '메뉴코드' }</div>
            <div className = { [styles.item2, styles.header ].join(' ') }>{ '메뉴명' }</div>
            <div className = { [styles.item3, styles.header ].join(' ') }>{ '메뉴레벨' }</div>
          </div>
          <ul className={ styles.grid_ul }>
            {menuList.map((menu) => ( 
              <li 
                key = { menu.menu_cd }  
                className = { styles.menuItem }
                onClick = { () => handleMenuClick(menu) }
              > 
              <div className = { [styles.item, styles.item1].join(' ') }>{ menu.menu_cd }</div>
              <div className = { [styles.item, styles.item2].join(' ') }>{ menu.menu_nm }</div>
              <div className = { [styles.item, styles.item3].join(' ') }>{ menu.menu_lvl }</div>
              </li>
            ))}
          </ul>
        </div>
        <div className={ styles.detail } >
          <h1 className={ styles.menu_nm }>상세보기</h1>
          <div>
            { selectMenu ? (
              <div>
                <div className={ styles.detailItem_div }><p className={ styles.detailItem }>메뉴 코드</p><input className={ styles.detailItem } name="menu_cd" value={ selectMenu.menu_cd || '' } onChange={handleChange}></input></div>
                <div className={ styles.detailItem_div }><p className={ styles.detailItem }>메뉴 명</p><input className={ styles.detailItem} name="menu_nm" value={ selectMenu.menu_nm || '' } onChange={handleChange} ></input></div>
                <div className={ styles.detailItem_div }><p className={ styles.detailItem }>메뉴 레벨</p><input className={ styles.detailItem} name="menu_lvl" value={ selectMenu.menu_lvl || '' } onChange={handleChange} ></input></div>
                <div className={ styles.detailItem_div }><p className={ styles.detailItem }>상위 코드</p><input className={ styles.detailItem} name="p_cd" value={ selectMenu.p_cd || '' } onChange={handleChange} ></input></div>
                <div className={ styles.detailItem_div }><p className={ styles.detailItem }>정렬 순서</p><input className={ styles.detailItem } name="s_ord" value={ selectMenu.s_ord || '' } onChange={handleChange}></input></div>
                <div className={ styles.detailItem_div }><p className={ styles.detailItem }>사용 여부</p><input className={ styles.detailItem } name="use_yn" value={ selectMenu.use_yn || '' } onChange={handleChange}></input></div>
              </div>  
              ) : (
                <p>메뉴를 선택하세요.</p>
            ) }
          </div>
        </div>
      </div>
    </div>
  );
}

export default Menu;