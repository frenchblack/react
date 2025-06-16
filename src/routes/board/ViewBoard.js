import { useState, useEffect } from "react";
import { Link, useLocation, useSearchParams, useNavigate } from "react-router-dom"
import { nonAuthGet } from "util";
import styles from "./ViewBoard.module.css";

function ViewBoard() {
  //===========================================================================
  //1.변수 선언
  //===========================================================================
  const [searchParams, setSearchParams] = useSearchParams();
  const pathNm = useLocation().pathname;
  const menuName = searchParams.get("menu_nm");
  const menuCd = searchParams.get("menu_cd");
  const board_no = searchParams.get("board_no");
  const upPath = pathNm.substring(0, pathNm.lastIndexOf("/"));
  const navigator = useNavigate();
  const prevPath = sessionStorage.getItem("prevPath");

  const [boardData, setBoardData] = useState({});
  //===========================================================================
  //2.내부 함수
  //===========================================================================
  useEffect(() => {
    if(board_no) viewBoard();   
  }, [board_no]);
  
  //카테고리 불러오기
  const viewBoard = async () => {
      try {
          const data = await nonAuthGet(`/viewBoard?board_no=${board_no}`);
          setBoardData(data.data);
          console.log(data.data);
          if(data.data == null || data.data == undefined || data.data == "" || data.data < 0) {
            alert("게시물이 존재하지 않습니다.");
          }
          
      } catch(e) {
          alert("게시물을 불러오지 못 했습니다.");
          navigator(upPath);
      }
  }
  //===========================================================================
  //3.event 함수
  //=========================================================================== 
  const onClickToList = () => {
    try {
      if (prevPath === upPath) {
        navigator(-1); // 뒤로가기
      } else {
        navigator(upPath); // ex: /freeBoard
      }
    } catch {
      navigator(upPath);
    }
  }
  //===========================================================================
  //4.컴포넌트 return
  //=========================================================================== 
  return (
    <div className={`${ styles.Home } container`}>
      <h1 className={ `menu_nm` }>
        <Link to={ upPath }>
          {`${menuName}`}
        </Link>
      </h1>
      <div className={styles.detail_div}>
        <div className={styles.info_header}>
          <div>
            {boardData.view_cnt}
          </div>
          <div>
            {boardData.category_nm}
          </div>
          <div>
            {boardData.write_date?.split(".")[0]?.slice(0, 16)}
          </div>
        </div>
        <div className={styles.title}>
          {boardData.title}
        </div>
        <div className={styles.content}>
          {boardData.content}
        </div>
      </div>
      <div className={styles.like_div}>
        {`추천 : ${boardData.like_cnt}`}
      </div>
      <div className={styles.list_div}>
        <button className={`whiteBtn ${styles.toListBtn}`} onClick={onClickToList}>
          목록으로
        </button>
      </div>
    </div>
  );
}

export default ViewBoard;