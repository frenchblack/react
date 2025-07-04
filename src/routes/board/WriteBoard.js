import { useState, useEffect, useContext, useRef, useMemo } from "react";
import { Link, useLocation, useSearchParams, useNavigate } from "react-router-dom"
import { MenuContext, getMenuName, getMenuCd, chkLogin, AuthContext, nonAuthGet, authPost, autMultipartPatch, BASE_URL } from "util";
import styles from "./WriteBoard.module.css";
import { Modal } from 'components';
import ReactQuill from 'react-quill';
import ImageResize from 'quill-image-resize-module-react'
import { v4 as uuidv4 } from 'uuid';
import 'react-quill/dist/quill.snow.css';

function WriteBoard() {
  //===========================================================================
  //1.변수 선언
  //===========================================================================
  const [searchParams, setSearchParams] = useSearchParams();
  const pathNm = useLocation().pathname;
  const menuName = searchParams.get("menu_nm");
  const menuCd = searchParams.get("menu_cd");
  const { _isAuthorization, _setIsAuthorizationHandler } = useContext(AuthContext);
  const navigator = useNavigate();
  const [modalIsOpen, setModalIsOpen] = useState();
  const quillRef = useRef();
  const tempUuidRef = useRef(uuidv4()); //이미지 업로드 temp폴더 명

  const imageHandler = () => {
    const input = document.createElement("input");
    input.setAttribute("type", "file"); 
    input.setAttribute("accept", "image/*");
    input.click(); 

    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file || !quillRef.current) return; 

      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await autMultipartPatch(
          `/boadUpload/temp/${tempUuidRef.current}`
        , formData
        , _setIsAuthorizationHandler
        , navigator 
        );

        const imageUrl = BASE_URL + response.data.url; // ex: /images/temp/uuid/파일.jpg

        const editor = quillRef.current.getEditor();
        const range = editor.getSelection();
        editor.insertEmbed(range.index, "image", imageUrl);
      } catch (e) {
        alert("이미지 업로드에 실패했습니다.");
      }
    };
  }
  const modules = useMemo(() => {
    return {
      toolbar: {
        container : [
          [{ 'header': [1, 2, 3, false] }],
          [{ 'font': [] }],
          [{ 'size': ['small', false, 'large', 'huge'] }],
          [{ 'color': [] }, { 'background': [] }],
          ['bold', 'italic', 'underline', 'strike'],
          [{ 'align': [] }],
          [{ 'list': 'ordered' }, { 'list': 'bullet' }],
          ['link', 'image'],
          ['clean']
        ],
        handlers: {
          image: imageHandler,
        },
      },
      imageResize: {
        modules: ['Resize', 'DisplaySize'], 
      },
    };
  }, []);

  const formats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike',
    'color', 'background',
    'align', 'list', 'bullet',
    'link', 'image'
  ];

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");
  const [categoryList, setCategoryList] = useState([]);
  const [subCategoryList, setSubCategoryList] = useState([]);
  const [insertNo, setInsertNo] = useState(null);



  //===========================================================================
  //2.내부 함수
  //===========================================================================
  useEffect(() => {
    chkLogin(_setIsAuthorizationHandler, navigator); //현재 클라이언트 권한이 유효한지 서버와 통신해서 확인
    ReactQuill.Quill.register('modules/imageResize', ImageResize);
    getCategoryList();
  }, []);

  useEffect(() => {
    if(!category && categoryList.length > 0) {
      setCategory(categoryList[0].category_cd);
      getSubCategoryList(categoryList[0].category_cd);
    }
  }, [categoryList]);

  useEffect(() => {
    if(categoryList.length > 0) {
      setSubCategory(categoryList[0].category_cd);
    }
  }, [subCategoryList]);

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

  const postBoard = async () => {
    const body = {
      "title" : title
    , "content" : content
    , "writer" : localStorage.getItem("user_id")
    , "category_cd" : category
    , "menu_cd" : menuCd
    , "uuid" : tempUuidRef.current
    }

    try {
        const result = await authPost(`/postBoard`, body,  _setIsAuthorizationHandler, navigator );
        if(result.data < 0) {
          alert("새 글 등록에 실패하였습니다.");
          return;
        }
        setInsertNo(result.data);
        setModalIsOpen(true);
    } catch(e) {
      alert("새 글 등록에 실패하였습니다...");
    }
  }

  const afterComplete = () => {
    const upperPath = pathNm.substring(0, pathNm.lastIndexOf("/"));
    navigator(upperPath);
  }

 

  //===========================================================================
  //3.event 함수
  //===========================================================================  
  const handleSubmit = () => {
    if (title.trim() === "" || content.trim() === "") {
      alert("제목과 내용을 입력해주세요.");
      return;
    }

    if (subCategory == "" || subCategory == null) {
      alert("카테고리를 설정 해 주세요.");
      return;
    }

    postBoard();
  };

  const changeCategory = (value) => {
    setCategory(value);
    getSubCategoryList(value);
  }

  const modalOnClose = () => {
    afterComplete();
  }
  //===========================================================================
  //4.컴포넌트 return
  //=========================================================================== 
  return (
    <div className={`${ styles.Home } container`}>
      <h1 className={ `menu_nm` }>
        <Link to={pathNm.substring(0, pathNm.lastIndexOf("/"))}>
          {`${menuName} 글 쓰기`}
        </Link>
      </h1>
      <div className={styles.form}>
        <div className={styles.category_div} >
          <select value={category} onChange={e => changeCategory(e.target.value)} className={styles.searchSelect}>
            {categoryList.map(cat => (
              <option key={cat.category_cd} value={cat.category_cd}>{cat.category_nm}</option>
            ))}
          </select>
          <select value={subCategory} onChange={e => setSubCategory(e.target.value)} className={styles.searchSelect}>
            {subCategoryList.map(sub => (
              <option key={sub.category_cd} value={sub.category_cd}>{sub.category_nm}</option>
            ))}
          </select>
        </div>
        <input
          className={styles.title}
          type="text"
          placeholder="제목을 입력하세요"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <div className={styles.editorWrapper }>
          <ReactQuill
            ref={quillRef}
            className={styles.content}
            value={content}
            onChange={setContent}
            modules={modules}
            formats={formats}
            placeholder="내용을 입력하세요"
          />
        </div>
        <div className={styles.buttonBox}>
          <button className={`blackBtn ${styles.create}`} onClick={handleSubmit}>
            등록
          </button>
        </div>
      </div>
      <Modal isOpen={modalIsOpen}>
        <p className={styles.modal_text}>
          글 작성에 성공 하였습니다.
        </p>
        <div className={styles.modal_div}>
          <button className={`blackBtn ${styles.madalBtn}`} onClick={modalOnClose}>확인</button>
        </div>
      </Modal>
    </div>
  );
}

export default WriteBoard;