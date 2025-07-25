import { useThemeContext } from './ThemeProvider';
import { cn } from '../lib/utils';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const { theme } = useThemeContext();

  return (
    <footer
      className={cn(
        'border-t mt-auto transition-colors duration-200',
        'bg-white dark:bg-gray-900',
        'border-gray-200 dark:border-gray-700',
      )}
      style={{
        backgroundColor: theme.colors.surfaceElevated,
        borderColor: theme.colors.border.default,
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
          <div
            className="text-sm transition-colors duration-200"
            style={{ color: theme.colors.text.secondary }}
          >
            © {currentYear} My Calendar App. Built with React 19 & TanStack
            Router.
          </div>

          <div className="flex space-x-6 text-sm">
            {['About', 'Privacy', 'Support'].map((item) => (
              <button
                key={item}
                type="button"
                className={cn(
                  'transition-all duration-200 rounded px-2 py-1',
                  'hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2',
                  'hover:text-primary-foreground hover:bg-primary/25',
                )}
                style={{
                  color: theme.colors.text.secondary,
                  borderRadius: theme.borderRadius.sm,
                }}
                onClick={() => {
                  /* Functionality will be implemented later */
                }}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
