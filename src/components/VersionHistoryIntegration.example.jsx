// Example integration for VersionHistory in Layout.jsx

// 1. Import the component at the top
import VersionHistory from './VersionHistory'

// 2. Add state for showing version history
const [showVersionHistory, setShowVersionHistory] = useState(false)
const [currentProjectId, setCurrentProjectId] = useState(null)

// 3. Add button in the UI (e.g., near Save Project button)
{user && generatedCode && currentProjectId && (
  <button 
    onClick={() => setShowVersionHistory(true)}
    className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-purple-700 transition-colors duration-200 flex items-center justify-center space-x-2"
  >
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
    </svg>
    <span>Version History</span>
  </button>
)}

// 4. Add the component at the end of Layout (before closing div)
<VersionHistory 
  projectId={currentProjectId}
  isOpen={showVersionHistory}
  onClose={() => setShowVersionHistory(false)}
  onRestore={(restoredCode) => {
    // Update the generated code with restored version
    setGeneratedCode(restoredCode)
    // Close the version history modal
    setShowVersionHistory(false)
    // Optionally show a success message
    setChatMessages(prev => [...prev, {
      role: 'assistant',
      content: 'Project has been restored to the selected version.',
      timestamp: new Date().toISOString()
    }])
  }}
/>

// 5. Update save project to set currentProjectId
const saveProject = async () => {
  // ... existing save logic ...
  
  // After successful save, store the project ID
  if (savedProject && savedProject.id) {
    setCurrentProjectId(savedProject.id)
  }
}

// 6. Update load project to set currentProjectId
const handleLoadProject = (project) => {
  // ... existing load logic ...
  
  // Set the current project ID
  setCurrentProjectId(project.id)
}

// 7. Update API calls to include projectId
// In handleGenerateCode and handleEditCode:
const response = await generateCode(prompt, currentProjectId)
const response = await chatEdit(generatedCode, editMessage, chatMessages, currentProjectId)