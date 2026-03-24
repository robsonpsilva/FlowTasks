'use client';
import styles from './componentStyles/button.module.css';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export default function Button({ children, className, ...rest }: ButtonProps) {
  return (
    <button
      {...rest}
      className={styles.button + (className ? ' ' + className : '')}
    >
      {children}
    </button>
  );
}