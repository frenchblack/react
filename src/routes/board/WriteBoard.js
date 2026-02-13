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
  const quillRef = useRef();
  const tempUuidRef = useRef(uuidv4()); //이미지 업로드 temp폴더 명
  const isEdit = !!paramBoard_no;

  //===========================================================================
  // ✅ 썸네일 팝업 변수
  //===========================================================================
  // 서버가 저장해둔 현재 썸네일 URL (자동 첫이미지 or null)
  const [thumb_current_url, set_thumb_current_url] = useState(null);
  const [thumb_current_blob_url, set_thumb_current_blob_url] = useState(null); // 표시용 blob

  // 팝업 오픈/대상 게시글
  const [thumb_modal_open_yn, set_thumb_modal_open_yn] = useState(false);
  const [thumb_board_no, set_thumb_board_no] = useState(null);

  // 사용자 선택 후보
  const [thumb_mode, set_thumb_mode] = useState("KEEP"); // KEEP | NONE | FILE
  const [thumb_file, set_thumb_file] = useState(null);
  const [thumb_file_preview, set_thumb_file_preview] = useState(null);

  const thumb_file_ref = useRef(null);

  const file_pick_prev_mode_ref = useRef("KEEP");
  const file_pick_inflight_ref = useRef(false);

  

  if (
    ReactQuill.Quill &&
    typeof ReactQuill.Quill.register === "function" &&
    !ReactQuill.Quill?.imports?.['modules/imageResize']
  ) {
    ReactQuill.Quill.register('modules/imageResize', ImageResize);
  }

  //===========================================================================
  // ✅ 이미지 리사이즈(가로/세로) 값 유지용 attributor 등록
  //===========================================================================
  if (!ReactQuill.Quill?.imports?.['formats/width']) {
    const Parchment = ReactQuill.Quill.import('parchment');

    const WidthStyle = new Parchment.Attributor.Style(
      'width'
      , 'width'
      , { scope: Parchment.Scope.INLINE }
    );

    const HeightStyle = new Parchment.Attributor.Style(
      'height'
      , 'height'
      , { scope: Parchment.Scope.INLINE }
    );

    ReactQuill.Quill.register(WidthStyle, true);
    ReactQuill.Quill.register(HeightStyle, true);
  }

  //===========================================================================
  //2.내부 함수
  //===========================================================================

  const extract_img_src_list = (html) => {
    try {
      const doc = new DOMParser().parseFromString(html || "", "text/html");
      const imgs = Array.from(doc.querySelectorAll("img"));
      return imgs
        .map((img) => img.getAttribute("src"))
        .filter((src) => !!src);
    } catch (e) {
      return [];
    }
  }

  const open_thumb_modal = async (board_no, thumb_url) => {
    set_thumb_board_no(board_no);
    set_thumb_current_url(thumb_url ?? null);

    // ✅ 이전 blob URL 해제
    if (thumb_current_blob_url) URL.revokeObjectURL(thumb_current_blob_url);

    // ✅ 서버 썸네일을 한 번만 받아서 blob으로 보관
    let blob_url = null;
    if (thumb_url) {
      blob_url = await build_blob_url_from_server(thumb_url);
    }
    set_thumb_current_blob_url(blob_url);

    set_thumb_mode("KEEP");

    // 파일 선택 초기화
    if (thumb_file_preview) URL.revokeObjectURL(thumb_file_preview);
    set_thumb_file(null);
    set_thumb_file_preview(null);

    set_thumb_modal_open_yn(true);
  }

  const go_detail = (board_no) => {
    const upperPath = pathNm.substring(0, pathNm.lastIndexOf("/"));
    navigator(`${upperPath}/ViewBoard?board_no=${board_no}`);
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

        const imageUrl = BASE_URL + encodeURI(response.data.url); // ex: /images/temp/uuid/파일.jpg

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
        container: [
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
    'link', 'image',
    'width', 'height'
  ];

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  // ✅ 상위/하위 네이밍 교체
  const [pCategory, setPCategory] = useState("");     // 상위 (기존 category)
  const [category, setCategory] = useState("");       // 하위(저장값) (기존 subCategory)

  const [writer, setWriter] = useState("");

  // ✅ 리스트 네이밍 교체
  const [pCategoryList, setPCategoryList] = useState([]); // 상위 리스트 (기존 categoryList)
  const [categoryList, setCategoryList] = useState([]);   // 하위 리스트 (기존 subCategoryList)

  const [fileList, setFileList] = useState([]);
  const [loadFileList, setLoadFileList] = useState([]);
  const [deleteFileIds, setDeleteFileIds] = useState([]);

  useEffect(async () => {
    chkLogin(_setIsAuthorizationHandler, navigator); //현재 클라이언트 권한이 유효한지 서버와 통신해서 확인
    if (isEdit) await loadEditData();
    getPCategoryList();
  }, [menuCd]);

  // ✅ 상위 로딩되면: 기본 상위 세팅 + 하위 불러오기
  useEffect(() => {
    if (pCategoryList.length > 0) {
      let pCate = pCategory;

      // 신규 생성일 경우
      if (!pCategory) {
        pCate = pCategoryList[0].category_cd;
        setPCategory(pCategoryList[0].category_cd);
      }

      getCategoryList(pCate);
    }
  }, [pCategoryList]);

  // ✅ 하위 로딩되면: 신규/상위 변경시 기본 하위 세팅
  useEffect(() => {
    if (categoryList.length > 0) {
      // 수정모드에서 loadEditData로 category(하위)가 이미 세팅된 경우엔 유지
      // 신규/상위 변경 시엔 첫번째 하위로 세팅
      if (!isEdit || !category) {
        setCategory(categoryList[0].category_cd);
      }
    } else {
      // 하위가 아예 없는 상위라면 category 비워둠(저장 막기)
      setCategory("");
    }
  }, [categoryList]);

  // ✅ 상위 카테고리 불러오기
  const getPCategoryList = async () => {
    try {
      const list = await nonAuthGet(`/getCategories?menu_cd=${menuCd}`);
      setPCategoryList(list.data || []);
    } catch (e) {

    }
  }

  // ✅ 하위 카테고리 불러오기 (p_category_cd 기준)
  const getCategoryList = async (p_category_cd) => {
    try {
      const list = await nonAuthGet(`/getSubCategories?p_cd=${p_category_cd}`);
      setCategoryList(list.data || []);
    } catch (e) {

    }
  }

  // ✅ 수정 데이터 로드
  const loadEditData = async () => {
    try {
      const result = await authGet(`/getBoradDtail?board_no=${paramBoard_no}`, _setIsAuthorizationHandler, navigator);
      const data = result.data.board;

      setTitle(data.title);
      setContent(data.content);

      setPCategory(data.p_category_cd);
      setCategory(data.category_cd);

      setWriter(data.writer);
      setLoadFileList(result.data.file || []);
    } catch (e) {
      alert("저장된글을 불러오는데 실패하였습니다.");
      navigator(-1);
    }
  }

  const postBoard = async () => {
    const formData = parsingFormData();

    try {
      const result = await authPost(`/postBoard`, formData, _setIsAuthorizationHandler, navigator);

      // ✅ 이제 result.data는 {board_no, thumb_url}
      if (!result.data || result.data.board_no <= 0) {
        alert("새 글 등록에 실패하였습니다.");
        return;
      }

      open_thumb_modal(result.data.board_no, result.data.thumb_url);
    } catch (e) {
      alert("새 글 등록에 실패하였습니다...");
    }
  }

  const updateBorad = async () => {
    const formData = parsingFormData();

    try {
      const result = await authPut(`/updateBoard`, formData, _setIsAuthorizationHandler, navigator);

      if (!result.data || result.data.board_no <= 0) {
        alert("글 수정에 실패하였습니다.");
        return;
      }

      open_thumb_modal(result.data.board_no, result.data.thumb_url);
    } catch (e) {
      alert("글 수정에 실패하였습니다...");
    }
  }

  const parsingFormData = () => {
    const formData = new FormData();

    const body = {
        "title" : title
      , "content" : content
      , "writer" : localStorage.getItem("user_id")
      , "p_category_cd" : pCategory
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

    if (isEdit) {
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

    // ✅ 하위(leaf) 없으면 저장 막기
    if (category === "" || category == null) {
      alert("카테고리를 설정 해 주세요.");
      return;
    }

    if (isEdit) {
      updateBorad();
    } else {
      postBoard();
    }
  };

  // ✅ 상위 변경 시: 상위 상태 변경 + 하위 목록 재조회
  const changePCategory = (value) => {
    setPCategory(value);
    setCategory("");          // 상위 바뀌면 하위 선택 초기화(안전)
    getCategoryList(value);
  }

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setFileList((prev) => [...prev, ...files]);
  };

  const removeFile = (index) => {
    setFileList((prev) => prev.filter((_, i) => i !== index));
  };

  const removeOrifinFile = (file) => {
    if (deleteFileIds.includes(file)) {
      setDeleteFileIds((prev) => prev.filter((item) => item.file_id !== file.file_id));
    } else {
      setDeleteFileIds((prev) => [...prev, file]);
    }
  }

  //===========================================================================
  // ✅ 썸네일 팝업 액션
  //===========================================================================

  const select_thumb_file = (file) => {
    if (!file) return;

    // 이전 preview revoke
    if (thumb_file_preview) URL.revokeObjectURL(thumb_file_preview);

    const preview = URL.createObjectURL(file);

    set_thumb_mode("FILE");
    set_thumb_file(file);
    set_thumb_file_preview(preview);
  }

  const confirm_thumb = async () => {
    if (!thumb_board_no) return;

    // KEEP: 서버 자동 썸네일 유지 -> 호출 없음
    if (thumb_mode === "KEEP") {
      go_detail(thumb_board_no);
      return;
    }

    // NONE: 서버에 null 처리
    if (thumb_mode === "NONE") {
      try {
        await authPost(
          `/updateThumb`
          , { board_no: thumb_board_no }
          , _setIsAuthorizationHandler
          , navigator
        );
        go_detail(thumb_board_no);
      } catch (e) {
        alert("썸네일 저장에 실패했습니다.");
      }
      return;
    }

    // FILE: 확인 시에만 업로드
    if (thumb_mode === "FILE") {
      if (!thumb_file) {
        alert("썸네일 파일을 선택해줘.");
        return;
      }

      const formData = new FormData();
      formData.append("board_no", thumb_board_no);
      formData.append("thumb_file", thumb_file);

      try {
        await autMultipartPatch(
          `/updateThumb`
          , formData
          , _setIsAuthorizationHandler
          , navigator
        );
        go_detail(thumb_board_no);
      } catch (e) {
        alert("썸네일 업로드에 실패했습니다.");
      }
      return;
    }
  }

  const to_img_src = (url) => {
    if (!url) return null;

    // 이미 절대경로면 그대로
    if (url.startsWith("http://") || url.startsWith("https://")) return url;

    // 상대경로면 BASE_URL 붙여서 표시
    if (url.startsWith("/")) return BASE_URL + url;

    // 예외: "/" 없이 오면 붙여줌
    return BASE_URL + "/" + url;
  }

  const build_blob_url_from_server = async (server_relative_url) => {
    if (!server_relative_url) return null;

    const full = server_relative_url.startsWith("http")
      ? server_relative_url
      : (server_relative_url.startsWith("/") ? (BASE_URL + server_relative_url) : (BASE_URL + "/" + server_relative_url));

    const res = await fetch(full, { cache: "force-cache" });
    if (!res.ok) return null;

    const blob = await res.blob();
    return URL.createObjectURL(blob);
  }

  useEffect(() => {
    return () => {
      if (thumb_current_blob_url) URL.revokeObjectURL(thumb_current_blob_url);
      if (thumb_file_preview) URL.revokeObjectURL(thumb_file_preview);
    };
  }, []); // 🔥 dependency 제거

  const open_file_picker = () => {
    // picker 열기 직전 상태 백업
    file_pick_prev_mode_ref.current = thumb_mode;
    file_pick_inflight_ref.current = true;

    // 같은 파일 다시 선택해도 onChange 뜨게 리셋
    if (thumb_file_ref.current) {
      thumb_file_ref.current.value = "";
    }

    thumb_file_ref.current?.click();

    // picker 닫히면(취소 포함) 브라우저가 다시 focus를 돌려줌
    const on_focus_back = () => {
      window.removeEventListener("focus", on_focus_back);

      // 아직 파일이 선택되지 않았다면 = 취소로 간주
      if (file_pick_inflight_ref.current) {
        file_pick_inflight_ref.current = false;

        // ✅ 현재 썸네일(자동)도 없고, 새 파일도 없으면 NONE으로
        if (!thumb_current_url && !thumb_current_blob_url) {
          set_thumb_mode("NONE");
        } else {
          // ✅ 현재 썸네일이 있으면 원래대로(KEEP)로 복귀
          set_thumb_mode(file_pick_prev_mode_ref.current || "KEEP");
        }
      }
    };

    window.addEventListener("focus", on_focus_back);
  };
  //===========================================================================
  //4.컴포넌트 return
  //===========================================================================
  return (
    <div className={`${styles.Home} container`}>
      <h1 className={`menu_nm`}>
        <Link to={pathNm.substring(0, pathNm.lastIndexOf("/"))}>
          {`${menuName} 글 쓰기`}
        </Link>
      </h1>

      <div className={styles.form}>
        <div className={styles.category_div} >
          {/* ✅ 상위 */}
          <select value={pCategory} onChange={e => changePCategory(e.target.value)} className={styles.searchSelect}>
            {pCategoryList.map(cat => (
              <option key={cat.category_cd} value={cat.category_cd}>{cat.category_nm}</option>
            ))}
          </select>

          {/* ✅ 하위(저장값) */}
          <select value={category} onChange={e => setCategory(e.target.value)} className={styles.searchSelect}>
            {categoryList.map(sub => (
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

        <div className={styles.editorWrapper}>
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
                <label>{file.origin_nm}</label>
                <button
                  className={`${deleteFileIds.some((item) => item.file_id == file.file_id) ? "blackBtn" : "whiteBtn"} ${styles.file_delete}`}
                  onClick={() => removeOrifinFile(file)}
                >
                  {deleteFileIds.some((item) => item.file_id == file.file_id) ? "삭제 취소" : "삭제"}
                </button>
              </div>
            ))}

            {fileList.map((file, idx) => (
              <div className={styles.flie_item} key={idx}>
                <label>{idx}_{file.name}</label>
                <button className={`whiteBtn ${styles.file_del}`} onClick={() => removeFile(idx)}>❌</button>
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

      {/* ========================================================================= */}
      {/* ✅ 썸네일 선택 팝업 */}
      {/* ========================================================================= */}
      <Modal isOpen={thumb_modal_open_yn}>
        <div className={styles.thumb_wrap}>
          <p className={styles.thumb_title}>썸네일 설정</p>

          <div className={styles.thumb_panel}>
            <div className={styles.thumb_col}>
              <div className={styles.thumb_label}>현재 썸네일(자동)</div>
              <div className={styles.thumb_preview}>
                {thumb_current_blob_url ? (
                  <img src={thumb_current_blob_url} alt="" />
                ) : (
                  thumb_current_url ? <img src={BASE_URL + thumb_current_url} alt="" /> : <div className={styles.thumb_no}>없음</div>
                )}
              </div>
            </div>

            <div className={styles.thumb_col}>
              <div className={styles.thumb_label}>선택된 썸네일</div>
              <div className={styles.thumb_preview}>
                {thumb_mode === "KEEP" && (
                  thumb_current_blob_url
                    ? <img src={thumb_current_blob_url} alt="" />
                    : (thumb_current_url ? <img src={BASE_URL + thumb_current_url} alt="" /> : <div className={styles.thumb_no}>없음</div>)
                )}

                {thumb_mode === "NONE" && (
                  <div className={styles.thumb_no}>없음</div>
                )}

                {thumb_mode === "FILE" && (
                  thumb_file_preview ? <img src={thumb_file_preview} alt="" /> : <div className={styles.thumb_no}>파일 선택 필요</div>
                )}
              </div>
            </div>
          </div>

          <input
            ref={thumb_file_ref}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={(e) => {
              const file = e.target.files?.[0];

              if (!file) return; // 취소는 focus-back에서 처리

              // ✅ 선택 성공이면 inflight 종료
              file_pick_inflight_ref.current = false;

              select_thumb_file(file);
            }}
          />

          <div className={styles.thumb_btn_row}>
            <button
              type="button"
              className={`${thumb_mode === "KEEP" ? "blackBtn" : "whiteBtn"}`}
              onClick={() => set_thumb_mode("KEEP")}
            >
              기본 유지
            </button>

            <button
              type="button"
              className={`${thumb_mode === "NONE" ? "blackBtn" : "whiteBtn"}`}
              onClick={() => {
                set_thumb_mode("NONE");
                // 파일 선택 초기화
                if (thumb_file_preview) URL.revokeObjectURL(thumb_file_preview);
                set_thumb_file(null);
                set_thumb_file_preview(null);
              }}
            >
              썸네일 없음
            </button>

            <button
              type="button"
              className={`${thumb_mode === "FILE" ? "blackBtn" : "whiteBtn"}`}
              onClick={open_file_picker}
            >
              새 썸네일 선택
            </button>

            <button
              type="button"
              className="blackBtn"
              onClick={confirm_thumb}
            >
              확인
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default WriteBoard;
