import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { Theme } from '../types';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    const storedTheme = localStorage.getItem('appTheme') as Theme | null;
    return storedTheme || 'formal'; // Default theme is 'formal'
  });

  useEffect(() => {
    // Remove all potential theme classes first
    document.documentElement.classList.remove('theme-formal', 'theme-vibrant', 'theme-terracotta'); // Updated from charcoal
    
    // Add the specific theme class if it's not the default 'formal'
    if (theme !== 'formal') { 
        document.documentElement.classList.add(`theme-${theme}`);
    }
    // For 'formal' theme, no class is needed as :root styles will apply.

    localStorage.setItem('appTheme', theme);
  }, [theme]);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};