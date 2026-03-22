'use client';
import styles from './componentStyles/modal.module.css';
import Button from './button';

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
        <div className={styles.modalHead}>
          <h2>{title}</h2>
        </div>
        <div className={styles.modalBody}>{children}</div>
        <div className={styles.btnContainer}>
          <Button type="button" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}