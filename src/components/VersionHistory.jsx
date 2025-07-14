import React, { useState, useEffect } from 'react'
import { format } from 'date-fns'
import VersionDiff from './VersionDiff'
import supabase from '../utils/supabase'

function VersionHistory({ projectId, isOpen, onClose, onRestore }) {
  const [versions, setVersions] = useState([])
  const [currentVersion, setCurrentVersion] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedVersion, setSelectedVersion] = useState(null)
  const [showDiff, setShowDiff] = useState(false)
  const [viewCode, setViewCode] = useState(null)
  const [restoring, setRestoring] = useState(false)

  useEffect(() => {
    console.log('=== VersionHistory useEffect triggered ===')
    console.log('isOpen:', isOpen)
    console.log('projectId:', projectId)
    
    if (isOpen && projectId) {
      console.log('Conditions met, fetching version history...')
      fetchVersionHistory()
    } else {
      console.log('Conditions not met:', { isOpen, projectId })
    }
  }, [isOpen, projectId])

  const fetchVersionHistory = async () => {
    console.log('=== fetchVersionHistory called ===')
    console.log('Project ID:', projectId)
    
    setLoading(true)
    setError(null)
    
    try {
      // Get current user session
      console.log('Getting user session...')
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        console.error('Session error:', sessionError)
        throw new Error(`Session error: ${sessionError.message}`)
      }
      
      if (!session) {
        console.error('No session found')
        throw new Error('Not authenticated')
      }
      
      console.log('Session found, access token:', session.access_token ? 'exists' : 'missing')

      // Construct API URL
      const apiUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/projects/${projectId}/versions`
      console.log('API URL:', apiUrl)

      // Fetch version history
      console.log('Fetching version history...')
      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      })

      console.log('Response status:', response.status)
      console.log('Response ok:', response.ok)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('Response error text:', errorText)
        throw new Error(`Failed to fetch version history: ${response.status} ${errorText}`)
      }

      const data = await response.json()
      console.log('Response data:', data)
      console.log('Versions count:', data.versions?.length || 0)
      console.log('Current version:', data.currentVersion)
      
      setVersions(data.versions || [])
      setCurrentVersion(data.currentVersion)
      console.log('Version history loaded successfully')
    } catch (err) {
      console.error('=== Error in fetchVersionHistory ===')
      console.error('Error object:', err)
      console.error('Error message:', err.message)
      console.error('Error stack:', err.stack)
      setError(err.message || 'Failed to load version history')
    } finally {
      setLoading(false)
      console.log('=== fetchVersionHistory completed ===')
    }
  }

  const fetchVersionCode = async (versionNumber) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        throw new Error('Not authenticated')
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/projects/${projectId}/versions/${versionNumber}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch version')
      }

      const data = await response.json()
      return data.version
    } catch (err) {
      console.error('Error fetching version:', err)
      throw err
    }
  }

  const handleViewCode = async (version) => {
    try {
      const fullVersion = await fetchVersionCode(version.version_number)
      setViewCode(fullVersion)
    } catch (err) {
      console.error('Error viewing code:', err)
    }
  }

  const handleCompare = async (version) => {
    try {
      const fullVersion = await fetchVersionCode(version.version_number)
      setSelectedVersion(fullVersion)
      setShowDiff(true)
    } catch (err) {
      console.error('Error comparing versions:', err)
    }
  }

  const handleRestore = async (version) => {
    if (!confirm(`Are you sure you want to restore to version ${version.version_number}? This will create a new version.`)) {
      return
    }

    setRestoring(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        throw new Error('Not authenticated')
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/projects/${projectId}/restore/${version.version_number}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to restore version')
      }

      const data = await response.json()
      
      // Call parent callback with restored code
      if (onRestore) {
        onRestore(data.restoredCode)
      }

      // Refresh version list
      await fetchVersionHistory()
      
      // Show success message
      alert(`Successfully restored to version ${version.version_number}`)
    } catch (err) {
      console.error('Error restoring version:', err)
      alert('Failed to restore version. Please try again.')
    } finally {
      setRestoring(false)
    }
  }

  if (!isOpen) {
    console.log('VersionHistory not rendering - isOpen is false')
    return null
  }

  console.log('=== VersionHistory Rendering ===')
  console.log('Loading:', loading)
  console.log('Error:', error)
  console.log('Versions:', versions)
  console.log('Current version:', currentVersion)

  return (
    <>
      {/* Main Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-black/50 transition-opacity"
          onClick={onClose}
        />
        
        {/* Modal Content */}
        <div className="relative bg-gray-900 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] m-4 overflow-hidden flex flex-col border border-gray-700">
          {/* Modal Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-700">
            <h2 className="text-2xl font-bold text-white">Version History</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              disabled={restoring}
            >
              <svg className="w-6 h-6 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Version List */}
          <div className="flex-1 overflow-y-auto p-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="flex flex-col items-center">
                  <svg className="animate-spin h-10 w-10 text-blue-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <p className="text-gray-400">Loading version history...</p>
                </div>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-400 mb-4">{error}</p>
                <button 
                  onClick={fetchVersionHistory}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Retry
                </button>
              </div>
            ) : versions.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400">No version history available yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {versions.map((version) => (
                  <div 
                    key={version.id} 
                    className={`bg-gray-800 rounded-lg p-4 border ${
                      version.version_number === currentVersion 
                        ? 'border-blue-500' 
                        : 'border-gray-700'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-white">
                            Version {version.version_number}
                          </h3>
                          {version.version_number === currentVersion && (
                            <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded-full">
                              Current
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-400 mb-2">
                          {format(new Date(version.created_at), 'MMM d, yyyy h:mm a')}
                        </p>
                        <p className="text-gray-300 text-sm">
                          {version.prompt_used}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={() => handleViewCode(version)}
                          className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg transition-colors"
                          title="View code"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                          </svg>
                        </button>
                        
                        {version.version_number !== currentVersion && (
                          <>
                            <button
                              onClick={() => handleCompare(version)}
                              className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg transition-colors"
                              title="Compare with current"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                              </svg>
                            </button>
                            
                            <button
                              onClick={() => handleRestore(version)}
                              disabled={restoring}
                              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Restore this version"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                              </svg>
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* View Code Modal */}
      {viewCode && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div 
            className="absolute inset-0 bg-black/50"
            onClick={() => setViewCode(null)}
          />
          <div className="relative bg-gray-900 rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] m-4 overflow-hidden flex flex-col border border-gray-700">
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <h3 className="text-lg font-semibold text-white">
                Version {viewCode.version_number} Code
              </h3>
              <button
                onClick={() => setViewCode(null)}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4">
              <pre className="text-sm text-gray-300 font-mono">
                {JSON.stringify(viewCode.code_snapshot, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* Diff View */}
      {showDiff && selectedVersion && (
        <VersionDiff
          currentVersion={currentVersion}
          compareVersion={selectedVersion}
          projectId={projectId}
          onClose={() => {
            setShowDiff(false)
            setSelectedVersion(null)
          }}
        />
      )}
    </>
  )
}

export default VersionHistory