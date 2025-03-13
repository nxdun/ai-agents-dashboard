import { Link } from 'react-router-dom';
import { useState } from 'react';

const StatusCard = ({ title, value, icon, loading, href, color }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <Link
      to={href}
      className={`bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg transform transition-all duration-300
        border border-gray-200 dark:border-gray-700 hover:shadow-soft-xl hover:-translate-y-1 
        ${isHovered ? 'ring-2 ring-offset-2 ring-opacity-50 ' + color.replace('bg-', 'ring-') : ''}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="p-5">
        <div className="flex items-center">
          <div className={`flex-shrink-0 p-3 rounded-md ${color} transform transition-transform ${isHovered ? 'scale-110' : ''}`}>
            {icon}
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate transition-colors">{title}</dt>
              <dd>
                {loading ? (
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mt-1 w-16"></div>
                ) : (
                  <div className={`text-lg font-semibold text-gray-900 dark:text-white transition-all duration-300 
                      ${isHovered ? 'text-primary-600 dark:text-primary-400 transform translate-x-1' : ''}`}>
                    {value}
                  </div>
                )}
              </dd>
            </dl>
          </div>
        </div>
      </div>
      
      {/* Decorative line at bottom that expands on hover */}
      <div className="relative h-1">
        <div 
          className={`absolute bottom-0 left-0 h-1 ${color.replace('bg-', 'bg-opacity-75 bg-')} transition-all duration-500 ease-out`}
          style={{ width: isHovered ? '100%' : '0%' }}
        />
      </div>
    </Link>
  );
};

export default StatusCard;
