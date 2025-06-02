import { useState, useContext, useEffect, useRef } from "react";
import { useLocation, useSearchParams } from "react-router-dom"
import { MenuContext, getMenuName, nonAuthGet, getMenuCd, utilSetParam } from "util";
import styles from "./FreeBoard.module.css";

function FreeBoard() {
  //===========================================================================
  //1.변수 선언
  //===========================================================================
  const [searchParams, setSearchParams] = useSearchParams();
  const initPage = parseInt(searchParams.get("page")) || 0;
  const initKeyword = searchParams.get("keyword") || "";
  const initType = searchParams.get("type") || "title";
  const initCategory = searchParams.get("category") || "";
  const initSubCategory = searchParams.get("subCategory") || "";

  const [boardList, setBoardList] = useState();
  const menuName = getMenuName(useContext(MenuContext).menuList, useLocation().pathname);  
  const menuCd = getMenuCd(useContext(MenuContext).menuList, useLocation().pathname);
  const [page, setPage] = useState(initPage);
  const [visiblePages, setVisiblePages] = useState([0,1,2]);
  const [hasNext, setHasNext] = useState(false);
  const [keyword, setKeyword] = useState(initKeyword);
  const sendKeyword = useRef(initKeyword); //searchParam 사용을 위해 ref사용
  const [searchType, setSearchType] = useState(initType); // 기본값: 제목  
  const [categoryList, setCategoryList] = useState([]);
  const [subCategoryList, setSubCategoryList] = useState([]);
  const [category, setCategory] = useState(initCategory);
  const [subCategory, setSubCategory] = useState(initSubCategory);
  

  //===========================================================================
  //2.내부 함수
  //===========================================================================
  useEffect(() => {
    console.log("getCategoryList start");
    if(menuCd) getCategoryList();
    console.log("getCategoryList end");
  }, [menuCd]);

  useEffect(() => {
    if(category) getSubCategoryList(category);
  }, [categoryList]);

  useEffect(() => {
    const p = parseInt(searchParams.get("page")) || 0;
    const k = searchParams.get("keyword") || "";
    const t = searchParams.get("type") || "title"; 
    const cat = searchParams.get("category") || ""; 
    const sub = searchParams.get("subCategory") || ""; 

    setPage(p);
    setKeyword(k);
    sendKeyword.current = k;
    setSearchType(t);
    setCategory(cat);
    setSubCategory(sub);

    getBoardList({ page: p , keyword : k, type : t, category : cat, subCategory : sub });
  }, [searchParams]);

  //게시판 리스트 불러오기
  const getBoardList = async ({page = 0, size = 15, keyword="", type="", category="", subCategory=""}) => {
      try {
          const menu = await nonAuthGet(`/getBoardList?page=${page}&size=${size}&keyword=${keyword}&type=${type}&category=${category}&subCategory=${subCategory}`);
          setBoardList(menu.data.content);

          const nextCount = menu.data.nextCount;
          let start = page <= 4 ? 0 : page - 5;
          let end = page <= 4 ? (page + nextCount < 9 ? page + nextCount : 9) : page + nextCount;

          const pages = [];
          for (let i = start; i <= end; i++) pages.push(i);

          setVisiblePages(pages);
          setHasNext(nextCount > 0);
      } catch(e) {

      }
  }

  //게시판 리스트 불러오기
  const getCategoryList = async () => {
      try {
          const list = await nonAuthGet(`/getCategories?menu_cd=${menuCd}`);
          setCategoryList(list.data);
      } catch(e) {

      }
  }

  const getSubCategoryList = async (p_cd) => {
      try {
          console.log(`/getSubCategories?p_cd=${p_cd}`);
          const list = await nonAuthGet(`/getSubCategories?p_cd=${p_cd}`);
          setSubCategoryList(list.data);
      } catch(e) {

      }
  }

  //검색 기능
  const handleSearch = () => {
    const word = keyword.trim()=="" ? "" : keyword;
    sendKeyword.current = word;

    utilSetParam(searchParams, setSearchParams, {      
      page: 0
    , keyword: word
    , type: searchType
    })
  }

  //===========================================================================
  //3.event 함수
  //===========================================================================  
  const selectCategory = (category_cd) => {
    setCategory(category_cd);
    getSubCategoryList(category_cd);   
    utilSetParam(searchParams, setSearchParams, {      
      page: 0
    , category: category_cd
    , subCategory : ""
    }) 
  }

  const selectSubCategory = (category_cd) => {
    setSubCategory(category_cd);
    utilSetParam(searchParams, setSearchParams, {      
      page : 0
    , subCategory : category_cd
    }) 
  }

  //===========================================================================
  //4.컴포넌트 return
  //=========================================================================== 
  return (
    <div className={`${ styles.Home } container`}>
      <h1 className={ styles.menu_nm }>
        {menuName}
      </h1>
      <div className={styles.searchBar}>
        <select value={category} onChange={e => selectCategory(e.target.value)} className={styles.searchSelect}>
          <option value="">전체</option>
          {categoryList.map(cat => (
            <option key={cat.category_cd} value={cat.category_cd}>{cat.category_nm}</option>
          ))}
        </select>
        <select value={subCategory} onChange={e => selectSubCategory(e.target.value)} className={styles.searchSelect}>
          <option value="">전체</option>
          {subCategoryList.map(sub => (
            <option key={sub.category_cd} value={sub.category_cd}>{sub.category_nm}</option>
          ))}
        </select>
      </div>
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
      <div className={styles.searchBar}>
        <select
          value={searchType}
          onChange={(e) => setSearchType(e.target.value)}
          className={styles.searchSelect}
        >
          <option value="title">제목</option>
          <option value="writer">작성자</option>
          <option value="titleContent">제목+내용</option>
        </select>

        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="검색어를 입력하세요"
          className={styles.searchInput}
          onKeyDown={(e) => {
          if (e.key === "Enter") {
            handleSearch(); // Enter 눌렀을 때 검색 실행
          }
          }}
        />

        <button onClick={() => handleSearch()} className={styles.searchButton}>
          검색
        </button>
      </div>
      <div className={styles.pagination}>
        {page > 0 && (
          <button className={styles.pageBtn} onClick={() => utilSetParam(searchParams, setSearchParams,{
                      page: Math.max(0, page - 5)
                    })}>이전</button>
        )}

        {visiblePages.map((p) => (
          <button
            key={p}
            onClick={() => utilSetParam(searchParams, setSearchParams,{
                      page: p
                    })}
            className={`${styles.pageBtn} ${p === page ? styles.activePage : ''}`}
          >
            {p + 1}
          </button>
        ))}

        {hasNext && (
          <button className={styles.pageBtn} onClick={() => utilSetParam(searchParams, setSearchParams,{
                      page: visiblePages[visiblePages.length - 1]
                    })}>다음</button>
        )}
      </div>
    </div>
  );
}

export default FreeBoard;