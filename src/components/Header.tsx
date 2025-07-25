import { Link, useLocation } from '@tanstack/react-router';
import { Calendar, Settings, List } from 'lucide-react';
import { cn } from '../lib/utils';
import { useThemeContext } from './ThemeProvider';
import { ThemeToggle } from './ThemeToggle';

export default function Header() {
  const location = useLocation();
  const { theme } = useThemeContext();

  const navigation = [
    { name: 'Calendar', href: '/', icon: Calendar },
    { name: 'Events', href: '/events', icon: List },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <header
      id="navigation"
      role="banner"
      className={cn(
        'transition-colors duration-200 border-b shadow-sm',
        'bg-white dark:bg-gray-900',
        'border-gray-200 dark:border-gray-700',
      )}
      style={{
        backgroundColor: theme.colors.surfaceElevated,
        borderColor: theme.colors.border.default,
        boxShadow: theme.colors.shadow.sm,
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Title */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Calendar
                className="h-8 w-8 transition-colors duration-200"
                style={{ color: theme.colors.primary.main }}
              />
              <h1
                className="text-xl font-bold transition-colors duration-200"
                style={{ color: theme.colors.text.primary }}
              >
                My Calendar
              </h1>
            </div>
          </div>

          {/* Right Section - Navigation and Theme Toggle */}
          <div className="flex items-center space-x-4">
            {/* Navigation */}
            <nav
              className="flex space-x-8"
              role="navigation"
              aria-label="Main navigation"
            >
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;

                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={cn(
                      'flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200',
                      'hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2',
                      isActive ? 'shadow-sm font-semibold' : 'hover:shadow-sm',
                    )}
                    style={{
                      backgroundColor: isActive
                        ? theme.colors.primary.bg
                        : 'transparent',
                      color: isActive
                        ? theme.colors.primary.main
                        : theme.colors.text.secondary,
                      borderRadius: theme.borderRadius.md,
                    }}
                    activeProps={{
                      style: {
                        backgroundColor: theme.colors.primary.bg,
                        color: theme.colors.primary.main,
                      },
                    }}
                  >
                    <Icon className="h-4 w-4 transition-transform duration-200" />
                    <span className="transition-colors duration-200">
                      {item.name}
                    </span>
                  </Link>
                );
              })}
            </nav>

            {/* Theme Toggle */}
            <div className="flex items-center border-l border-gray-200 dark:border-gray-700 pl-4">
              <ThemeToggle
                size="md"
                variant="outline"
                className="transition-all duration-200 hover:scale-105"
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
