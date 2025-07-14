import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import Anthropic from '@anthropic-ai/sdk';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Helper function to create prompt for Claude
function createCodeGenerationPrompt(userPrompt, isRetry = false, truncationIssue = false) {
  if (isRetry) {
    // Simplified prompt for retry attempts
    const simplifiedPrompt = truncationIssue 
      ? `Create a minimal web project: "${userPrompt}". Include ONLY index.html with inline CSS and JS.`
      : `Generate a simple web project based on: "${userPrompt}"`;
      
    return `${simplifiedPrompt}

Return ONLY a valid JSON object with essential files:
{
  "index.html": "<!DOCTYPE html>...",
  "style.css": "/* CSS code */",
  "script.js": "// JavaScript code"
}

${truncationIssue ? 'IMPORTANT: Keep response under 4000 characters. Prioritize working code over completeness.' : 'Keep it simple and concise.'} Return ONLY valid JSON.`;
  }

  return `You are an expert full-stack web developer. Generate a complete web project based on the following user request:

"${userPrompt}"

Requirements:
1. Generate a COMPLETE web project with all necessary files
2. Return the response as a JSON object where keys are file paths and values are file contents
3. Include all necessary files: HTML, CSS, JavaScript, and any configuration files
4. Use modern, clean code with proper structure
5. Make it visually appealing and responsive
6. Include proper file organization (e.g., 'index.html', 'styles/main.css', 'js/app.js')
7. Add a README.md file with project documentation
8. For React projects, include all component files separately
9. Ensure all files work together as a cohesive project

Return ONLY a valid JSON object in this format:
{
  "index.html": "<!DOCTYPE html>...",
  "styles/main.css": "/* CSS code */",
  "js/app.js": "// JavaScript code",
  "README.md": "# Project Name\\n\\nDescription..."
}

Do not include any text outside the JSON object. The JSON must be valid and parseable.`;
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'cmdshift-backend'
  });
});

// API endpoint for code explanation
app.post('/api/explain', async (req, res) => {
  const startTime = Date.now();
  console.log(`[${new Date().toISOString()}] Explain request started`);
  
  // Set shorter timeout for explanations
  req.setTimeout(30000); // 30 seconds
  res.setTimeout(30000); // 30 seconds
  
  try {
    const { code } = req.body;
    
    // Validate input
    if (!code) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'Code is required for explanation'
      });
    }
    
    // Log the request
    console.log('[Explain Request] Code length:', typeof code === 'string' ? code.length : 'object');
    
    // Check if API key is configured
    if (!process.env.ANTHROPIC_API_KEY) {
      console.error('ANTHROPIC_API_KEY not configured');
      return res.status(500).json({
        error: 'Configuration error',
        message: 'AI service is not properly configured'
      });
    }
    
    // Prepare code content for explanation
    let codeContent = '';
    let projectInfo = '';
    
    if (typeof code === 'object' && !Array.isArray(code)) {
      // Multi-file project
      const files = Object.entries(code);
      projectInfo = `This is a complete website project with ${files.length} files:\n`;
      files.forEach(([filename, content]) => {
        projectInfo += `- ${filename}\n`;
        codeContent += `\n=== File: ${filename} ===\n${content}\n`;
      });
    } else {
      // Single file
      codeContent = code;
      projectInfo = 'This is a single component/file.';
    }
    
    // Create explanation prompt
    const explanationPrompt = `You are explaining code to someone who has never programmed before. They are a business owner or entrepreneur who wants to understand what their generated website does.

${projectInfo}

Please explain this code in simple, non-technical terms:
1. What the website/component does for visitors
2. The main features and sections
3. How users will interact with it
4. Simple customization tips

Use analogies, plain language, and avoid ALL technical jargon. Focus on the user experience and business value, not programming concepts.

Format your response as JSON with this structure:
{
  "overview": "A brief 1-2 sentence overview",
  "sections": [
    {
      "title": "Section name",
      "description": "What this section does for visitors"
    }
  ],
  "features": [
    "Feature 1 description",
    "Feature 2 description"
  ],
  "customization": [
    "Tip 1",
    "Tip 2"
  ]
}

Code to explain:
${codeContent.substring(0, 8000)}${codeContent.length > 8000 ? '\n... (truncated for brevity)' : ''}`;
    
    try {
      // Use Claude Opus 4 model
      const model = process.env.ANTHROPIC_MODEL || 'claude-opus-4-20250514';
      console.log(`[Explain] Using model: ${model}`);
      
      // Create timeout controller (25 seconds, leaving 5s buffer)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 25000);
      
      const message = await anthropic.messages.create({
        model: model,
        max_tokens: 2000, // Shorter response for explanations
        temperature: 0.7,
        system: "You are a helpful assistant explaining code to non-technical business owners. Always respond with valid JSON only, no other text.",
        messages: [
          {
            role: 'user',
            content: explanationPrompt
          }
        ]
      });
      
      clearTimeout(timeoutId);
      
      // Extract and parse the response
      let explanationText = message.content[0].text;
      console.log(`[Explain] Response length: ${explanationText.length} characters`);
      
      // Clean up the response
      explanationText = explanationText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      let explanation;
      try {
        explanation = JSON.parse(explanationText);
      } catch (parseError) {
        console.error('[Explain] JSON parse error:', parseError.message);
        // Fallback to simple explanation
        explanation = {
          overview: "I've created a modern website for your business with all the features you requested.",
          sections: [
            {
              title: "Main Content",
              description: "The website includes all the sections and features from your request, professionally designed and ready to use."
            }
          ],
          features: [
            "Mobile-friendly design that works on all devices",
            "Professional styling and layout",
            "Interactive elements for user engagement",
            "Easy to customize with your content"
          ],
          customization: [
            "Replace placeholder text with your actual business information",
            "Update images with your own photos or graphics",
            "Adjust colors to match your brand",
            "Add or remove sections as needed"
          ]
        };
      }
      
      // Success - return the explanation
      const elapsed = Date.now() - startTime;
      console.log(`[${new Date().toISOString()}] Explain request completed in ${elapsed}ms`);
      
      res.json({
        success: true,
        explanation: explanation,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('[Explain] Claude API Error:', error.message);
      
      // Handle specific errors
      if (error.name === 'AbortError') {
        return res.status(504).json({
          error: 'Request timeout',
          message: 'The explanation took too long. Please try again.'
        });
      }
      
      throw error;
    }
    
  } catch (error) {
    console.error('Error in /api/explain:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to generate explanation. Please try again.'
    });
  }
});

