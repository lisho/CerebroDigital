
import React, { useState, useEffect, useCallback } from 'react';
import { ClientNote } from '../../types';
import { analyzeTextWithAI } from '../../services/geminiService';
import LoadingSpinner from '../LoadingSpinner';
import { MOCK_CLIENT_NOTES_KEY } from '../../constants';
import { DocumentTextIcon } from '../Sidebar'; // Assuming this is a suitable icon
import PlusIcon from '../icons/PlusIcon'; // Use common PlusIcon

const TrashIcon = () => (
 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
  <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12.56 0c1.153 0 2.242.078 3.324.225m8.916-.225c-.342.052-.682.107-1.022.166m0 0a48.11 48.11 0 013.478-.397m0 0c-.409 0-.804.024-1.183.066M12 3.75l-.16.008c-.302.016-.601.04-.896.072C9.666 3.976 8.54 4.49 7.75 5.451L4.25 10.5m0 0L3.25 11m1.001-1.001L3.25 11m0 0L2.25 12m1.001-1.001L2.25 12m0 0L1.25 13m1.001-1.001L1.25 13M3.75 7.5h16.5M4.5 10.5h15M5.25 13.5h13.5m-13.5 3h13.5m-13.5 3h13.5" />
</svg>
);

const LightbulbIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.354a15.055 15.055 0 01-4.5 0M12 3a.75.75 0 00-.75.75v2.25m0-2.25a.75.75 0 01.75.75v2.25m0 0A2.25 2.25 0 0112 7.5H9.75A2.25 2.25 0 017.5 5.25V3m3.75 0A2.25 2.25 0 0012 3.75M12 3.75A2.25 2.25 0 0114.25 6v2.25M12 7.5A2.25 2.25 0 019.75 9.75V12m0 0A2.25 2.25 0 0012 14.25m0 0A2.25 2.25 0 0114.25 12v-2.25M12 7.5c0 .828-.672 1.5-1.5 1.5S9 8.328 9 7.5s.672-1.5 1.5-1.5S12 6.672 12 7.5z" />
  </svg>
);


