
import React from 'react';
import { Link } from 'react-router-dom'; // Import Link
import { CaseDetail, CaseStatus } from '../../types';

interface CaseItemProps {
  caseData: CaseDetail;
}

const getStatusClasses = (status: CaseStatus): { bg: string; text: string } => {
  switch (status) {
    case CaseStatus.Open:
    case CaseStatus.Active: // Visually group Active with Open
      return { bg: 'bg-status-open-bg', text: 'text-status-open-text' };
    case CaseStatus.InProgress:
      return { bg: 'bg-status-progress-bg', text: 'text-status-progress-text' };
    case CaseStatus.PendingReview:
      return { bg: 'bg-status-pending-bg', text: 'text-status-pending-text' };
    case CaseStatus.Closed:
      return { bg: 'bg-status-closed-bg', text: 'text-status-closed-text' };
    default:
      return { bg: 'bg-gray-200', text: 'text-gray-700' }; 
  }
};

const CaseItem: React.FC<CaseItemProps> = ({ caseData }) => {
  const statusStyle = getStatusClasses(caseData.status);

  return (
    <Link 
      to={`/case/${caseData.id}`} 
      className="block bg-theme-bg-card p-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-theme-accent-primary focus:ring-opacity-50"
      aria-label={`Ver detalles del caso ${caseData.clientName}`}
    >
      <div className="flex items-center space-x-4">
        <div className="flex-shrink-0">
          <img 
            src={caseData.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(caseData.clientName)}&background=random&color=fff`} 
            alt={`Avatar de ${caseData.clientName}`}
            className="w-16 h-16 rounded-lg object-cover bg-theme-bg-tertiary" 
          />
        </div>
        <div className="flex-grow">
          <div className="flex justify-between items-start mb-1">
            <h3 className="text-lg font-semibold text-theme-text-primary leading-tight">{caseData.clientName}</h3>
            <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${statusStyle.bg} ${statusStyle.text}`}>
              {caseData.status}
            </span>
          </div>
          <p className="text-sm text-theme-text-secondary">Asignado a: {caseData.assignedTo}</p>
          {caseData.lastUpdate && (
             <p className="text-xs text-theme-text-secondary mt-0.5">Última act.: {caseData.lastUpdate}</p>
          )}
        </div>
      </div>
    </Link>
  );
};

export default CaseItem;