import { Link, useLocation } from '@tanstack/react-router';
import { Calendar, Settings, List } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Header() {
  const location = useLocation();

  const navigation = [
    { name: 'Calendar', href: '/', icon: Calendar },
    { name: 'Events', href: '/events', icon: List },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Title */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-8 w-8 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900">My Calendar</h1>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex space-x-8">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;

              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    'flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100',
                  )}
                  activeProps={{
                    className: 'bg-blue-100 text-blue-700',
                  }}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}
