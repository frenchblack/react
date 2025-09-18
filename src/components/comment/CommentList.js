import { useEffect, useState } from 'react';
import {CommentItem} from './CommentItem';
import {CommentWrite} from './CommentWrite';
import { nonAuthGet } from "util";
import styles from "./CommentList.module.css";

function CommentList({ boardId }) {
  const [commentList, setCommentList] = useState([]);

  useEffect(() => {
    if(boardId != "" && boardId != null &&  boardId != undefined){
        getCommentLsit();
      }
  }, [boardId]);

  const getCommentLsit = async () => {
      try {
          const list = await nonAuthGet(`/getCommentList?board_no=${boardId}`);
          setCommentList(list.data);
          
      } catch(e) {
          alert("댓글을 불러오지 못 했습니다.");
      }
  }

  return (
    <div className={styles.comment_div}>
      <h3 className={styles.comment_cnt} >{`댓글 ${commentList.length}`}</h3>
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
        <CommentWrite boardId={boardId} parentId={null} onSuccess={() => {}} />
    </div>
  );
}

export {CommentList};