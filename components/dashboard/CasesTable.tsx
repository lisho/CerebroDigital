import React from 'react';
import { Case } from '../../types';
import CaseRow from './CaseRow';

interface CasesTableProps {
  cases: Case[];
}

const CasesTable: React.FC<CasesTableProps> = ({ cases }) => {
  if (!cases || cases.length === 0) {
    return <p className="text-theme-text-secondary text-center py-4">No hay casos para mostrar.</p>;
  }

  return (
    <div className="overflow-x-auto bg-theme-bg-card rounded-lg shadow">
      <table className="min-w-full table-auto">
        <thead className="bg-theme-bg-secondary">
          <tr>
            <th className="py-3 px-4 text-left text-xs font-medium text-theme-text-secondary uppercase tracking-wider">ID Caso</th>
            <th className="py-3 px-4 text-left text-xs font-medium text-theme-text-secondary uppercase tracking-wider">Nombre Cliente</th>
            <th className="py-3 px-4 text-left text-xs font-medium text-theme-text-secondary uppercase tracking-wider">Estado</th>
            <th className="py-3 px-4 text-left text-xs font-medium text-theme-text-secondary uppercase tracking-wider">Próxima Cita</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-theme-border-secondary">
          {cases.map((caseItem) => (
            <CaseRow key={caseItem.id} caseData={caseItem} />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CasesTable;