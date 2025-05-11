"use client";

import type { FC } from 'react';
import Link from 'next/link';
import { Zap, PanelLeftClose, PanelLeftOpen } from 'lucide-react'; 
import { motion } from 'framer-motion';
import { SidebarTrigger, useSidebar } from '@/components/ui/sidebar'; 
import { Button } from '@/components/ui/button'; 
import { cn } from '@/lib/utils';

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
      className={cn(
        "h-16 py-3 px-4 md:px-6 sticky top-0 z-40 flex items-center justify-between",
        "border-b border-border/50", 
        "bg-background/90 dark:bg-background/80 backdrop-blur-lg shadow-md" 
      )}
    >
      <div className="flex items-center gap-2 md:gap-3">
        
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="text-muted-foreground hover:text-foreground hover:bg-muted/50 h-9 w-9 rounded-full focus-visible:ring-ring focus-visible:ring-1"
            aria-label={sidebarState === 'expanded' && !isMobile ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            {isMobile ? <PanelLeftOpen className="h-5 w-5" /> : (sidebarState === 'expanded' ? <PanelLeftClose className="h-5 w-5" /> : <PanelLeftOpen className="h-5 w-5" />)}
          </Button>
        
        <motion.div
            className={cn(
              "items-center",
              (!isMobile && sidebarState === 'expanded') ? "hidden sm:flex" : "flex" 
            )}
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
          >
            <Link href="/" className="flex items-center group">
              <Zap className="h-7 w-7 text-primary mr-1.5 sm:mr-2 group-hover:text-accent transition-colors duration-300" />
              <h1 className="text-2xl font-bold text-gradient-primary tracking-tight">
                TaskWise
              </h1>
            </Link>
          </motion.div>
      </div>
      
      <div className="flex items-center space-x-3">
        {/* Placeholder for future actions */}
      </div>
    </motion.header>
  );
};

export default AppHeader;
