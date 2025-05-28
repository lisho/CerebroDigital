import React from 'react';

const CheckBadgeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props} className={`sidebar-icon ${props.className || ''}`}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
     <path strokeLinecap="round" strokeLinejoin="round" d="M10.56 10.06L13.44 12.94M13.44 10.06L10.56 12.94M9 12l2.25 2.25L15 9.75" />
     <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
  </svg>
);
// A more Task like icon:
const TaskListIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props} className={`sidebar-icon ${props.className || ''}`}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.375 6.75L6 6.375a.375.375 0 01.53 0L7.125 6.75M6.375 12L6 11.625a.375.375 0 01.53 0L7.125 12m-1.28-4.28a1.5 1.5 0 010 2.12M17.625 6.75L18 6.375a.375.375 0 00-.53 0L16.875 6.75M17.625 12L18 11.625a.375.375 0 00-.53 0L16.875 12" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 7.5V4.875C8.25 4.171 8.821 3.6 9.525 3.6h4.95c.704 0 1.275.571 1.275 1.275V7.5" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 17.25H20.25V19.5A2.25 2.25 0 0118 21.75H6A2.25 2.25 0 013.75 19.5V17.25Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 7.5V4.875C8.25 4.171 8.821 3.6 9.525 3.6h4.95c.704 0 1.275.571 1.275 1.275V7.5" />
    <rect x="8" y="9" width="8" height="7" rx="1" strokeWidth="1.5" />
    <line x1="10" y1="11" x2="10" y2="14" strokeWidth="1.5" />
    <line x1="14" y1="11" x2="14" y2="14" strokeWidth="1.5" />
  </svg>
);


const BetterCheckBadgeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props} className={`sidebar-icon ${props.className || ''}`}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068M21 12a8.997 8.997 0 00-8.452-8.98M3.75 12c0-4.006 3.244-7.25 7.25-7.25 1.268 0 2.48.32 3.562.898M3.75 12H21m-8.468 5.053A4.501 4.501 0 0112 16.5a4.5 4.5 0 01-3.068-1.043" />
        <path strokeLinecap="round" strokeLinejoin="round" d="m16.864 19.5 1.532.864 1.532-.864m-3.064 0V16.5m0 3c.244.137.503.257.773.363m-.773-.363a2.987 2.987 0 00-1.532 0m1.532 0c.27-.106.529-.226.773-.363m0 0L18 18.407l-1.136 1.093M12 12.75l-2.625 2.625L7.5 12.75M12 12.75V3.75" />
    </svg>
);
// Heroicons: clipboard-document-check
const ClipboardDocumentCheckIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props} className={`sidebar-icon ${props.className || ''}`}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.125 2.25h-4.5c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125v-9M10.125 2.25h.375a9 9 0 019 9v.375M10.125 2.25A3.375 3.375 0 0113.5 5.625v1.5c0 .621.504 1.125 1.125 1.125h1.5a3.375 3.375 0 013.375 3.375M9 15l2.25 2.25L15 12" />
  </svg>
);


export default ClipboardDocumentCheckIcon;
