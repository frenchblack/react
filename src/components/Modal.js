import React from "react";
import ReactDOM from "react-dom";
import styles from  "./Modal.module.css";

function Modal({ isOpen, onClose, children }) {
  if (!isOpen) return null;

  // return ReactDOM.createPortal(
  //   <div className={styles.modal_overlay}>
  //     <div className={styles.modal_content}>
  //       {children}
  //       <button onClick={onClose}>닫기</button>
  //     </div>
  //   </div>,
  //   document.getElementById("modal-root")
  // ); index.html 관련
  return (
    <div className={styles.modal_overlay}>
      <div className={styles.modal_content}>
        {children}
      </div>
    </div>
  );
}

export {Modal};