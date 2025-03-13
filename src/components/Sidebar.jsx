import { useLocation, Link } from 'react-router-dom';
import { useRef, useEffect } from 'react';
import { 
  HomeIcon, 
  HeartPulseIcon, 
  CpuIcon, 
  UsersIcon, 
  GitBranchIcon, 
  ActivityIcon,
  XIcon,
  ChevronRightIcon
} from 'lucide-react';
import { useDarkMode } from '../context/DarkModeContext';

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const { darkMode } = useDarkMode();
  const location = useLocation();
  const sidebarRef = useRef(null);
  
  const navItems = [
    { name: 'Dashboard', href: '/', icon: HomeIcon },
    { name: 'Models', href: '/models', icon: CpuIcon },
    { name: 'Agents', href: '/agents', icon: UsersIcon },
    { name: 'Workflows', href: '/workflows', icon: GitBranchIcon },
    { name: 'Activities', href: '/activities', icon: ActivityIcon },
    { name: 'Health', href: '/health', icon: HeartPulseIcon },
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };
  
  // Close sidebar when clicking outside (mobile)
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarOpen && sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setSidebarOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [sidebarOpen, setSidebarOpen]);

  // Lock body scroll when sidebar is open on mobile
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [sidebarOpen]);

  return (
    <>
      {/* Mobile sidebar overlay */}
      <div 
        className={`lg:hidden fixed inset-0 bg-gray-900 bg-opacity-75 z-40 backdrop-blur-sm transition-opacity duration-300
          ${sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        aria-hidden="true"
      />

      {/* Mobile sidebar */}
      <div 
        ref={sidebarRef}
        className={`lg:hidden fixed inset-y-0 left-0 w-64 bg-gray-900 dark:bg-gray-900 z-50 transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0 shadow-lg' : '-translate-x-full'}`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <span className="text-xl text-white font-semibold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            AgentFlow
          </span>
          <button 
            className="text-gray-300 hover:text-white transition-colors"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <XIcon className="h-6 w-6" />
          </button>
        </div>
        <nav className="mt-5 px-2 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={`group flex items-center px-2 py-3 text-base font-medium rounded-md transition-all duration-200
                ${isActive(item.href)
                  ? 'bg-gray-800 text-primary-400 border-l-4 border-primary-400 pl-2'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-primary-300'
                }`}
              onClick={() => setSidebarOpen(false)}
            >
              <item.icon className={`mr-4 h-6 w-6 transition-colors
                ${isActive(item.href) ? 'text-primary-400' : 'text-gray-400 group-hover:text-gray-300'}
              `} />
              {item.name}
              {isActive(item.href) && (
                <ChevronRightIcon className="ml-auto h-5 w-5 text-primary-400 animate-pulse-slow" />
              )}
            </Link>
          ))}
        </nav>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className="flex flex-col w-64 bg-gray-900 dark:bg-gray-900">
          <div className="flex items-center h-16 px-4 border-b border-gray-700">
            <span className="text-xl text-white font-semibold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              AgentFlow
            </span>
          </div>
          <div className="flex-1 flex flex-col overflow-y-auto">
            <nav className="flex-1 px-2 py-4 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center px-2 py-3 text-base font-medium rounded-md transition-all duration-200
                    ${isActive(item.href)
                      ? 'bg-gray-800 text-primary-400 border-l-4 border-primary-400 pl-2'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-primary-300'
                    }`}
                >
                  <item.icon className={`mr-4 h-6 w-6 transition-colors
                    ${isActive(item.href) ? 'text-primary-400' : 'text-gray-400 group-hover:text-gray-300'}
                  `} />
                  {item.name}
                  {isActive(item.href) && (
                    <ChevronRightIcon className="ml-auto h-5 w-5 text-primary-400 animate-pulse-slow" />
                  )}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
