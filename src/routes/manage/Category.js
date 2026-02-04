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
  
  const [temp_row_key, set_temp_row_key] = useState(null);  
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
      cancel_temp_row_if_needed();
      close_detail();
      return;
    }

    const ok = window.confirm("변경사항이 존재합니다. 취소하고 닫을까요?");
    if (!ok) return;

    cancel_temp_row_if_needed();
    close_detail();
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

    // dirty면 저장 후 진행 유도(기존 유지)
    if (is_dirty) {
      const ok = window.confirm("변경사항이 있습니다. 저장 후 신규 생성을 진행할까요?");
      if (!ok) return;

      const saved = await on_click_save();
      if (!saved) return;
    }

    //============================================================
    // 1) 신규 row 생성 (기존 규칙 유지)
    //============================================================
    const parent = selected_row;
    const new_lvl = parent.category_lvl + 1;

    // 같은 부모의 하위 row들 중 맨 아래 sort_order로 세팅
    const siblings = list.filter((r) => r.p_tree_key === parent.tree_key);
    const max_sort = siblings.length > 0
      ? Math.max(...siblings.map(r => r.sort_order ?? 0))
      : 0;

    const temp_key = `TEMP-${Date.now()}`;

    const new_row = {
        tree_key: temp_key
      , p_tree_key: parent.tree_key
      , category_cd: ""
      , category_nm: ""
      , sort_order: max_sort + 1
      , use_yn: 1
      , menu_cd: (new_lvl === 3 ? (parent.menu_cd || parent.category_cd) : null)
      , p_cd: (new_lvl === 3 ? null : parent.category_cd)
      , category_lvl: new_lvl
      , __temp__: true
    };

    //============================================================
    // 2) 리스트에 "트리 순서로" 삽입 (부모 하위들 맨 아래)
    //    - 부모의 마지막 자손 바로 뒤에 끼워넣음
    //============================================================
    set_list((prev) => {
      const parent_idx = prev.findIndex((x) => x.tree_key === parent.tree_key);
      if (parent_idx < 0) return [...prev, new_row];

      let insert_idx = parent_idx + 1;

      for (let i = parent_idx + 1; i < prev.length; i++) {
        const r = prev[i];

        // r이 parent의 자손이면 계속 내려가서 마지막 자손 뒤로
        if (is_descendant_of(r, parent.tree_key)) {
          insert_idx = i + 1;
          continue;
        }

        // 자손이 아니면 여기서 끊음
        break;
      }

      return [
          ...prev.slice(0, insert_idx)
        , new_row
        , ...prev.slice(insert_idx)
      ];
    });

    //============================================================
    // 3) 접혀있으면 자동 펼침 (부모 + 조상까지 펼쳐서 무조건 보이게)
    //============================================================
    set_expanded_set((prev) => {
      const next = new Set(prev);
      next.add(parent.tree_key);
      // parent가 보이려면 조상도 펼쳐져 있어야 하니까 조상도 추가
      get_ancestors(parent.tree_key).forEach((k) => next.add(k));
      return next;
    });

    //============================================================
    // 4) 선택 row를 신규 row로 변경 + 디테일 NEW 오픈
    //============================================================
    set_temp_row_key(temp_key);
    set_selected_row(new_row);

    set_detail_open_yn(true);
    set_grid_lock_yn(true);
    set_detail_mode("NEW");

    set_form({
        category_cd: ""
      , category_nm: ""
      , sort_order: new_row.sort_order
      , use_yn: 1
      , menu_cd: new_row.menu_cd
      , p_cd: new_row.p_cd
      , category_lvl: new_lvl
    });

    set_origin_form({
        category_cd: ""
      , category_nm: ""
      , sort_order: new_row.sort_order
      , use_yn: 1
      , menu_cd: new_row.menu_cd
      , p_cd: new_row.p_cd
      , category_lvl: new_lvl
    });
  };

  const is_descendant_of = (row, ancestor_tree_key) => {
    let p = row.p_tree_key ?? null;
    while (p) {
      if (p === ancestor_tree_key) return true;
      p = parent_map.get(p) ?? null;
    }
    return false;
  };

  const on_click_save = async () => {
    try {
      // 간단 검증 (기존 유지)
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

        await authPost("/manage/category/create", form);
      } else {
        await authPut("/manage/category/update", form);
      }

      // ✅ 성공 시 리로드
      await fetch_list();

      // ✅ 저장 완료 안내
      window.alert("저장되었습니다.");

      // ✅ NEW였으면 임시 row 키 정리
      set_temp_row_key(null);

      // ✅ 디테일 닫기(선택 해제, lock 해제까지 포함)
      close_detail();

      return true;

    } catch (e) {
      console.error(e);
      const msg = e?.response?.data?.message || "처리에 실패했습니다.";
      window.alert(msg);
      return false;
    }
  };

  const on_click_delete = async () => {
    if (!selected_row) return;

    // 프론트 1차 차단 (UX)
    if (has_children(selected_row.tree_key)) {
      window.alert("하위 카테고리가 존재하여 삭제할 수 없습니다.");
      return;
    }

    const ok = window.confirm(
      "삭제하시겠습니까?\n\n" +
      "※ 하위 게시글이 존재할 경우 삭제되지 않고\n" +
      "   해당 카테고리는 '미사용' 처리됩니다."
    );
    if (!ok) return;

    try {
      await authDelete(
        `/manage/category/delete?category_cd=${ encodeURIComponent(selected_row.category_cd) }`
      );

      await fetch_list();

      window.alert("삭제되었습니다.");   // ✅ 성공 알림

      close_detail();

    } catch (e) {
      console.error(e);

      // ✅ 서버 메시지 최대한 안전하게 추출
      const msg =
          e?.response?.data?.message
        || e?.response?.data
        || e?.message
        || "삭제할 수 없습니다.";

      window.alert(msg);
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

  const cancel_temp_row_if_needed = () => {
    if (detail_mode !== "NEW" || !temp_row_key) return;

    set_list(prev =>
      prev.filter(row => row.tree_key !== temp_row_key)
    );

    set_selected_row(null);
    set_temp_row_key(null);
  };
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
                disabled={ !can_delete_row(selected_row)
                || (selected_row ? has_children(selected_row.tree_key) : false)
                || selected_row?.__temp__ === true }
                onClick={ on_click_delete }
              >
                삭제
              </button>

              <button
                type="button"
                className={ `whiteBtn ${styles.Btn}` }
                disabled={ detail_mode === "NEW"
                || selected_row?.__temp__ === true
                || !can_create_child(selected_row) }
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
