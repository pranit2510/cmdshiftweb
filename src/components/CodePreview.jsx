import { Sandpack } from '@codesandbox/sandpack-react'

function CodePreview({ code = '', files = null }) {
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

  return (
    <div className="h-full w-full">
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
