import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { Theme } from '../../types';

const themes: { name: string; value: Theme }[] = [
  { name: 'Formal', value: 'formal' }, 
  { name: 'Vibrante', value: 'vibrant' },
  { name: 'Terracota', value: 'terracotta' }, // Changed from Carbón/charcoal
];

const ThemeSwitcher: React.FC = () => {
  const { theme, setTheme } = useTheme();

  return (
    <div className="mt-2">
      <label htmlFor="theme-select" className="block text-xs font-medium text-theme-text-secondary mb-1">
        Tema Visual
      </label>
      <select
        id="theme-select"
        value={theme}
        onChange={(e) => setTheme(e.target.value as Theme)}
        className="w-full p-2 text-xs border border-theme-border-primary rounded-md bg-theme-bg-secondary text-theme-text-primary focus:ring-theme-accent-primary focus:border-theme-accent-primary"
      >
        {themes.map((t) => (
          <option key={t.value} value={t.value}>
            {t.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default ThemeSwitcher;