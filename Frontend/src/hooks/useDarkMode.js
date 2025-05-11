import { useState, useEffect } from 'react';

function useDarkMode() {
  // Initialize with the system preference
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    // Create a media query for dark mode preference
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    // Define the handler to update state when preference changes
    const handleChange = (event) => {
      setIsDarkMode(event.matches);
    };

    // Add event listener
    mediaQuery.addEventListener('change', handleChange);
    
    // Initial check
    setIsDarkMode(mediaQuery.matches);
    
    // Apply dark mode class to document if needed
    if (mediaQuery.matches) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Clean up
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  return isDarkMode;
}

export default useDarkMode;