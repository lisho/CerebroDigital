import React, { useState, useEffect } from 'react';
import { ClientNote } from '../../types';

export interface CaseNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (noteData: { title: string; content: string; tags: string; }) => void;
  noteToEdit?: ClientNote | null;
}

const CaseNoteModal: React.FC<CaseNoteModalProps> = ({ isOpen, onClose, onSave, noteToEdit }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');

  useEffect(() => {
    if (noteToEdit) {
      setTitle(noteToEdit.title);
      setContent(noteToEdit.content);
      setTags(noteToEdit.tags.join(', '));
    } else {
      setTitle('');
      setContent('');
      setTags('');
    }
  }, [noteToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
        alert("El título y contenido de la nota son obligatorios.");
        return;
    }
    onSave({ title, content, tags });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-[950]">
      <div className="bg-theme-bg-card p-6 rounded-lg shadow-xl w-full max-w-lg">
        <h2 className="text-xl font-semibold text-theme-text-primary mb-4">{noteToEdit ? 'Editar Nota' : 'Nueva Nota'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" placeholder="Título" value={title} onChange={e => setTitle(e.target.value)} required className="w-full p-2 border border-theme-border-primary rounded-md bg-theme-bg-secondary text-theme-text-primary focus:ring-theme-accent-primary focus:border-theme-accent-primary" />
          <textarea placeholder="Contenido" value={content} onChange={e => setContent(e.target.value)} rows={5} required className="w-full p-2 border border-theme-border-primary rounded-md bg-theme-bg-secondary text-theme-text-primary focus:ring-theme-accent-primary focus:border-theme-accent-primary" />
          <input type="text" placeholder="Etiquetas (separadas por comas)" value={tags} onChange={e => setTags(e.target.value)} className="w-full p-2 border border-theme-border-primary rounded-md bg-theme-bg-secondary text-theme-text-primary focus:ring-theme-accent-primary focus:border-theme-accent-primary" />
          <div className="flex justify-end space-x-2">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-theme-button-secondary-bg text-theme-button-secondary-text rounded-md hover:bg-theme-button-secondary-hover-bg">Cancelar</button>
            <button type="submit" className="px-4 py-2 bg-theme-button-primary-bg text-theme-button-primary-text rounded-md hover:bg-theme-button-primary-hover-bg">{noteToEdit ? 'Guardar Cambios' : 'Crear Nota'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CaseNoteModal;
