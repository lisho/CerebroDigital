
import React, { useState, useMemo, useEffect } from 'react';
import { CaseDetail, CaseStatus, CompositionUnitRecord, FamilyMember, HouseholdMember } from '../../types';
import CaseItem from '../cases/CaseItem';
import MagnifyingGlassIcon from '../icons/MagnifyingGlassIcon';
import PlusIcon from '../icons/PlusIcon';
import { MOCK_CASES_KEY } from '../../constants';
import LoadingSpinner from '../LoadingSpinner'; // Added for loading state

const CasesView: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [cases, setCases] = useState<CaseDetail[]>([]); 
  const [isLoading, setIsLoading] = useState(true); // Added loading state

  useEffect(() => {
    const loadCases = async () => {
      setIsLoading(true);
      let storedCases = localStorage.getItem(MOCK_CASES_KEY);
      if (storedCases) {
        setCases(JSON.parse(storedCases));
        setIsLoading(false);
      } else {
        try {
          const response = await fetch('/data/cases.json');
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const fetchedCases: CaseDetail[] = await response.json();
          setCases(fetchedCases);
          localStorage.setItem(MOCK_CASES_KEY, JSON.stringify(fetchedCases));
        } catch (error) {
          console.error("Error fetching initial cases data:", error);
          // Set to empty array or handle error state appropriately
          setCases([]); 
        } finally {
          setIsLoading(false);
        }
      }
    };
    loadCases();
  }, []);

  const filteredCases = useMemo(() => {
    if (!searchTerm) return cases;
    return cases.filter(c => 
      c.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.assignedTo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.status.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [cases, searchTerm]);

  const handleAddNewCase = () => {
    const newCase: CaseDetail = {
      id: `case${Date.now()}`,
      clientName: `Nuevo Cliente ${Math.floor(Math.random() * 100)}`,
      status: CaseStatus.Open,
      assignedTo: 'Emily Carter', 
      avatarUrl: `https://i.pravatar.cc/150?u=newcase${Date.now()}`,
      dateOpened: new Date().toISOString().split('T')[0],
      lastUpdate: new Date().toLocaleDateString(),
      description: 'Este es un nuevo caso generado para demostración.',
      compositionHistory: [
        {
          recordId: `comp-new-${Date.now()}`, effectiveDate: new Date().toISOString().split('T')[0],
          familyUnit: [],
          householdUnit: [],
          notes: 'Composición inicial pendiente de definir.'
        }
      ]
    };
    const updatedCases = [newCase, ...cases];
    setCases(updatedCases);
    localStorage.setItem(MOCK_CASES_KEY, JSON.stringify(updatedCases));
    // Consider navigating to the new case detail view or showing a success message.
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
        <p className="ml-3 text-theme-text-secondary">Cargando casos...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h2 className="text-2xl md:text-3xl font-semibold text-theme-text-primary">Casos</h2>
        <button 
          onClick={handleAddNewCase}
          className="w-full md:w-auto flex items-center justify-center px-4 py-2.5 bg-theme-button-primary-bg text-theme-button-primary-text rounded-lg font-medium transition-colors shadow-sm hover:bg-theme-button-primary-hover-bg text-sm"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          Nuevo Caso
        </button>
      </div>

      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MagnifyingGlassIcon className="w-5 h-5 text-theme-text-secondary" />
        </div>
        <input
          type="text"
          placeholder="Buscar casos por nombre, asignado, estado..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-3 pl-10 border border-theme-border-primary rounded-lg bg-theme-bg-secondary text-theme-text-primary focus:ring-2 focus:ring-theme-accent-primary focus:border-transparent shadow-sm"
        />
      </div>

      {filteredCases.length > 0 ? (
        <div className="grid grid-cols-1 gap-5">
          {filteredCases.map(caseData => (
            <CaseItem key={caseData.id} caseData={caseData} />
          ))}
        </div>
      ) : (
        <p className="text-center text-theme-text-secondary py-8">No se encontraron casos.</p>
      )}
    </div>
  );
};

export default CasesView;
