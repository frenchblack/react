import { useState, useContext, useEffect } from "react";
import { useLocation } from "react-router-dom"
import { MenuContext, getMenuName, nonAuthGet } from "util";
import styles from "./FreeBoard.module.css";

function FreeBoard() {
  //===========================================================================
  //1.변수 선언
  //===========================================================================
  const [boardList, setBoardList] = useState();
  const menuName = getMenuName(useContext(MenuContext).menuList, useLocation().pathname);


  //===========================================================================
  //2.내부 함수
  //===========================================================================
  useEffect(() => {
      getBoardList(); 
  }, []);

  //게시판 리스트 불러오기
  const getBoardList = async () => {
      try {
          const menu = await nonAuthGet("/getBoardList");
          setBoardList(menu.data);
      } catch(e) {

      }
  }

  //===========================================================================
  //3.event 함수
  //===========================================================================  
  //===========================================================================
  //4.컴포넌트 return
  //=========================================================================== 
  return (
    <div className={`${ styles.Home } container`}>
      <h1 className={ styles.menu_nm }>
        {menuName}
      </h1>
      <div className={styles.list_div}>
        <div className={styles.listHeader}>
          <div className={styles.listItem1}>글번호</div>
          <div className={styles.listItem2}>카테고리</div>
          <div className={styles.listItem3}>제목</div>
          <div className={styles.listItem4}>추천</div>
          <div className={styles.listItem5}>조회</div>
        </div>
        {boardList?.map((board) =>(
          <div key={board.board_no} className={styles.list}>
            <div className={styles.listItem1} >{board.board_no}</div>
            <div className={styles.listItem2} >{board.category_nm}</div>
            <div className={styles.listItem3} >{board.title}</div>
            <div className={styles.listItem4} >{board.like_cnt}</div>
            <div className={styles.listItem5} >{board.view_cnt}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default FreeBoard;