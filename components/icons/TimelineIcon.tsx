
import React from 'react';

const TimelineIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4M12 12V9.75M12 18v-2.25M6 12H3.75M18 12h2.25M6 6l-1.5-1.5M18 6l1.5-1.5M6 18l-1.5 1.5M18 18l1.5 1.5" />
  </svg>
);

export default TimelineIcon;
