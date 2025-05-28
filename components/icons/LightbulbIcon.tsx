import React from 'react';

const LightbulbIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.354a15.055 15.055 0 01-4.5 0M12 3a.75.75 0 00-.75.75v2.25m0-2.25a.75.75 0 01.75.75v2.25m0 0A2.25 2.25 0 0112 7.5H9.75A2.25 2.25 0 017.5 5.25V3m3.75 0A2.25 2.25 0 0012 3.75M12 3.75A2.25 2.25 0 0114.25 6v2.25M12 7.5A2.25 2.25 0 019.75 9.75V12m0 0A2.25 2.25 0 0012 14.25m0 0A2.25 2.25 0 0114.25 12v-2.25M12 7.5c0 .828-.672 1.5-1.5 1.5S9 8.328 9 7.5s.672-1.5 1.5-1.5S12 6.672 12 7.5z" />
  </svg>
);

export default LightbulbIcon;