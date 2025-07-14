import { useState, useEffect } from 'react'
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'
import CodePreview from './CodePreview'
import TemplateGallery from './TemplateGallery'
import ProjectsList from './ProjectsList'
import Auth from './Auth'
import GenerationProgress from './GenerationProgress'
import CodeExplainer from './CodeExplainer'
import ComponentLibrary from './ComponentLibrary'
import ChatInterface from './ChatInterface'
import VersionHistory from './VersionHistory'
import supabase from '../utils/supabase'
import { generateCode, chatEdit } from '../services/api'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import '../styles/panels.css'

function Layout() {
  const [prompt, setPrompt] = useState('')
  const [generatedCode, setGeneratedCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showTemplates, setShowTemplates] = useState(false)
  const [user, setUser] = useState(null)
  const [showAuth, setShowAuth] = useState(false)
  const [projects, setProjects] = useState([])
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [showProjects, setShowProjects] = useState(false)
  const [showComponentLibrary, setShowComponentLibrary] = useState(false)
  const [chatMessages, setChatMessages] = useState([])
  const [showVersionHistory, setShowVersionHistory] = useState(false)
  const [currentProjectId, setCurrentProjectId] = useState(null)
  const [currentVersionNumber, setCurrentVersionNumber] = useState(null)

  // Check user auth status on mount
  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    checkUser()

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  const saveProject = async () => {
    // Check if we have generated code and prompt
    if (!generatedCode || !prompt) {
      setError('No code to save. Please generate some code first.')
      return
    }

    try {
      // Get the current user from Supabase auth
      const { data: { user: currentUser }, error: authError } = await supabase.auth.getUser()
      
      if (authError) {
        console.error('Auth error:', authError)
        setError('Authentication error. Please sign in again.')
        return
      }
      
      if (!currentUser) {
        setError('You must be signed in to save projects.')
        setShowAuth(true) // Open auth modal
        return
      }

      // Generate project name from first 30 characters of prompt
      const projectName = prompt.length > 30 
        ? prompt.substring(0, 30) + '...' 
        : prompt

      // Determine if it's a multi-file project or single file
      const isMultiFile = typeof generatedCode === 'object' && !Array.isArray(generatedCode)
      
      const projectData = {
        user_id: currentUser.id,
        name: projectName,
        prompt: prompt,
        project_type: isMultiFile ? 'multi-file' : 'single-file'
      }

      // Save either files or code based on project type
      if (isMultiFile) {
        projectData.files = generatedCode
      } else {
        projectData.code = generatedCode
      }

      console.log('Saving project with data:', {
        user_id: currentUser.id,
        name: projectName,
        project_type: projectData.project_type
      })

      const { data: savedProject, error } = await supabase
        .from('projects')
        .insert(projectData)
        .select()
        .single()

      if (error) {
        console.error('Supabase insert error:', error)
        throw error
      }

      // Set the current project ID
      if (savedProject && savedProject.id) {
        setCurrentProjectId(savedProject.id)
        setCurrentVersionNumber(savedProject.current_version || 1)
        console.log('Project saved successfully:', savedProject.id)
      }

      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (err) {
      console.error('Error saving project:', err)
      const errorMessage = err.message || 'Failed to save project. Please try again.'
      setError(errorMessage)
    }
  }

  const handleTemplateSelect = async (templatePrompt) => {
    // Add template prompt as a user message
    const userMessage = {
      role: 'user',
      content: templatePrompt,
      timestamp: new Date().toISOString()
    }
    setChatMessages(prev => [...prev, userMessage])
    
    // Set the prompt
    setPrompt(templatePrompt)
    
    // Close the template gallery
    setShowTemplates(false)
    
    // Auto-generate code
    setTimeout(() => handleGenerateCode(templatePrompt), 100)
  }

  const handleLoadProject = (project) => {
    // Clear chat and add the loaded project prompt
    setChatMessages([
      {
        role: 'user',
        content: project.prompt,
        timestamp: new Date().toISOString()
      },
      {
        role: 'assistant',
        content: 'I\'ve loaded your saved project. The code is displayed in the preview panel.',
        timestamp: new Date().toISOString()
      }
    ])
    
    // Set the prompt from the loaded project
    setPrompt(project.prompt)
    
    // Set the current project ID and version
    setCurrentProjectId(project.id)
    setCurrentVersionNumber(project.current_version || 1)
    
    // Load either files or code based on what's available
    if (project.files) {
      setGeneratedCode(project.files)
    } else if (project.code) {
      setGeneratedCode(project.code)
    }
    
    // Close the projects modal
    setShowProjects(false)
  }

  const handleGenerateCode = async (promptText = null) => {
    const messagePrompt = promptText || prompt
    
    // Clear previous error
    setError(null)
    
    // Validate prompt
    if (!messagePrompt.trim()) {
      setError('Please enter a prompt describing what you want to build.')
      return
    }

    setIsLoading(true)
    
    try {
      console.log('Generating code for prompt:', messagePrompt)
      console.log('Current project ID:', currentProjectId)
      if (!currentProjectId) {
        console.log('Note: No project ID - versions will not be saved until project is saved')
      }
      const response = await generateCode(messagePrompt, currentProjectId)
      
      if (response.success) {
        // Add assistant success message
        const assistantMessage = {
          role: 'assistant',
          content: 'I\'ve generated the code for your request. You can view it in the preview panel on the right. Feel free to ask for any modifications or explanations!',
          timestamp: new Date().toISOString()
        }
        setChatMessages(prev => [...prev, assistantMessage])
        
        // Check if it's a multi-file project or single file
        if (response.files && response.isProject) {
          setGeneratedCode(response.files)
          console.log('Multi-file project generated successfully')
        } else if (response.code) {
          setGeneratedCode(response.code)
          console.log('Code generated successfully')
        } else {
          throw new Error('Invalid response format')
        }
      } else {
        throw new Error('Invalid response from server')
      }
    } catch (err) {
      console.error('Error generating code:', err)
      
      // Use the user-friendly error message if available
      const errorMessage = err.userMessage || err.message || 'Failed to generate code. Please try again.'
      setError(errorMessage)
      
      // Add error message to chat
      const errorAssistantMessage = {
        role: 'assistant',
        content: `I encountered an error: ${errorMessage}`,
        timestamp: new Date().toISOString()
      }
      setChatMessages(prev => [...prev, errorAssistantMessage])
      
      // Clear the code if there was an error
      setGeneratedCode('')
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditCode = async (editMessage) => {
    // Clear previous error
    setError(null)
    setIsLoading(true)
    
    try {
      console.log('Editing code with message:', editMessage)
      console.log('Current project ID for edit:', currentProjectId)
      const response = await chatEdit(generatedCode, editMessage, chatMessages, currentProjectId)
      
      if (response.success) {
        // Add assistant success message
        const assistantMessage = {
          role: 'assistant',
          content: 'I\'ve updated the code based on your request. The changes are reflected in the preview panel.',
          timestamp: new Date().toISOString()
        }
        setChatMessages(prev => [...prev, assistantMessage])
        
        // Update the code
        if (response.files && response.isProject) {
          setGeneratedCode(response.files)
          console.log('Multi-file project edited successfully')
        } else if (response.code) {
          setGeneratedCode(response.code)
          console.log('Code edited successfully')
        } else {
          throw new Error('Invalid response format')
        }
      } else {
        throw new Error('Invalid response from server')
      }
    } catch (err) {
      console.error('Error editing code:', err)
      
      // Use the user-friendly error message if available
      const errorMessage = err.userMessage || err.message || 'Failed to edit code. Please try again.'
      setError(errorMessage)
      
      // Add error message to chat
      const errorAssistantMessage = {
        role: 'assistant',
        content: `I encountered an error while editing: ${errorMessage}`,
        timestamp: new Date().toISOString()
      }
      setChatMessages(prev => [...prev, errorAssistantMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendMessage = async (messageContent) => {
    // Add user message to chat
    const userMessage = {
      role: 'user',
      content: messageContent,
      timestamp: new Date().toISOString()
    }
    setChatMessages(prev => [...prev, userMessage])
    
    // Check if we have existing code - if so, edit it; otherwise generate new
    if (generatedCode) {
      // Edit existing code
      await handleEditCode(messageContent)
    } else {
      // Generate new code
      setPrompt(messageContent)
      await handleGenerateCode(messageContent)
    }
  }

  const handleInsertComponent = (componentCode) => {
    // Add component as a user message
    const userMessage = {
      role: 'user',
      content: `Add this component to my project:\n\n${componentCode}`,
      timestamp: new Date().toISOString()
    }
    setChatMessages(prev => [...prev, userMessage])
    
    // Set the prompt and generate code
    const newPrompt = prompt ? `${prompt}\n\nAlso add this component:\n\n${componentCode}` : componentCode
    setPrompt(newPrompt)
    
    // Close the component library
    setShowComponentLibrary(false)
    
    // Generate code with the updated prompt
    setTimeout(() => handleGenerateCode(newPrompt), 100)
  }

  const downloadCode = async () => {
    if (!generatedCode) return

    const now = new Date()
    const timestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}-${String(now.getHours()).padStart(2, '0')}-${String(now.getMinutes()).padStart(2, '0')}`
    
    // Check if it's a multi-file project
    const isMultiFile = typeof generatedCode === 'object' && !Array.isArray(generatedCode)
    
    if (isMultiFile) {
      try {
        // Create a new ZIP file
        const zip = new JSZip()
        
        // Add each file to the ZIP maintaining the path structure
        Object.entries(generatedCode).forEach(([filePath, content]) => {
          // Remove leading slash if present for ZIP compatibility
          const zipPath = filePath.startsWith('/') ? filePath.slice(1) : filePath
          
          // Add file to ZIP
          zip.file(zipPath, content)
        })
        
        // Generate the ZIP file
        const blob = await zip.generateAsync({ type: 'blob' })
        
        // Save the ZIP file
        saveAs(blob, `cmdshift-project-${timestamp}.zip`)
        
      } catch (error) {
        console.error('Error creating ZIP file:', error)
        // Fallback to JSON download if ZIP creation fails
        const blob = new Blob([JSON.stringify(generatedCode, null, 2)], { type: 'application/json' })
        saveAs(blob, `project-${timestamp}.json`)
      }
    } else {
      // Single file download (backward compatible)
      const filename = `component-${timestamp}.jsx`
      const blob = new Blob([generatedCode], { type: 'application/javascript' })
      saveAs(blob, filename)
    }
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm flex-shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-sm">CS</span>
          </div>
          <h1 className="text-xl font-semibold text-gray-900">CmdShift Web</h1>
          {currentVersionNumber && (
            <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
              v{currentVersionNumber}
            </span>
          )}
        </div>
        <div className="flex items-center space-x-4">
          {user ? (
            <>
              <span className="text-sm text-gray-600">{user.email}</span>
              {currentProjectId && generatedCode && (
                <button
                  onClick={() => setShowVersionHistory(true)}
                  className="text-sm bg-purple-100 hover:bg-purple-200 text-purple-700 px-4 py-2 rounded-lg transition-colors font-medium flex items-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                  </svg>
                  History
                </button>
              )}
              <button
                onClick={() => setShowProjects(true)}
                className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors font-medium"
              >
                My Projects
              </button>
              <button
                onClick={handleSignOut}
                className="text-sm text-gray-700 hover:text-gray-900 font-medium transition-colors"
              >
                Sign Out
              </button>
            </>
          ) : (
            <button
              onClick={() => setShowAuth(true)}
              className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Sign In
            </button>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <PanelGroup direction="horizontal" className="flex-1 panel-group" style={{ height: '100%' }}>
        {/* Left Panel - Chat Interface */}
        <Panel defaultSize={40} minSize={20} maxSize={70} className="bg-white flex flex-col">
          <div className="px-6 py-4 border-b border-gray-200 flex-shrink-0 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-medium text-gray-900">Chat</h2>
              <p className="text-sm text-gray-500 mt-1">Describe what you want to build</p>
            </div>
            <button
              onClick={() => setShowTemplates(true)}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2 text-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
              </svg>
              <span>Templates</span>
            </button>
          </div>
          
          <div className="flex-1 overflow-hidden">
            <ChatInterface 
              messages={chatMessages}
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
              disabled={false}
            />
          </div>
          
          {/* Success Message */}
          {saveSuccess && (
            <div className="mx-6 mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start">
                <svg className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <p className="ml-3 text-sm text-green-700">Project saved successfully!</p>
              </div>
            </div>
          )}
          
          <div className="p-6 border-t border-gray-200 flex-shrink-0 space-y-3">
            {/* Component Library Button */}
            <button
              onClick={() => setShowComponentLibrary(true)}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 3.5a1.5 1.5 0 013 0V4a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-.5a1.5 1.5 0 000 3h.5a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-.5a1.5 1.5 0 00-3 0v.5a1 1 0 01-1 1H6a1 1 0 01-1-1v-3a1 1 0 00-1-1h-.5a1.5 1.5 0 010-3H4a1 1 0 001-1V6a1 1 0 011-1h3a1 1 0 001-1v-.5z" />
              </svg>
              <span>Component Library</span>
            </button>
            
            {/* Save Project Button */}
            {user && generatedCode && (
              <button 
                onClick={saveProject}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V6h5a2 2 0 012 2v7a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h5v5.586l-1.293-1.293zM9 4a1 1 0 012 0v2H9V4z" />
                </svg>
                <span>Save Project</span>
              </button>
            )}
            
            {/* Version History Button */}
            {generatedCode && (
              <button 
                onClick={() => setShowVersionHistory(true)}
                className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-indigo-700 transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                </svg>
                <span>Version History</span>
              </button>
            )}
            
            {/* Action Buttons Row */}
            {generatedCode && (
              <div className="flex gap-2">
                {/* Export Code Button */}
                <button 
                  onClick={downloadCode}
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors duration-200 flex items-center justify-center space-x-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  <span>Export Code</span>
                </button>
                
                {/* Code Explainer Button */}
                <CodeExplainer code={generatedCode} isVisible={true} />
              </div>
            )}
          </div>
        </Panel>

        {/* Resize Handle */}
        <PanelResizeHandle className="resize-handle-vertical">
          <div className="h-full w-full relative flex items-center justify-center">
            <div className="h-8 w-1 bg-gray-300 rounded-full" />
          </div>
        </PanelResizeHandle>

        {/* Right Panel - Code Preview */}
        <Panel defaultSize={60} minSize={30} maxSize={80} className="flex flex-col min-h-0 bg-gray-900" style={{ minHeight: 0 }}>
          <CodePreview 
            code={typeof generatedCode === 'string' ? generatedCode : ''} 
            files={typeof generatedCode === 'object' ? generatedCode : null} 
          />
        </Panel>
      </PanelGroup>

      {/* Template Gallery Modal */}
      {showTemplates && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 transition-opacity"
            onClick={() => setShowTemplates(false)}
          />
          
          {/* Modal Content */}
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] m-4 overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800">Template Gallery</h2>
              <button
                onClick={() => setShowTemplates(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Template Gallery */}
            <div className="flex-1 overflow-y-auto">
              <TemplateGallery onTemplateSelect={handleTemplateSelect} />
            </div>
          </div>
        </div>
      )}

      {/* Auth Modal */}
      {showAuth && (
        <Auth 
          onClose={() => setShowAuth(false)}
          onAuthSuccess={(user) => {
            setUser(user)
            setShowAuth(false)
          }}
        />
      )}

      {/* Projects List Modal */}
      {showProjects && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 transition-opacity"
            onClick={() => setShowProjects(false)}
          />
          
          {/* Modal Content */}
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] m-4 overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800">My Projects</h2>
              <button
                onClick={() => setShowProjects(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Projects List */}
            <div className="flex-1 overflow-y-auto p-6">
              <ProjectsList user={user} onLoadProject={handleLoadProject} />
            </div>
          </div>
        </div>
      )}

      {/* Generation Progress */}
      <GenerationProgress isGenerating={isLoading} />
      
      {/* Component Library */}
      <ComponentLibrary 
        isOpen={showComponentLibrary}
        onClose={() => setShowComponentLibrary(false)}
        onInsertComponent={handleInsertComponent}
      />
      
      {/* Version History */}
      <VersionHistory 
        projectId={currentProjectId}
        isOpen={showVersionHistory}
        onClose={() => setShowVersionHistory(false)}
        onRestore={(restoredCode) => {
          // Update the generated code with restored version
          setGeneratedCode(restoredCode)
          
          // Update version number if it's in the restored code metadata
          // For now, we'll increment it since restore creates a new version
          setCurrentVersionNumber(prev => (prev || 0) + 1)
          
          // Close the version history modal
          setShowVersionHistory(false)
          
          // Add a message to chat
          setChatMessages(prev => [...prev, {
            role: 'assistant',
            content: 'Project has been restored to the selected version. A new version has been created for this restore action.',
            timestamp: new Date().toISOString()
          }])
        }}
      />
    </div>
  )
}

export default Layout
