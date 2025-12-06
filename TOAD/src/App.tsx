import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { SearchProvider } from './context/SearchContext';
import { TaskProvider } from './context/TaskContext';
import { LandingPage } from './pages/LandingPage';
import { KanbanPage } from './pages/KanbanPage';
import { ListPage } from './pages/ListPage';
import { CalendarPage } from './pages/CalendarPage';
import { TimelinePage } from './pages/TimelinePage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { SprintBoardPage } from './pages/SprintBoardPage';
import { TeamPage } from './pages/TeamPage';
import { AiAssistant } from './components/ai/AiAssistant';
import lightLogo from '../images/bg-white.png';
import darkLogo from '../images/bg-black.png';

function SplashScreen() {
  const { theme } = useTheme();
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white dark:bg-black">
      <div className="flex flex-col items-center gap-4">
        <img
          src={theme === 'dark' ? darkLogo : lightLogo}
          alt="TOAD"
          className="w-24 h-24 rounded-2xl object-cover shadow-lg"
        />
        <div className="text-sm text-gray-600 dark:text-gray-300">Loading...</div>
      </div>
    </div>
  );
}

function App() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setShowSplash(false), 1500);
    return () => clearTimeout(t);
  }, []);

  return (
    <ThemeProvider>
      <TaskProvider>
        <SearchProvider>
          <Router>
            {showSplash && <SplashScreen />}
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/app/kanban" element={<><KanbanPage /><AiAssistant /></>} />
              <Route path="/app/list" element={<><ListPage /><AiAssistant /></>} />
              <Route path="/app/calendar" element={<><CalendarPage /><AiAssistant /></>} />
              <Route path="/app/timeline" element={<><TimelinePage /><AiAssistant /></>} />
              <Route path="/app/analytics" element={<><AnalyticsPage /><AiAssistant /></>} />
              <Route path="/app/sprint" element={<><SprintBoardPage /><AiAssistant /></>} />
              <Route path="/app/team" element={<><TeamPage /><AiAssistant /></>} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
        </SearchProvider>
      </TaskProvider>
    </ThemeProvider>
  );
}

export default App;
