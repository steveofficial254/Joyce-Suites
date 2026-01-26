import React from 'react';
import './PageTransition.css';

const PageTransition = ({ children, isVisible }) => {
  return (
    <div className={`page-transition ${isVisible ? 'page-transition-enter-active' : 'page-transition-exit-active'}`}>
      {children}
    </div>
  );
};

export default PageTransition;
