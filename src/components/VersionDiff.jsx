import React, { useState, useEffect } from 'react'
import { diffLines } from 'diff'
import supabase from '../utils/supabase'

function VersionDiff({ currentVersion, compareVersion, projectId, onClose }) {
  const [currentCode, setCurrentCode] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedFile, setSelectedFile] = useState(null)

  useEffect(() => {
    fetchCurrentVersionCode()
  }, [currentVersion, projectId])

  const fetchCurrentVersionCode = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        throw new Error('Not authenticated')
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/projects/${projectId}/versions/${currentVersion}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch current version')
      }

      const data = await response.json()
      setCurrentCode(data.version)
      
      // Select first file by default
      const files = Object.keys(data.version.code_snapshot || {})
      if (files.length > 0) {
        setSelectedFile(files[0])
      }
    } catch (err) {
      console.error('Error fetching current version:', err)
      setError(err.message || 'Failed to load current version')
    } finally {
      setLoading(false)
    }
  }

  const getDiff = (file1, file2) => {
    const diff = diffLines(file1 || '', file2 || '')
    return diff
  }

  const renderDiff = () => {
    if (!currentCode || !compareVersion || !selectedFile) return null

    const currentFileContent = currentCode.code_snapshot[selectedFile] || ''
    const compareFileContent = compareVersion.code_snapshot[selectedFile] || ''
    
    const diff = getDiff(compareFileContent, currentFileContent)

    return (
      <div className="font-mono text-sm">
        {diff.map((part, index) => {
          const lines = part.value.split('\n').filter((_, i, arr) => i < arr.length - 1 || part.value[part.value.length - 1] !== '\n')
          
          return lines.map((line, lineIndex) => (
            <div
              key={`${index}-${lineIndex}`}
              className={`px-4 py-1 ${
                part.added 
                  ? 'bg-green-900/30 text-green-300' 
                  : part.removed 
                  ? 'bg-red-900/30 text-red-300' 
                  : 'text-gray-400'
              }`}
            >
              <span className="inline-block w-6 text-gray-500 select-none">
                {part.added ? '+' : part.removed ? '-' : ' '}
              </span>
              {line || ' '}
            </div>
          ))
        })}
      </div>
    )
  }

  const getAllFiles = () => {
    const files = new Set()
    
    if (currentCode?.code_snapshot) {
      Object.keys(currentCode.code_snapshot).forEach(file => files.add(file))
    }
    
    if (compareVersion?.code_snapshot) {
      Object.keys(compareVersion.code_snapshot).forEach(file => files.add(file))
    }
    
    return Array.from(files).sort()
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative bg-gray-900 rounded-xl shadow-2xl w-full max-w-6xl h-[90vh] m-4 overflow-hidden flex flex-col border border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div>
            <h3 className="text-lg font-semibold text-white">
              Version Comparison
            </h3>
            <p className="text-sm text-gray-400 mt-1">
              Comparing version {compareVersion.version_number} with current version {currentVersion}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="flex flex-col items-center">
              <svg className="animate-spin h-10 w-10 text-blue-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="text-gray-400">Loading diff...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-red-400">{error}</p>
          </div>
        ) : (
          <div className="flex flex-1 overflow-hidden">
            {/* File List */}
            <div className="w-64 border-r border-gray-700 bg-gray-950 overflow-y-auto">
              <div className="p-4">
                <h4 className="text-sm font-semibold text-gray-400 mb-3">Files</h4>
                <div className="space-y-1">
                  {getAllFiles().map(file => {
                    const inCurrent = currentCode?.code_snapshot?.[file]
                    const inCompare = compareVersion?.code_snapshot?.[file]
                    const isNew = inCurrent && !inCompare
                    const isDeleted = !inCurrent && inCompare
                    
                    return (
                      <button
                        key={file}
                        onClick={() => setSelectedFile(file)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                          selectedFile === file
                            ? 'bg-gray-800 text-white'
                            : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="truncate">{file}</span>
                          {isNew && (
                            <span className="text-xs text-green-400 ml-2">new</span>
                          )}
                          {isDeleted && (
                            <span className="text-xs text-red-400 ml-2">deleted</span>
                          )}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Diff View */}
            <div className="flex-1 overflow-auto bg-gray-950">
              <div className="sticky top-0 bg-gray-900 border-b border-gray-700 px-4 py-2 flex items-center justify-between">
                <h4 className="text-sm font-semibold text-gray-300">
                  {selectedFile}
                </h4>
                <div className="flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-900/50 rounded"></div>
                    <span className="text-gray-400">Removed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-900/50 rounded"></div>
                    <span className="text-gray-400">Added</span>
                  </div>
                </div>
              </div>
              <div className="p-4">
                {selectedFile && renderDiff()}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default VersionDiff