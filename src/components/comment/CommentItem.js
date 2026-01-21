import { useState, useContext, useRef } from 'react';
import { CommentWrite } from './CommentWrite';
import { formatRelativeTime, authPost, authGet, nonAuthGet, AuthContext } from 'util';
import { useNavigate } from "react-router-dom";
import userDefault from "../../img/icon/user-photo-default.svg";
import likeImg from "../../img/icon/thumb.svg";
import styles from "./CommentItem.module.css";

function CommentItem({ comment, boardId, onUpdateReaction, onRefreshCommentList }) {
  const { _isAuthorization, _setIsAuthorizationHandler } = useContext(AuthContext);
  const navigator = useNavigate();

  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replies, setReplies] = useState([]);
  const [showReplies, setShowReplies] = useState(false);
  const [like_bounce, setLike_bounce] = useState(0);
    // ✅ 대댓글 페이징 상태
  const [reply_list, setReply_list] = useState([]);
  const [reply_paging, setReply_paging] = useState(null);
  const [reply_page, setReply_page] = useState(1);
  const reply_size = 5;

  const [reply_loading, setReply_loading] = useState(false);

  const is_reply = comment.comment_lvl === 1;

  // ===== 추가: 옵션메뉴/수정모드 =====
  const [option_open, setOption_open] = useState(false);
  const [is_edit, setIs_edit] = useState(false);
  const [edit_content, setEdit_content] = useState(comment.comment_content);

  const itemRef = useRef(null);

  const toggleReplies = () => {
    if (!showReplies) {
      // fetchReplies(comment.comment_no)
    }
    setShowReplies(!showReplies);
  };

  const onClickLike = async () => {
    if (!_isAuthorization) {
      alert("로그인한 사용자만 추천할 수 있습니다.");
      return;
    }

    const next_cd = comment.my_like_yn === 1 ? 0 : 1;

    setLike_bounce(v => v + 1);

    try {
      const res = await authPost(
        "/comment/reaction",
        {
          comment_no: comment.comment_no,
          reaction_cd: next_cd,
        }
      );

      onUpdateReaction?.(
        comment.comment_no,
        res.data.like_cnt,
        res.data.my_like_yn
      );
    } catch (e) {
      alert("추천 처리 중 오류가 발생했습니다.");
    }
  };

    const fetchReplyList = async (pageNo = 1, silent = false) => {
      if (reply_loading) return null;

      try {
        setReply_loading(true);

        const url = `/getReplyList?board_no=${boardId}&p_comment_no=${comment.comment_no}&page=${pageNo}&size=${reply_size}`;

        const res = _isAuthorization
          ? await authGet(url, _setIsAuthorizationHandler, navigator)
          : await nonAuthGet(url);

        const list = res?.data?.list ?? [];
        const paging = res?.data?.paging ?? null;

        setReply_list(list);
        setReply_paging(paging);
        setReply_page(pageNo);

        return paging; // ✅ 핵심
      } catch (e) {
        if (!silent) alert("대댓글을 불러오지 못 했습니다.");
        return null;
      } finally {
        setReply_loading(false);
      }
    }

    const onToggleReplies = async () => {
      const next = !showReplies;
      setShowReplies(next);

      if (next) {
        // ✅ 펼칠 때마다 최신 1페이지 로딩(요구사항 반영)
        await fetchReplyList(1);
      }
  }

  // ===== 추가: 수정 시작 =====
  const onClickEdit = () => {
    if (!_isAuthorization) {
      alert("로그인이 필요합니다.");
      return;
    }

    if (comment.owner_yn !== 1) {
      alert("작성자만 수정할 수 있습니다.");
      return;
    }

    if (comment.ex_del) {
      return;
    }

    setEdit_content(comment.comment_content);
    setIs_edit(true);
    setOption_open(false);

    // 시야 확보
    setTimeout(() => {
      itemRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 0);
  };

  const onCancelEdit = () => {
    setIs_edit(false);
    setEdit_content(comment.comment_content);
  };

  const onSaveEdit = async () => {
    if (!edit_content.trim()) {
      alert("댓글을 입력하세요.");
      return;
    }

    if (!window.confirm("댓글을 수정할까요?")) return;

    try {
      await authPost("/comment/update", {
        comment_no: comment.comment_no,
        comment_content: edit_content.trim(),
      });

      alert("수정되었습니다.");

      setIs_edit(false);

      // 리스트 새로고침 + 해당 댓글로 이동
      onRefreshCommentList?.(comment.comment_no);
    } catch (e) {
      alert("댓글 수정 중 오류가 발생했습니다.");
    }
  };

  // ===== 추가: 삭제 =====
  const onClickDelete = async () => {
    if (!_isAuthorization) {
      alert("로그인이 필요합니다.");
      return;
    }

    if (comment.owner_yn !== 1) {
      alert("작성자만 삭제할 수 있습니다.");
      return;
    }

    if (comment.ex_del) {
      return;
    }

    if (!window.confirm("댓글을 삭제할까요?")) return;

    try {
      await authPost(`/comment/delete?comment_no=${comment.comment_no}`, {});

      alert("삭제완료되었습니다.");

      setOption_open(false);

      // 리스트 새로고침 + 해당 댓글로 이동
      onRefreshCommentList?.(comment.comment_no);
    } catch (e) {
      alert("댓글 삭제 중 오류가 발생했습니다.");
    }
  };

  const onClickReport = () => {
    alert("신고 기능은 추후 추가 예정");
    setOption_open(false);
  };

  return (
    <div
      id={`comment-${comment.comment_no}`}
      ref={itemRef}
      className={`${styles.item_div} ${comment.owner_yn === 1 ? styles.mine : ""}`}
      style={{ marginLeft: comment.comment_lvl === 1 ? 20 : 0 }}
    >
      <div className={styles.comment_div}>
        <img
          src={userDefault}
          alt="사용자 프로필"
          className={styles.user_profile}
        />

        <div className={styles.content_div}>
          <strong>{comment.user_nm}</strong>

          {/* ===== 기존 출력 유지 + 수정모드만 추가 ===== */}
          {!is_edit && (
            <div className={styles.comment_content}>
              {comment.comment_content}
            </div>
          )}

          {is_edit && (
            <div className={styles.edit_div}>
              <textarea
                className={styles.edit_area}
                value={edit_content}
                onChange={(e) => setEdit_content(e.target.value)}
              />
              <div className={styles.edit_btn_div}>
                <button className={`whiteBtn ${styles.edit_btn}`} onClick={onCancelEdit}>취소</button>
                <button className={`blackBtn ${styles.edit_btn}`} onClick={onSaveEdit}>확인</button>
              </div>
            </div>
          )}

          <div className={styles.bottom_div}>
            {formatRelativeTime(comment.write_date.split('.')[0])}

            {!is_reply && (
              <div
                className={`linkBtn ${styles.like_div} ${comment.my_like_yn === 1 ? styles.liked : ""} ${comment.my_like_yn === 1 && styles.like_bounce}`}
                onClick={onClickLike}
                key={like_bounce}
              >
                <img src={likeImg} className={styles.thumb} />
                {comment.like_cnt}
              </div>
            )}

            {!is_reply && (
              <button className={`linkBtn ${styles.replyToggle}`} onClick={onToggleReplies}>
                {`답글 ${comment.c_comment_cnt}개`}
              </button>
            )}
          </div>
        </div>

        {/* ===== 기존 ... 유지 + 옵션메뉴 추가 ===== */}
        <div className={styles.option}>
          <button className={`linkBtn`} onClick={() => setOption_open(v => !v)}>
            ...
          </button>

          {option_open && (
            <div className={styles.option_menu}>
              {comment.owner_yn === 1 && !comment.ex_del ? (
                <>
                  <button className={`linkBtn ${styles.option_btn}`} onClick={onClickEdit}>수정</button>
                  <button className={`linkBtn ${styles.option_btn}`} onClick={onClickDelete}>삭제</button>
                </>
              ) : (
                <button className={`linkBtn ${styles.option_btn}`} onClick={onClickReport}>신고</button>
              )}
            </div>
          )}
        </div>
      </div>

      {showReplyForm && (
        <CommentWrite
          boardId={boardId}
          parentId={comment.comment_no}
          onSuccess={() => {
            // 댓글 작성 후 대댓글 갱신
          }}
        />
      )}

      {/* ✅ 대댓글 영역: 부모댓글에서만 */}
      {!is_reply && showReplies && (
        <div className={styles.reply_wrap}>
          {/* 리스트 */}
          <div className={styles.reply_list}>
            {(reply_list ?? []).filter(Boolean).map(reply => (
              <CommentItem
                key={reply.comment_no}
                comment={reply}
                boardId={boardId}
                onUpdateReaction={onUpdateReaction}
                onRefreshCommentList={(focus_no) => {
                  // ✅ 대댓글 수정/삭제 후: 대댓글 1페이지 최신화
                  fetchReplyList(1);
                }}
              />
            ))}
          </div>

          {/* 대댓글 페이징 */}
          {reply_paging && (
            <div className={styles.reply_paging}>
              {reply_page >= 4 && (
                <button className={`whiteBtn`} onClick={() => fetchReplyList(1)}>{'<<'}</button>
              )}

              {reply_page > 1 && (
                <button className={`whiteBtn`} onClick={() => fetchReplyList(Math.max(1, reply_page - 3))}>{'<'}</button>
              )}

              {(() => {
                const total_page = reply_paging.total_page;
                let start = Math.max(1, reply_page - 2);
                let end = Math.min(total_page, start + 4);
                if (end - start < 4) start = Math.max(1, end - 4);

                const pages = [];
                for (let i = start; i <= end; i++) pages.push(i);

                return pages.map(p => (
                  <button
                    key={p}
                    className={`${p === reply_page ? 'blackBtn' : 'whiteBtn'}`}
                    onClick={() => fetchReplyList(p)}
                  >
                    {p}
                  </button>
                ));
              })()}

              {reply_page < reply_paging.total_page && (
                <button
                  className={`whiteBtn`}
                  onClick={() => fetchReplyList(Math.min(reply_paging.total_page, reply_page + 3))}
                >
                  {'>'}
                </button>
              )}

              {reply_paging.total_page - reply_page >= 4 && (
                <button className={`whiteBtn`} onClick={() => fetchReplyList(reply_paging.total_page)}>
                  {'>>'}
                </button>
              )}
            </div>
          )}

          {/* ✅ 대댓글 작성폼: 페이징 아래 */}
          <CommentWrite
            boardId={boardId}
            parentId={comment.comment_no}
            onSuccess={async  (new_comment_no) => {
              // alert("대댓글 작성이 완료되었습니다.");
              const paging  = await fetchReplyList(1, true); 
              if (!paging) return;

                // const last_page = Math.max(
                //   1,
                //   Math.ceil(paging.total_cnt / reply_size)
                // );

                fetchReplyList(paging.total_page);
              // ✅ 부모 댓글 리스트 새로고침 -> 답글 n개 갱신됨
              onRefreshCommentList?.(comment.comment_no);
              // 필요하면 새로 작성된 대댓글로 스크롤도 가능
              // setTimeout(() => document.getElementById(`comment-${new_comment_no}`)?.scrollIntoView({ behavior:"smooth", block:"center" }), 50);
            }}
          />
        </div>
      )}
      {/* {showReplies && (
        <div className="reply-list">
          {replies.map(reply => (
            <CommentItem
              key={reply.comment_no}
              comment={reply}
              boardId={boardId}
            />
          ))}
        </div>
      )} */}
    </div>
  );
}

export { CommentItem };
