import { useEffect, useState, useRef } from 'react';
import {CommentItem} from './CommentItem';
import {CommentWrite} from './CommentWrite';
import { nonAuthGet } from "util";
import styles from "./CommentList.module.css";

function CommentList({ boardId }) {
  const [commentList, setCommentList] = useState([]);
  const [paging, setPaging] = useState(null);
  const [page, setPage] = useState(1);
  const commentTopRef = useRef(null);

  const size = 10;
  

  useEffect(() => {
    if(boardId != "" && boardId != null &&  boardId != undefined){
        getCommentList(1, false);
      }
  }, [boardId]);

  const getCommentList = async (pageNo = 1, scroll = true) => {
      try {
          const res = await nonAuthGet(`/getCommentList?board_no=${boardId}&page=${pageNo}&size=${size}`);
          setCommentList(res.data.list);
          setPaging(res.data.paging);
          setPage(pageNo);

          if (scroll) {
              commentTopRef.current?.scrollIntoView({
              behavior: "smooth",
              block: "start",
            });
          }
          
      } catch(e) {
          alert("댓글을 불러오지 못 했습니다.");
      }
  }

  const getPageNumbers = () => {
    if (!paging) return [];

    const totalPage = paging.total_page;
    let start = Math.max(1, page - 2);
    let end = Math.min(totalPage, start + 4);

    if (end - start < 4) {
      start = Math.max(1, end - 4);
    }

    const pages = [];
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className={styles.comment_div}>
      <div ref={commentTopRef}>
        <h3 className={styles.comment_cnt} >{`댓글 ${commentList.length}`}</h3>
      </div>
      {commentList
        .filter(c => c.parent_id == null)
        .map(comment => (
          <CommentItem
            key={comment.comment_no}
            comment={comment}
            boardId={boardId}
            allComments={commentList}
          />
        ))}
        {paging && (
          <div className={styles.paging}>
            
            {page >= 4 && (
              <button className={ `whiteBtn` } onClick={() => getCommentList(1)}>{'<<'}</button>
            )}

            {page > 1 && (
              <button className={ `whiteBtn` } onClick={() => getCommentList(Math.max(1, page - 3))}>{'<'}</button>
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
                className={ `whiteBtn` }
                onClick={() =>
                  getCommentList(Math.min(paging.total_page, page + 3))
                }
              >
                {'>'}
              </button>
            )}

            {paging.total_page - page >= 4 && (
              <button  className={ `whiteBtn` } onClick={() => getCommentList(paging.total_page)}>
                {'>>'}
              </button>
            )}

          </div>
        )}
        <CommentWrite boardId={boardId} parentId={null} onSuccess={() => {}} />
    </div>
  );
}

export {CommentList};