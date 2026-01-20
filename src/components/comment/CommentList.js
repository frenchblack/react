import { useEffect, useState, useRef, useContext } from 'react';
import { useNavigate } from "react-router-dom";   // ✅ 추가
import { CommentItem } from './CommentItem';
import { CommentWrite } from './CommentWrite';
import { authGet, nonAuthGet, AuthContext } from "util";
import styles from "./CommentList.module.css";

function CommentList({ boardId }) {
  const { _isAuthorization, _setIsAuthorizationHandler } = useContext(AuthContext);
  const navigator = useNavigate(); // ✅ 추가 (authGet에 넘기고 있더라)

  const [commentList, setCommentList] = useState([]);
  const [paging, setPaging] = useState(null);
  const [page, setPage] = useState(1);
  const commentTopRef = useRef(null);

  const size = 10;

  useEffect(() => {
    if (boardId != "" && boardId != null && boardId != undefined) {
      getCommentList(1, false);
    }
  }, [boardId, _isAuthorization]); // ✅ 로그인 상태 바뀌면 OWNER_YN/MY_LIKE_YN 달라지니 갱신

  // ✅ 추가: focus_comment_no 받아서 해당 댓글로 스크롤
  const getCommentList = async (pageNo = 1, scroll = true, focus_comment_no = 0) => {
    try {
      const url = `/getCommentList?board_no=${boardId}&page=${pageNo}&size=${size}`;

      const res = _isAuthorization
        ? await authGet(url, _setIsAuthorizationHandler, navigator)
        : await nonAuthGet(url);

      setCommentList(res.data.list);
      setPaging(res.data.paging);
      setPage(pageNo);

      if (scroll) {
        commentTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }

      if (focus_comment_no && focus_comment_no > 0) {
        setTimeout(() => {
          document.getElementById(`comment-${focus_comment_no}`)?.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }, 50);
      }
    } catch (e) {
      alert("댓글을 불러오지 못 했습니다.");
    }
  };

  const getPageNumbers = () => {
    if (!paging) return [];

    const totalPage = paging.total_page;
    let start = Math.max(1, page - 2);
    let end = Math.min(totalPage, start + 4);

    if (end - start < 4) {
      start = Math.max(1, end - 4);
    }

    const pages = [];
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  const updateReaction = (comment_no, like_cnt, my_like_yn) => {
    setCommentList(prev =>
      prev.map(c =>
        c.comment_no === comment_no
          ? { ...c, like_cnt, my_like_yn }
          : c
      )
    );
  };

  // ✅ 추가: 수정/삭제 후 리프레시 + 해당 댓글로 이동
  const refreshCommentList = (focus_comment_no = 0) => {
    getCommentList(page, false, focus_comment_no);
  };

  return (
    <div className={styles.comment_div}>
      <div ref={commentTopRef}>
        {/* ✅ 기존은 commentList.length라 페이지 크기만 나옴. total_cnt 있으면 그게 정확 */}
        <h3 className={styles.comment_cnt}>
          {`댓글 ${paging ? paging.total_cnt : commentList.length}`}
        </h3>
      </div>

      {commentList
        .filter(c => c.comment_lvl === 0)
        .map(comment => (
          <CommentItem
            key={comment.comment_no}
            comment={comment}
            boardId={boardId}
            allComments={commentList}
            onUpdateReaction={updateReaction}
            onRefreshCommentList={refreshCommentList}  // ✅ 추가
          />
        ))}

      {paging && (
        <div className={styles.paging}>
          {page >= 4 && (
            <button className={`whiteBtn`} onClick={() => getCommentList(1)}>{'<<'}</button>
          )}

          {page > 1 && (
            <button className={`whiteBtn`} onClick={() => getCommentList(Math.max(1, page - 3))}>{'<'}</button>
          )}

          {getPageNumbers().map(p => (
            <button
              key={p}
              className={`${p === page ? 'blackBtn' : 'whiteBtn'}`}
              onClick={() => getCommentList(p)}
            >
              {p}
            </button>
          ))}

          {page < paging.total_page && (
            <button
              className={`whiteBtn`}
              onClick={() => getCommentList(Math.min(paging.total_page, page + 3))}
            >
              {'>'}
            </button>
          )}

          {paging.total_page - page >= 4 && (
            <button className={`whiteBtn`} onClick={() => getCommentList(paging.total_page)}>
              {'>>'}
            </button>
          )}
        </div>
      )}

      <CommentWrite
        boardId={boardId}
        parentId={null}
        onSuccess={(new_comment_no) => {
          // total_cnt는 작성 후 +1 된 값이니까, 그냥 현재 paging 기준으로 계산하면 1페이지 오차날 수 있음
          // 그래서 마지막 페이지로 이동은 "리스트 다시 불러와서 paging 받아온 뒤" 가 제일 안전.
          // 간단하게: 우선 현재 paging 있으면 그걸로 계산, 없으면 1.
          const next_total_cnt = (paging?.total_cnt ?? 0) + 1;
          const last_page = Math.max(1, Math.ceil(next_total_cnt / size));

          getCommentList(last_page, false, new_comment_no);
        }}
      />
    </div>
  );
}

export { CommentList };
