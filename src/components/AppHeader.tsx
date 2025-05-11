"use client";

import type { FC } from 'react';
import Link from 'next/link';
import { Zap, PanelLeftClose, PanelLeftOpen } from 'lucide-react'; 
import { motion } from 'framer-motion';
import { useSidebar } from '@/components/ui/sidebar'; 
import { Button } from '@/components/ui/button'; 
import { cn } from '@/lib/utils'; // Added import for cn

const AppHeader: FC = () => {
  const headerVariants = {
    hidden: { opacity: 0, y: -25 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "circOut" } },
  };

  const { state: sidebarState, toggleSidebar, isMobile } = useSidebar();

  return (
    <motion.header
      initial="hidden"
      animate="visible"
      variants={headerVariants}
      className={cn(
        "h-16 py-2.5 px-4 md:px-5 sticky top-0 z-40 flex items-center justify-between",
        "border-b border-border/60 dark:border-border/50", 
        "bg-background/85 dark:bg-background/75 backdrop-blur-lg shadow-sm" 
      )}
    >
      <div className="flex items-center gap-2 md:gap-2.5">
        
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="text-muted-foreground hover:text-foreground hover:bg-muted/60 dark:hover:bg-muted/40 h-9 w-9 rounded-lg focus-visible:ring-ring focus-visible:ring-1"
            aria-label={sidebarState === 'expanded' && !isMobile ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            {isMobile ? <PanelLeftOpen className="h-5 w-5" /> : (sidebarState === 'expanded' ? <PanelLeftClose className="h-5 w-5" /> : <PanelLeftOpen className="h-5 w-5" />)}
          </Button>
        
        <motion.div
            className={cn(
              "items-center",
              // Show logo/name if mobile OR if desktop and sidebar is collapsed
              (isMobile || (!isMobile && sidebarState === 'collapsed')) ? "flex" : "hidden sm:flex" 
            )}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1, duration: 0.35 }}
          >
            <Link href="/" className="flex items-center group">
              <Zap className="h-7 w-7 text-primary mr-1.5 sm:mr-2 group-hover:text-accent transition-colors duration-200 drop-shadow-sm" />
              <h1 className="text-xl sm:text-2xl font-bold text-gradient-primary tracking-tight">
                TaskWise
              </h1>
            </Link>
          </motion.div>
      </div>
      
      <div className="flex items-center space-x-2.5">
        {/* Placeholder for future actions like user profile, notifications */}
      </div>
    </motion.header>
  );
};

export default AppHeader;
