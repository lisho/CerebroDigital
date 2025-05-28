import React from 'react';

const UserGroupIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props} className={`sidebar-icon ${props.className || ''}`}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-3.741-5.036m-3.741 5.515a3 3 0 01-3.741-5.036m0 0a3 3 0 013.741 5.036m0 0l-3.741 5.036M12 12.75a3 3 0 002.618-4.516 3 3 0 00-5.236 0A3 3 0 0012 12.75zm-2.25 4.125a7.512 7.512 0 00-5.482 2.482C2.932 18.09 2.25 16.075 2.25 13.875c0-4.033 2.038-7.66 5.038-9.847A9.014 9.014 0 0112 3c2.45 0 4.715.983 6.398 2.623 2.999 2.187 5.037 5.814 5.037 9.847 0 2.2-.682 4.215-1.982 5.958a7.512 7.512 0 00-5.482-2.482zM4.5 18.75a2.25 2.25 0 002.25 2.25h10.5a2.25 2.25 0 002.25-2.25V18c0-.47-.192-.922-.506-1.256A6.008 6.008 0 0012 15.75a6.008 6.008 0 00-6.994 1.994A1.873 1.873 0 004.5 18v.75z" />
  </svg>
);

export default UserGroupIcon;
