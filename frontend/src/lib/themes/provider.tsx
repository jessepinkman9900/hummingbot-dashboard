'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { ThemeConfig, DEFAULT_THEME_CONFIG, ThemeMode } from './config';

interface ThemeContextType extends ThemeConfig {
  setTheme: (theme: string) => void;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [config, setConfig] = useState<ThemeConfig>(DEFAULT_THEME_CONFIG);
  const [mounted, setMounted] = useState(false);

  // Load theme from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('hummingbot-theme-config');
      if (stored) {
        const parsedConfig = JSON.parse(stored);
        setConfig(parsedConfig);
      }
    } catch (error) {
      console.error('Failed to load theme config:', error);
    }
    setMounted(true);
  }, []);

  // Save theme to localStorage whenever it changes
  useEffect(() => {
    if (mounted) {
      try {
        localStorage.setItem('hummingbot-theme-config', JSON.stringify(config));
      } catch (error) {
        console.error('Failed to save theme config:', error);
      }
    }
  }, [config, mounted]);

  // Apply theme to document
  useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;
    
    // Remove existing theme classes
    root.classList.remove('light', 'dark');
    root.removeAttribute('data-theme');
    
    // Add new theme classes
    root.classList.add(config.mode);
    root.setAttribute('data-theme', config.theme);
    
    // Dynamically load theme CSS
    loadThemeCSS(config.theme);
  }, [config, mounted]);

  const loadThemeCSS = async (themeName: string) => {
    // Remove existing theme stylesheets
    const existingThemeLinks = document.querySelectorAll('link[data-theme-css]');
    existingThemeLinks.forEach(link => link.remove());

    // Load new theme stylesheet
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = `/themes/${themeName}.css`;
    link.setAttribute('data-theme-css', 'true');
    document.head.appendChild(link);
  };

  const setTheme = (theme: string) => {
    setConfig(prev => ({ ...prev, theme }));
  };

  const setMode = (mode: ThemeMode) => {
    setConfig(prev => ({ ...prev, mode }));
  };

  const toggleMode = () => {
    setConfig(prev => ({ 
      ...prev, 
      mode: prev.mode === 'light' ? 'dark' : 'light' 
    }));
  };

  // Don't render until mounted to avoid hydration issues
  if (!mounted) {
    return null;
  }

  const value: ThemeContextType = {
    ...config,
    setTheme,
    setMode,
    toggleMode,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}