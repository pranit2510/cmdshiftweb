# Claude Configuration for CmdShift Web

## 🎯 Project Context

You are helping build **CmdShift Web** - a web-based AI code generation platform that enables non-technical users to build full-stack web applications through natural language descriptions. The target users are business owners, marketers, and entrepreneurs who have never coded.

**Project Location**: `/Users/pranitsharma/desktop/cmdshiftwebv2`

## 🚨 CRITICAL WORKFLOW RULES

### 1. ONE STEP AT A TIME - ALWAYS
- Give ONE instruction
- WAIT for user to confirm "Done" or report issue
- ONLY then give next step
- NEVER give multiple steps at once

### 2. ALWAYS USE LOCATION LABELS
- 🤖 **CLAUDE CODE**: For ALL coding tasks (user pastes prompts)
- 💻 **TERMINAL**: For commands only (user copy/pastes)
- 🖱️ **MANUAL**: For browser/UI actions
- 👀 **VERIFY**: Check and confirm results

### 3. USER WORKFLOW
- User is a "vibe coder" (non-technical background)
- User ONLY gives prompts to Claude Code
- User NEVER writes or copies code manually
- User ONLY copy/pastes terminal commands
- Always verify manual steps before proceeding

## 📊 Current Project State

### ✅ Completed (Phase 1-4)
- React + Vite project setup
- Tailwind CSS v4 configured and working
- Two-panel responsive layout
- Header with "CmdShift Web" branding
- Prompt input area (UI only)
- Code preview area (UI only)
- Professional UI with dark code theme

### 📍 Current Phase: 5 of 10
**Next Step**: Implement Sandpack in `components/CodePreview.jsx`

### 🛠️ Tech Stack
```javascript
{
  "frontend": "React + Vite + Tailwind CSS v4",
  "codeExecution": "Sandpack (NOT Docker/WebContainers)",
  "ai": "Claude Opus 4 (claude-opus-4-20250514)",
  "database": "Supabase",
  "backend": "Node.js + Express (minimal)",
  "hosting": "Vercel + Railway"
}
```

## 💡 Key Technical Decisions

1. **Sandpack over WebContainers**: Free, works everywhere, no licensing
2. **Tailwind CSS v4**: Requires `@tailwindcss/postcss` in PostCSS config
3. **Target non-coders**: Hide ALL technical complexity
4. **Business templates**: Landing pages, forms, dashboards (NOT dev tools)
5. **One-click everything**: Deploy, export, share

## ⚠️ Known Issues & Solutions

### Tailwind CSS PostCSS Error
If you see: `[postcss] It looks like you're trying to use tailwindcss directly`
```javascript
// postcss.config.js - CORRECT for v4
export default {
  plugins: {
    '@tailwindcss/postcss': {},  // NOT 'tailwindcss'
    autoprefixer: {},
  },
}
```

### Port Changes
- Vite uses next available port (5173, 5174, etc.)
- Always check terminal output for actual port

## 📋 Example Interaction Pattern

```
Claude: "Step 1 - 🤖 CLAUDE CODE: Create a new component..."
User: "Done"
Claude: "Step 2 - 💻 TERMINAL: npm run dev"
Claude: "👀 VERIFY: Do you see the app running on localhost?"
User: "Yes, I see it"
Claude: "Step 3 - 🖱️ MANUAL: Open browser..."
```

## 🎨 UI/UX Conventions

- **Layout**: Two-panel (40% prompt, 60% preview)
- **Colors**: Professional grays, blue accents
- **Code Preview**: Dark theme (#1e293b background)
- **Responsive**: Mobile stacks vertically
- **Icons**: Use simple, clear icons (no complex SVGs)

## 🚀 Deployment Plan

1. **Frontend**: Vercel (automatic from GitHub)
2. **Backend**: Railway (Node.js API)
3. **Database**: Supabase (free tier initially)
4. **Environment Variables**: Store API keys securely

## 📝 Code Generation Prompts

When integrating Claude API, use this prompt structure:
```
Generate a ${type} with these requirements:
- Modern React with hooks
- Tailwind CSS styling (core utilities only)
- Mobile responsive
- Clean, commented code
- ${userRequirements}

Return ONLY code, no explanations.
```

## ✅ Success Criteria

- Non-technical user can build landing page in < 5 minutes
- Generated code works first time
- No coding knowledge required
- Export works with one click
- Preview updates instantly

## 🚫 What NOT to Do

- Don't add developer features
- Don't optimize prematurely  
- Don't use Docker/containers
- Don't make UI complex
- Don't target technical users
- Don't give multiple steps at once
- Don't skip location labels

## 📂 Project Structure

```
cmdshiftwebv2/
├── src/
│   ├── components/
│   │   └── Layout.jsx      # Two-panel layout
│   ├── App.jsx            # Root (imports Layout)
│   ├── main.jsx           # Entry point
│   └── index.css          # Tailwind directives
├── postcss.config.js      # Tailwind v4 config
├── package.json           # Dependencies installed
└── claude.md              # This file
```

## 🔄 Phase Progress

- [x] Phase 1: Project Setup
- [x] Phase 2: Core Dependencies
- [x] Phase 3: Tailwind Configuration  
- [x] Phase 4: UI Layout
- [ ] Phase 5: Sandpack Integration ← **CURRENT**
- [ ] Phase 6: Claude API Setup
- [ ] Phase 7: Frontend-Backend Connection
- [ ] Phase 8: Templates System
- [ ] Phase 9: Database Integration
- [ ] Phase 10: Deployment

## 💬 Communication Style

- Be direct and specific
- Always include location labels
- Give clear, actionable steps
- Verify before proceeding
- Focus on simplicity
- Remember: "If mom can't use it, we've failed"

## 🎯 Next Immediate Action

When continuing this project:
1. Verify project is at correct location
2. Run `npm run dev` to start
3. Begin with Phase 5 - Sandpack integration
4. Create `components/CodePreview.jsx`

---

**Remember**: The user is the director, Claude Code is the developer. Always be clear about WHERE each instruction should be executed!