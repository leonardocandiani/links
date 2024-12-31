import React from 'react';

interface ContainerProps {
  children: React.ReactNode;
}

export function Container({ children }: ContainerProps) {
  return (
    <div className="w-[90%] max-w-[480px] p-10 glass-container relative z-10">
      {children}
    </div>
  );
}