// Main API endpoint for code generation
app.post('/api/generate', async (req, res) => {
  const startTime = Date.now();
  console.log(`[${new Date().toISOString()}] Generate request started`);
  
  // Set request timeout
  req.setTimeout(120000); // 2 minutes
  
  // Set response timeout
  res.setTimeout(120000); // 2 minutes
  
  try {
    const { prompt } = req.body;

    // Validate prompt
    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'Prompt is required and must be a non-empty string'
      });
    }

    // Log the request
    console.log(`[Generate Request] Prompt: ${prompt.substring(0, 100)}...`);

    // Check if API key is configured
    if (!process.env.ANTHROPIC_API_KEY) {
      console.error('ANTHROPIC_API_KEY not configured');
      return res.status(500).json({
        error: 'Configuration error',
        message: 'AI service is not properly configured. Please check server settings.'
      });
    }

    // Call Claude API with retry logic
    let attempt = 0;
    const maxAttempts = 2;
    let lastError = null;
    
    console.log('[Generate] Request timeout set to 120 seconds');
    
    let hadTruncationIssue = false;
    
    while (attempt < maxAttempts) {
      try {
        const isRetry = attempt > 0;
        const systemPrompt = createCodeGenerationPrompt(prompt, isRetry, hadTruncationIssue);
        
        // Use Claude Opus 4 model
        const model = process.env.ANTHROPIC_MODEL || 'claude-opus-4-20250514';
        console.log(`[Generate] Attempt ${attempt + 1}: Using model: ${model}`);
        
        // Use 6000 max tokens for better performance
        const maxTokens = isRetry ? 4000 : 6000;
        console.log(`[Generate] Max tokens: ${maxTokens}`);
        
        // Create an AbortController for timeout
        // Set high timeout for complex generations (default: 110s, leaving 10s buffer from 120s request timeout)
        const claudeTimeout = parseInt(process.env.CLAUDE_API_TIMEOUT) || 110000;
        console.log(`[Generate] Claude API timeout: ${claudeTimeout}ms (${claudeTimeout/1000}s)`);
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), claudeTimeout);
        
        const message = await anthropic.messages.create({
          model: model,
          max_tokens: maxTokens,
          temperature: 0.7,
          system: systemPrompt,
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ]
        });
        
        clearTimeout(timeoutId);

        // Extract the generated content from Claude's response
        let generatedContent = message.content[0].text;
        console.log(`[Generate] Response length: ${generatedContent.length} characters`);
        
        // Clean up the content (remove any markdown formatting if present)
        generatedContent = generatedContent.replace(/```json\n?/g, '').replace(/```\n?/g, '');
        generatedContent = generatedContent.trim();
        
        // Enhanced truncation detection
        const isJsonTruncated = (json) => {
          let openBraces = 0;
          let openBrackets = 0;
          let inString = false;
          let escapeNext = false;
          
          for (let i = 0; i < json.length; i++) {
            const char = json[i];
            
            if (escapeNext) {
              escapeNext = false;
              continue;
            }
            
            if (char === '\\') {
              escapeNext = true;
              continue;
            }
            
            if (char === '"' && !inString) {
              inString = true;
            } else if (char === '"' && inString) {
              inString = false;
            }
            
            if (!inString) {
              if (char === '{') openBraces++;
              else if (char === '}') openBraces--;
              else if (char === '[') openBrackets++;
              else if (char === ']') openBrackets--;
            }
          }
          
          return openBraces > 0 || openBrackets > 0 || inString;
        };
        
        // Function to repair truncated JSON
        const repairTruncatedJson = (json) => {
          let repaired = json;
          let repairs = [];
          
          // Count unclosed structures
          let openBraces = 0;
          let openBrackets = 0;
          let inString = false;
          let lastStringStart = -1;
          
          for (let i = 0; i < json.length; i++) {
            const char = json[i];
            
            if (char === '"' && (i === 0 || json[i-1] !== '\\')) {
              if (!inString) {
                inString = true;
                lastStringStart = i;
              } else {
                inString = false;
              }
            }
            
            if (!inString) {
              if (char === '{') openBraces++;
              else if (char === '}') openBraces--;
              else if (char === '[') openBrackets++;
              else if (char === ']') openBrackets--;
            }
          }
          
          // Close unclosed string
          if (inString) {
            repaired += '"';
            repairs.push('closed unclosed string');
          }
          
          // Close unclosed arrays and objects
          while (openBrackets > 0) {
            repaired += ']';
            openBrackets--;
            repairs.push('closed unclosed array');
          }
          
          while (openBraces > 0) {
            repaired += '}';
            openBraces--;
            repairs.push('closed unclosed object');
          }
          
          return { repaired, repairs };
        };
        
        // Check if response is truncated
        let wasRepaired = false;
        let repairDetails = [];
        
        if (isJsonTruncated(generatedContent)) {
          console.warn('[Generate] Response appears to be truncated, attempting repair...');
          
          const { repaired, repairs } = repairTruncatedJson(generatedContent);
          generatedContent = repaired;
          wasRepaired = true;
          repairDetails = repairs;
          
          console.log(`[Generate] Applied repairs: ${repairs.join(', ')}`);
        }
        
        let responseData;
        
        try {
          // Try to parse as JSON (multi-file project)
          const parsedFiles = JSON.parse(generatedContent);
          
          // Validate that it's an object with file paths
          if (typeof parsedFiles === 'object' && !Array.isArray(parsedFiles)) {
            console.log(`[Generate Success] Multi-file project generated with ${Object.keys(parsedFiles).length} files`);
            responseData = {
              success: true,
              files: parsedFiles,
              isProject: true,
              timestamp: new Date().toISOString(),
              partial: wasRepaired,
              repairs: wasRepaired ? repairDetails : undefined
            };
          } else {
            throw new Error('Invalid project structure');
          }
        } catch (jsonError) {
          // If this is a retry and we couldn't repair, throw error
          if (isRetry && !wasRepaired) {
            throw jsonError;
          }
          
          // If JSON was repaired but still can't parse, log details
          if (wasRepaired) {
            console.error('[Generate] Repaired JSON still invalid:', jsonError.message);
          }
          
          // Fallback: treat as single file (backward compatibility)
          console.log('[Generate Success] Single file generated (backward compatible)');
          
          // For backward compatibility, wrap single file response
          let code = generatedContent;
          
          // Ensure the code starts with function declaration for React components
          if (!code.startsWith('function') && !code.startsWith('<!DOCTYPE')) {
            code = code.replace(/^export\s+default\s+/, '');
          }
          
          // Add export default for React components
          if (code.startsWith('function')) {
            code = `export default ${code}`;
          }
          
          responseData = {
            success: true,
            code: code,
            language: 'javascript',
            framework: 'react',
            isProject: false,
            timestamp: new Date().toISOString(),
            partial: wasRepaired,
            repairs: wasRepaired ? repairDetails : undefined
          };
        }
        
        // Success - return the response
        const elapsed = Date.now() - startTime;
        console.log(`[${new Date().toISOString()}] Generate request completed in ${elapsed}ms`);
        res.json(responseData);
        return;
        
      } catch (error) {
        lastError = error;
        attempt++;
        console.error(`[Generate] Attempt ${attempt} failed:`, error.message);
        
        // Check if it was a truncation issue
        if (error.message === 'Response truncated' || wasRepaired) {
          hadTruncationIssue = true;
          console.log('[Generate] Setting truncation flag for retry');
        }
        
        // Check if it's a timeout error
        if (error.name === 'AbortError') {
          console.error('[Generate] Request timed out');
          return res.status(504).json({
            error: 'Request timeout',
            message: 'The request took too long to process. Please try with a simpler prompt.'
          });
        }
        
        // Don't retry for certain errors
        if (error.status === 401 || error.status === 429) {
          break;
        }
      }
    }
    
    // All attempts failed - handle the error
    console.error('Claude API Error:', lastError);
    
    // Handle specific API errors
    if (lastError.status === 401) {
      return res.status(401).json({
        error: 'Authentication error',
        message: 'Invalid API key. Please check your configuration.'
      });
    } else if (lastError.status === 429) {
      return res.status(429).json({
        error: 'Rate limit exceeded',
        message: 'Too many requests. Please try again later.'
      });
    } else if (lastError.status === 400) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'The prompt may be too long or contain invalid characters.'
      });
    }
    
    // Generic error response
    return res.status(500).json({
      error: 'AI service error',
      message: 'Failed to generate code. Please try again.',
      details: process.env.NODE_ENV === 'development' ? lastError.message : undefined
    });

  } catch (error) {
    console.error('Error in /api/generate:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to generate code. Please try again.'
    });
  }
});

