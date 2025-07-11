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
function createCodeGenerationPrompt(userPrompt, isRetry = false) {
  if (isRetry) {
    // Simplified prompt for retry attempts
    return `Generate a simple web project based on: "${userPrompt}"

Return ONLY a valid JSON object with essential files:
{
  "index.html": "<!DOCTYPE html>...",
  "style.css": "/* CSS code */",
  "script.js": "// JavaScript code"
}

Keep it simple and concise. Return ONLY valid JSON.`;
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
    
    while (attempt < maxAttempts) {
      try {
        const isRetry = attempt > 0;
        const systemPrompt = createCodeGenerationPrompt(prompt, isRetry);
        
        // Use Claude Opus 4 model
        const model = process.env.ANTHROPIC_MODEL || 'claude-opus-4-20250514';
        console.log(`[Generate] Attempt ${attempt + 1}: Using model: ${model}`);
        
        // Use 6000 max tokens for better performance
        const maxTokens = isRetry ? 4000 : 6000;
        console.log(`[Generate] Max tokens: ${maxTokens}`);
        
        // Create an AbortController for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 45000); // 45 second timeout
        
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
        
        // Check if response might be truncated
        const lastChar = generatedContent[generatedContent.length - 1];
        const secondLastChar = generatedContent[generatedContent.length - 2];
        const isTruncated = lastChar !== '}' && !(lastChar === '"' && secondLastChar === '}');
        
        if (isTruncated) {
          console.warn('[Generate] Response appears to be truncated, will retry with simpler prompt');
          throw new Error('Response truncated');
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
              timestamp: new Date().toISOString()
            };
          } else {
            throw new Error('Invalid project structure');
          }
        } catch (jsonError) {
          // If this is a retry, don't fall back to single file
          if (isRetry) {
            throw jsonError;
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
            timestamp: new Date().toISOString()
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