"use client";

import type { FC } from 'react';
import Link from 'next/link';
import { Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { SidebarTrigger } from '@/components/ui/sidebar'; // Import SidebarTrigger

const AppHeader: FC = () => {
  const headerVariants = {
    hidden: { opacity: 0, y: -30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };

  return (
    <motion.header
      initial="hidden"
      animate="visible"
      variants={headerVariants}
      className="h-16 py-3 px-4 md:px-6 border-b border-border/30 shadow-sm sticky top-0 bg-background/80 dark:bg-slate-900/80 backdrop-blur-md z-40 flex items-center justify-between"
    >
      <div className="flex items-center gap-4">
        {/* Sidebar Trigger for mobile, hidden on md and larger screens where sidebar is persistent or icon-only */}
        <div className="md:hidden">
          <SidebarTrigger />
        </div>
        {/* App Logo/Title - only shown if sidebar is not expanded or on mobile when trigger is present */}
        {/* This title can be conditionally shown based on sidebar state from useSidebar() if needed, for now always show */}
        <motion.div
            className="hidden md:flex items-center" /* Hide on mobile, sidebar header has title */
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
        {/* For now, it's empty as per the refactor */}
      </div>
    </motion.header>
  );
};

export default AppHeader;
