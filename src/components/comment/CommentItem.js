import { useState } from 'react';
import {CommentWrite} from './CommentWrite';

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
    <div style={{ marginLeft: comment.parent_id ? 20 : 0 }}>
      <div>
        <strong>{comment.writer}</strong>: {comment.content}
        <button onClick={toggleReplies}>{showReplies ? '접기' : '답글 보기'}</button>
        <button onClick={() => setShowReplyForm(prev => !prev)}>답글 달기</button>
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