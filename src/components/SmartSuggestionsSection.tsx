"use client";

import type { FC } from 'react';
import { useState, useEffect } from 'react'; 
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Task } from '@/types'; 
import { suggestTasks, SuggestTasksOutput } from '@/ai/flows/smart-task-suggestion';
import { useToast } from '@/hooks/use-toast';
import { Lightbulb, PlusSquare, Loader2, BrainCircuit, AlertTriangle, Sparkles } from 'lucide-react'; 
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion'; 
import { cn } from '@/lib/utils';

interface SmartSuggestionsSectionProps {
  existingTasks: Task[];
  onAddSuggestedTask: (taskData: { title: string; description: string }) => void;
  isVisible: boolean; 
}

const itemVariants = {
  hidden: { opacity: 0, x: -12, scale: 0.98 },
  visible: (i:number) => ({ 
    opacity: 1, 
    x: 0, 
    scale: 1, 
    transition: { duration: 0.25, ease: "circOut", delay: i * 0.05 } 
  }),
  exit: { opacity: 0, x: 8, scale: 0.97, transition: { duration: 0.15, ease: "circIn"} }
};

const buttonMotionProps = {
  whileHover: { scale: 1.02, y:-0.5, boxShadow: "0px 3px 8px hsla(var(--accent-rgb), 0.12)"},
  whileTap: { scale: 0.97, y:0 },
  transition:{ type: "spring", stiffness: 350, damping: 15 }
};

