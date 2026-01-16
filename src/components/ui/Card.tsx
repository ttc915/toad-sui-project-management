import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
}

export function Card({ children, className = '', onClick, hover = false, draggable, onDragStart }: CardProps) {
  return (
    <div
      onClick={onClick}
      draggable={draggable}
      onDragStart={onDragStart}
      className={`
        bg-white dark:bg-dark-card
        rounded-2xl
        shadow-card dark:shadow-card-dark
        border border-transparent dark:border-dark-border
        ${hover ? 'hover:shadow-lg hover:scale-[1.02] transition-all duration-200 cursor-pointer' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
