import { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Models from './pages/Models';
import Agents from './pages/Agents';
import Workflows from './pages/Workflows';
import Activities from './pages/Activities';
import Health from './pages/Health';
import GoalToTask from './pages/GoalToTask';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import LoadingIndicator from './components/LoadingIndicator';
import { DarkModeProvider } from './context/DarkModeContext';

// AnimatedRoutes component with transition animation
const AnimatedRoutes = () => {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [prevLocation, setPrevLocation] = useState('');
  const loadingTimerRef = useRef(null);
  
  // Improved loading state management
  useEffect(() => {
    if (prevLocation !== location.pathname) {
      // Clear any existing timer to prevent race conditions
      if (loadingTimerRef.current) {
        clearTimeout(loadingTimerRef.current);
      }
      
      // Start loading
      setIsLoading(true);
      
      // Set a maximum loading time to ensure the indicator always completes
      loadingTimerRef.current = setTimeout(() => {
        setIsLoading(false);
        loadingTimerRef.current = null;
      }, 800); // Increased timeout slightly for better UX
      
      setPrevLocation(location.pathname);
    }
  }, [location, prevLocation]);
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (loadingTimerRef.current) {
        clearTimeout(loadingTimerRef.current);
      }
    };
  }, []);
  
  return (
    <>
      <LoadingIndicator isLoading={isLoading} />
      
      <div className={`transition-opacity duration-300 ${isLoading ? 'opacity-70' : 'opacity-100'}`}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/models" element={<Models />} />
          <Route path="/agents" element={<Agents />} />
          <Route path="/workflows" element={<Workflows />} />
          <Route path="/activities" element={<Activities />} />
          <Route path="/health" element={<Health />} />
          <Route path="/goaltotask" element={<GoalToTask />} />
        </Routes>
      </div>
    </>
  );
};

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  return (
    <Router>
      <DarkModeProvider>
        <div className="h-screen flex overflow-hidden bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-200">
          <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
          
          <div className="flex-1 flex flex-col overflow-hidden">
            <Navbar setSidebarOpen={setSidebarOpen} />
            
            <main className="flex-1 overflow-y-auto focus:outline-none p-6">
              <AnimatedRoutes />
            </main>
          </div>
        </div>
      </DarkModeProvider>
    </Router>
  );
}

export default App;
