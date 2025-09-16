import { useEffect, useState } from 'react';
import {CommentItem} from './CommentItem';
import {CommentWrite} from './CommentWrite';
import styles from "./CommentList.module.css";

function CommentList({ boardId }) {
  const [commentList, setCommentList] = useState([]);

  useEffect(() => {
    // fetchComments()
  }, [boardId]);

  return (
    <div className={styles.comment_div}>
      <h3 className={styles.comment_cnt} >{`댓글 [${commentList.length}]`}</h3>
      <CommentWrite boardId={boardId} parentId={null} onSuccess={() => {}} />

      {commentList
        .filter(c => c.parent_id == null)
        .map(comment => (
          <CommentItem
            key={comment.comment_id}
            comment={comment}
            boardId={boardId}
            allComments={commentList}
          />
        ))}
    </div>
  );
}

export {CommentList};