const ClientNotesView: React.FC = () => {
  const [notes, setNotes] = useState<ClientNote[]>([]);
  const [isLoading, setIsLoadingNotes] = useState(true); // Added
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [newNoteTags, setNewNoteTags] = useState('');
  const [selectedNote, setSelectedNote] = useState<ClientNote | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<{text: string; sources?: any[]} | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');


  const loadNotes = useCallback(async () => {
    setIsLoadingNotes(true);
    const storedNotes = localStorage.getItem(MOCK_CLIENT_NOTES_KEY);
    if (storedNotes) {
      setNotes(JSON.parse(storedNotes));
      setIsLoadingNotes(false);
    } else {
      try {
        const response = await fetch('/data/clientNotes.json');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const fetchedNotes: ClientNote[] = await response.json();
        setNotes(fetchedNotes);
        localStorage.setItem(MOCK_CLIENT_NOTES_KEY, JSON.stringify(fetchedNotes));
      } catch (error) {
        console.error("Error fetching initial client notes:", error);
        setNotes([]);
      } finally {
        setIsLoadingNotes(false);
      }
    }
  }, []);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  const saveNotes = (updatedNotes: ClientNote[]) => {
    setNotes(updatedNotes);
    localStorage.setItem(MOCK_CLIENT_NOTES_KEY, JSON.stringify(updatedNotes));
  };

  const handleAddNote = () => {
    if (!newNoteTitle.trim() || !newNoteContent.trim()) {
      alert('El título y el contenido son obligatorios.');
      return;
    }
    const note: ClientNote = {
      id: Date.now().toString(),
      title: newNoteTitle,
      content: newNoteContent,
      date: new Date().toISOString().split('T')[0],
      tags: newNoteTags.split(',').map(tag => tag.trim()).filter(tag => tag),
    };
    saveNotes([note, ...notes]);
    setNewNoteTitle('');
    setNewNoteContent('');
    setNewNoteTags('');
    setShowAddForm(false);
  };

  const handleDeleteNote = (id: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta nota?')) {
      saveNotes(notes.filter(note => note.id !== id));
      if (selectedNote?.id === id) {
        setSelectedNote(null);
        setAnalysisResult(null);
      }
    }
  };

  const handleAnalyzeNote = async (note: ClientNote) => {
    setSelectedNote(note);
    setIsAnalyzing(true);
    setAnalysisResult(null);
    try {
      const result = await analyzeTextWithAI(note.content, `Analiza la siguiente nota de caso de trabajo social. Proporciona un resumen conciso, identifica posibles fortalezas del cliente, riesgos, necesidades y sugiere 2-3 posibles próximos pasos o consideraciones para el trabajador social. Estructura tu respuesta claramente con encabezados para cada sección (Resumen, Fortalezas, Riesgos, Necesidades, Próximos Pasos/Consideraciones). Nota del Caso:\n`);
      setAnalysisResult(result);
    } catch (error) {
      setAnalysisResult({ text: `Error analizando la nota: ${error instanceof Error ? error.message : String(error)}` });
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  const filteredNotes = notes.filter(note => 
    note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
        <p className="ml-3 text-theme-text-secondary">Cargando notas...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h2 className="text-2xl md:text-3xl font-semibold text-theme-text-primary">Notas de Cliente</h2>
        <button
          onClick={() => { setShowAddForm(!showAddForm); setSelectedNote(null); setAnalysisResult(null); }}
          className="w-full md:w-auto flex items-center justify-center px-4 py-2 bg-theme-button-primary-bg text-theme-button-primary-text rounded-md hover:bg-theme-button-primary-hover-bg transition-colors text-sm"
        >
          <PlusIcon className="w-5 h-5 mr-2" /> {showAddForm ? 'Cancelar' : 'Añadir Nueva Nota'}
        </button>
      </div>

      {showAddForm && (
        <div className="bg-theme-bg-card p-6 rounded-lg shadow-md space-y-4">
          <h3 className="text-xl font-semibold text-theme-text-primary">Nueva Nota de Cliente</h3>
          <input
            type="text"
            placeholder="Título de la Nota"
            value={newNoteTitle}
            onChange={(e) => setNewNoteTitle(e.target.value)}
            className="w-full p-2 border border-theme-border-primary rounded-md bg-theme-bg-secondary text-theme-text-primary focus:ring-theme-accent-primary focus:border-theme-accent-primary"
          />
          <textarea
            placeholder="Contenido de la Nota..."
            value={newNoteContent}
            onChange={(e) => setNewNoteContent(e.target.value)}
            rows={5}
            className="w-full p-2 border border-theme-border-primary rounded-md bg-theme-bg-secondary text-theme-text-primary focus:ring-theme-accent-primary focus:border-theme-accent-primary"
          />
          <input
            type="text"
            placeholder="Etiquetas (separadas por comas, ej: vivienda, salud mental)"
            value={newNoteTags}
            onChange={(e) => setNewNoteTags(e.target.value)}
            className="w-full p-2 border border-theme-border-primary rounded-md bg-theme-bg-secondary text-theme-text-primary focus:ring-theme-accent-primary focus:border-theme-accent-primary"
          />
          <button
            onClick={handleAddNote}
            className="px-4 py-2 bg-theme-button-secondary-bg text-theme-button-secondary-text rounded-md hover:bg-theme-button-secondary-hover-bg transition-colors"
          >
            Guardar Nota
          </button>
        </div>
      )}
      
      <div className="bg-theme-bg-card p-4 rounded-lg shadow-md">
         <input
          type="text"
          placeholder="Buscar notas por título, contenido o etiqueta..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-3 border border-theme-border-primary rounded-md bg-theme-bg-secondary text-theme-text-primary focus:ring-theme-accent-primary focus:border-theme-accent-primary"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-4 max-h-[60vh] overflow-y-auto pr-2">
          {filteredNotes.length > 0 ? filteredNotes.map(note => (
            <div key={note.id} className={`p-4 rounded-lg shadow-md cursor-pointer transition-all duration-150 ease-in-out 
              ${selectedNote?.id === note.id ? 'bg-theme-accent-primary-light ring-2 ring-theme-accent-primary' : 'bg-theme-bg-card hover:shadow-lg'}`}>
              <div onClick={() => { setSelectedNote(note); setAnalysisResult(null); }}>
                <h4 className={`font-semibold ${selectedNote?.id === note.id ? 'text-theme-accent-primary-dark' : 'text-theme-accent-primary'}`}>{note.title}</h4>
                <p className="text-xs text-theme-text-secondary">{new Date(note.date).toLocaleDateString()}</p>
                <p className="text-sm text-theme-text-primary mt-1 truncate">{note.content}</p>
                {note.tags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {note.tags.map(tag => (
                      <span key={tag} className="text-xs bg-theme-bg-tertiary text-theme-text-secondary px-2 py-0.5 rounded-full">{tag}</span>
                    ))}
                  </div>
                )}
              </div>
              <div className="mt-3 pt-3 border-t border-theme-border-secondary flex justify-between items-center">
                <button
                  onClick={() => handleAnalyzeNote(note)}
                  disabled={isAnalyzing && selectedNote?.id === note.id}
                  className="text-xs px-3 py-1 bg-accent text-white rounded-md hover:bg-amber-600 transition-colors flex items-center disabled:opacity-50" // Accent is a fixed color from Tailwind config for now
                >
                  <LightbulbIcon/> <span className="ml-1">Analizar</span>
                </button>
                <button
                  onClick={() => handleDeleteNote(note.id)}
                  className="text-xs px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors" // Red also fixed for now
                >
                 <TrashIcon/>
                </button>
              </div>
            </div>
          )) : <p className="text-theme-text-secondary text-center py-4">No hay notas, o limpie la búsqueda.</p>}
        </div>

        <div className="md:col-span-2 bg-theme-bg-card p-6 rounded-lg shadow-md min-h-[60vh] max-h-[70vh] overflow-y-auto">
          {selectedNote ? (
            <div>
              <h3 className="text-2xl font-semibold text-theme-text-primary mb-2">{selectedNote.title}</h3>
              <p className="text-sm text-theme-text-secondary mb-1">Fecha: {new Date(selectedNote.date).toLocaleDateString()}</p>
               {selectedNote.tags.length > 0 && (
                  <div className="mb-3 flex flex-wrap gap-1">
                    {selectedNote.tags.map(tag => (
                      <span key={tag} className="text-xs bg-theme-bg-tertiary text-theme-text-secondary px-2 py-1 rounded-full">{tag}</span>
                    ))}
                  </div>
                )}
              <h4 className="font-semibold mt-4 mb-1 text-theme-text-primary">Nota Completa:</h4>
              <div className="prose prose-sm max-w-none bg-theme-bg-secondary p-3 rounded whitespace-pre-wrap text-theme-text-primary max-h-60 overflow-y-auto">
                {selectedNote.content}
              </div>

              {isAnalyzing && (
                <div className="mt-6 text-center">
                  <LoadingSpinner color="text-theme-accent-primary" />
                  <p className="text-theme-text-secondary mt-2">Eulogio está analizando la nota...</p>
                </div>
              )}
              {analysisResult && (
                <div className="mt-6">
                  <h4 className="text-xl font-semibold text-theme-accent-primary mb-2">Análisis IA:</h4>
                   {analysisResult.sources && analysisResult.sources.length > 0 && (
                    <div className="mb-3 p-2 bg-amber-50 border border-amber-200 rounded">
                      <p className="text-xs font-semibold text-amber-700">Información potencialmente complementada por (verificar relevancia):</p>
                      <ul className="list-disc list-inside text-xs">
                        {analysisResult.sources.map((src, idx) => (
                          <li key={idx}><a href={src.uri} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">{src.title}</a></li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <div className="prose prose-sm max-w-none bg-theme-bg-tertiary p-4 rounded whitespace-pre-wrap text-theme-text-primary">
                    {analysisResult.text}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-theme-text-secondary">
              <DocumentTextIcon />
              <p className="mt-4 text-lg">Seleccione una nota para ver sus detalles o añada una nueva.</p>
              <p className="text-sm">También puede obtener análisis por IA para las notas seleccionadas.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientNotesView;
