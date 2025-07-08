import React from "react";
import styles from  "./Confirm.module.css";

function Confirm({ isOpen, message, onConfirm, onCancel, onClose }) {
  if (!isOpen) return null;

  return (
    <div className={styles.confirm_overlay}>
      <div className={styles.confirm_content}>
        <p className={styles.confirm_message}>{message}</p>
        <button onClick={() => {onConfirm?.(); onClose?.();}}>예</button>
        <button onClick={() => {onCancel?.(); onClose?.();}}>아니오</button>
      </div>
    </div>
  );
}

export {Confirm};