import { Sandpack } from '@codesandbox/sandpack-react'
import { useState, useRef, useEffect } from 'react'

function CodePreview({ code = '', files = null }) {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const containerRef = useRef(null)
  // Default code for testing
  const defaultCode = `function Welcome() {
  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1 style={{ color: '#3b82f6' }}>Welcome to CmdShift Web!</h1>
      <p>Your AI-generated app will appear here.</p>
      <button 
        style={{
          backgroundColor: '#3b82f6',
          color: 'white',
          padding: '8px 16px',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          marginTop: '10px'
        }}
        onClick={() => alert('Hello from your generated app!')}
      >
        Click Me
      </button>
    </div>
  )
}`

  // Determine if we have multiple files or single file
  const isMultiFile = files && typeof files === 'object' && !Array.isArray(files);
  
  let sandpackFiles = {};
  let activeFile;
  let isStaticProject = false;
  
  try {
    if (isMultiFile) {
      // Multiple files - format for Sandpack
      const fileKeys = Object.keys(files);
      
      // Normalize file paths and check for index.html
      fileKeys.forEach(filePath => {
        // Normalize path - ensure it starts with /
        const normalizedPath = filePath.startsWith('/') ? filePath : `/${filePath}`;
        
        // Store the file content
        if (files[filePath] && typeof files[filePath] === 'string') {
          sandpackFiles[normalizedPath] = {
            code: files[filePath]
          };
        }
      });
      
      // Check if this is a static HTML project
      const hasIndexHtml = sandpackFiles['/index.html'] || 
                          sandpackFiles['/index.htm'] || 
                          (Object.keys(sandpackFiles).some(key => key.toLowerCase() === '/index.html'));
      
      isStaticProject = hasIndexHtml;
      
      // Set active file
      if (hasIndexHtml) {
        activeFile = '/index.html';
      } else {
        // Find the first JS/JSX/TS/TSX file, or just the first file
        activeFile = Object.keys(sandpackFiles).find(key => 
          /\.(jsx?|tsx?)$/i.test(key)
        ) || Object.keys(sandpackFiles)[0] || '/App.js';
      }
      
      // If no files were successfully processed, fall back to default
      if (Object.keys(sandpackFiles).length === 0) {
        throw new Error('No valid files found');
      }
      
    } else {
      // Single file (backward compatible) - always React
      const wrappedCode = code ? `
import React from 'react';

${code}
      ` : `
import React from 'react';

export default ${defaultCode}
      `;

      sandpackFiles = {
        '/App.js': {
          code: wrappedCode
        }
      };
      activeFile = '/App.js';
      isStaticProject = false;
    }
  } catch (error) {
    console.error('Error processing files:', error);
    // Fallback to default
    sandpackFiles = {
      '/App.js': {
        code: `
import React from 'react';

export default ${defaultCode}
        `
      }
    };
    activeFile = '/App.js';
    isStaticProject = false;
  }

  // Create a key based on files to force remount when content changes
  const sandpackKey = isMultiFile 
    ? JSON.stringify(Object.keys(sandpackFiles).sort()) 
    : code ? code.substring(0, 50) : 'default';

  // Fullscreen functionality
  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      try {
        if (containerRef.current.requestFullscreen) {
          await containerRef.current.requestFullscreen();
        } else if (containerRef.current.mozRequestFullScreen) { // Firefox
          await containerRef.current.mozRequestFullScreen();
        } else if (containerRef.current.webkitRequestFullscreen) { // Chrome, Safari and Opera
          await containerRef.current.webkitRequestFullscreen();
        } else if (containerRef.current.msRequestFullscreen) { // IE/Edge
          await containerRef.current.msRequestFullscreen();
        }
        setIsFullscreen(true);
      } catch (err) {
        console.error('Error attempting to enable fullscreen:', err);
      }
    } else {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      } else if (document.mozCancelFullScreen) { // Firefox
        await document.mozCancelFullScreen();
      } else if (document.webkitExitFullscreen) { // Chrome, Safari and Opera
        await document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) { // IE/Edge
        await document.msExitFullscreen();
      }
      setIsFullscreen(false);
    }
  };

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('msfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('msfullscreenchange', handleFullscreenChange);
    };
  }, []);

  return (
    <div ref={containerRef} className="h-full w-full relative">
      {/* Fullscreen button */}
      <button
        onClick={toggleFullscreen}
        className="absolute top-4 right-4 z-10 bg-gray-800 hover:bg-gray-700 text-white p-2 rounded-lg transition-colors duration-200"
        title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
      >
        {isFullscreen ? (
          // Exit fullscreen icon
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25" />
          </svg>
        ) : (
          // Enter fullscreen icon
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
          </svg>
        )}
      </button>

      {/* Escape hint when in fullscreen */}
      {isFullscreen && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-gray-800 bg-opacity-90 text-white px-4 py-2 rounded-lg z-10">
          Press ESC to exit fullscreen
        </div>
      )}

      <Sandpack
        key={sandpackKey}
        template={isStaticProject ? "static" : "react"}
        files={sandpackFiles}
        theme="dark"
        options={{
          showNavigator: isMultiFile,
          showTabs: true,
          showLineNumbers: true,
          showInlineErrors: true,
          wrapContent: false,
          editorHeight: isMultiFile ? "100%" : 400,
          editorWidthPercentage: isMultiFile ? 50 : 45,
          // bundlerURL removed - let Sandpack use its default
          externalResources: [],
          resizablePanels: true,
          autorun: true,
          autoReload: true,
          activeFile: activeFile,
          recompileMode: "delayed",
          recompileDelay: 300
        }}
        customSetup={{
          dependencies: isStaticProject ? {} : {
            "react": "^18.0.0",
            "react-dom": "^18.0.0"
          },
          entry: isStaticProject ? "/index.html" : "/index.js"
        }}
        style={{
          height: '100%'
        }}
      />
    </div>
  )
}

export default CodePreview
