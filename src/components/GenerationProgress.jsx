import { useState, useEffect } from 'react'

const GenerationProgress = ({ isGenerating }) => {
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState(0)
  const [elapsedTime, setElapsedTime] = useState(0)
  
  const steps = [
    { message: "Understanding your request...", duration: 15 },
    { message: "Analyzing project requirements...", duration: 25 },
    { message: "Generating components...", duration: 40 },
    { message: "Optimizing code structure...", duration: 55 },
    { message: "Finalizing your project...", duration: 65 }
  ]
  
  useEffect(() => {
    if (!isGenerating) {
      setProgress(0)
      setCurrentStep(0)
      setElapsedTime(0)
      return
    }
    
    const startTime = Date.now()
    const totalDuration = 65000 // 65 seconds average
    
    // Update progress every 100ms
    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime
      const progressPercent = Math.min((elapsed / totalDuration) * 100, 95)
      setProgress(progressPercent)
      setElapsedTime(Math.floor(elapsed / 1000))
      
      // Update current step based on elapsed time
      const currentStepIndex = steps.findIndex(step => elapsed < step.duration * 1000)
      if (currentStepIndex !== -1 && currentStepIndex !== currentStep) {
        setCurrentStep(currentStepIndex)
      } else if (currentStepIndex === -1 && currentStep < steps.length - 1) {
        setCurrentStep(steps.length - 1)
      }
    }, 100)
    
    return () => clearInterval(progressInterval)
  }, [isGenerating, currentStep])
  
  if (!isGenerating) return null
  
  const estimatedRemaining = Math.max(65 - elapsedTime, 0)
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <svg className="w-8 h-8 text-blue-600 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900">Generating Your Code</h3>
          <p className="text-gray-600 mt-2">{steps[currentStep]?.message}</p>
        </div>
        
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-full rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            >
              <div className="h-full bg-white/20 animate-pulse"></div>
            </div>
          </div>
        </div>
        
        {/* Step Indicators */}
        <div className="mb-6">
          <div className="flex justify-between">
            {steps.map((step, index) => (
              <div 
                key={index}
                className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-medium transition-all duration-300 ${
                  index < currentStep 
                    ? 'bg-green-500 text-white' 
                    : index === currentStep 
                    ? 'bg-blue-600 text-white animate-pulse' 
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {index < currentStep ? (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  index + 1
                )}
              </div>
            ))}
          </div>
        </div>
        
        {/* Time Estimate */}
        <div className="text-center space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Elapsed time:</span>
            <span className="font-medium text-gray-900">{elapsedTime}s</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Estimated remaining:</span>
            <span className="font-medium text-gray-900">~{estimatedRemaining}s</span>
          </div>
        </div>
        
        {/* Tips */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <span className="font-medium">💡 Tip:</span> More detailed prompts result in better code generation
          </p>
        </div>
      </div>
    </div>
  )
}

export default GenerationProgress