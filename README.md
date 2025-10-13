# Bot Script Editor - Hummingbot Dashboard

A comprehensive bot script editor with GitHub-like file viewer and VSCode-like editing experience, integrated into the Hummingbot Dashboard.

## 🚀 Features Implemented

### ✅ File Management System
- **GitHub-style File Viewer**: Browse scripts with visual file type indicators
- **Search & Filter**: Search scripts by name and filter by file type (Python, Config, etc.)
- **File Type Recognition**: Automatic detection and icons for `.py`, `.yml`, `.yaml` files
- **Create New Scripts**: One-click creation of new Python scripts with comprehensive templates

### ✅ Advanced Code Editor
- **Monaco Editor Integration**: Full VSCode editor with syntax highlighting
- **Monaco Diff Editor**: Side-by-side comparison view showing original vs modified code
- **Real-time Change Detection**: Automatic tracking of modifications with visual indicators
- **Dual View Modes**: Switch between Edit mode and Diff mode with one click
- **Python Language Support**: Optimized for Hummingbot Python scripts
- **Multi-language Support**: Python, YAML, JSON syntax highlighting
- **Editor Features**:
  - Line numbers and minimap
  - Word wrap and auto-formatting
  - Find/replace functionality
  - Code folding
  - Multiple cursors
  - IntelliSense support
  - Git-like diff highlighting

### ✅ Smart Script Operations
- **Real-time Save Detection**: Visual indicators for unsaved changes
- **Keyboard Shortcuts**: `Ctrl+S`/`Cmd+S` for saving
- **Download/Upload**: Export scripts locally or import from files
- **Auto-save Prompts**: Clear status indicators (saved/unsaved)
- **Error Handling**: Robust error handling for API failures

### ✅ API Integration
- **REST API Client**: Complete integration with Hummingbot `/scripts` endpoints
- **Reactive Data**: Real-time loading and caching with TanStack React Query
- **Optimistic Updates**: Immediate UI feedback with background synchronization
- **Connection Resilience**: Graceful handling of API unavailability

## 🏗️ Technical Architecture

### Frontend Stack
- **React 19** + **Next.js 15** with TypeScript
- **Monaco Editor React** for code editing
- **TanStack React Query** for API state management
- **Tailwind CSS** + **shadcn/ui** for styling
- **Zustand** for global state management

### API Endpoints
- `GET /scripts/` - List all available scripts
- `GET /scripts/{script_name}` - Get specific script content
- `POST /scripts/{script_name}` - Create or update script

### Key Components
```
src/
├── app/bots/page.tsx                 # Main bots page
├── components/bots/
│   ├── script-file-viewer.tsx        # GitHub-style file browser
│   └── script-editor.tsx             # VSCode-style editor
├── lib/api/scripts.ts                # API client functions
└── components/ui/                    # Reusable UI components
```

## 🖥️ Usage Instructions

### 1. Starting the Application
```bash
cd frontend
pnpm install
pnpm run dev
```
The app will run on `http://localhost:3001` (or 3000 if available)

### 2. Accessing the Bot Script Editor
1. Open the Hummingbot Dashboard in your browser
2. Click **"Bots"** in the sidebar navigation
3. You'll see the script file viewer interface

### 3. Working with Scripts

#### When API is Available:
- Scripts are loaded from `GET /scripts/` endpoint
- Click any script to edit it
- Changes are saved to `POST /scripts/{script_name}`

#### When API is Unavailable:
- Shows helpful error message with connection instructions
- Can still create and edit scripts locally
- Demonstrates full editor functionality

### 4. Creating New Scripts
1. Click **"New Script"** button
2. A new script opens with a comprehensive Hummingbot v2 template
3. Includes:
   - Proper imports and class structure
   - Configuration class with common parameters
   - Strategy class with documented methods
   - Example trading logic structure
   - Risk management parameters

