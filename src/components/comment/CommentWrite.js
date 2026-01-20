import { useState, useContext } from "react";
import { authPost, AuthContext } from "util";
import styles from "./CommentWrite.module.css";

function CommentWrite({ boardId, parentId, onSuccess }) {
  const { _isAuthorization } = useContext(AuthContext);

  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!_isAuthorization) {
      alert("로그인한 사용자만 댓글을 작성할 수 있습니다.");
      return;
    }

    if (!content.trim()) {
      alert("댓글을 입력하세요.");
      return;
    }

    try {
      setSaving(true);

      const res = await authPost("/comment/write", {
          board_no: boardId,
          comment_content: content.trim(),
      });

      setContent("");
      alert("댓글 작성이 완료되었습니다.");

      onSuccess?.(res.data?.comment_no);

    } catch (e) {
      alert("댓글 작성 중 오류가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.write_div}>
      <textarea
        className={styles.write_area}
        placeholder="댓글을 작성하세요."
        value={content}
        onChange={e => setContent(e.target.value)}
        disabled={saving}
      />
      <button
        className={`whiteBtn ${styles.write_btn}`}
        onClick={handleSubmit}
        disabled={saving}
      >
        작성
      </button>
    </div>
  );
}

export { CommentWrite };
