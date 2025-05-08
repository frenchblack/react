import { useState, useContext } from "react";
import { useLocation } from "react-router-dom"
import { MenuContext, getMenuName } from "util";
import styles from "./FreeBoard.module.css";

function FreeBoard() {
  //===========================================================================
  //1.변수 선언
  //===========================================================================
  const [id, setId] = useState("");
  const menuName = getMenuName(useContext(MenuContext).menuList, useLocation().pathname);
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
      {menuName}
    </div>
  );
}

export default FreeBoard;