### 5. Editor Features
- **Syntax Highlighting**: Full Python syntax highlighting
- **Auto-completion**: IntelliSense for better coding
- **Save Shortcuts**: `Ctrl+S` (Windows/Linux) or `Cmd+S` (Mac)
- **Diff View**: Click "Diff" button to see side-by-side comparison of changes
- **Visual Change Tracking**: Modified badge and real-time change detection
- **Download/Upload**: Import/export scripts as files
- **Status Tracking**: Real-time save status and change detection

### 6. Using the Diff View
1. **Make Changes**: Edit your script in the normal editor
2. **View Diff**: Click the "Diff" button (enabled when changes are detected)
3. **Side-by-Side**: See original code (left) vs modified code (right)
4. **Visual Indicators**: Red for removed lines, green for added lines
5. **Edit in Diff**: Make changes directly in the right panel
6. **Switch Back**: Click "Edit" to return to normal editing mode

## 🎯 Demo Scenarios

### Scenario 1: API Connected
```bash
# Start the Hummingbot API server first
# Then access http://localhost:3001/bots
# Scripts will load from the API
```

### Scenario 2: API Disconnected (Demo Mode)
```bash
# Access http://localhost:3001/bots without API running
# Shows error handling and offline capabilities
# Can create and edit scripts locally
```

### Scenario 3: Creating New Scripts
1. Click "New Script" from the file viewer
2. Edit the comprehensive template provided
3. Save with Ctrl+S or Save button
4. Download the script file if needed

## 🔧 Configuration

### API Configuration
The app automatically detects the API endpoint from:
1. `process.env.NEXT_PUBLIC_API_BASE_URL`
2. Health monitor settings in localStorage
3. Falls back to `http://localhost:8000`

### Monaco Editor Options
Configured for optimal Python development:
```javascript
{
  minimap: { enabled: true },
  fontSize: 14,
  lineNumbers: 'on',
  wordWrap: 'on',
  folding: true,
  tabSize: 4,
  rulers: [80, 120], // PEP 8 line length guides
}
```

## 🚨 Error Handling

### API Connection Issues
- Shows user-friendly error message
- Provides retry functionality
- Allows offline script creation
- Clear instructions for API setup

### Script Save Failures
- Displays specific error messages
- Automatic retry with exponential backoff
- Preserves unsaved content
- Visual status indicators

### File Upload Errors
- Validates file types
- Handles large files gracefully
- Shows progress indicators
- Clear error feedback

## 🎨 UI/UX Features

### Visual Design
- **GitHub-inspired File Browser**: Familiar interface for developers
- **VSCode-style Editor**: Professional code editing experience  
- **Responsive Design**: Works on desktop and tablet
- **Dark/Light Theme**: Matches dashboard theme settings

### Accessibility
- Keyboard navigation support
- Screen reader compatibility
- High contrast theme support
- Focus indicators

### Performance
- **Code Splitting**: Monaco editor loaded dynamically
- **Lazy Loading**: Components loaded on demand
- **Optimistic Updates**: Immediate UI feedback
- **Caching**: Smart caching with React Query

## 📝 Script Template

New scripts include a comprehensive template with:

```python
"""
Hummingbot Strategy Template

This template includes:
- Proper v2 framework structure
- Configuration class with market/risk parameters
- Strategy class with documented methods
- Example trading logic structure
- Risk management guidelines
"""
```

## 🔮 Future Enhancements

- **Syntax Validation**: Real-time Python linting
- **Auto-formatting**: Code formatting with Black
- **IntelliSense**: Hummingbot-specific code completion
- **Debugging**: Integrated debugging tools
- **Version Control**: Git integration
- **Collaboration**: Multi-user editing
- **More Templates**: Additional strategy templates

## 🐛 Testing

The implementation includes:
- **Error Boundary Components**: Graceful error handling
- **Loading States**: Smooth loading experiences  
- **Connection Resilience**: Robust API failure handling
- **User Feedback**: Clear status and error messages

## 📦 Dependencies Added

```json
{
  "@monaco-editor/react": "^4.7.0"
}
```

All other dependencies were already present in the existing Hummingbot Dashboard.

---

**The bot script editor is now fully integrated and ready for use!** 🎉

Access it at: `http://localhost:3001/bots` (when the frontend dev server is running)