
import React, { useState, useEffect, useCallback } from 'react';
import { ResourceCategory, Resource } from '../../types';
import { MOCK_RESOURCES_KEY } from '../../constants';
import LoadingSpinner from '../LoadingSpinner'; // Added

const ChevronDownIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
  </svg>
);

const HousingIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h7.5" />
  </svg>
);

const MentalHealthIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5C8.686 4.5 6 7.186 6 10.5c0 2.304 1.125 4.342 2.832 5.562A8.954 8.954 0 0012 20.25a8.954 8.954 0 003.168-4.188A6.478 6.478 0 0018 10.5c0-3.314-2.686-6-6-6zm0 3a3 3 0 100 6 3 3 0 000-6z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 14.25c-1.242 0-2.382.404-3.306 1.079a.75.75 0 00-.444.924l.707 2.829a.75.75 0 001.386-.346L11.25 15.39V12a.75.75 0 011.5 0v3.39l.911 3.346a.75.75 0 001.386.346l.707-2.829a.75.75 0 00-.444-.924A8.212 8.212 0 0012 14.25z" />
  </svg>
);

const FoodIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 9.75A2.25 2.25 0 0019.5 7.5h-15A2.25 2.25 0 002.25 9.75v7.5A2.25 2.25 0 004.5 19.5h15a2.25 2.25 0 002.25-2.25v-7.5zm-17.25-.75a.75.75 0 01.75-.75h15a.75.75 0 01.75.75v.008c0 .414-.336.75-.75.75h-15a.75.75 0 01-.75-.75V9zm2.25 3.75a.75.75 0 000 1.5h3a.75.75 0 000-1.5h-3zm5.25 0a.75.75 0 000 1.5h3a.75.75 0 000-1.5h-3zm5.25 0a.75.75 0 000 1.5h.75a.75.75 0 000-1.5h-.75z" />
</svg>
);

const iconMap: { [key: string]: React.FC<React.SVGProps<SVGSVGElement>> } = {
  HousingIcon: HousingIcon,
  MentalHealthIcon: MentalHealthIcon,
  FoodIcon: FoodIcon,
  DefaultIcon: ChevronDownIcon, // Fallback icon
};


const ResourcesView: React.FC = () => {
  const [resourceCategories, setResourceCategories] = useState<ResourceCategory[]>([]);
  const [isLoading, setIsLoadingResources] = useState(true); // Added
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const loadResources = useCallback(async () => {
    setIsLoadingResources(true);
    const storedResourcesRaw = localStorage.getItem(MOCK_RESOURCES_KEY);
    let rawData: Omit<ResourceCategory, 'icon'>[] = []; // Type for data from JSON/localStorage

    if (storedResourcesRaw) {
      rawData = JSON.parse(storedResourcesRaw);
    } else {
      try {
        const response = await fetch('/data/resources.json');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const fetchedRawData: Omit<ResourceCategory, 'icon'>[] = await response.json();
        rawData = fetchedRawData;
        localStorage.setItem(MOCK_RESOURCES_KEY, JSON.stringify(fetchedRawData));
      } catch (error) {
        console.error("Error fetching initial resources data:", error);
        rawData = [];
      }
    }
    
    // Transform rawData by mapping iconIdentifier to actual icon components
    const transformedData: ResourceCategory[] = rawData.map(category => ({
      ...category,
      icon: React.createElement(iconMap[category.iconIdentifier] || iconMap.DefaultIcon), // Provide a fallback
    }));
    
    setResourceCategories(transformedData);
    if (transformedData.length > 0 && !expandedCategory) {
        setExpandedCategory(transformedData[0].id); // Open first category by default if not set
    }
    setIsLoadingResources(false);
  }, [expandedCategory]); // expandedCategory dependency for initial open logic

  useEffect(() => {
    loadResources();
  }, [loadResources]);


  const toggleCategory = (categoryId: string) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
  };
  
  const filteredResources = resourceCategories.map(category => ({
    ...category,
    resources: category.resources.filter(resource => 
      resource.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (resource.contact && resource.contact.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (resource.website && resource.website.toLowerCase().includes(searchTerm.toLowerCase()))
    )
  })).filter(category => category.resources.length > 0 || (searchTerm && category.name.toLowerCase().includes(searchTerm.toLowerCase())));


  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
        <p className="ml-3 text-theme-text-secondary">Cargando recursos...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl md:text-3xl font-semibold text-theme-text-primary">Directorio de Recursos</h2>
      
      <div className="bg-theme-bg-card p-4 rounded-lg shadow-md">
        <input
          type="text"
          placeholder="Buscar recursos por nombre, descripción, contacto o sitio web..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-3 border border-theme-border-primary rounded-md bg-theme-bg-secondary text-theme-text-primary focus:ring-theme-accent-primary focus:border-theme-accent-primary"
        />
      </div>

      {filteredResources.length > 0 ? filteredResources.map((category) => (
        <div key={category.id} className="bg-theme-bg-card rounded-lg shadow-md overflow-hidden">
          <button
            onClick={() => toggleCategory(category.id)}
            className="w-full flex justify-between items-center p-4 text-left hover:bg-theme-bg-tertiary transition-colors"
            aria-expanded={expandedCategory === category.id}
          >
            <div className="flex items-center space-x-3">
              {React.cloneElement(category.icon, { className: 'w-6 h-6 text-theme-accent-primary' })}
              <span className="text-xl font-medium text-theme-text-primary">{category.name}</span>
            </div>
            <ChevronDownIcon className={`w-5 h-5 text-theme-text-secondary transition-transform duration-200 ${expandedCategory === category.id ? 'rotate-180' : ''}`} />
          </button>
          {expandedCategory === category.id && (
            <div className="p-4 border-t border-theme-border-secondary space-y-3">
              {category.resources.length > 0 ? category.resources.map((resource) => (
                <div key={resource.id} className="p-3 bg-theme-bg-secondary rounded-md border border-theme-border-primary">
                  <h4 className="font-semibold text-theme-text-primary">{resource.name}</h4>
                  <p className="text-sm text-theme-text-secondary mt-1">{resource.description}</p>
                  {resource.contact && <p className="text-sm text-theme-text-secondary mt-1"><strong>Contacto:</strong> {resource.contact}</p>}
                  {resource.website && (
                    <p className="text-sm text-theme-text-secondary mt-1">
                      <strong>Sitio Web:</strong>{' '}
                      <a href={resource.website} target="_blank" rel="noopener noreferrer" className="text-theme-text-accent hover:underline">
                        {resource.website}
                      </a>
                    </p>
                  )}
                </div>
              )) : <p className="text-theme-text-secondary p-3">No hay recursos que coincidan con su búsqueda en esta categoría.</p>}
            </div>
          )}
        </div>
      )) : <p className="text-theme-text-secondary text-center py-4">No hay categorías de recursos que coincidan con su búsqueda.</p>}
      
      <div className="mt-8 p-4 bg-theme-bg-tertiary border border-theme-border-primary rounded-lg text-sm text-theme-text-secondary">
        <strong>Descargo de Responsabilidad:</strong> Este directorio de recursos es solo para fines informativos. Verifique la exactitud y adecuación de cualquier recurso antes de hacer una referencia. La información puede cambiar y esta lista no es exhaustiva.
      </div>
    </div>
  );
};

export default ResourcesView;
