import { useState, useEffect } from 'react'
import { componentTemplates, searchComponents } from '../data/componentTemplates'

const ComponentLibrary = ({ isOpen, onClose, onInsertComponent }) => {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredComponents, setFilteredComponents] = useState([])
  const [copiedId, setCopiedId] = useState(null)
  const [searchInputRef, setSearchInputRef] = useState(null)

  // Get all components on mount
  useEffect(() => {
    updateFilteredComponents()
  }, [selectedCategory, searchQuery])

  // Handle keyboard shortcuts and focus management
  useEffect(() => {
    if (!isOpen) return

    // Focus search input when modal opens
    if (searchInputRef) {
      setTimeout(() => {
        searchInputRef.focus()
      }, 100)
    }

    const handleKeyDown = (event) => {
      // Close on Escape key
      if (event.key === 'Escape' || event.keyCode === 27) {
        onClose()
      }
    }

    // Add event listener
    document.addEventListener('keydown', handleKeyDown)

    // Cleanup
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose, searchInputRef])

  const updateFilteredComponents = () => {
    if (searchQuery) {
      // If searching, ignore category filter
      setFilteredComponents(searchComponents(searchQuery))
    } else if (selectedCategory === 'all') {
      // Show all components
      const allComponents = []
      Object.values(componentTemplates).forEach(category => {
        allComponents.push(...category.components)
      })
      setFilteredComponents(allComponents)
    } else {
      // Show components from selected category
      const category = componentTemplates[selectedCategory]
      setFilteredComponents(category ? category.components : [])
    }
  }

  const handleInsertComponent = (component) => {
    if (onInsertComponent) {
      onInsertComponent(component.code)
    }
    
    // Show copied feedback
    setCopiedId(component.id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleCopyCode = (component) => {
    navigator.clipboard.writeText(component.code)
    setCopiedId(component.id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div className="fixed right-0 top-0 h-full w-full max-w-2xl bg-white shadow-2xl z-50 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-xl">🧩</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Component Library</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors group"
              title="Close (ESC)"
            >
              <svg className="w-6 h-6 text-gray-500 group-hover:text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Search Bar */}
          <div className="relative">
            <input
              ref={(el) => setSearchInputRef(el)}
              type="text"
              placeholder="Search components..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <svg 
              className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
        
        {/* Category Tabs */}
        <div className="px-6 py-3 border-b border-gray-200 overflow-x-auto">
          <div className="flex space-x-2 min-w-max">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Components
            </button>
            {Object.entries(componentTemplates).map(([key, category]) => (
              <button
                key={key}
                onClick={() => setSelectedCategory(key)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
                  selectedCategory === key
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span>{category.icon}</span>
                <span>{category.name}</span>
              </button>
            ))}
          </div>
        </div>
        
        {/* Components Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {filteredComponents.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-gray-500">No components found</p>
              <p className="text-gray-400 text-sm mt-1">Try adjusting your search</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredComponents.map((component) => (
                <div
                  key={component.id}
                  className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-200"
                >
                  {/* Component Preview */}
                  <div className="p-6 bg-gray-50 flex items-center justify-center h-32">
                    <div className="text-4xl">{component.preview}</div>
                  </div>
                  
                  {/* Component Info */}
                  <div className="p-4 bg-white">
                    <h3 className="font-semibold text-gray-800 mb-2">{component.name}</h3>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleInsertComponent(component)}
                        className="flex-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded transition-colors duration-200"
                      >
                        {onInsertComponent ? 'Insert' : 'Use Component'}
                      </button>
                      <button
                        onClick={() => handleCopyCode(component)}
                        className={`px-3 py-1.5 text-sm font-medium rounded transition-all duration-200 ${
                          copiedId === component.id
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                        }`}
                      >
                        {copiedId === component.id ? (
                          <>
                            <svg className="w-4 h-4 inline mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            Copied!
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            Copy
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              {filteredComponents.length} components available
            </p>
            <div className="flex items-center space-x-4 text-xs text-gray-500">
              <span>Click to insert or copy</span>
              <span className="flex items-center space-x-1">
                <kbd className="px-2 py-1 bg-gray-200 rounded text-gray-700 font-mono">ESC</kbd>
                <span>to close</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default ComponentLibrary