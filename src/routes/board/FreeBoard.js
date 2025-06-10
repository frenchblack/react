import { useState, useContext, useEffect, useRef } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom"
import { MenuContext, getMenuName, nonAuthGet, getMenuCd, utilSetParam,AuthContext, isLogin } from "util";
import styles from "./FreeBoard.module.css";

function FreeBoard() {
  //===========================================================================
  //1.변수 선언
  //===========================================================================
  const defaultBoardParams = {
    page: 0
 ,  size: 15
 ,  keyword: ""
 ,  type: ""
 ,  category: ""
 ,  subCategory: ""
 ,  sort : ""
 ,  period : ""
  };
  const [searchParams, setSearchParams] = useSearchParams();
  const initPage = parseInt(searchParams.get("page")) || defaultBoardParams["page"];
  const initKeyword = searchParams.get("keyword") || defaultBoardParams["keyword"];
  const initType = searchParams.get("type") || defaultBoardParams[""];
  const initCategory = searchParams.get("category") || defaultBoardParams["category"];
  const initSubCategory = searchParams.get("subCategory") || defaultBoardParams["subCategory"];
  const initSort = searchParams.get("sort") || defaultBoardParams["sort"];
  const initPeriod = searchParams.get("period") || defaultBoardParams["period"];


  const [boardList, setBoardList] = useState();
  const pathNm = useLocation().pathname;
  const menuName = getMenuName(useContext(MenuContext).menuList, pathNm);  
  const menuCd = getMenuCd(useContext(MenuContext).menuList, pathNm);
  const {_isAuthorization} = useContext(AuthContext);
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
  const [sort, setSort] = useState(initSort);  // 최신순
  const [period, setPeriod] = useState(initPeriod);  // 24시간

  //===========================================================================
  //2.내부 함수
  //===========================================================================
  useEffect(() => {
    // if(menuCd) getCategoryList();
    getCategoryList();
  }, [menuCd]);

  useEffect(() => {
    if(category) getSubCategoryList(category);
  }, [categoryList]);

  useEffect(() => {
    if (!menuCd) return;

    const p = parseInt(searchParams.get("page")) || defaultBoardParams["page"];
    const k = searchParams.get("keyword") || defaultBoardParams["keyword"];
    const t = searchParams.get("type") || defaultBoardParams["type"]; 
    const cat = searchParams.get("category") || defaultBoardParams["category"]; 
    const sub = searchParams.get("subCategory") || defaultBoardParams["subCategory"]; 
    const sor = searchParams.get("sort") || defaultBoardParams["sort"];
    const per = searchParams.get("period") || defaultBoardParams["period"];

    setPage(p);
    setKeyword(k);
    sendKeyword.current = k;
    setSearchType(t);
    setCategory(cat);
    setSubCategory(sub);
    setSort(sor);
    setPeriod(per);

    getBoardList({ page: p , keyword : k, type : t, category : cat, subCategory : sub, sort : sor, period : per});
  }, [searchParams, menuCd]);

  //게시판 리스트 불러오기
  const getBoardList = async (params = {}) => {
    //기본값 따라 셋팅
    const { page, size, keyword, type, category, subCategory, sort, period } = {
      ...defaultBoardParams,
      ...params
    };

    const query = new URLSearchParams();
    query.set("menu_cd", menuCd);
    if (page !== undefined) query.set("page", page);
    if (size !== undefined) query.set("size", size);
    if (keyword) query.set("keyword", keyword);
    if (type) query.set("type", type);
    if (category) query.set("category", category);
    if (subCategory) query.set("subCategory", subCategory);
    if (sort) query.set("sort", sort);
    if (period) query.set("period", period);

    try {
        const menu = await nonAuthGet(`/getBoardList?${query.toString()}`);
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

  //카테고리 불러오기
  const getCategoryList = async () => {
      try {
          const list = await nonAuthGet(`/getCategories?menu_cd=${menuCd}`);
          setCategoryList(list.data);
      } catch(e) {

      }
  }

  const getSubCategoryList = async (p_cd) => {
      try {
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
    , type: word ? searchType || "title" : ""
    }, defaultBoardParams)
  } //type: word ? searchType || "title" : "" 페이지에 처음 들어왔을 시 select를 안건드리면 searchType이 ""라서 검색이 안되는 문제를 위해

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
    }, defaultBoardParams) 
  }

  const selectSubCategory = (category_cd) => {
    setSubCategory(category_cd);
    utilSetParam(searchParams, setSearchParams, {      
      page : 0
    , subCategory : category_cd
    }, defaultBoardParams) 
  }

  const selectSort = (sort) => {
    setSort(sort);
    utilSetParam(searchParams, setSearchParams, {      
      page : 0
    , sort : sort
    , period : sort ? ( period ? period : "1d" ) : ""
    }, defaultBoardParams) 
  }

  const selectPeriod = (period) => {
    setPeriod(period);
    utilSetParam(searchParams, setSearchParams, {      
      page : 0
    , period : period
    }, defaultBoardParams) 
  }

  //===========================================================================
  //4.컴포넌트 return
  //=========================================================================== 
  return (
    <div className={`${ styles.Home } container`}>
      <h1 className={ styles.menu_nm }>
        <Link to={pathNm}>
          {menuName}
        </Link>
      </h1>
      <div style={{marginBottom : "5px"}} className={styles.searchBar}>
        <div className={styles.cate_div}>
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
        <div className={styles.sort_div}>
          { (sort === "popular" || sort === "vote") && 
            <select className={styles.searchSelect} value={period} onChange={e => selectPeriod(e.target.value)}>
              <option value="1d">24시간</option>
              <option value="7d">일주일</option>
              <option value="1m">한 달</option>
            </select>
          }
          <select className={styles.searchSelect} value={sort} onChange={e => selectSort(e.target.value)}>
            <option value="">최신순</option>
            <option value="popular">조회순</option>
            <option value="vote">추천순</option>
          </select>
        </div>
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
        <div className={styles.searchBox}>
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
        {isLogin(_isAuthorization) &&
        <Link to= {`${pathNm}/WriteBoard?menu_cd=${menuCd}&menu_nm=${menuName}`} className={`blackLink ${styles.writeBtn}`} >
            글 쓰기
        </Link>
        }
      </div>
      <div className={styles.pagination}>
        {page > 0 && (
          <button className={styles.pageBtn} onClick={() => utilSetParam(searchParams, setSearchParams,{
                      page: Math.max(0, page - 5)
                    }, defaultBoardParams)}>이전</button>
        )}

        {visiblePages.map((p) => (
          <button
            key={p}
            onClick={() => utilSetParam(searchParams, setSearchParams,{
                      page: p
                    }, defaultBoardParams)}
            className={`${styles.pageBtn} ${p === page ? styles.activePage : ''}`}
          >
            {p + 1}
          </button>
        ))}

        {hasNext && (
          <button className={styles.pageBtn} onClick={() => utilSetParam(searchParams, setSearchParams,{
                      page: visiblePages[visiblePages.length - 1]
                    }, defaultBoardParams)}>다음</button>
        )}
      </div>
    </div>
  );
}

export default FreeBoard;