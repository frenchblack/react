import { useState, useContext, useRef } from 'react';
import { CommentWrite } from './CommentWrite';
import { formatRelativeTime, authPost, AuthContext } from 'util';
import userDefault from "../../img/icon/user-photo-default.svg";
import likeImg from "../../img/icon/thumb.svg";
import styles from "./CommentItem.module.css";

function CommentItem({ comment, boardId, onUpdateReaction, onRefreshCommentList }) {
  const { _isAuthorization } = useContext(AuthContext);

  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replies, setReplies] = useState([]);
  const [showReplies, setShowReplies] = useState(false);

  const [like_bounce, setLike_bounce] = useState(0);

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
      style={{ marginLeft: comment.parent_id ? 20 : 0 }}
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

            <div
              className={`linkBtn ${styles.like_div} ${comment.my_like_yn === 1 ? styles.liked : ""} ${comment.my_like_yn === 1 && styles.like_bounce}`}
              onClick={onClickLike}
              key={like_bounce}
            >
              <img src={likeImg} className={styles.thumb} />
              {comment.like_cnt}
            </div>

            <button className={`linkBtn ${styles.replyToggle}`}>
              {`답글 ${comment.c_comment_cnt}개`}
            </button>
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

      {showReplies && (
        <div className="reply-list">
          {replies.map(reply => (
            <CommentItem
              key={reply.comment_id}
              comment={reply}
              boardId={boardId}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export { CommentItem };
