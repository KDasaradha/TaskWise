"use client";

import { useState, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const ThemeToggle = () => {
  const [theme, setTheme] = useState<string | undefined>(undefined);

  useEffect(() => {
    // This effect runs only on the client after hydration
    const storedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setTheme(storedTheme || (prefersDark ? 'dark' : 'light'));
  }, []);

  useEffect(() => {
    if (theme === undefined) return; // Don't run if theme is not yet determined

    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  if (theme === undefined) {
    // Render a placeholder or null during SSR/hydration mismatch phase
    return <div className="h-9 w-9 rounded-full bg-muted/50 animate-pulse" />; 
  }

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 300, damping: 15 }}
    >
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleTheme}
        aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        className={cn(
          "rounded-lg text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/15 w-9 h-9",
          "focus-visible:ring-1 focus-visible:ring-sidebar-ring focus-visible:ring-offset-1 focus-visible:ring-offset-sidebar-background"
        )}
      >
        {theme === 'light' ? <Moon className="h-[1.1rem] w-[1.1rem]" /> : <Sun className="h-[1.2rem] w-[1.2rem]" />}
      </Button>
    </motion.div>
  );
};

export default ThemeToggle;
