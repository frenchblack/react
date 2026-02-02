import { useState, useEffect, useContext, useRef, useMemo } from "react";
import { Link, useLocation, useSearchParams, useNavigate } from "react-router-dom"
import { MenuContext, getMenuName, getMenuCd, chkLogin, AuthContext, authGet, nonAuthGet, authPost, autMultipartPatch, BASE_URL } from "util";
import styles from "./WriteBoard.module.css";
import { Modal } from 'components';
import ReactQuill from 'react-quill';
import ImageResize from 'quill-image-resize-module-react'
import { v4 as uuidv4 } from 'uuid';
import 'react-quill/dist/quill.snow.css';
import { authPut } from "util";

function WriteBoard() {
  //===========================================================================
  //1.변수 선언
  //===========================================================================
  const [searchParams, setSearchParams] = useSearchParams();
  const pathNm = useLocation().pathname;
  const menuList = useContext(MenuContext).menuList;
  const menuName = getMenuName(menuList, pathNm);
  const menuCd = getMenuCd(menuList, pathNm);
  const paramBoard_no = searchParams.get("board_no");
  const { _isAuthorization, _setIsAuthorizationHandler } = useContext(AuthContext);
  const navigator = useNavigate();
  const [modalIsOpen, setModalIsOpen] = useState(); 
  const quillRef = useRef();
  const tempUuidRef = useRef(uuidv4()); //이미지 업로드 temp폴더 명
  const isEdit = !!paramBoard_no;

  // ReactQuill.Quill.register('modules/imageResize', ImageResize);
  if (
    ReactQuill.Quill &&
    typeof ReactQuill.Quill.register === "function" &&
    !ReactQuill.Quill?.imports?.['modules/imageResize']
  ) {
    ReactQuill.Quill.register('modules/imageResize', ImageResize);
  }
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
  const [writer, setWriter] = useState("");
  const [categoryList, setCategoryList] = useState([]);
  const [subCategoryList, setSubCategoryList] = useState([]);
  const [insertNo, setInsertNo] = useState(null);
  const [fileList, setFileList] = useState([]);
  const [loadFileList, setLoadFileList] = useState([]);
  const [deleteFileIds, setDeleteFileIds] = useState([]);




  //===========================================================================
  //2.내부 함수
  //===========================================================================
  useEffect(async() => {
    chkLogin(_setIsAuthorizationHandler, navigator); //현재 클라이언트 권한이 유효한지 서버와 통신해서 확인
    if (isEdit) await loadEditData();
    getCategoryList();
    
  }, [menuCd]);

  useEffect(() => {
  //0이면 아직 로드 전
    if(categoryList.length > 0){
      var cate = category;
      //신규 생성일 경우
      if(!category) {
        cate = categoryList[0].category_cd;
        setCategory(categoryList[0].category_cd);
      }
      //신규일 경우 첫번째 로딩, 신규가 아닐경우 category 값 로딩
      getSubCategoryList(cate);
    }
  }, [categoryList]);

  useEffect(() => {
    if(subCategoryList.length > 0) {
      setSubCategory(subCategoryList[0].category_cd);
    } else {
      // setSubCategory(null);
    }
  }, [subCategoryList]);

  //카테고리 불러오기
  const getCategoryList = async () => {
      try {
          const list = await nonAuthGet(`/getCategories?menu_cd=${menuCd}`);
          // if(list.data.length > 0)
            setCategoryList(list.data);
      } catch(e) {

      }
  }

  const getSubCategoryList = async (p_cd) => {
      try {
          const list = await nonAuthGet(`/getSubCategories?p_cd=${p_cd}`);
          // if(list.data.length > 0) {
            setSubCategoryList(list.data);
          // } else{
          //   setSubCategoryList([]);
          // }
      } catch(e) {

      }
  }

  const loadEditData = async () => {
    try {
      const result = await authGet(`/getBoradDtail?board_no=${paramBoard_no}`, _setIsAuthorizationHandler, navigator );
      console.log("load complete");
      const data = result.data.board;
      setTitle(data.title);
      setContent(data.content);
      setCategory(data.category_cd);
      setSubCategory(data.sub_category_cd); 
      setWriter(data.writer);
      setLoadFileList(result.data.file || []);

    } catch(e) {
      alert("저장된글을 불러오는데 실패하였습니다.");
      navigator(-1);
    }
  }

  const postBoard = async () => {
    const formData = parsingFormData();

    try {
        const result = await authPost(`/postBoard`, formData,  _setIsAuthorizationHandler, navigator );
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

  const updateBorad = async() => {
    const formData = parsingFormData();

    try {
        const result = await authPut(`/updateBoard`, formData,  _setIsAuthorizationHandler, navigator );
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
    navigator(`${upperPath}/ViewBoard?board_no=${insertNo}`);
  }

  const parsingFormData = () => {
    const formData = new FormData();

    const body = {
        "title" : title
      , "content" : content
      , "writer" : localStorage.getItem("user_id")
      , "category_cd" : category
      , "menu_cd" : menuCd
      , "uuid" : tempUuidRef.current
      , "board_no" : paramBoard_no
    }

    formData.append(
      "data",
      new Blob([JSON.stringify(body)], { type: "application/json" })
    );

    fileList.forEach(file => {
      formData.append("files", file);
    });

    if(isEdit) {
      formData.append(
        "deleteFiles",
        new Blob([JSON.stringify(deleteFileIds)], { type: "application/json" })
      );
    }

    return formData;
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

    if(isEdit){
      updateBorad();
    } else {
      postBoard();
    }
  };

  const changeCategory = (value) => {
    setCategory(value);
    getSubCategoryList(value);
  }

  const modalOnClose = () => {
    afterComplete();
  }

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setFileList((prev) => [...prev, ...files]);
  };

  // 파일 삭제
  const removeFile = (index) => {
    setFileList((prev) => prev.filter((_, i) => i !== index));
  };

  const removeOrifinFile = (file) => {
    if(deleteFileIds.includes(file)) {
       setDeleteFileIds((prev) => prev.filter((item) => item.file_id !== file.file_id));
    } else {
      setDeleteFileIds((prev) => [...prev, file]);
    }
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
        <div className={styles.file_container}>
          <label className={`whiteBtn ${styles.file_upload}`} htmlFor="file-upload" style={{ cursor: 'pointer' }}>
            📎 파일 첨부
          </label>
          <input id="file-upload" type="file" multiple onChange={handleFileChange} style={{ display: 'none' }} />
          <div className={styles.file_list}>
            {loadFileList.map((file) => (
              <div className={styles.flie_item} key={file.file_id}>
                <label>{file.origin_nm}</label> <button className={`${deleteFileIds.some((item) => item.file_id == file.file_id)? "blackBtn" : "whiteBtn"} ${styles.file_delete}`} onClick={() => removeOrifinFile(file)}>{deleteFileIds.some((item) => item.file_id == file.file_id) ? "삭제 취소" : "삭제"}</button>
              </div>
            ))}
            {fileList.map((file, idx) => (
              <div className={styles.flie_item} key={idx}>
                <label>{idx}_{file.name}</label> <button className={`whiteBtn ${styles.file_del}`} onClick={() => removeFile(idx)}>❌</button>
              </div>
            ))}
          </div>
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