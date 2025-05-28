
import React from 'react';

const TrashIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12.56 0c1.153 0 2.242.078 3.324.225m8.916-.225c-.342.052-.682.107-1.022.166M12 3.75l-.16.008c-.302.016-.601.04-.896.072C9.666 3.976 8.54 4.49 7.75 5.451L4.25 10.5m0 0L3.25 11m1.001-1.001L3.25 11m0 0L2.25 12m1.001-1.001L2.25 12m0 0L1.25 13m1.001-1.001L1.25 13M3.75 7.5h16.5M4.5 10.5h15M5.25 13.5h13.5m-13.5 3h13.5m-13.5 3h13.5" />
  </svg>
);

export default TrashIcon;
