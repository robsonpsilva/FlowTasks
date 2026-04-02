'use client';
import styles from './componentStyles/modal.module.css';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export default function Modal({ children, onClose, open, title }: ModalProps) {
  return (
    <div
      className={
        styles.modal + ' ' + (open ? styles.displayBlock : styles.displayNone)
      }
    >
      <div className={styles.modalMain}>
        
        {/* HEADER */}
        <div className={styles.modalHead}>
          <h2>{title}</h2>

          <button
            type="button"
            onClick={onClose}
            className={styles.closeButton}
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        {/* BODY */}
        <div className={styles.modalBody}>{children}</div>

      </div>
    </div>
  );
}