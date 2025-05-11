
"use client";

import type { FC } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { PlusCircle, Lightbulb, Zap, LayoutDashboard, BarChart3, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface AppHeaderProps {
  onAddTask: () => void;
  onSuggestTasks: () => void;
  isSuggestingTasks: boolean;
}

const AppHeader: FC<AppHeaderProps> = ({ onAddTask, onSuggestTasks, isSuggestingTasks }) => {
  const pathname = usePathname();

  const navLinks = [
    { href: '/', label: 'Home', icon: <Zap className="h-5 w-5" /> },
    { href: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
    { href: '/analytics', label: 'Analytics', icon: <BarChart3 className="h-5 w-5" /> },
    { href: '/about', label: 'About', icon: <Info className="h-5 w-5" /> },
  ];

  const headerVariants = {
    hidden: { opacity: 0, y: -30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };

  const buttonVariants = {
    hover: { scale: 1.05, transition: { duration: 0.2 } },
    tap: { scale: 0.95 },
  };

  const navItemVariants = {
    initial: { opacity: 0, y: -10 },
    animate: { opacity: 1, y: 0 },
    hover: { scale: 1.05, color: 'hsl(var(--primary))' },
    active: { color: 'hsl(var(--primary))', fontWeight: '600' },
  };

  return (
    <motion.header
      initial="hidden"
      animate="visible"
      variants={headerVariants}
      className="py-4 px-4 md:px-8 border-b border-border/30 shadow-lg sticky top-0 bg-background/80 dark:bg-slate-900/80 backdrop-blur-lg z-50"
    >
      <div className="container mx-auto flex items-center justify-between">
        <motion.div
          className="flex items-center"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <Link href="/" className="flex items-center group">
            <Zap className="h-8 w-8 text-primary mr-2 group-hover:text-accent transition-colors" />
            <h1 className="text-3xl md:text-4xl font-extrabold text-primary group-hover:text-accent tracking-tight transition-colors">
              TaskWise
            </h1>
          </Link>
        </motion.div>

        <nav className="hidden md:flex items-center space-x-2 lg:space-x-4">
          {navLinks.map((link, index) => (
            <motion.div
              key={link.href}
              variants={navItemVariants}
              initial="initial"
              animate="animate"
              whileHover="hover"
              transition={{ delay: 0.3 + index * 0.1 }}
            >
              <Link
                href={link.href}
                className={cn(
                  "px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-primary transition-colors flex items-center space-x-2",
                  pathname === link.href && "text-primary bg-primary/10 dark:bg-primary/20"
                )}
              >
                {link.icon}
                <span>{link.label}</span>
              </Link>
            </motion.div>
          ))}
        </nav>
        
        <div className="flex items-center space-x-2 md:space-x-3">
          {pathname === '/' && ( /* Only show these buttons on the home page */
            <>
              <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                <Button 
                  onClick={onSuggestTasks} 
                  variant="outline" 
                  disabled={isSuggestingTasks} 
                  className="rounded-lg shadow-sm border-primary/50 hover:border-primary hover:bg-primary/10 transition-all duration-300 text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2"
                >
                  <Lightbulb className="mr-1 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5 text-accent" />
                  {isSuggestingTasks ? 'Thinking...' : 'Smart Suggest'}
                </Button>
              </motion.div>

              <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                <Button 
                  onClick={onAddTask} 
                  className="rounded-lg shadow-md hover:shadow-lg transition-all duration-300 bg-gradient-to-r from-primary to-blue-500 hover:from-primary/90 hover:to-blue-500/90 text-primary-foreground text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2"
                >
                  <PlusCircle className="mr-1 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                  Add Task
                </Button>
              </motion.div>
            </>
          )}
           {/* Mobile navigation trigger - can be enhanced later */}
           <div className="md:hidden">
            {/* Placeholder for a mobile menu trigger if needed */}
           </div>
        </div>
      </div>
       {/* Mobile Navigation - Simple version for now, can be expanded to a Sheet component */}
       <div className="md:hidden mt-3 flex justify-center space-x-2 border-t border-border/20 pt-3">
          {navLinks.map((link) => (
             <Link
                key={`mobile-${link.href}`}
                href={link.href}
                className={cn(
                  "p-2 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors flex flex-col items-center text-xs",
                  pathname === link.href && "text-primary bg-primary/10"
                )}
              >
                {link.icon}
                <span className="mt-0.5">{link.label}</span>
              </Link>
          ))}
        </div>
    </motion.header>
  );
};

export default AppHeader;
