import React, {
  useState,
  useCallback,
  useRef,
  useEffect,
  useMemo,
} from 'react';
import { Search, X, Filter, History } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import type { EventCategory } from '../types/event';
import { EventCategory as EventCategoryEnum } from '../types/event';
import { useThemeContext } from './ThemeProvider';
import { cn } from '../lib/utils';

export interface SearchFilters {
  categories: EventCategory[];
  dateRange: {
    start: string | null;
    end: string | null;
  };
}

interface SearchBarProps {
  onSearch: (query: string, filters?: SearchFilters) => void;
  placeholder?: string;
  className?: string;
  onFocus?: () => void;
  onClear?: () => void;
}

const SEARCH_HISTORY_KEY = 'calendar-search-history';
const MAX_HISTORY_ITEMS = 10;

export const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  placeholder = 'Search events...',
  className,
  onFocus,
  onClear,
}) => {
  const { theme } = useThemeContext();
  const [query, setQuery] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedHistoryIndex, setSelectedHistoryIndex] = useState(-1);
  const [filters, setFilters] = useState<SearchFilters>({
    categories: [],
    dateRange: { start: null, end: null },
  });
  const [showFilters, setShowFilters] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load search history from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(SEARCH_HISTORY_KEY);
      if (stored) {
        setSearchHistory(JSON.parse(stored));
      }
    } catch {
      // Silently ignore localStorage errors
    }
  }, []);

  // Save search history to localStorage
  const saveSearchHistory = useCallback((history: string[]) => {
    try {
      localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(history));
    } catch {
      // Silently ignore localStorage errors
    }
  }, []);

  // Add query to search history
  const addToHistory = useCallback(
    (searchQuery: string) => {
      if (!searchQuery.trim() || searchQuery.length < 2) return;

      setSearchHistory((prev) => {
        const filtered = prev.filter((item) => item !== searchQuery);
        const newHistory = [searchQuery, ...filtered].slice(
          0,
          MAX_HISTORY_ITEMS,
        );
        saveSearchHistory(newHistory);
        return newHistory;
      });
    },
    [saveSearchHistory],
  );

  // Debounced search function
  const debouncedSearch = useCallback(
    (searchQuery: string, searchFilters: SearchFilters) => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      debounceTimeoutRef.current = setTimeout(() => {
        onSearch(searchQuery, searchFilters);
        if (searchQuery.trim()) {
          addToHistory(searchQuery.trim());
        }
      }, 300);
    },
    [onSearch, addToHistory],
  );

  // Handle input change
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setQuery(value);
      setSelectedHistoryIndex(-1);
      debouncedSearch(value, filters);
    },
    [filters, debouncedSearch],
  );

  // Handle input focus
  const handleInputFocus = useCallback(() => {
    setIsExpanded(true);
    setShowHistory(searchHistory.length > 0 && !query);
    onFocus?.();
  }, [searchHistory.length, query, onFocus]);

  // Handle input blur
  const handleInputBlur = useCallback(
    (e: React.FocusEvent) => {
      // Don't close if clicking on history items or filter controls
      if (containerRef.current?.contains(e.relatedTarget as Node)) {
        return;
      }

      setTimeout(() => {
        setShowHistory(false);
        setSelectedHistoryIndex(-1);
        if (!query && !showFilters) {
          setIsExpanded(false);
        }
      }, 150);
    },
    [query, showFilters],
  );

  // Handle clear
  const handleClear = useCallback(() => {
    setQuery('');
    setFilters({
      categories: [],
      dateRange: { start: null, end: null },
    });
    onSearch('', {
      categories: [],
      dateRange: { start: null, end: null },
    });
    setShowHistory(false);
    setSelectedHistoryIndex(-1);
    onClear?.();
    inputRef.current?.focus();
  }, [onSearch, onClear]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (showHistory && searchHistory.length > 0) {
        switch (e.key) {
          case 'ArrowDown':
            e.preventDefault();
            setSelectedHistoryIndex((prev) =>
              prev < searchHistory.length - 1 ? prev + 1 : prev,
            );
            break;
          case 'ArrowUp':
            e.preventDefault();
            setSelectedHistoryIndex((prev) => (prev > 0 ? prev - 1 : -1));
            break;
          case 'Enter':
            e.preventDefault();
            if (selectedHistoryIndex >= 0) {
              const selectedQuery = searchHistory[selectedHistoryIndex];
              setQuery(selectedQuery);
              debouncedSearch(selectedQuery, filters);
              setShowHistory(false);
              setSelectedHistoryIndex(-1);
            }
            break;
          case 'Escape':
            e.preventDefault();
            setShowHistory(false);
            setSelectedHistoryIndex(-1);
            if (!query) {
              inputRef.current?.blur();
            }
            break;
        }
      } else if (e.key === 'Escape' && query) {
        handleClear();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        debouncedSearch(query, filters);
        setShowHistory(false);
      }
    },
    [
      showHistory,
      searchHistory,
      selectedHistoryIndex,
      query,
      filters,
      debouncedSearch,
      handleClear,
    ],
  );

  // Handle history item click
  const handleHistoryClick = useCallback(
    (historyQuery: string) => {
      setQuery(historyQuery);
      debouncedSearch(historyQuery, filters);
      setShowHistory(false);
      setSelectedHistoryIndex(-1);
      inputRef.current?.focus();
    },
    [filters, debouncedSearch],
  );

  // Handle category filter toggle
  const handleCategoryToggle = useCallback(
    (category: EventCategory) => {
      const newFilters = {
        ...filters,
        categories: filters.categories.includes(category)
          ? filters.categories.filter((c) => c !== category)
          : [...filters.categories, category],
      };
      setFilters(newFilters);
      debouncedSearch(query, newFilters);
    },
    [filters, query, debouncedSearch],
  );

  // Handle date range change
  const handleDateRangeChange = useCallback(
    (field: 'start' | 'end', value: string) => {
      const newFilters = {
        ...filters,
        dateRange: {
          ...filters.dateRange,
          [field]: value || null,
        },
      };
      setFilters(newFilters);
      debouncedSearch(query, newFilters);
    },
    [filters, query, debouncedSearch],
  );

  // Get active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.categories.length > 0) count++;
    if (filters.dateRange.start || filters.dateRange.end) count++;
    return count;
  }, [filters]);

  // Category options
  const categoryOptions = Object.values(EventCategoryEnum);

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative transition-all duration-200',
        isExpanded ? 'w-full max-w-md' : 'w-64',
        className,
      )}
    >
      {/* Main search input */}
      <div
        className={cn(
          'relative flex items-center rounded-lg border transition-all duration-200',
          isExpanded ? 'shadow-md' : 'shadow-sm',
          'hover:shadow-md focus-within:shadow-lg',
        )}
        style={{
          backgroundColor: theme.colors.surface,
          borderColor: isExpanded
            ? theme.colors.border.focus
            : theme.colors.border.default,
        }}
      >
        <Search
          className="absolute left-3 h-4 w-4 pointer-events-none transition-colors duration-200"
          style={{ color: theme.colors.text.muted }}
        />

        <Input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={cn(
            'pl-10 pr-20 border-0 bg-transparent focus:ring-0 focus:outline-none',
            'placeholder:transition-colors duration-200',
          )}
          style={{
            color: theme.colors.text.primary,
          }}
          aria-label="Search events"
          aria-expanded={showHistory}
          aria-haspopup="listbox"
          role="combobox"
          autoComplete="off"
        />

        <div className="absolute right-2 flex items-center gap-1">
          {/* Filter button */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              'h-7 w-7 p-0 transition-all duration-200',
              showFilters && 'bg-opacity-20',
              activeFilterCount > 0 && 'text-blue-600 dark:text-blue-400',
            )}
            style={{
              color:
                activeFilterCount > 0
                  ? theme.colors.primary.main
                  : theme.colors.text.muted,
            }}
            aria-label={`Toggle filters ${activeFilterCount > 0 ? `(${activeFilterCount} active)` : ''}`}
          >
            <Filter className="h-3 w-3" />
            {activeFilterCount > 0 && (
              <Badge
                variant="secondary"
                className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs"
                style={{
                  backgroundColor: theme.colors.primary.main,
                  color: theme.colors.primary.text,
                }}
              >
                {activeFilterCount}
              </Badge>
            )}
          </Button>

          {/* Clear button */}
          {query && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="h-7 w-7 p-0 transition-all duration-200 hover:scale-105"
              style={{ color: theme.colors.text.muted }}
              aria-label="Clear search"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>

      {/* Search history dropdown */}
      {showHistory && searchHistory.length > 0 && (
        <div
          className={cn(
            'absolute top-full left-0 right-0 mt-1 py-2 rounded-lg border shadow-lg z-50',
            'max-h-60 overflow-y-auto',
          )}
          style={{
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border.default,
            boxShadow: theme.colors.shadow.lg,
          }}
          role="listbox"
          aria-label="Search history"
        >
          <div
            className="px-3 py-1 text-xs font-medium flex items-center gap-2"
            style={{ color: theme.colors.text.muted }}
          >
            <History className="h-3 w-3" />
            Recent searches
          </div>
          {searchHistory.map((historyItem, index) => (
            <button
              key={index}
              onClick={() => handleHistoryClick(historyItem)}
              className={cn(
                'w-full px-3 py-2 text-left text-sm transition-colors duration-150',
                'hover:bg-opacity-10 focus:bg-opacity-10 focus:outline-none',
                selectedHistoryIndex === index && 'bg-opacity-10',
              )}
              style={{
                color: theme.colors.text.primary,
                backgroundColor:
                  selectedHistoryIndex === index
                    ? theme.colors.primary.main + '10'
                    : 'transparent',
              }}
              role="option"
              aria-selected={selectedHistoryIndex === index}
            >
              {historyItem}
            </button>
          ))}
        </div>
      )}

      {/* Filters panel */}
      {showFilters && (
        <div
          className={cn(
            'absolute top-full left-0 right-0 mt-1 p-4 rounded-lg border shadow-lg z-40',
            'space-y-4',
          )}
          style={{
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border.default,
            boxShadow: theme.colors.shadow.lg,
          }}
        >
          {/* Categories filter */}
          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: theme.colors.text.primary }}
            >
              Categories
            </label>
            <div className="flex flex-wrap gap-2">
              {categoryOptions.map((category) => (
                <Button
                  key={category}
                  type="button"
                  variant={
                    filters.categories.includes(category)
                      ? 'default'
                      : 'outline'
                  }
                  size="sm"
                  onClick={() => handleCategoryToggle(category)}
                  className="text-xs transition-all duration-200"
                  style={{
                    backgroundColor: filters.categories.includes(category)
                      ? theme.colors.primary.main
                      : 'transparent',
                    borderColor: theme.colors.border.default,
                    color: filters.categories.includes(category)
                      ? theme.colors.primary.text
                      : theme.colors.text.primary,
                  }}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </Button>
              ))}
            </div>
          </div>

          {/* Date range filter */}
          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: theme.colors.text.primary }}
            >
              Date Range
            </label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label
                  className="block text-xs mb-1"
                  style={{ color: theme.colors.text.muted }}
                >
                  From
                </label>
                <Input
                  type="date"
                  value={filters.dateRange.start || ''}
                  onChange={(e) =>
                    handleDateRangeChange('start', e.target.value)
                  }
                  className="text-sm"
                  style={{
                    backgroundColor: theme.colors.background,
                    borderColor: theme.colors.border.default,
                    color: theme.colors.text.primary,
                  }}
                />
              </div>
              <div>
                <label
                  className="block text-xs mb-1"
                  style={{ color: theme.colors.text.muted }}
                >
                  To
                </label>
                <Input
                  type="date"
                  value={filters.dateRange.end || ''}
                  onChange={(e) => handleDateRangeChange('end', e.target.value)}
                  className="text-sm"
                  style={{
                    backgroundColor: theme.colors.background,
                    borderColor: theme.colors.border.default,
                    color: theme.colors.text.primary,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Filter actions */}
          <div
            className="flex justify-between items-center pt-2 border-t"
            style={{ borderColor: theme.colors.border.muted }}
          >
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setFilters({
                  categories: [],
                  dateRange: { start: null, end: null },
                });
                debouncedSearch(query, {
                  categories: [],
                  dateRange: { start: null, end: null },
                });
              }}
              className="text-xs"
              style={{ color: theme.colors.text.muted }}
            >
              Clear filters
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(false)}
              className="text-xs"
            >
              Done
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
