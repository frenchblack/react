import { useState, useEffect } from "react";
import { Link, useLocation, useSearchParams, useNavigate } from "react-router-dom"
import { nonAuthGet, BASE_URL } from "util";
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
  const [fileList, setFileList] = useState([]);
  const [showFileBox, setShowFileBox] = useState(false);
  const [fileBoxPos, setFileBoxPos] = useState({ x: 0, y: 0 });
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
          setBoardData(data.data.board);
          setFileList(data.data.file || []);
          console.log(data.data.file);
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
  const onClickFileButton = (e) => {
    setFileBoxPos({ x: e.clientX, y: e.clientY });
    setShowFileBox(!showFileBox);
  };
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
          <div className={styles.file_box}>
            {boardData.ex_file  && (
              <button className={`whiteBtn`} onClick={onClickFileButton}>
                첨부파일
              </button>
            )}
          </div>
          <div className={styles.info_box}>
            <div>{boardData.view_cnt}</div>
            <div>{boardData.category_nm}</div>
            <div>{boardData.write_date?.split(".")[0]?.slice(0, 16)}</div>
          </div>
        </div>
        <div className={styles.title}>
          {boardData.title}
        </div>
        <div className={styles.content} dangerouslySetInnerHTML={{ __html: boardData.content }}>
          {/* {boardData.content} */}
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
      {showFileBox && (
          <div
            className={styles.fileBox}
            style={{
              position: "absolute"
            , top: `${fileBoxPos.y + 10}px`
            , left: `${fileBoxPos.x + 10}px`
            , zIndex: 9999
            }}
          >
          {fileList.length > 0 ? (
            <table className={styles.fileTable}>
              <thead>
                <tr>
                  <th>파일명</th>
                  <th>등록일자</th>
                  <th>유형</th>
                  <th>다운로드</th>
                </tr>
              </thead>
              <tbody>
                {fileList.map(file => (
                  <tr key={file.file_id}>
                    <td>{file.origin_nm}</td>
                    <td>{file.insert_date?.slice(0, 10)}</td>
                    <td>{file.file_type}</td>
                    <td className={styles.download}>
                      <a href={`${BASE_URL}${file.file_path}`} download={file.origin_nm} target="blank">
                        다운로드
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div>첨부된 파일이 없습니다.</div>
          )}
        </div>
      )}
    </div>
  );
}

export default ViewBoard;