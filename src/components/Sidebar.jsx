import React from 'react';
import { NavLink } from 'react-router-dom';
import { useDarkMode } from '../context/DarkModeContext';

// Import icons from react-icons
import { 
  MdDashboard, 
  MdWorkspaces, 
  MdOutlineHealthAndSafety, 
  MdPerson,
  MdAccessTime,
  MdCategory
} from 'react-icons/md';
import { Brain, Target, Home, FileCog, Goal, ServerCrash, Settings, Command, Zap, LayoutDashboard } from 'lucide-react'; // Using the Brain and Target icons from lucide-react

const Sidebar = ({ isOpen }) => {
  const { darkMode } = useDarkMode();

  // Active menu items
  const activeMenuItems = [
    { path: '/', name: 'Dashboard', icon: <MdDashboard className="text-xl" /> },
    { path: '/health', name: 'Health', icon: <MdOutlineHealthAndSafety className="text-xl" /> },
    { path: '/models', name: 'Models', icon: <MdCategory className="text-xl" /> },
    { path: '/goaltotask', name: 'Goal to Task', icon: <Target className="text-xl" /> },
  ];
  
  // Inactive (grayed out) menu items
  const inactiveMenuItems = [
    { path: '/workflows', name: 'Workflows', icon: <MdWorkspaces className="text-xl" /> },
    { path: '/activities', name: 'Activities', icon: <MdAccessTime className="text-xl" /> },
    { path: '/agents', name: 'Agents', icon: <MdPerson className="text-xl" /> },
  ];

  return (
    <div 
      className={`${isOpen ? 'translate-x-0' : '-translate-x-full'} transform fixed top-0 left-0 z-30 h-full transition-transform duration-300 ease-in-out md:relative md:translate-x-0 md:z-auto`}
    >
      <div 
        className={`h-full w-64 overflow-y-auto shadow-lg ${
          darkMode 
            ? 'bg-gradient-to-b from-gray-800 to-gray-900 text-gray-100' 
            : 'bg-gradient-to-b from-white to-gray-50 text-gray-800'
        } transition-all duration-200 ease-in-out`}
      >
        <div className="px-4 py-6">
          <div className="mb-8">
            <h2 className={`text-xl font-semibold mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
              AI Agents
            </h2>
            <div className={`h-1 w-12 rounded-full ${darkMode ? 'bg-blue-500' : 'bg-indigo-600'}`}></div>
          </div>

          <nav className="flex flex-col h-[calc(100vh-180px)]">
            {/* Active menu items */}
            <ul className="space-y-1">
              {activeMenuItems.map((item) => (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    end={item.path === '/'}
                    className={({ isActive }) => 
                      `flex items-center px-4 py-3 rounded-lg group transition-all duration-200
                      ${isActive 
                        ? (darkMode ? 'bg-gray-700/50 text-blue-400 font-medium shadow-inner' 
                            : 'bg-indigo-50 text-indigo-700 font-medium shadow-sm')
                        : ''
                      } 
                      ${darkMode ? 'hover:bg-gray-700/30' : 'hover:bg-gray-100'}`
                    }
                  >
                    <div className={`mr-3 transition-transform duration-200 group-hover:scale-110 ${darkMode ? 'text-blue-400' : 'text-indigo-600'}`}>
                      {item.icon}
                    </div>
                    <span className="text-sm font-medium">{item.name}</span>
                  </NavLink>
                </li>
              ))}
            </ul>

            {/* Spacer */}
            <div className="flex-grow"></div>

            {/* Divider */}
            <div className={`my-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}></div>

            {/* Inactive menu items */}
            <ul className="space-y-1">
              {inactiveMenuItems.map((item) => (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    end={item.path === '/'}
                    className={`flex items-center px-4 py-3 rounded-lg group transition-all duration-200
                      ${darkMode ? 'text-gray-500 hover:bg-gray-700/20' : 'text-gray-400 hover:bg-gray-100/60'}`
                    }
                  >
                    <div className="mr-3">
                      {item.icon}
                    </div>
                    <span className="text-sm font-medium">{item.name}</span>
                    <span className="ml-auto text-xs px-1.5 py-0.5 rounded bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                      Soon
                    </span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <div className={`absolute bottom-0 left-0 right-0 p-4 ${darkMode ? 'bg-gray-900/80' : 'bg-gray-50/80'} backdrop-blur-sm`}>
          <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            <p>© {new Date().getFullYear()} AI Agents Dashboard</p>
            <p>v1.0.0</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
