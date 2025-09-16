import { useState } from "react";
import styles from "./CommentWrite.module.css";

function CommentWrite({ boardId, parentId, onSuccess }) {
  const [content, setContent] = useState("");

  const handleSubmit = async () => {
    if (!content.trim()) return;
    // await authPost('/comment/write', { board_id: boardId, parent_id: parentId, content })
    setContent("");
    onSuccess?.(); // 댓글 등록 후 콜백
  };

  return (
    <div className={styles.write_div}>
      <textarea className={styles.write_area} placeholder="댓글을 작성하세요." value={content} onChange={e => setContent(e.target.value)} />
      <button className={ `whiteBtn ${styles.write_btn}` } onClick={handleSubmit}>작성</button>
    </div>
  );
}

export {CommentWrite};