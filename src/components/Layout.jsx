import { useState, useEffect } from 'react'
import CodePreview from './CodePreview'
import TemplateGallery from './TemplateGallery'
import ProjectsList from './ProjectsList'
import Auth from './Auth'
import supabase from '../utils/supabase'
import { generateCode } from '../services/api'

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
    if (!user || !generatedCode || !prompt) return

    try {
      // Generate project name from first 30 characters of prompt
      const projectName = prompt.length > 30 
        ? prompt.substring(0, 30) + '...' 
        : prompt

      // Determine if it's a multi-file project or single file
      const isMultiFile = typeof generatedCode === 'object' && !Array.isArray(generatedCode)
      
      const projectData = {
        user_id: user.id,
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

      const { error } = await supabase
        .from('projects')
        .insert(projectData)

      if (error) throw error

      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (err) {
      console.error('Error saving project:', err)
      setError('Failed to save project. Please try again.')
    }
  }

  const handleTemplateSelect = async (templatePrompt) => {
    // Set the prompt to the template's prompt text
    setPrompt(templatePrompt)
    
    // Close the template gallery
    setShowTemplates(false)
    
    // Optionally auto-generate code
    // Uncomment the following line to auto-generate when selecting a template
    // await handleGenerateCode()
  }

  const handleLoadProject = (project) => {
    // Set the prompt from the loaded project
    setPrompt(project.prompt)
    
    // Load either files or code based on what's available
    if (project.files) {
      setGeneratedCode(project.files)
    } else if (project.code) {
      setGeneratedCode(project.code)
    }
    
    // Close the projects modal
    setShowProjects(false)
  }

  const handleGenerateCode = async () => {
    // Clear previous error
    setError(null)
    
    // Validate prompt
    if (!prompt.trim()) {
      setError('Please enter a prompt describing what you want to build.')
      return
    }

    setIsLoading(true)
    
    try {
      console.log('Generating code for prompt:', prompt)
      const response = await generateCode(prompt)
      
      if (response.success) {
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
      
      // Clear the code if there was an error
      setGeneratedCode('')
    } finally {
      setIsLoading(false)
    }
  }

  const downloadCode = () => {
    if (!generatedCode) return

    const now = new Date()
    const timestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}-${String(now.getHours()).padStart(2, '0')}-${String(now.getMinutes()).padStart(2, '0')}`
    
    // Check if it's a multi-file project
    const isMultiFile = typeof generatedCode === 'object' && !Array.isArray(generatedCode)
    
    if (isMultiFile) {
      // For multi-file projects, create a downloadable HTML that includes all files
      // We'll create a simple HTML file that can be opened in a browser
      const indexHtml = generatedCode['index.html'] || generatedCode['/index.html']
      
      if (indexHtml) {
        const blob = new Blob([indexHtml], { type: 'text/html' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `project-${timestamp}.html`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
      } else {
        // If no index.html, download as JSON
        const blob = new Blob([JSON.stringify(generatedCode, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `project-${timestamp}.json`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
      }
    } else {
      // Single file download (backward compatible)
      const filename = `component-${timestamp}.jsx`
      const blob = new Blob([generatedCode], { type: 'application/javascript' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    }
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm flex-shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-sm">CS</span>
          </div>
          <h1 className="text-xl font-semibold text-gray-900">CmdShift Web</h1>
        </div>
        <div className="flex items-center space-x-4">
          {user ? (
            <>
              <span className="text-sm text-gray-600">{user.email}</span>
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
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0">
        {/* Left Panel - Prompt Input */}
        <div className="w-full lg:w-2/5 bg-white lg:border-r border-gray-200 flex flex-col">
          <div className="px-6 py-4 border-b border-gray-200 flex-shrink-0">
            <h2 className="text-lg font-medium text-gray-900">Prompt</h2>
            <p className="text-sm text-gray-500 mt-1">Describe what you want to build</p>
          </div>
          
          <div className="flex-1 p-6 overflow-auto">
            <div className="mb-4">
              <button
                onClick={() => setShowTemplates(true)}
                className="w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                </svg>
                <span>Browse Templates</span>
              </button>
            </div>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Try something like: 'Create a modern landing page with a hero section, features grid, and contact form'"
              className="w-full h-full p-4 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-sans min-h-[200px]"
              disabled={isLoading}
            />
          </div>
          
          {/* Error Message */}
          {error && (
            <div className="mx-6 mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start">
                <svg className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <p className="ml-3 text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

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
            <button 
              onClick={handleGenerateCode}
              disabled={!prompt.trim() || isLoading}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center space-x-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  <span>Generate Code</span>
                </>
              )}
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
            
            {/* Export Code Button */}
            {generatedCode && (
              <button 
                onClick={downloadCode}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                <span>Export Code</span>
              </button>
            )}
          </div>
        </div>

        {/* Right Panel - Code Preview */}
        <div className="flex-1 flex flex-col min-h-0 bg-gray-900">
          <CodePreview 
            code={typeof generatedCode === 'string' ? generatedCode : ''} 
            files={typeof generatedCode === 'object' ? generatedCode : null} 
          />
        </div>
      </div>

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
    </div>
  )
}

export default Layout
