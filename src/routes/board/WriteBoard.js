import { useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom"
import { MenuContext, getMenuName, getMenuCd } from "util";
import styles from "./WriteBoard.module.css";

function WriteBoard() {
  //===========================================================================
  //1.변수 선언
  //===========================================================================
  const [searchParams, setSearchParams] = useSearchParams();
  const pathNm = useLocation().pathname;
  const menuName = searchParams.get("menu_nm");
  const menuCd = searchParams.get("menu_cd");


  //===========================================================================
  //2.내부 함수
  //===========================================================================
  //===========================================================================
  //3.event 함수
  //===========================================================================  
  //===========================================================================
  //4.컴포넌트 return
  //=========================================================================== 
  return (
    <div className={`${ styles.Home } container`}>
      <h1 className={ styles.menu_nm }>
        <Link to={pathNm}>
          {`${menuName} 글 쓰기`}
        </Link>
      </h1>
    </div>
  );
}

export default WriteBoard;