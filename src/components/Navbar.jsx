import { useState, useEffect } from 'react';
import { MenuIcon, BellIcon, MoonIcon, SunIcon, UserIcon } from 'lucide-react';
import { useDarkMode } from '../context/DarkModeContext';

const Navbar = ({ setSidebarOpen }) => {
  const { darkMode, toggleDarkMode } = useDarkMode();
  const [scrolled, setScrolled] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, message: "New model available", read: false },
    { id: 2, message: "Workflow completed", read: false }
  ]);
  const [showNotifications, setShowNotifications] = useState(false);
  
  // Handle scroll event to add shadow when scrolled
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  const unreadCount = notifications.filter(n => !n.read).length;
  
  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  return (
    <header 
      className={`bg-white dark:bg-gray-800 h-16 flex items-center transition-all duration-300
        ${scrolled ? 'shadow-md' : 'shadow-sm'} sticky top-0 z-30`}
    >
      <div className="flex-1 px-4 flex justify-between">
        <div className="flex-1 flex items-center">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-md text-gray-500 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 transition-colors"
            aria-label="Open sidebar"
          >
            <MenuIcon className="h-6 w-6" />
          </button>
          <div className="ml-2 lg:ml-0">
            <h1 className="text-xl font-semibold text-gray-800 dark:text-white bg-gradient-to-r from-primary-600 to-blue-500 bg-clip-text text-transparent animate-fade-in">
              AgentFlow Dashboard
            </h1>
          </div>
        </div>
        <div className="ml-4 flex items-center space-x-4">
          <button 
            onClick={toggleDarkMode}
            className="p-1 rounded-full text-gray-500 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-transform duration-300 hover:rotate-12"
            aria-label="Toggle dark mode"
          >
            {darkMode ? (
              <SunIcon className="h-6 w-6 text-amber-400" />
            ) : (
              <MoonIcon className="h-6 w-6" />
            )}
          </button>
          
          <div className="relative">
            <button 
              className="p-1 rounded-full text-gray-500 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <BellIcon className="h-6 w-6" />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 block h-4 w-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center transform -translate-y-1/2 translate-x-1/2 animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>
            
            {/* Notification dropdown */}
            {showNotifications && (
              <div className="origin-top-right absolute right-0 mt-2 w-72 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none animate-slide-down divide-y divide-gray-100 dark:divide-gray-700">
                <div className="py-1 px-3 bg-gray-50 dark:bg-gray-750 rounded-t-md">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-200">Notifications</h3>
                </div>
                <div className="max-h-60 overflow-y-auto">
                  {notifications.length ? (
                    notifications.map((notification) => (
                      <div 
                        key={notification.id} 
                        className={`px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer
                          ${notification.read ? 'opacity-60' : 'border-l-2 border-primary-500'}`}
                        onClick={() => markAsRead(notification.id)}
                      >
                        <p className="text-sm text-gray-700 dark:text-gray-300">{notification.message}</p>
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                      No notifications.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          
          <div className="relative">
            <button className="flex items-center rounded-full bg-gray-100 dark:bg-gray-700 p-1 hover:ring-2 hover:ring-primary-500 transition-all duration-300 group">
              <UserIcon className="h-6 w-6 text-gray-600 dark:text-gray-300 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
