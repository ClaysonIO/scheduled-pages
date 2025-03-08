import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline } from '@mui/material';
import ScheduleListPage from './components/ScheduleListPage';
import ScheduleDetailPage from './components/ScheduleDetailPage';
import CountdownPage from './components/CountdownPage';
import Layout from './components/Layout';
import { ThemeContextProvider } from './context/ThemeContext';
import { scheduler } from './services/scheduler';
import './App.css';

function App() {
  // Start the scheduler when the app loads
  useEffect(() => {
    scheduler.start();
    
    // Clean up when the app unmounts
    return () => {
      scheduler.stop();
    };
  }, []);
  
  return (
    <ThemeContextProvider>
      <CssBaseline />
      <BrowserRouter basename={"/app"}>
        <Layout>
          <Routes>
            <Route path="/" element={<ScheduleListPage />} />
            <Route path="/new" element={<ScheduleDetailPage />} />
            <Route path="/edit/:id" element={<ScheduleDetailPage />} />
            <Route path="/countdown" element={<CountdownPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </ThemeContextProvider>
  );
}

export default App;
