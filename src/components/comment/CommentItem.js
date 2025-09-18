import { useState } from 'react';
import {CommentWrite} from './CommentWrite';
import {formatRelativeTime} from 'util';
import userDefault from "../../img/icon/user-photo-default.svg";
import likeImg from "../../img/icon/thumb.svg";
import styles from "./CommentItem.module.css";

function CommentItem({ comment, boardId }) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replies, setReplies] = useState([]);
  const [showReplies, setShowReplies] = useState(false);

  const toggleReplies = () => {
    if (!showReplies) {
      // fetchReplies(comment.comment_id)
    }
    setShowReplies(!showReplies);
  };

  return (
    <div className={styles.item_div} style={{ marginLeft: comment.parent_id ? 20 : 0 }}>
      <div className={ styles.comment_div }>
        <img 
          src={ userDefault }
          alt="사용자 프로필"
          className={styles.user_profile}
        />
        <div className={ styles.content_div }>
          <strong>{comment.user_nm}</strong>
          {comment.comment_content}
          <div className={styles.bottom_div}>
            {formatRelativeTime(comment.write_date.split('.')[0])}
            <div className={ `linkBtn ${styles.like_div}` }><img src={ likeImg } className={styles.thumb} />{comment.like_cnt}</div>
            <button className={`linkBtn ${styles.replyToggle}`} >{`답글 ${comment.c_comment_cnt}개`}</button>
          </div>
        </div>
        <div className={styles.option}>
          <button className={`linkBtn`} >{`...`}</button>
        </div>
        {/* <button onClick={toggleReplies}>{showReplies ? '접기' : '답글 보기'}</button>
        <button onClick={() => setShowReplyForm(prev => !prev)}>답글 달기</button> */}
      </div>

      {showReplyForm && (
        <CommentWrite
          boardId={boardId}
          parentId={comment.comment_id}
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

export {CommentItem};