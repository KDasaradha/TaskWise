
import type { FC } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle, Lightbulb, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

interface AppHeaderProps {
  onAddTask: () => void;
  onSuggestTasks: () => void;
  isSuggestingTasks: boolean;
}

const AppHeader: FC<AppHeaderProps> = ({ onAddTask, onSuggestTasks, isSuggestingTasks }) => {
  // Framer Motion variants for animations
  const headerVariants = {
    hidden: { opacity: 0, y: -30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };

  const buttonVariants = {
    hover: { scale: 1.05, transition: { duration: 0.2 } },
    tap: { scale: 0.95 },
  };

  return (
    <motion.header
      initial="hidden"
      animate="visible"
      variants={headerVariants}
      className="py-5 px-4 md:px-8 border-b border-border/30 shadow-lg sticky top-0 bg-background/70 dark:bg-slate-900/70 backdrop-blur-lg z-50"
      // Added glassmorphism effect with backdrop-blur and semi-transparent background
    >
      <div className="container mx-auto flex items-center justify-between">
        <motion.div 
          className="flex items-center"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <Zap className="h-8 w-8 text-primary mr-2" />
          <h1 className="text-3xl md:text-4xl font-extrabold text-primary tracking-tight">
            TaskWise
          </h1>
        </motion.div>
        
        <div className="flex items-center space-x-3">
          {/* Smart Suggestions Button with Framer Motion */}
          <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
            <Button onClick={onSuggestTasks} variant="outline" disabled={isSuggestingTasks} className="rounded-lg shadow-sm border-primary/50 hover:border-primary hover:bg-primary/10 transition-all duration-300">
              <Lightbulb className="mr-2 h-5 w-5 text-accent" />
              {isSuggestingTasks ? 'Thinking...' : 'Smart Suggestions'}
            </Button>
          </motion.div>

          {/* Add Task Button with Framer Motion */}
          <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
            <Button onClick={onAddTask} className="rounded-lg shadow-md hover:shadow-lg transition-all duration-300 bg-gradient-to-r from-primary to-blue-500 hover:from-primary/90 hover:to-blue-500/90 text-primary-foreground">
              <PlusCircle className="mr-2 h-5 w-5" />
              Add Task
            </Button>
          </motion.div>
        </div>
      </div>
    </motion.header>
  );
};

export default AppHeader;
