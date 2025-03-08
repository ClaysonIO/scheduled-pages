import { createContext, useState, useMemo, ReactNode } from 'react';
import { ThemeProvider, createTheme, PaletteMode } from '@mui/material';

// Define the context type
interface ThemeModeContextType {
  mode: PaletteMode;
  toggleThemeMode: () => void;
}

// Create the context with a default value
export const ThemeModeContext = createContext<ThemeModeContextType>({
  mode: 'light',
  toggleThemeMode: () => {},
});

// Define the props for the provider component
interface ThemeProviderProps {
  children: ReactNode;
}

// Create the theme provider component
export function ThemeContextProvider({ children }: ThemeProviderProps) {
  const [mode, setMode] = useState<PaletteMode>('light');

  // Toggle between light and dark mode
  const toggleThemeMode = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  // Create the context value
  const themeModeContextValue = useMemo(
    () => ({
      mode,
      toggleThemeMode,
    }),
    [mode]
  );

  // Create the theme based on the current mode
  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: {
            // Deep indigo
            main: mode === 'light' ? '#3f51b5' : '#5c6bc0',
            light: mode === 'light' ? '#7986cb' : '#8c9eff',
            dark: mode === 'light' ? '#303f9f' : '#3949ab',
            contrastText: '#ffffff',
          },
          secondary: {
            // Vibrant teal
            main: mode === 'light' ? '#00897b' : '#26a69a',
            light: mode === 'light' ? '#4ebaaa' : '#64d8cb',
            dark: mode === 'light' ? '#00695c' : '#00796b',
            contrastText: '#ffffff',
          },
          background: {
            default: mode === 'light' ? '#f5f7fa' : '#121212',
            paper: mode === 'light' ? '#ffffff' : '#1e1e1e',
          },
          text: {
            primary: mode === 'light' ? 'rgba(0, 0, 0, 0.87)' : 'rgba(255, 255, 255, 0.87)',
            secondary: mode === 'light' ? 'rgba(0, 0, 0, 0.6)' : 'rgba(255, 255, 255, 0.6)',
          },
        },
        typography: {
          fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
          h1: {
            fontWeight: 500,
          },
          h2: {
            fontWeight: 500,
          },
          h3: {
            fontWeight: 500,
          },
          h4: {
            fontWeight: 500,
          },
          h5: {
            fontWeight: 500,
          },
          h6: {
            fontWeight: 500,
          },
        },
        components: {
          MuiButton: {
            styleOverrides: {
              root: {
                borderRadius: 8,
                textTransform: 'none',
                fontWeight: 500,
              },
              contained: {
                boxShadow: 'none',
                '&:hover': {
                  boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.2)',
                },
              },
            },
          },
          MuiPaper: {
            styleOverrides: {
              root: {
                borderRadius: 8,
                boxShadow: mode === 'light' 
                  ? '0px 2px 8px rgba(0, 0, 0, 0.05)' 
                  : '0px 2px 8px rgba(0, 0, 0, 0.2)',
              },
            },
          },
          MuiAppBar: {
            styleOverrides: {
              root: {
                boxShadow: mode === 'light'
                  ? '0px 2px 8px rgba(0, 0, 0, 0.05)'
                  : '0px 2px 8px rgba(0, 0, 0, 0.2)',
              },
            },
          },
          MuiTableCell: {
            styleOverrides: {
              head: {
                fontWeight: 600,
                backgroundColor: mode === 'light' ? '#f5f7fa' : '#1e1e1e',
              },
            },
          },
        },
      }),
    [mode]
  );

  return (
    <ThemeModeContext.Provider value={themeModeContextValue}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </ThemeModeContext.Provider>
  );
}