// API endpoint for chat-based code editing
app.post('/api/chat', async (req, res) => {
  const startTime = Date.now();
  console.log(`[${new Date().toISOString()}] Chat edit request started`);
  
  // Set request timeout
  req.setTimeout(120000); // 2 minutes
  res.setTimeout(120000); // 2 minutes
  
  try {
    const { code, message, history } = req.body;
    
    // Validate input
    if (!code || !message) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'Code and message are required'
      });
    }
    
    // Log the request
    console.log(`[Chat Edit Request] Message: ${message.substring(0, 100)}...`);
    console.log(`[Chat Edit Request] Code type: ${typeof code}`);
    console.log(`[Chat Edit Request] History length: ${history ? history.length : 0}`);
    
    // Check if API key is configured
    if (!process.env.ANTHROPIC_API_KEY) {
      console.error('ANTHROPIC_API_KEY not configured');
      return res.status(500).json({
        error: 'Configuration error',
        message: 'AI service is not properly configured'
      });
    }
    
    // Prepare current code content
    let currentCodeContent = '';
    let isMultiFile = false;
    
    if (typeof code === 'object' && !Array.isArray(code)) {
      // Multi-file project
      isMultiFile = true;
      const files = Object.entries(code);
      files.forEach(([filename, content]) => {
        currentCodeContent += `\n=== File: ${filename} ===\n${content}\n`;
      });
    } else {
      // Single file
      currentCodeContent = code;
    }
    
    // Build conversation history for context
    let conversationContext = '';
    if (history && history.length > 0) {
      // Take last 5 messages for context
      const recentHistory = history.slice(-5);
      conversationContext = 'Recent conversation:\n';
      recentHistory.forEach(msg => {
        conversationContext += `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}\n\n`;
      });
    }
    
    // Create edit prompt
    const editPrompt = `You are an expert web developer helping to edit and improve code based on user requests.

${conversationContext}

Current code:
${currentCodeContent}

User's edit request: "${message}"

Please analyze the current code and make the specific changes requested by the user. 

Requirements:
1. Make ONLY the changes requested - don't add extra features
2. Preserve all existing functionality unless explicitly asked to change it
3. Maintain the same code style and structure
4. Keep the same file organization
5. Ensure all changes work together properly

${isMultiFile ? `Return the complete updated project as a JSON object with file paths as keys and updated content as values:
{
  "filename.ext": "updated content",
  ...
}` : 'Return the updated code as a single string.'}

Return ONLY the ${isMultiFile ? 'JSON object' : 'code'}, no explanations or markdown.`;
    
    try {
      // Use Claude Opus 4 model
      const model = process.env.ANTHROPIC_MODEL || 'claude-opus-4-20250514';
      console.log(`[Chat Edit] Using model: ${model}`);
      
      // Create timeout controller
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 110000); // 110 seconds
      
      const claudeMessage = await anthropic.messages.create({
        model: model,
        max_tokens: 6000,
        temperature: 0.7,
        system: "You are a helpful coding assistant that makes specific edits to existing code based on user requests. Always preserve existing functionality unless asked to change it.",
        messages: [
          {
            role: 'user',
            content: editPrompt
          }
        ]
      });
      
      clearTimeout(timeoutId);
      
      // Extract and clean the response
      let editedContent = claudeMessage.content[0].text;
      console.log(`[Chat Edit] Response length: ${editedContent.length} characters`);
      
      // Clean up markdown if present
      editedContent = editedContent.replace(/```json\n?/g, '').replace(/```javascript\n?/g, '').replace(/```\n?/g, '').trim();
      
      let responseData;
      
      if (isMultiFile) {
        try {
          // Parse as JSON for multi-file projects
          const parsedFiles = JSON.parse(editedContent);
          
          if (typeof parsedFiles === 'object' && !Array.isArray(parsedFiles)) {
            console.log(`[Chat Edit Success] Multi-file project edited with ${Object.keys(parsedFiles).length} files`);
            responseData = {
              success: true,
              files: parsedFiles,
              isProject: true,
              timestamp: new Date().toISOString()
            };
          } else {
            throw new Error('Invalid project structure');
          }
        } catch (jsonError) {
          console.error('[Chat Edit] JSON parse error:', jsonError.message);
          throw new Error('Failed to parse edited project files');
        }
      } else {
        // Single file response
        console.log('[Chat Edit Success] Single file edited');
        
        // Ensure proper formatting for React components
        let processedCode = editedContent;
        if (!processedCode.startsWith('function') && !processedCode.startsWith('<!DOCTYPE')) {
          processedCode = processedCode.replace(/^export\s+default\s+/, '');
        }
        if (processedCode.startsWith('function')) {
          processedCode = `export default ${processedCode}`;
        }
        
        responseData = {
          success: true,
          code: processedCode,
          language: 'javascript',
          framework: 'react',
          isProject: false,
          timestamp: new Date().toISOString()
        };
      }
      
      // Success - return the response
      const elapsed = Date.now() - startTime;
      console.log(`[${new Date().toISOString()}] Chat edit request completed in ${elapsed}ms`);
      res.json(responseData);
      
    } catch (error) {
      console.error('[Chat Edit] Claude API Error:', error.message);
      
      // Handle specific errors
      if (error.name === 'AbortError') {
        return res.status(504).json({
          error: 'Request timeout',
          message: 'The edit took too long. Please try with a simpler request.'
        });
      }
      
      throw error;
    }
    
  } catch (error) {
    console.error('Error in /api/chat:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to edit code. Please try again.'
    });
  }
});

// 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.url}`
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';
  
  res.status(status).json({
    error: status === 500 ? 'Internal Server Error' : err.name || 'Error',
    message: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`
🚀 CmdShift Backend Server is running!
📍 Local: http://localhost:${PORT}
🏥 Health: http://localhost:${PORT}/health
📝 Environment: ${process.env.NODE_ENV || 'development'}
  `);
});

// Set all server timeouts to 2 minutes
server.timeout = 120000;
server.keepAliveTimeout = 120000;
server.headersTimeout = 120000;

// Log all timeout values
console.log(`
⏱️  Timeout Configuration:
   - Server timeout: ${server.timeout}ms (2 minutes)
   - Keep-alive timeout: ${server.keepAliveTimeout}ms (2 minutes)
   - Headers timeout: ${server.headersTimeout}ms (2 minutes)
`);