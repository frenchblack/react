import { useState } from "react";

function CommentWrite({ boardId, parentId, onSuccess }) {
  const [content, setContent] = useState("");

  const handleSubmit = async () => {
    if (!content.trim()) return;
    // await authPost('/comment/write', { board_id: boardId, parent_id: parentId, content })
    setContent("");
    onSuccess?.(); // 댓글 등록 후 콜백
  };

  return (
    <div>
      <textarea value={content} onChange={e => setContent(e.target.value)} />
      <button onClick={handleSubmit}>작성</button>
    </div>
  );
}

export {CommentWrite};