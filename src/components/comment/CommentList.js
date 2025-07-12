import { useEffect, useState } from 'react';
import {CommentItem} from './CommentItem';
import {CommentWrite} from './CommentWrite';

function CommentList({ boardId }) {
  const [commentList, setCommentList] = useState([]);

  useEffect(() => {
    // fetchComments()
  }, [boardId]);

  return (
    <div>
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