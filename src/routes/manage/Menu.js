import { useEffect, useState, useContext, useRef } from 'react';
import styles from "./Menu.module.css";
import { useNavigate } from "react-router-dom"
import { AuthContext ,authGet, authPost, authPut ,authDelete ,nonAuthGet ,getCookie } from "util"
import { Modal, Confirm } from 'components';

function Menu() {
  const [menuList, setMenuList] = useState([]);
  const [selectMenu, setSelectMenu] = useState(null); //현재 선택된 메뉴
  const { _isAuthorization, _setIsAuthorizationHandler } = useContext(AuthContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [clickedCreate, setClickedCreate] = useState(false);
  const [clickedDelete, setClickedDelete] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState("");
  const [confirmAction, setConfirmAction] = useState(() => {});

  //상세메뉴 객체
  const [formData, setFormData] = useState({
      menu_cd: null
    , menu_nm: null
    , menu_lvl: 3
    , p_cd: null
    , s_ord: 9
    , use_yn: false
    , etc: null
    , menu_url: null
  });

  //생성용 객체
  const [createData, setCreateData] = useState({
      menu_cd: null
    , menu_nm: null
    , menu_lvl: 1
    , p_cd: null
    , s_ord: 9
    , use_yn: true
    , etc: null
    , menu_url: null
  });

  const navigator = useNavigate();

  //메뉴 리스트 불러오기
  const getMenuList = async () => {
    try {
        const amenu = await authGet("http://localhost:8080/getManageMenuList" ,_setIsAuthorizationHandler ,navigator);
        // const menu = await nonAuthGet("http://localhost:8080/getManageMenuList");
        setMenuList(amenu.data);
    } catch(e) {
      console.log("에러입니다.");
    }
  }

  const postMenu = async () => {
    try {
      const post = await authPost("http://localhost:8080/postMenu", createData ,_setIsAuthorizationHandler ,navigator);
      setIsModalOpen(false);
      alert("메뉴 생성에 성공하였습니다.");
    } catch(e) {
      console.log(e);
      alert("생성 중 오류가 발생하였습니다. 서버에 문의하세요.");
    }
  }

  const putMenu = async () => {
    try {
      const post = await authPut("/putMenu", formData ,_setIsAuthorizationHandler ,navigator);
      alert("메뉴 수정에 성공하였습니다.");
    } catch(e) {
      console.log(e);
      alert("수정 중 오류가 발생하였습니다. 서버에 문의하세요.");
    }
  }

  const deleteMenu = async (menu) => {
    try {
      const post = await authDelete("/deleteMenu", menu ,_setIsAuthorizationHandler ,navigator);
      alert("메뉴 삭제에 성공하였습니다.");
      setClickedDelete(false);
    } catch(e) {
      console.log(e);
      alert("삭제 중 오류가 발생하였습니다. 서버에 문의하세요.");
    }
  }

  //페이지 접속 시 메뉴리스트불러옴
  useEffect(() => {
      getMenuList();

      // if ( getCookie("Authorization") != undefined ) { 
      //     _setIsAuthorizationHandler(true);
      // }
  }, []);

  //modal onpe메소드
  const modalOnpen = () =>{
    setClickedCreate(false);
    setIsModalOpen(true);
  }

   //컨펌 create
   const confirmOpen = (message, action) =>{
    setConfirmMessage(message);
    setConfirmAction(() => action); // 함수 저장
    setIsConfirmOpen(true);
  }

  //필수 값 체크
  const validateCreateData  = (data) =>{
    if(!data.menu_cd || data.menu_cd.trim() === ''){
      alert("메뉴 코드를 입력하세요.");
      return true;
    }
    if(!data.menu_nm || data.menu_nm.trim() === ''){
      alert("메뉴 명을 입력하세요.");
      return true;
    }
    if(!data.s_ord){ //trim == 문자열 공백 제거
      alert("정렬 순서를 입력하세요.");
      return true;
    }
  }

  //생성 액션
  const actionCreate = async () => {
    await postMenu();
    getMenuList();
  }
  //수정 액션
  const actionSave = async() => {
    await putMenu();
    getMenuList();
  }
  //삭제 액션
  const actionDelete = async(menu) => {
    await deleteMenu(menu);
    getMenuList();
  }  

 ////////////////////////////////////////////////////////////////////////////
 // 컴포넌트 event
 //////////////////////////////////////////////////////////////////////////// 
  //메뉴 클릭시
  const handleMenuClick = (menu) => {
    setSelectMenu(menu);
    setFormData(menu);
    
    //생성버튼을 누른 상태라면
    if(clickedCreate){
      //메뉴 레벨은 1~3
      if(menu.menu_lvl < 3){      
        setCreateData({
            menu_cd: null
          , menu_nm: null
          , menu_lvl: (Number(menu.menu_lvl) + 1)
          , p_cd: menu.menu_cd
          , s_ord: 9
          , use_yn: true
          , etc: null
          , menu_url: null
        });
        modalOnpen();
      } else {
        //레벨 3이상의 메뉴는 생성할 수 없습니다. 메세지 띄우기
        alert("레벨 3이상의 메뉴는 생성할 수 없습니다.");
      }
    //삭제 버튼을 누른 상태라면
    }else if(clickedDelete){
      if(menuList.some((indexMenu) => indexMenu.p_cd == menu.menu_cd)){
        alert("하위메뉴가 존재하여 삭제할 수 없습니다. 자식메뉴를 먼저 삭제 해 주세요.");
        return;
      }
      confirmOpen("삭제 하시겠습니까?", ()=>actionDelete(menu));
    }
  }

  //입력 onchange
  const handleChange = (e, changeMethod) => {
    const { name, value } = e.target;
    const method = changeMethod || setFormData;

    if(name == "use_yn"){
      method((prev) => ({ ...prev, [name]: e.target.checked ? true : false }));  
    } else{
      method((prev) => ({ ...prev, [name]: value }));  
    }
  };

  //신규 버튼 클릭
  const onCreateBtn = (e) => {
    setClickedCreate(true);
    setClickedDelete(false);
  }

  //삭제 버튼 클릭
  const onDeleteBtn = () => {
    setClickedDelete(true);
    setClickedCreate(false);
  }

  //저장 버튼 클릭
  const onSaveBtn= () => {
    //변경사항 있나 없나 체크
    if(!Object.keys(formData).some(key => formData[key] !== selectMenu[key])) {
      alert("변경사항이 없습니다.");
      return;
    }
    if(validateCreateData(formData))return;

    confirmOpen("저장 하시겠습니까?", actionSave);
  }

  //최상위 생성 버튼 onclick
  const lvl1btnOnClick = (e) => {
    //이전에 닫기 버튼 눌러서 쓰레기 데이터가 남아 있을 수 있으니 createData 초기화.
    setCreateData({
        menu_cd: null
      , menu_nm: null
      , menu_lvl: 1
      , p_cd: null
      , s_ord: 9
      , use_yn: true
      , etc: null
      , menu_url: null
    });
    modalOnpen();
  }
  
  const createModalOnClick = () => {
    //중복 체크
    if(validateCreateData(createData))return;
    if(menuList.some((menu) => menu.menu_cd == createData.menu_cd)) {
      alert("이미 존재하는 메뉴코드입니다. 다른 코드를 입력 해 주세요.");
      return;
    }
    confirmOpen("생성 하시겠습니까?", actionCreate);
  }

  const confirmDeny = () => {
    
  }

  return (
    <div className={`${ styles.Home } container`}>
      <h1 className={ styles.menu_nm }>
        메뉴관리
      </h1>
      <div className={`${styles.top_div}`}>
        <div className={`${ styles.guide_div }`}>
          <p style={{display : "inline"}}>{(clickedCreate?'생성할 메뉴의 상위코드를 선택 해 주세요.': (clickedDelete? "삭제할 메뉴를 선태 해 주세요." : ""))}</p>
          {clickedCreate && <button style={{width : "120px"}} onClick={lvl1btnOnClick} >최상위 메뉴 생성</button>}
          {clickedCreate && <button style={{width : "120px"}} onClick={()=> setClickedCreate(false)} >생성 취소</button>}
          {clickedDelete && <button style={{width : "120px"}} onClick={()=> setClickedDelete(false)} >삭제 취소</button>}
        </div>
        <div className = { `${styles.btn_div}` }>
          <button id="cerate_btn" onClick={onCreateBtn}>신규</button>
          <button onClick={onSaveBtn}>저장</button>
          <button onClick={onDeleteBtn}>삭제</button>
        </div>
      </div>
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
                // className = { `${styles.menuItem} ${styles[`treeLevel${menu.menu_lvl}`]}` }
                className = { styles.menuItem }
                onClick = { () => handleMenuClick(menu) }
              > 
              {/* <div className = { `${styles.item} ${styles.item1} ${styles[`treeLevel${menu.menu_lvl}`]}` }> */}
              <div className = { [styles.item, styles.item1].join(' ') }>
                <div className = {`${styles.innerItem} ${styles[`treeLevel${menu.menu_lvl}`]}`}>
                  {menu.menu_lvl > 1 ? `▸ ${menu.menu_cd}` : menu.menu_cd}
                </div>
              </div>
              {/* <div className = { [styles.item, styles.item1].join(' ') }>{ menu.menu_cd }</div> */}
              <div className = { [styles.item, styles.item2].join(' ') }>{ menu.menu_nm }</div>
              <div className = { [styles.item, styles.item3].join(' ') }>{ menu.menu_lvl }</div>
              </li> 
            ))}
          </ul>
        </div>
        <div className={ styles.detail } >
          <h2 className={ `${styles.menu_nm} ${ styles.detail_nm } ` }>상세보기</h2>
          <div>
            { selectMenu ? (  
              <div>
                <div className={ styles.detailItem_div }><p className={ `${styles.detailItem_heder} ${styles.header}` }>메뉴 코드</p><input readOnly={true} className={ styles.detailItem } name="menu_cd" value={ formData.menu_cd || '' } onChange={handleChange}></input></div>
                <div className={ styles.detailItem_div }><p className={ `${styles.detailItem_heder} ${styles.header}` }>메뉴 명</p><input className={ styles.detailItem} name="menu_nm" value={ formData.menu_nm || '' } onChange={handleChange} ></input></div>
                <div className={ styles.detailItem_div }><p className={ `${styles.detailItem_heder} ${styles.header}` }>메뉴 레벨</p><input readOnly={true} type="number" min="1" max="3"className={ styles.detailItem} name="menu_lvl" value={ formData.menu_lvl || 3 } onChange={handleChange} ></input></div>
                <div className={ styles.detailItem_div }><p className={ `${styles.detailItem_heder} ${styles.header}` }>상위 코드</p><input readOnly={true} className={ styles.detailItem} name="p_cd" value={ formData.p_cd || '' } onChange={handleChange} ></input></div>
                <div className={ styles.detailItem_div }><p className={ `${styles.detailItem_heder} ${styles.header}` }>정렬 순서</p><input type="number" min="0" max ="99" className={ styles.detailItem } name="s_ord" value={ formData.s_ord || 9 } onChange={handleChange}></input></div>
                <div className={ styles.detailItem_div }><p className={ `${styles.detailItem_heder} ${styles.header}` }>사용 여부</p><input type='checkbox' checked={ formData.use_yn === true } className={ styles.detailItem } name="use_yn" value={ formData.use_yn || 'false' } onChange={handleChange}></input></div>
                <div className={ styles.detailItem_div }><p className={ `${styles.detailItem_heder} ${styles.header}` }>URL</p><input className={ styles.detailItem} name="menu_url" value={ formData.menu_url || '' } onChange={handleChange} ></input></div>
                <div style ={ {height : '170px'} } className={ styles.detailItem_div }><p className={ `${styles.detailItem_heder} ${styles.header}` }>비고</p><textarea style = {{ fontSize : "15px"  }} className={ styles.detailItem } name="etc" value={ formData.etc || '' } onChange={handleChange}></textarea></div>
              </div>  
              ) : (
                <p>메뉴를 선택하세요.</p>
            ) }
          </div>
        </div>
      </div>
      <Modal isOpen={isModalOpen} >
        <h2 className={ `${styles.menu_nm} ${ styles.detail_nm } `}>메뉴 생성</h2>
        <div style={{backgroundColor : "#a9bae3"}}>
          <div className={ styles.detailItem_div }><p className={ `${styles.detailItem_heder} ${styles.header}` }>메뉴 코드</p><input className={ styles.detailItem } name="menu_cd" maxLength="8"value={ createData.menu_cd || '' } onChange={(e) => handleChange(e, setCreateData)}></input></div>
          <div className={ styles.detailItem_div }><p className={ `${styles.detailItem_heder} ${styles.header}` }>메뉴 명</p><input className={ styles.detailItem} name="menu_nm" value={ createData.menu_nm || '' } onChange={(e) => handleChange(e, setCreateData)} ></input></div>
          <div className={ styles.detailItem_div }><p className={ `${styles.detailItem_heder} ${styles.header}` }>메뉴 레벨</p><input readOnly={true} type="number" min="1" max="3"className={ styles.detailItem} name="menu_lvl" value={ createData.menu_lvl || 3 } onChange={(e) => handleChange(e, setCreateData)} ></input></div>
          <div className={ styles.detailItem_div }><p className={ `${styles.detailItem_heder} ${styles.header}` }>상위 코드</p><input readOnly={true} className={ styles.detailItem} name="p_cd" value={ createData.p_cd || '' } onChange={(e) => handleChange(e, setCreateData)} ></input></div>
          <div className={ styles.detailItem_div }><p className={ `${styles.detailItem_heder} ${styles.header}` }>정렬 순서</p><input type="number" min="0" max ="99" className={ styles.detailItem } name="s_ord" value={ createData.s_ord || 9 } onChange={(e) => handleChange(e, setCreateData)}></input></div>
          <div className={ styles.detailItem_div }><p className={ `${styles.detailItem_heder} ${styles.header}` }>사용 여부</p><input type='checkbox' checked={ createData.use_yn === true } className={ styles.detailItem } name="use_yn" value={ createData.use_yn || 'false' } onChange={(e) => handleChange(e, setCreateData)}></input></div>
          <div className={ styles.detailItem_div }><p className={ `${styles.detailItem_heder} ${styles.header}` }>URL</p><input className={ styles.detailItem} name="menu_url" value={ createData.menu_url || '' } onChange={(e) => handleChange(e, setCreateData)} ></input></div>
          <div style ={ {height : '170px'} } className={ styles.detailItem_div }><p className={ `${styles.detailItem_heder} ${styles.header}` }>비고</p><textarea style = {{ fontSize : "15px"  }} className={ styles.detailItem } name="etc" value={ createData.etc || '' } onChange={(e) => handleChange(e, setCreateData)}></textarea></div>
        </div>  
        <div style={{ textAlign : 'center', marginTop : "20px" }}>
          <button onClick={createModalOnClick}>생성</button>
          <button onClick={()=>setIsModalOpen(false)}>닫기</button>
        </div>
      </Modal>
      <Confirm isOpen={isConfirmOpen} onConfirm={confirmAction} onCancel={confirmDeny} onClose={()=>setIsConfirmOpen(false)} message={confirmMessage}>
      </Confirm>
    </div>
  );
}

export default Menu;