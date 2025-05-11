"use client";

import type { FC } from 'react';
import Link from 'next/link';
import { Zap, PanelLeftClose, PanelLeftOpen } from 'lucide-react'; 
import { motion } from 'framer-motion';
import { SidebarTrigger, useSidebar } from '@/components/ui/sidebar'; 
import { Button } from '@/components/ui/button'; 
import { cn } from '@/lib/utils'; // Added import for cn

const AppHeader: FC = () => {
  const headerVariants = {
    hidden: { opacity: 0, y: -30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };

  const { state: sidebarState, toggleSidebar, isMobile } = useSidebar();

  return (
    <motion.header
      initial="hidden"
      animate="visible"
      variants={headerVariants}
      className="h-16 py-3 px-4 md:px-6 border-b border-border/30 shadow-sm sticky top-0 bg-background/80 dark:bg-slate-900/80 backdrop-blur-md z-40 flex items-center justify-between"
    >
      <div className="flex items-center gap-2 md:gap-4">
        {/* Mobile Sidebar Trigger */}
        <div className="md:hidden">
          <SidebarTrigger />
        </div>

        {/* Desktop Sidebar Toggle Button */}
        {!isMobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="text-foreground hover:bg-accent/10 h-9 w-9 rounded-full"
            aria-label={sidebarState === 'expanded' ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            {sidebarState === 'expanded' ? <PanelLeftClose className="h-5 w-5" /> : <PanelLeftOpen className="h-5 w-5" />}
          </Button>
        )}
        
        {/* App Logo/Title - shown when sidebar is collapsed or if it's preferred to always show in header */}
        {/* Conditionally show based on sidebar state if it's also in the sidebar header */}
        <motion.div
            className={cn(
              "items-center",
              (!isMobile && sidebarState === 'expanded') ? "hidden md:flex" : "flex" // Show if mobile, or if desktop & sidebar collapsed
            )}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <Link href="/" className="flex items-center group">
              <Zap className="h-7 w-7 text-primary mr-2 group-hover:text-accent transition-colors" />
              <h1 className="text-2xl font-bold text-primary group-hover:text-accent tracking-tight transition-colors">
                TaskWise
              </h1>
            </Link>
          </motion.div>
      </div>
      
      <div className="flex items-center space-x-3">
        {/* Global actions like User Profile, Notifications can go here */}
        {/* For now, it's empty */}
      </div>
    </motion.header>
  );
};

export default AppHeader;