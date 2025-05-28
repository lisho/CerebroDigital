import React from 'react';
import { Case, CaseStatus } from '../../types';

interface CaseRowProps {
  caseData: Case;
}

const getStatusBadgeClasses = (status: CaseStatus): string => {
  switch (status) {
    case CaseStatus.Active:
    case CaseStatus.Open: // Grouping Open with Active for similar visual
      return 'bg-status-open-bg text-status-open-text';
    case CaseStatus.PendingReview:
      return 'bg-status-pending-bg text-status-pending-text'; // Using a general pending style
    case CaseStatus.InProgress:
      return 'bg-status-progress-bg text-status-progress-text';
    case CaseStatus.Closed:
      return 'bg-status-closed-bg text-status-closed-text';
    default:
      return 'bg-gray-200 text-gray-700'; // Fallback
  }
};

const CaseRow: React.FC<CaseRowProps> = ({ caseData }) => {
  return (
    <tr className="border-b border-theme-border-secondary hover:bg-theme-bg-tertiary transition-colors duration-150">
      <td className="py-3 px-4 text-sm text-theme-text-primary">{caseData.id}</td>
      <td className="py-3 px-4 text-sm text-theme-text-primary font-medium">{caseData.clientName}</td>
      <td className="py-3 px-4 text-sm">
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${getStatusBadgeClasses(caseData.status)}`}>
          {caseData.status}
        </span>
      </td>
      <td className="py-3 px-4 text-sm text-theme-text-secondary">{caseData.nextAppointment || 'N/A'}</td>
    </tr>
  );
};

export default CaseRow;