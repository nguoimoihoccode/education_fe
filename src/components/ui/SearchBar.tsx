import React, { useState, useRef, useEffect, useCallback } from 'react'
import { cn, debounce } from '@/lib/utils'
export interface Stock {
  symbol: string;
  name: string;
  exchange?: string;
  index?: string;
}

export interface SearchBarProps {
  /**
   * Array of stocks to search through
   */
  stocks: Stock[]
  /**
   * Placeholder text
   * @default "Tìm kiếm mã cổ phiếu..."
   */
  placeholder?: string
  /**
   * Callback when a stock is selected
   */
  onSelect?: (stock: Stock) => void
  /**
   * Callback when search term changes
   */
  onSearchChange?: (term: string) => void
  /**
   * Maximum number of results to show
   * @default 8
   */
  maxResults?: number
  /**
   * Debounce delay in milliseconds
   * @default 300
   */
  debounceMs?: number
  /**
   * Additional CSS classes
   */
  className?: string
}

/**
 * SearchBar Component
 * 
 * Autocomplete search bar for finding stocks by symbol or name.
 * Features keyboard navigation, debounced search, and cyberpunk styling.
 * 
 * @example
 * ```tsx
 * <SearchBar
 *   stocks={allStocks}
 *   onSelect={(stock) => navigate(`/stock/${stock.symbol}`)}
 *   onSearchChange={(term) => console.log('Searching:', term)}
 * />
 * ```
 */
export const SearchBar: React.FC<SearchBarProps> = ({
  stocks,
  placeholder = 'Tìm kiếm mã cổ phiếu...',
  onSelect,
  onSearchChange,
  maxResults = 8,
  debounceMs = 300,
  className,
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [filteredStocks, setFilteredStocks] = useState<Stock[]>([])
  
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const resultsRef = useRef<HTMLDivElement>(null)

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((term: string) => {
      if (onSearchChange) {
        onSearchChange(term)
      }

      if (!term.trim()) {
        setFilteredStocks([])
        setIsOpen(false)
        return
      }

      const lowerTerm = term.toLowerCase()
      const results = stocks
        .filter(stock => 
          stock.symbol.toLowerCase().includes(lowerTerm) ||
          stock.name.toLowerCase().includes(lowerTerm)
        )
        .slice(0, maxResults)

      setFilteredStocks(results)
      setIsOpen(results.length > 0)
      setSelectedIndex(-1)
    }, debounceMs),
    [stocks, maxResults, onSearchChange]
  )

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchTerm(value)
    debouncedSearch(value)
  }

  // Handle stock selection
  const handleSelect = (stock: Stock) => {
    setSearchTerm('')
    setIsOpen(false)
    setFilteredStocks([])
    if (onSelect) {
      onSelect(stock)
    }
    inputRef.current?.blur()
  }

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || filteredStocks.length === 0) {
      if (e.key === 'Escape') {
        setSearchTerm('')
        setIsOpen(false)
        inputRef.current?.blur()
      }
      return
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev < filteredStocks.length - 1 ? prev + 1 : prev
        )
        break
      
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1))
        break
      
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && selectedIndex < filteredStocks.length) {
          handleSelect(filteredStocks[selectedIndex])
        }
        break
      
      case 'Escape':
        e.preventDefault()
        setSearchTerm('')
        setIsOpen(false)
        inputRef.current?.blur()
        break
    }
  }

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Scroll selected item into view
  useEffect(() => {
    if (selectedIndex >= 0 && resultsRef.current) {
      const selectedElement = resultsRef.current.children[selectedIndex] as HTMLElement
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
      }
    }
  }, [selectedIndex])

  // Clear button handler
  const handleClear = () => {
    setSearchTerm('')
    setFilteredStocks([])
    setIsOpen(false)
    inputRef.current?.focus()
  }

  return (
    <div ref={containerRef} className={cn('relative w-full', className)}>
      {/* Input Container */}
      <div className="relative">
        {/* Search Icon */}
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neon-cyan">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        {/* Input Field */}
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => searchTerm && filteredStocks.length > 0 && setIsOpen(true)}
          placeholder={placeholder}
          className={cn(
            'w-full h-11 pl-11 pr-10 rounded-lg',
            'bg-cyber-800/50 border border-cyber-700',
            'text-white placeholder:text-gray-500',
            'focus:outline-none focus:ring-2 focus:ring-neon-cyan/50 focus:border-neon-cyan',
            'transition-all duration-300 motion-reduce:transition-none',
            'backdrop-blur-sm'
          )}
        />

        {/* Clear Button */}
        {searchTerm && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors duration-200 motion-reduce:transition-none cursor-pointer"
            type="button"
            aria-label="Xóa tìm kiếm"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Results Dropdown */}
      {isOpen && filteredStocks.length > 0 && (
        <div
          ref={resultsRef}
          className={cn(
            'absolute z-50 w-full mt-2 rounded-lg overflow-hidden',
            'bg-cyber-800/95 backdrop-blur-md border border-neon-cyan/30',
            'shadow-lg shadow-neon-cyan/20',
            'max-h-80 overflow-y-auto',
            'animate-in fade-in slide-in-from-top-2 duration-200 motion-reduce:animate-none'
          )}
        >
          {filteredStocks.map((stock, index) => (
            <button
              key={stock.symbol}
              onClick={() => handleSelect(stock)}
              className={cn(
                'w-full px-4 py-3 text-left transition-all duration-200 motion-reduce:transition-none cursor-pointer',
                'hover:bg-neon-cyan/10 hover:border-l-4 hover:border-neon-cyan',
                'border-l-4 border-transparent',
                selectedIndex === index && 'bg-neon-cyan/10 border-neon-cyan'
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="font-bold text-white text-sm">
                    {stock.symbol}
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5 truncate">
                    {stock.name}
                  </div>
                </div>
                
                <div className="flex items-center gap-2 ml-2">
                  {stock.exchange && (
                    <span className="text-xs px-2 py-0.5 rounded bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/30">
                      {stock.exchange}
                    </span>
                  )}
                  {stock.index && (
                    <span className="text-xs px-2 py-0.5 rounded bg-neon-purple/10 text-neon-purple border border-neon-purple/30">
                      {stock.index}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* No results message */}
      {isOpen && searchTerm && filteredStocks.length === 0 && (
        <div className="absolute z-50 w-full mt-2 p-4 rounded-lg bg-cyber-800/95 backdrop-blur-md border border-cyber-700 text-center text-gray-400 text-sm">
          Không tìm thấy kết quả cho "{searchTerm}"
        </div>
      )}
    </div>
  )
}
