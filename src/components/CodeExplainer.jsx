import { useState } from 'react'
import { explainCode } from '../services/api'

const CodeExplainer = ({ code, isVisible = true }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [explanation, setExplanation] = useState(null)
  const [error, setError] = useState(null)
  
  // Determine if it's a multi-file project
  const isMultiFile = code && typeof code === 'object' && !Array.isArray(code)
  const fileCount = isMultiFile ? Object.keys(code).length : 1
  
  // Default explanation structure for fallback
  const defaultExplanation = {
    overview: isMultiFile 
      ? `I've created a complete website project for you with ${fileCount} files, organized and ready to deploy:`
      : "I've created a modern component for your website with these features:",
    sections: [
      {
        title: "Hero Section",
        description: "The main welcome area at the top of your page with a big headline and call-to-action button. This is what visitors see first!"
      },
      {
        title: "Features Grid",
        description: "A section showcasing your main features or services in an organized grid layout with icons and descriptions."
      },
      {
        title: "Contact Form",
        description: "A form where visitors can enter their name, email, and message to get in touch with you. The form validates input to ensure you get proper contact information."
      },
      {
        title: "Responsive Design",
        description: "Your website automatically adjusts to look great on phones, tablets, and desktop computers."
      }
    ],
    technical: {
      title: "Behind the Scenes",
      points: [
        "Uses modern React components for interactive features",
        "Styled with Tailwind CSS for a professional look",
        "Includes smooth animations and hover effects",
        "Form validation ensures data quality",
        "Mobile-first design approach"
      ]
    },
    tips: [
      "You can easily change colors by updating the color values in the code",
      "Replace placeholder text with your actual content",
      "Add your own images by updating the image URLs",
      "The form currently shows an alert - connect it to your email service to receive messages"
    ]
  }
  
  const handleExplainClick = async () => {
    setIsOpen(true)
    setIsLoading(true)
    setError(null)
    
    try {
      // Call the API to get explanation
      const response = await explainCode(code)
      
      if (response.success && response.explanation) {
        setExplanation(response.explanation)
      } else {
        throw new Error('Invalid response from server')
      }
    } catch (err) {
      console.error('Error getting explanation:', err)
      setError(err.userMessage || 'Failed to generate explanation. Please try again.')
      
      // Use default explanation as fallback
      setExplanation(defaultExplanation)
    } finally {
      setIsLoading(false)
    }
  }
  
  if (!isVisible) return null
  
  return (
    <>
      {/* Explain Code Button */}
      <button
        onClick={handleExplainClick}
        className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
      >
        <svg 
          className="w-5 h-5" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" 
          />
        </svg>
        <span className="font-medium">Explain Code</span>
      </button>
      
      {/* Explanation Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Modal Content */}
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                  <svg 
                    className="w-6 h-6 text-indigo-600" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" 
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Understanding Your Code</h2>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {isLoading ? (
                /* Loading State */
                <div className="p-12 flex flex-col items-center justify-center">
                  <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
                  <p className="text-gray-600 text-lg">Analyzing your code...</p>
                  <p className="text-gray-500 text-sm mt-2">Creating a simple explanation just for you</p>
                </div>
              ) : (
                /* Explanation Content */
                <div className="p-6 space-y-6">
                  {/* Error Message */}
                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                      <p className="text-red-800 text-sm">{error}</p>
                    </div>
                  )}
                  
                  {/* Overview */}
                  {explanation && (
                    <>
                      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                        <p className="text-blue-900 text-lg">{explanation.overview}</p>
                      </div>
                      
                      {/* Main Sections */}
                      {explanation.sections && explanation.sections.length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                            <span className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center mr-3 text-sm font-bold text-indigo-600">1</span>
                            What's in Your Website
                          </h3>
                          <div className="space-y-3">
                            {explanation.sections.map((section, index) => (
                              <div key={index} className="bg-gray-50 rounded-lg p-4">
                                <h4 className="font-semibold text-gray-900 mb-1">{section.title}</h4>
                                <p className="text-gray-600 text-sm">{section.description}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Features */}
                      {explanation.features && explanation.features.length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                            <span className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center mr-3 text-sm font-bold text-indigo-600">2</span>
                            Key Features
                          </h3>
                          <div className="bg-gray-50 rounded-lg p-4">
                            <ul className="space-y-2">
                              {explanation.features.map((feature, index) => (
                                <li key={index} className="flex items-start">
                                  <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                  </svg>
                                  <span className="text-gray-700 text-sm">{feature}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}
                      
                      {/* Customization Tips */}
                      {explanation.customization && explanation.customization.length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                            <span className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center mr-3 text-sm font-bold text-indigo-600">3</span>
                            Tips for Customization
                          </h3>
                          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                            <div className="flex items-start mb-2">
                              <svg className="w-5 h-5 text-amber-600 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                              </svg>
                              <span className="font-medium text-amber-900">Quick Tips:</span>
                            </div>
                            <ul className="space-y-2 ml-7">
                              {explanation.customization.map((tip, index) => (
                                <li key={index} className="text-amber-800 text-sm">• {tip}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}
                      
                      {/* Call to Action */}
                      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 text-white">
                        <h4 className="font-semibold text-lg mb-2">Ready to Make It Yours?</h4>
                        <p className="text-indigo-100 text-sm mb-4">
                          Your code is ready to use! You can export it, save it to your account, or continue editing to make it perfect for your needs.
                        </p>
                        <div className="flex space-x-3">
                          <button
                            onClick={() => setIsOpen(false)}
                            className="px-4 py-2 bg-white text-indigo-600 rounded-lg font-medium hover:bg-indigo-50 transition-colors"
                          >
                            Got it!
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default CodeExplainer