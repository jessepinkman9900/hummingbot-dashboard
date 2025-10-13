# Theme System

The Hummingbot Dashboard now supports multiple themes with light/dark mode switching.

## Available Themes

### Kodama Grove
A serene, nature-inspired theme with earthy green tones and elegant typography using Merriweather font.

### Doom 64  
A dark, retro-futuristic theme inspired by classic gaming with sharp contrasts and Oxanium font.

## Theme Components

### ThemeProvider
Wraps the entire application and manages theme state. Automatically saves preferences to localStorage.

### ThemePicker
Full theme customization dialog allowing users to:
- Choose between available themes (Kodama Grove, Doom 64)
- Select light or dark mode
- Preview current selection

### ThemeToggle  
Simple button to quickly toggle between light/dark modes without changing the theme.

## Usage

Both components are available in the header:
- **Theme Toggle** (Sun/Moon icon) - Quick light/dark switch
- **Theme Picker** (Palette icon) - Full theme customization

## Technical Details

- Themes are implemented as CSS custom properties (CSS variables)
- Dynamic theme loading via CSS injection
- Persistent preferences stored in localStorage 
- SSR-safe with proper hydration handling
- Smooth transitions between themes
- Consistent `rounded-md` border radius across all components

## File Structure

```
src/lib/themes/
├── config.ts           # Theme definitions and types
├── provider.tsx        # Theme context and provider
├── kodama-grove.css    # Kodama Grove theme variables
├── doom-64.css         # Doom 64 theme variables  
└── index.ts            # Public exports

public/themes/          # Static theme CSS files
├── kodama-grove.css
└── doom-64.css

src/components/ui/
├── theme-picker.tsx    # Full theme customization dialog
└── theme-toggle.tsx    # Simple light/dark toggle
```

The themes dynamically override the default CSS variables to provide seamless theme switching without page reloads.