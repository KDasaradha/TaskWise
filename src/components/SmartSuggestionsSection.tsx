
"use client";

import type { FC } from 'react';
import { useState, useEffect } from 'react'; // Added useEffect
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Task } from '@/types'; // TaskStatus not used directly here
import { suggestTasks, SuggestTasksOutput } from '@/ai/flows/smart-task-suggestion';
import { useToast } from '@/hooks/use-toast';
import { Lightbulb, PlusSquare, Loader2, BrainCircuit, AlertTriangle } from 'lucide-react'; // Added BrainCircuit
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion'; // Import Framer Motion

interface SmartSuggestionsSectionProps {
  existingTasks: Task[];
  onAddSuggestedTask: (taskData: { title: string; description: string }) => void;
  isVisible: boolean; // Keep isVisible to control overall section rendering via parent state
}

// Framer Motion variants
const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: "easeOut" } },
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

const buttonMotionProps = {
  whileHover: { scale: 1.05, transition: { duration: 0.2 } },
  whileTap: { scale: 0.95 },
};

const SmartSuggestionsSection: FC<SmartSuggestionsSectionProps> = ({
  existingTasks,
  onAddSuggestedTask,
  isVisible,
}) => {
  const [suggestions, setSuggestions] = useState<SuggestTasksOutput['suggestedTasks']>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [hasFetchedOnce, setHasFetchedOnce] = useState(false); // Track if suggestions have been fetched

  const handleGetSuggestions = async () => {
    if (existingTasks.length === 0 && !hasFetchedOnce) { // Only show this toast if no tasks AND never fetched
      toast({
        title: 'No Tasks to Analyze',
        description: 'Please add some tasks first to get relevant smart suggestions.',
        variant: 'default',
        icon: <Lightbulb className="h-5 w-5 text-accent" />,
      });
      return;
    }

    setIsLoading(true);
    setHasFetchedOnce(true); // Mark that a fetch attempt has been made
    // setSuggestions([]); // Clear previous suggestions immediately for better UX
    try {
      const aiInput = {
        existingTasks: existingTasks.map(task => ({
          task_title: task.task_title,
          task_description: task.task_description || "", // Ensure description is a string
        })),
      };
      const result = await suggestTasks(aiInput);
      if (result.suggestedTasks && result.suggestedTasks.length > 0) {
        setSuggestions(result.suggestedTasks);
        toast({
          title: 'Suggestions Generated!',
          description: `Found ${result.suggestedTasks.length} new task ideas for you.`,
          icon: <BrainCircuit className="h-5 w-5 text-primary" />,
        });
      } else {
        setSuggestions([]); // Clear if no new suggestions
        toast({
          title: 'No New Suggestions',
          description: "Couldn't find new task ideas based on your current list this time.",
          icon: <Lightbulb className="h-5 w-5 text-muted-foreground" />,
        });
      }
    } catch (error) {
      console.error('Error fetching smart suggestions:', error);
      toast({
        title: 'Suggestion Error',
        description: 'Failed to get smart suggestions. Please try again later.',
        variant: 'destructive',
        icon: <AlertTriangle className="h-5 w-5" />,
      });
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };
  
  // This component will be controlled by AnimatePresence in page.tsx, 
  // so direct 'isVisible' check for root return is less critical here.
  // The parent's AnimatePresence handles the overall section's mount/unmount.

  return (
    // Enhanced Card with glassmorphism and motion
    <Card 
      className="mt-10 mb-6 shadow-xl rounded-2xl border-none bg-card/70 dark:bg-slate-800/70 backdrop-blur-lg overflow-hidden"
      // Variants applied by parent's motion.div wrapping this section
    >
      <CardHeader className="pb-5 border-b border-border/20 dark:border-slate-700/30">
        <div className="flex items-center space-x-3">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.1, type: "spring", stiffness: 200 }}>
            <BrainCircuit className="h-10 w-10 text-accent drop-shadow-md" />
          </motion.div>
          <div>
            <CardTitle className="text-2xl font-semibold text-foreground dark:text-slate-100 tracking-tight">
              AI Task Brainstorm
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground dark:text-slate-400 mt-1">
              Let AI discover your next tasks based on your current workload.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6 pb-8">
        {/* Loading State */}
        {isLoading && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="flex flex-col items-center justify-center py-10 text-center"
          >
            <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
            <p className="text-lg font-medium text-muted-foreground dark:text-slate-300">Crafting intelligent suggestions...</p>
            <p className="text-sm text-muted-foreground dark:text-slate-400">This might take a moment.</p>
          </motion.div>
        )}

        {/* Initial/Empty State (No suggestions loaded yet OR no tasks to analyze) */}
        {!isLoading && suggestions.length === 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.2 }}
            className="text-center py-8"
          >
            <Image 
              src={`https://picsum.photos/seed/taskwise_ai_brainstorm/350/200`} 
              alt="AI concept art" 
              width={350} 
              height={200} 
              className="mx-auto mb-6 rounded-xl shadow-lg opacity-80" 
              data-ai-hint="AI brain"
            />
            <p className="text-md text-muted-foreground dark:text-slate-300 mb-5 max-w-md mx-auto">
              {existingTasks.length > 0 
                ? "Ready to unlock some productivity? Hit the button below!" 
                : "Add some tasks to your list, then let our AI find your next big idea!"}
            </p>
             <motion.div {...buttonMotionProps}>
                <Button 
                  onClick={handleGetSuggestions} 
                  disabled={isLoading} 
                  className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-lg px-6 py-3 text-base font-semibold shadow-md hover:shadow-lg transition-all duration-300"
                  aria-label="Get smart task suggestions"
                >
                    <Lightbulb className="mr-2.5 h-5 w-5" /> Get Suggestions
                </Button>
            </motion.div>
          </motion.div>
        )}

        {/* Suggestions List */}
        {!isLoading && suggestions.length > 0 && (
          <motion.div 
            className="space-y-4"
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
          >
            <p className="text-sm text-muted-foreground dark:text-slate-400 mb-4">
              Here are some tasks AI thinks you might want to tackle:
            </p>
            <ul className="space-y-3">
              {suggestions.map((suggestion, index) => (
                <motion.li
                  key={index}
                  variants={itemVariants}
                  className="p-4 bg-background/80 dark:bg-slate-700/50 rounded-lg shadow-md flex items-center justify-between hover:shadow-lg transition-shadow duration-300 group"
                >
                  <div className="flex-1 mr-3">
                    <h4 className="font-semibold text-md text-foreground dark:text-slate-200 group-hover:text-primary transition-colors">{suggestion.task_title}</h4>
                    {suggestion.task_description && (
                      <p className="text-xs text-muted-foreground dark:text-slate-400 mt-1 truncate" title={suggestion.task_description}>{suggestion.task_description}</p>
                    )}
                  </div>
                  <motion.div {...buttonMotionProps}>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onAddSuggestedTask({ title: suggestion.task_title, description: suggestion.task_description })}
                      className="ml-4 border-primary/50 hover:border-primary hover:bg-primary/10 text-primary rounded-md whitespace-nowrap"
                      aria-label={`Add suggested task: ${suggestion.task_title}`}
                    >
                      <PlusSquare className="mr-2 h-4 w-4" /> Add Task
                    </Button>
                  </motion.div>
                </motion.li>
              ))}
            </ul>
             <div className="pt-6 text-center">
                <motion.div {...buttonMotionProps}>
                  <Button 
                    onClick={handleGetSuggestions} 
                    variant="ghost" 
                    className="text-accent hover:text-accent/90 hover:bg-accent/10 rounded-lg px-5 py-2.5"
                    disabled={isLoading}
                    aria-label="Get more smart task suggestions"
                  >
                      <Lightbulb className="mr-2 h-5 w-5" /> Get More Suggestions
                  </Button>
                </motion.div>
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
};

export default SmartSuggestionsSection;
