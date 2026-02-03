import { useEffect, useMemo, useState } from "react";
import styles from "./Category.module.css";
import { authGet, authDelete, authPost, authPut} from "util";

function Category() {
  //===========================================================================
  //1.변수 선언
  //===========================================================================
  const [list, set_list] = useState([]);
  const [loading, set_loading] = useState(true);
  const [error_msg, set_error_msg] = useState("");
  const [expanded_set, set_expanded_set] = useState(new Set()); // key = tree_key

  const [selected_row, set_selected_row] = useState(null);
  const [detail_open_yn, set_detail_open_yn] = useState(false);
  const [detail_mode, set_detail_mode] = useState("VIEW"); // VIEW | EDIT | NEW

  const [form, set_form] = useState({
      category_cd: ""
    , category_nm: ""
    , sort_order: 99
    , use_yn: 1
    , menu_cd: ""
    , p_cd: null
    , category_lvl: 0
  });

  const [origin_form, set_origin_form] = useState(null);
  const [grid_lock_yn, set_grid_lock_yn] = useState(false);

  const is_dirty = useMemo(() => {
    if (!origin_form) return false;
    return JSON.stringify(form) !== JSON.stringify(origin_form);
  }, [form, origin_form]);

  //===========================================================================
  //2.effect
  //===========================================================================
  useEffect(() => {
    fetch_list();
  }, []);

  //===========================================================================
  //3.내부 함수
  //===========================================================================
  const get_use_yn = (use_yn) => {
    return use_yn === 1 ? "Y" : "N";
  };

  const fetch_list = async () => {
    try {
      set_loading(true);
      set_error_msg("");

      const res = await authGet("/manage/category/manageList");
      const data = Array.isArray(res?.data) ? res.data : [];

      set_list(data);

      // 기본 펼침: lvl 1~2 펼침
      const next = new Set();
      data.forEach((row) => {
        if (row.category_lvl <= 2) next.add(row.tree_key);
      });
      set_expanded_set(next);

    } catch (e) {
      console.error(e);
      set_error_msg("카테고리 목록 조회에 실패했습니다.");
    } finally {
      set_loading(false);
    }
  };

  const open_detail = (row, mode = "VIEW") => {
    set_selected_row(row);
    set_detail_mode(mode);
    set_detail_open_yn(true);
    set_grid_lock_yn(true);

    const next_form = {
        category_cd: row?.category_cd ?? ""
      , category_nm: row?.category_nm ?? ""
      , sort_order: row?.sort_order ?? 99
      , use_yn: row?.use_yn ?? 1
      , menu_cd: row?.menu_cd ?? ""
      , p_cd: row?.p_cd ?? null
      , category_lvl: row?.category_lvl ?? 0
    };

    set_form(next_form);
    set_origin_form(next_form);
  };

  const close_detail = () => {
    set_detail_open_yn(false);
    set_grid_lock_yn(false);
    set_detail_mode("VIEW");
    set_selected_row(null);
    set_origin_form(null);
    set_form({
        category_cd: ""
      , category_nm: ""
      , sort_order: 99
      , use_yn: 1
      , menu_cd: ""
      , p_cd: null
      , category_lvl: 0
    });
  };

  const request_close_detail = () => {
    if (!is_dirty) {
      close_detail();
      return;
    }
    const ok = window.confirm("변경사항이 존재합니다. 취소하고 닫을까요?");
    if (ok) close_detail();
  };

  const on_click_row = (row) => {
    if (grid_lock_yn) return; // 디테일 열려있으면 리스트 조작 불가(요구사항)
    open_detail(row, "VIEW");
  };

  const on_click_overlay = () => {
    request_close_detail();
  };

  // 신규 가능: lvl 2,3만
  const can_create_child = (row) => {
    return row && (row.category_lvl === 2 || row.category_lvl === 3);
  };

  const toggle_expand = (tree_key) => {
    set_expanded_set((prev) => {
      const next = new Set(prev);
      if (next.has(tree_key)) next.delete(tree_key);
      else next.add(tree_key);
      return next;
    });
  };

  //===========================================================================
  //4.트리 계산(부모/자식/가시노드/라인)
  //===========================================================================
  const parent_map = useMemo(() => {
    const map = new Map();
    list.forEach((row) => {
      map.set(row.tree_key, row.p_tree_key ?? null);
    });
    return map;
  }, [list]);

  const child_map = useMemo(() => {
    const map = new Map();
    list.forEach((row) => {
      const p = row.p_tree_key ?? null;
      if (!map.has(p)) map.set(p, []);
      map.get(p).push(row);
    });
    return map;
  }, [list]);

  const has_children = (tree_key) => {
    const arr = child_map.get(tree_key);
    return Array.isArray(arr) && arr.length > 0;
  };

  const is_expanded = (tree_key) => {
    return expanded_set.has(tree_key);
  };

  const visible_list = useMemo(() => {
    const is_visible = (row) => {
      let p = row.p_tree_key ?? null;
      while (p) {
        if (!expanded_set.has(p)) return false;
        p = parent_map.get(p) ?? null;
      }
      return true;
    };

    return list.filter((row) => row.category_lvl === 1 || is_visible(row));
  }, [list, expanded_set, parent_map]);

  const get_ancestors = (tree_key) => {
    const arr = [];
    let p = parent_map.get(tree_key) ?? null;
    while (p) {
      arr.push(p);
      p = parent_map.get(p) ?? null;
    }
    return arr.reverse(); // 루트->부모
  };

  const get_sibling_info = (row) => {
    const p = row.p_tree_key ?? null;
    const siblings = child_map.get(p) || [];
    const idx = siblings.findIndex((x) => x.tree_key === row.tree_key);
    const is_last = idx === siblings.length - 1;
    return { siblings, idx, is_last };
  };

  const build_line_guides = (row) => {
    // │ ├ └ 가이드 생성
    const ancestors = get_ancestors(row.tree_key);
    const guides = [];

    for (let i = 0; i < ancestors.length; i++) {
      const anc_key = ancestors[i];
      const anc_parent = parent_map.get(anc_key) ?? null;
      const anc_siblings = child_map.get(anc_parent) || [];
      const anc_idx = anc_siblings.findIndex((x) => x.tree_key === anc_key);
      const anc_is_last = anc_idx === anc_siblings.length - 1;

      guides.push({
          type: anc_is_last ? "blank" : "pipe"
      });
    }

    const { is_last } = get_sibling_info(row);
    guides.push({
        type: is_last ? "elbow" : "tee"
    });

    return guides;
  };

  //===========================================================================
  //5.저장/신규/삭제 (API는 아래 백엔드 섹션과 맞춤)
  //===========================================================================
  const on_click_new = async () => {
    if (!selected_row) return;

    if (!can_create_child(selected_row)) {
      window.alert("신규 생성은 레벨 2, 3 노드에서만 가능합니다.");
      return;
    }

    // dirty면 저장 후 진행 유도
    if (is_dirty) {
      const ok = window.confirm("변경사항이 있습니다. 저장 후 신규 생성을 진행할까요?");
      if (!ok) return;

      const saved = await on_click_save();
      if (!saved) return;
    }

    // NEW 폼 구성 규칙 (문서 기준)
    // - lvl3 신규: 상위노드 메뉴코드 가져옴, p_cd는 null
    // - lvl4 신규: menu_cd는 null, p_cd는 상위의 category_cd (또는 상위 p_cd 규칙은 서버에서 최종 확정)
    const parent = selected_row;

    const new_lvl = parent.category_lvl + 1;
    const next = {
        category_cd: ""
      , category_nm: ""
      , sort_order: 99
      , use_yn: 1
      , category_lvl: new_lvl
      , menu_cd: (new_lvl === 3 ? parent.menu_cd || parent.category_cd : null) // 너 DB 룰에 맞게 서버에서 보정 추천
      , p_cd: (new_lvl === 3 ? null : parent.category_cd)
    };

    set_detail_mode("NEW");
    set_form(next);
    set_origin_form(next);
  };

  const on_click_save = async () => {
    try {
      // 간단 검증
      if (!form.category_nm?.trim()) {
        window.alert("카테고리명은 필수입니다.");
        return false;
      }
      if (form.sort_order === null || form.sort_order === undefined) {
        window.alert("정렬순서는 필수입니다.");
        return false;
      }

      if (detail_mode === "NEW") {
        if (!form.category_cd?.trim()) {
          window.alert("신규 생성 시 카테고리코드는 필수입니다.");
          return false;
        }

        // 코드 중복 체크(저장 전)
        const chk = await authGet(`/manage/category/checkCode?category_cd=${ encodeURIComponent(form.category_cd) }`);
        if (chk?.data?.dup_yn === 1) {
          window.alert("이미 존재하는 카테고리 코드입니다.");
          return false;
        }

        await authPost("/manage/category/create", form);
      } else {
        await authPut("/manage/category/update", form);
      }

      await fetch_list();

      // 저장 후: 다시 조회한 리스트에서 동일 key 찾아서 detail 갱신
      // (tree_key는 서버에서 고정이니 category_cd/lvl로 다시 찾는 게 안전)
      set_origin_form(form);
      set_detail_mode("VIEW");
      return true;

    } catch (e) {
      console.error(e);
      window.alert("저장에 실패했습니다.");
      return false;
    }
  };

  const on_click_delete = async () => {
    if (!selected_row) return;

    const ok = window.confirm("삭제하시겠습니까?");
    if (!ok) return;

    try {
      // 게시글 존재 여부 확인
      const has = await authGet(`/manage/category/${ encodeURIComponent(selected_row.category_cd) }/has-posts`);
      const has_posts_yn = has?.data?.has_posts_yn === 1;

      if (has_posts_yn) {
        // 글 있으면 use_yn=0 처리(요구사항)
        const ok2 = window.confirm("게시글이 존재합니다. 삭제 대신 '미사용'으로 변경할까요?");
        if (!ok2) return;

        await authPut("/manage/category/update", {
            ...form
          , use_yn: 0
        });
      } else {
        await authDelete(`/manage/category/delete?category_cd=${ encodeURIComponent(selected_row.category_cd) }`);
      }

      await fetch_list();
      close_detail();

    } catch (e) {
      console.error(e);
      window.alert("삭제 처리에 실패했습니다.");
    }
  };

  const is_menu_node = (row) => {
    return row && (row.category_lvl === 1 || row.category_lvl === 2);
  };

  const can_edit_row = (row) => {
    return row && !is_menu_node(row);
  };

  const can_delete_row = (row) => {
    return row && !is_menu_node(row);
  };

  const edit_able_yn = can_edit_row(selected_row);
  //===========================================================================
  //6.컴포넌트 return
  //===========================================================================
  return (
    <div className={`${ styles.Home } container`}>
      <h1 className={ styles.menu_nm }>
        카테고리 관리
      </h1>

      <div className={ styles.Panel }>
        <div className={ styles.HeaderRow }>
          <div className={ styles.ColToggle }>펼침</div>
          <div className={ styles.ColName }>메뉴 / 카테고리</div>
          <div className={ styles.ColCode }>코드</div>
          <div className={ styles.ColLvl }>레벨</div>
          <div className={ styles.ColUseIcon }>사용</div>
        </div>

        {loading && (
          <div className={ styles.State }>
            불러오는 중...
          </div>
        )}

        {!loading && error_msg && (
          <div className={ styles.StateError }>
            {error_msg}
          </div>
        )}

        {!loading && !error_msg && visible_list.length === 0 && (
          <div className={ styles.State }>
            데이터가 없습니다.
          </div>
        )}

        {!loading && !error_msg && visible_list.map((row) => {
          const children_yn = has_children(row.tree_key);
          const expanded_yn = is_expanded(row.tree_key);
          const guides = build_line_guides(row);

          const selected_yn = row.tree_key === selected_row?.tree_key;

          return (
            <div className={ `${ styles.DataRow } ${ selected_yn ? styles.SelectedRow : "" }` } key={ row.tree_key } onClick={() => on_click_row(row)}>

              {/* ✅ 1) 접기/펼치기 버튼이 맨 앞 */}
              <div className={ styles.ColToggle }>
                <button
                  type="button"
                  className={ styles.ToggleBtn }
                  disabled={ !children_yn }
                  onClick={ (e) => {
                    e.stopPropagation();              
                    toggle_expand(row.tree_key);
                  }}
                >
                  {children_yn ? (expanded_yn ? "-" : "+") : ""}
                </button>
              </div>

              {/* ✅ 2) 트리선은 이름에 붙게(토글 뒤에 바로) */}
              <div className={ styles.ColName }>
                <div className={ styles.NameWrap }>
                  <div className={ styles.Guides }>
                    {guides.map((g, idx) => (
                      <span
                        key={ `${ row.tree_key }-g-${ idx }` }
                        className={
                          g.type === "pipe"  ? styles.GuidePipe
                        : g.type === "tee"   ? styles.GuideTee
                        : g.type === "elbow" ? styles.GuideElbow
                        : styles.GuideBlank
                        }
                      />
                    ))}
                  </div>

                  <span className={ styles.NameText } title={ row.category_nm }>
                    {row.category_nm}
                  </span>
                </div>
              </div>

              <div className={ styles.ColCode }>{row.category_cd}</div>
              <div className={ styles.ColLvl }>{row.category_lvl}</div>

              {/* ✅ 3) 사용여부는 녹색 체크 아이콘 */}
              <div className={ styles.ColUseIcon }>
                <span
                  className={ row.use_yn === 1 ? styles.UseOn : styles.UseOff }
                  title={ row.use_yn === 1 ? "사용" : "미사용" }
                />
              </div>
            </div>
          );
        })}
      </div>
      {/* ✅ 오버레이 + 디테일 패널 */}
      {detail_open_yn && (
        <>
          <div className={ styles.Overlay } onClick={ on_click_overlay } />

          <div className={ styles.DetailPanel }>
            <div className={ styles.DetailBody }>

              <div className={ styles.FormRow }>
                <div className={ styles.FormLabel }>카테고리코드</div>
                <input
                  className={ styles.FormInput }
                  value={ form.category_cd }
                  disabled={ detail_mode !== "NEW" || !edit_able_yn }
                  onChange={ (e) => set_form((prev) => ({ ...prev, category_cd: e.target.value })) }
                />
              </div>

              <div className={ styles.FormRow }>
                <div className={ styles.FormLabel }>카테고리명</div>
                <input
                  className={ styles.FormInput }
                  value={ form.category_nm }
                  disabled={ !edit_able_yn }
                  onChange={ (e) => set_form((prev) => ({ ...prev, category_nm: e.target.value })) }
                />
              </div>

              <div className={ styles.FormRow }>
                <div className={ styles.FormLabel }>정렬순서</div>
                <input
                  className={ styles.FormInput }
                  type="number"
                  value={ form.sort_order }
                  disabled={ !edit_able_yn }
                  onChange={ (e) => set_form((prev) => ({ ...prev, sort_order: Number(e.target.value) })) }
                />
              </div>

              <div className={ styles.FormRow }>
                <div className={ styles.FormLabel }>사용여부</div>
                <select
                  className={ styles.FormInput }
                  value={ form.use_yn }
                  disabled={ !edit_able_yn }
                  onChange={ (e) => set_form((prev) => ({ ...prev, use_yn: Number(e.target.value) })) }
                >
                  <option value={1}>사용</option>
                  <option value={0}>미사용</option>
                </select>
              </div>

            </div>

            <div className={ styles.DetailFooter }>

              <button
                type="button"
                className={ `whiteBtn ${styles.Btn}` }
                disabled={ !can_delete_row(selected_row) }
                onClick={ on_click_delete }
              >
                삭제
              </button>

              <button
                type="button"
                className={ `whiteBtn ${styles.Btn}` }
                disabled={ !can_create_child(selected_row) }
                onClick={ on_click_new }
              >
                신규
              </button>

              <button
                type="button"
                className={ `whiteBtn ${styles.BtnPrimary}` }
                disabled={ !can_edit_row(selected_row) }
                onClick={ on_click_save }
              >
                저장
              </button>

              <button
                type="button"
                className={ `whiteBtn ${styles.Btn}` }
                onClick={ request_close_detail }
              >
                취소
              </button>

            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Category;
