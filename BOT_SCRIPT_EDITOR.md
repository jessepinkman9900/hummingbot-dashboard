# Bot Script Editor

A comprehensive bot script editor integrated into the Hummingbot Dashboard with GitHub-like file management and VSCode-like editing capabilities.

## Features

### 🗂️ File Management
- **File Explorer**: GitHub-style file viewer showing all scripts from `/scripts` API endpoint
- **Search & Filter**: Search scripts by name and filter by file type (Python, Config, etc.)
- **File Icons**: Visual indicators for different file types
- **Create New Scripts**: Easy creation of new Python scripts with templates

### ✨ Code Editor
- **Monaco Editor**: Full VSCode-powered editor with syntax highlighting
- **Monaco Diff Editor**: Side-by-side comparison view showing original vs modified code
- **Real-time Change Detection**: Automatic tracking of modifications with visual indicators
- **Dual View Modes**: Switch between Edit mode and Diff mode with one click
- **Python Language Support**: Default Python syntax highlighting for bot scripts
- **Auto-completion**: IntelliSense support for better coding experience
- **Multiple Language Support**: Python, YAML, JSON syntax highlighting
- **Line Numbers**: Easy code navigation
- **Minimap**: Overview of code structure
- **Word Wrap**: Comfortable editing of long lines

### 💾 Script Operations
- **Save & Auto-save Detection**: Real-time save status with keyboard shortcuts (Ctrl+S / Cmd+S)
- **Git-like Diff View**: Side-by-side comparison showing exactly what changed
- **Visual Change Indicators**: Modified badge, unsaved change status, and line-by-line diffs
- **Download Scripts**: Export scripts to local files
- **Upload Scripts**: Import scripts from local files
- **Version Control Ready**: Git diff-like interface for tracking changes

### 🔄 API Integration
- **Real-time Loading**: Fetches scripts from `/scripts/` endpoint
- **Individual Script Loading**: Gets script content from `/scripts/{script_name}` endpoint
- **Create/Update**: Saves scripts via POST to `/scripts/{script_name}` endpoint
- **Error Handling**: Graceful handling of API connection issues

## Usage

### Accessing the Editor
1. Navigate to `/bots` page from the sidebar
2. The page shows the file explorer by default

### Managing Scripts
1. **View Scripts**: All scripts are listed with file type badges
2. **Search Scripts**: Use the search bar to find specific scripts
3. **Filter Scripts**: Filter by Python scripts, Config files, or all files
4. **Create New Script**: Click "New Script" to create a new Python script with template

### Editing Scripts
1. **Open Script**: Click on any script in the file explorer
2. **Edit Content**: Use the full Monaco editor with syntax highlighting
3. **View Changes**: Click the "Diff" button to see side-by-side comparison of original vs modified code
4. **Track Changes**: Unsaved changes are indicated with orange status and "Modified" badge
5. **Save Changes**: Press Ctrl+S (Cmd+S on Mac) or click the Save button
6. **Download/Upload**: Use toolbar buttons for import/export

### Using the Diff View
1. **Activate Diff Mode**: Click the "Diff" button in the toolbar (only enabled when changes are detected)
2. **Side-by-Side Comparison**: View original code on the left, modified code on the right
3. **Visual Indicators**: Red highlighting for removed lines, green for added lines
4. **Edit in Diff Mode**: Make changes directly in the right panel of the diff view
5. **Switch Back**: Click "Edit" button to return to normal editing mode

### Keyboard Shortcuts
- `Ctrl+S` / `Cmd+S`: Save current script
- `Ctrl+Z` / `Cmd+Z`: Undo changes
- `Ctrl+Y` / `Cmd+Shift+Z`: Redo changes

## API Endpoints Used

### GET `/scripts/`
Returns list of available script names:
```json
["v2_with_controllers", "my_strategy", "simple_pmm"]
```

### GET `/scripts/{script_name}`
Returns script content:
```json
{
  "name": "v2_with_controllers",
  "content": "import os\nfrom decimal import Decimal\n..."
}
```

### POST `/scripts/{script_name}`
Creates or updates a script:
```json
{
  "content": "import os\nfrom decimal import Decimal\n..."
}
```

## Error Handling

- **API Connection Issues**: Shows helpful error message with retry options
- **Script Not Found**: Graceful handling of missing scripts
- **Save Failures**: Clear error messages with retry functionality
- **Network Timeouts**: Automatic retry with exponential backoff

## Technical Implementation

### Frontend Stack
- **React 19** with Next.js 15
- **TypeScript** for type safety
- **Monaco Editor** (`@monaco-editor/react`) for code editing
- **TanStack React Query** for API state management
- **Tailwind CSS** for responsive styling
- **shadcn/ui** components for consistent UI

### Key Components
- `ScriptFileViewer`: GitHub-like file explorer
- `ScriptEditor`: VSCode-like editor with Monaco
- `scriptsApi`: API client for backend communication

### State Management
- React Query for server state and caching
- Local state for editor content and UI state
- Optimistic updates for better UX

## Browser Compatibility

Supports all modern browsers with ES2015+ support:
- Chrome 88+
- Firefox 78+
- Safari 14+
- Edge 88+

## Future Enhancements

- **Syntax Validation**: Real-time Python syntax checking
- **Auto-formatting**: Code formatting with Black/autopep8
- **Intellisense**: Hummingbot-specific code completion
- **Debugging**: Integrated debugging capabilities
- **Version History**: Git-like version control
- **Collaboration**: Multi-user editing support
- **Templates**: More script templates for different strategies

## Development

The bot script editor is fully integrated into the existing Hummingbot Dashboard architecture and follows the established patterns for consistency and maintainability.