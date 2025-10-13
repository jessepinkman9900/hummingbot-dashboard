'use client';

import { useState } from 'react';
import { Palette, Sun, Moon, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useTheme } from '@/lib/themes/provider';
import { THEMES, ThemeMode } from '@/lib/themes/config';

export function ThemePicker() {
  const { theme, mode, setTheme, setMode } = useTheme();
  const [open, setOpen] = useState(false);

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
  };

  const handleModeChange = (newMode: ThemeMode) => {
    setMode(newMode);
  };

  const currentTheme = THEMES.find(t => t.id === theme);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Palette className="h-4 w-4" />
          <span className="sr-only">Open theme picker</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Customize Appearance</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          {/* Theme Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Choose Theme</Label>
            <RadioGroup
              value={theme}
              onValueChange={handleThemeChange}
              className="grid grid-cols-1 gap-3"
            >
              {THEMES.map((themeOption) => (
                <div key={themeOption.id} className="flex items-center space-x-3">
                  <RadioGroupItem 
                    value={themeOption.id} 
                    id={themeOption.id}
                    className="mt-1"
                  />
                  <div className="grid gap-1.5 leading-none flex-1">
                    <Label
                      htmlFor={themeOption.id}
                      className="text-sm font-medium cursor-pointer"
                    >
                      {themeOption.name}
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {themeOption.description}
                    </p>
                  </div>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Mode Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Choose Mode</Label>
            <RadioGroup
              value={mode}
              onValueChange={handleModeChange}
              className="grid grid-cols-2 gap-3"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="light" id="light" />
                <Label htmlFor="light" className="flex items-center space-x-2 cursor-pointer">
                  <Sun className="h-4 w-4" />
                  <span className="text-sm">Light</span>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="dark" id="dark" />
                <Label htmlFor="dark" className="flex items-center space-x-2 cursor-pointer">
                  <Moon className="h-4 w-4" />
                  <span className="text-sm">Dark</span>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Current Selection Preview */}
          <Card className="border-dashed">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Current Selection</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Theme:</span>
                <span className="font-medium">{currentTheme?.name}</span>
              </div>
              <div className="flex items-center justify-between text-sm mt-2">
                <span className="text-muted-foreground">Mode:</span>
                <div className="flex items-center space-x-1">
                  {mode === 'light' ? (
                    <Sun className="h-3 w-3" />
                  ) : (
                    <Moon className="h-3 w-3" />
                  )}
                  <span className="font-medium capitalize">{mode}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Apply Button */}
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setOpen(false)}>
              Apply Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}