const SmartSuggestionsSection: FC<SmartSuggestionsSectionProps> = ({
  existingTasks,
  onAddSuggestedTask,
  isVisible, // isVisible prop can be used for conditional rendering logic if needed elsewhere
}) => {
  const [suggestions, setSuggestions] = useState<SuggestTasksOutput['suggestedTasks']>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [hasFetchedOnce, setHasFetchedOnce] = useState(false); 

  const handleGetSuggestions = async () => {
    if (existingTasks.length === 0 && !hasFetchedOnce) { 
      toast({
        title: 'No Tasks to Inspire AI',
        description: 'Add some tasks, and AI will help you brainstorm more!',
        variant: 'default', 
        icon: <Lightbulb className="h-5 w-5 text-accent" />,
      });
      setSuggestions([]); // Clear previous suggestions if any
      return;
    }

    setIsLoading(true);
    setSuggestions([]); // Clear old suggestions before fetching new ones
    setHasFetchedOnce(true); 
    try {
      const aiInput = {
        existingTasks: existingTasks.map(task => ({
          task_title: task.task_title,
          task_description: task.task_description || "", 
        })).slice(0, 10), // Limit to latest 10 tasks to keep payload reasonable
      };
      const result = await suggestTasks(aiInput);
      if (result.suggestedTasks && result.suggestedTasks.length > 0) {
        setSuggestions(result.suggestedTasks);
        toast({
          title: 'AI Ideas Sparked!',
          description: `Found ${result.suggestedTasks.length} new task concepts for you.`,
          variant: 'success', 
          icon: <Sparkles className="h-5 w-5" />,
        });
      } else {
        setSuggestions([]); 
        toast({
          title: 'AI is Pondering...',
          description: "No new specific task ideas right now. Try adding more diverse tasks or refining existing ones!",
          icon: <Lightbulb className="h-5 w-5 text-muted-foreground" />,
        });
      }
    } catch (error) {
      console.error('Error fetching smart suggestions:', error);
      toast({
        title: 'Suggestion System Error',
        description: 'Could not fetch AI suggestions. Please try again later.',
        variant: 'destructive',
        icon: <AlertTriangle className="h-5 w-5" />,
      });
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Automatically fetch suggestions when section becomes visible if tasks exist and not fetched yet
  useEffect(() => {
    if (isVisible && existingTasks.length > 0 && !hasFetchedOnce && !isLoading) {
      handleGetSuggestions();
    }
    if (!isVisible) { // Optionally clear suggestions or reset state when hidden
       // setSuggestions([]);
       // setHasFetchedOnce(false);
    }
  }, [isVisible, existingTasks, hasFetchedOnce, isLoading]);


  return (
    <Card 
      className={cn(
        "shadow-lg rounded-xl border-none overflow-hidden",
        "bg-card/80 dark:bg-card/70 backdrop-blur-md" 
      )}
    >
      <CardHeader className="pb-3.5 pt-4 px-4 sm:px-5 border-b border-border/40 dark:border-border/30">
        <div className="flex items-center space-x-2.5">
          <motion.div initial={{ scale: 0.6, rotate: -10 }} animate={{ scale: 1, rotate: 0 }} transition={{ delay: 0.05, type: "spring", stiffness: 280, damping: 12 }}>
            <BrainCircuit className="h-6 w-6 sm:h-7 sm:w-7 text-accent drop-shadow-md" />
          </motion.div>
          <div>
            <CardTitle className="text-md sm:text-lg font-semibold text-foreground tracking-tight">
              AI Task Assistant
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-0.5">
              Let AI help you discover your next steps.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4 sm:pt-5 pb-5 px-4 sm:px-5 min-h-[200px] flex flex-col">
        {isLoading && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="flex flex-col items-center justify-center py-6 text-center flex-grow"
          >
            <Loader2 className="h-8 w-8 text-primary animate-spin mb-2.5" />
            <p className="text-sm font-medium text-muted-foreground">Generating smart suggestions...</p>
            <p className="text-xs text-muted-foreground/80">This might take a moment.</p>
          </motion.div>
        )}

        {!isLoading && suggestions.length === 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 8 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.05 }}
            className="text-center py-4 flex-grow flex flex-col items-center justify-center"
          >
            <Image 
              src="https://picsum.photos/seed/ai_brainstorm/280/160" 
              alt="AI brainstorming concept" 
              width={280} 
              height={160} 
              className="mx-auto mb-4 rounded-lg shadow-sm opacity-80" 
              data-ai-hint="AI idea lightbulb"
            />
            <p className="text-sm text-muted-foreground mb-3 max-w-xs mx-auto">
              {existingTasks.length === 0
                ? "Add some tasks to your list, and AI can help you find related ideas!"
                : hasFetchedOnce 
                ? "No specific suggestions right now. Try again or with different tasks!"
                : "Ready for some AI magic? Let's find your next task!"}
            </p>
             <motion.div {...buttonMotionProps}>
                <Button 
                  onClick={handleGetSuggestions} 
                  disabled={isLoading} 
                  className={cn(
                    "bg-accent hover:bg-accent/90 text-accent-foreground rounded-md",
                    "px-4 py-2 text-xs sm:text-sm font-medium shadow-sm hover:shadow-md transition-all"
                  )}
                  aria-label="Get smart task suggestions"
                >
                    <Lightbulb className="mr-1.5 h-4 w-4" /> Get Suggestions
                </Button>
            </motion.div>
          </motion.div>
        )}
        
        <AnimatePresence>
        {!isLoading && suggestions.length > 0 && (
          <motion.div 
            className="space-y-2.5"
            initial="hidden"
            animate="visible"
            exit="hidden" // Ensures list items also animate out if suggestions array changes
            variants={{ visible: { transition: { staggerChildren: 0.07 } } }}
          >
            <p className="text-xs text-muted-foreground/90 mb-2.5">
              AI has brainstormed these potential tasks based on your current list:
            </p>
            <ul className="space-y-2">
              {suggestions.map((suggestion, index) => (
                <motion.li
                  key={index} // Assuming index is stable for current suggestions batch
                  custom={index}
                  variants={itemVariants}
                  className={cn(
                    "p-3 bg-background/60 dark:bg-muted/30 rounded-md shadow-sm hover:shadow-md",
                    "flex items-center justify-between transition-all duration-150 group"
                  )}
                >
                  <div className="flex-1 mr-2">
                    <h4 className="font-medium text-xs sm:text-sm text-foreground group-hover:text-primary transition-colors line-clamp-1" title={suggestion.task_title}>{suggestion.task_title}</h4>
                    {suggestion.task_description && (
                      <p className="text-xs text-muted-foreground/80 mt-0.5 line-clamp-1" title={suggestion.task_description}>{suggestion.task_description}</p>
                    )}
                  </div>
                  <motion.div {...buttonMotionProps} whileHover={{scale:1.04, ...buttonMotionProps.whileHover}} className="shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onAddSuggestedTask({ title: suggestion.task_title, description: suggestion.task_description })}
                      className={cn(
                        "ml-2 border-primary/50 hover:border-primary hover:bg-primary/10 text-primary text-[0.7rem] sm:text-xs",
                        "rounded px-2 h-7 sm:h-8"
                      )}
                      aria-label={`Add suggested task: ${suggestion.task_title}`}
                    >
                      <PlusSquare className="mr-1 h-3 w-3 sm:h-3.5 sm:w-3.5" /> Add
                    </Button>
                  </motion.div>
                </motion.li>
              ))}
            </ul>
             <div className="pt-4 text-center">
                <motion.div {...buttonMotionProps}>
                  <Button 
                    onClick={handleGetSuggestions} 
                    variant="ghost" 
                    className="text-accent hover:text-accent/90 hover:bg-accent/10 rounded-md px-3 py-1.5 text-xs sm:text-sm"
                    disabled={isLoading}
                    aria-label="Get more smart task suggestions"
                  >
                      <Lightbulb className="mr-1 h-3.5 w-3.5 sm:h-4 sm:w-4" /> {isLoading ? <Loader2 className="animate-spin h-4 w-4"/> : "More Ideas"}
                  </Button>
                </motion.div>
            </div>
          </motion.div>
        )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
};

export default SmartSuggestionsSection;
