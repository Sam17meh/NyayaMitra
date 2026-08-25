import React from 'react';

const Card = ({
  children,
  className = '',
  onClick,
  hoverable = false,
  bordered = true,
  padding = 'p-5',
  ...props
}) => {
  return (
    <div
      onClick={onClick}
      className={`
        bg-white rounded-xl transition-all duration-200
        ${bordered ? 'border border-slate-200/80 shadow-sm' : ''}
        ${hoverable ? 'hover:shadow-md hover:border-slate-300 hover:-translate-y-0.5 cursor-pointer' : ''}
        ${padding}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
