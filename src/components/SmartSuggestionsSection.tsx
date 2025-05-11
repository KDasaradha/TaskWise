
"use client";

import type { FC } from 'react';
import { useState } from 'react'; 
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Task } from '@/types'; 
import { suggestTasks, SuggestTasksOutput } from '@/ai/flows/smart-task-suggestion';
import { useToast } from '@/hooks/use-toast';
import { Lightbulb, PlusSquare, Loader2, BrainCircuit, AlertTriangle } from 'lucide-react'; 
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion'; 
import { cn } from '@/lib/utils';

interface SmartSuggestionsSectionProps {
  existingTasks: Task[];
  onAddSuggestedTask: (taskData: { title: string; description: string }) => void;
  isVisible: boolean; 
}

const itemVariants = {
  hidden: { opacity: 0, x: -15, scale: 0.98 },
  visible: { opacity: 1, x: 0, scale: 1, transition: { duration: 0.3, ease: "circOut" } },
};

const buttonMotionProps = {
  whileHover: { scale: 1.03, y:-1, boxShadow: "0px 4px 10px hsla(var(--accent-rgb), 0.15)"},
  whileTap: { scale: 0.97, y:0 },
  transition:{ type: "spring", stiffness: 300, damping: 15 }
};

const SmartSuggestionsSection: FC<SmartSuggestionsSectionProps> = ({
  existingTasks,
  onAddSuggestedTask,
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
      return;
    }

    setIsLoading(true);
    setHasFetchedOnce(true); 
    try {
      const aiInput = {
        existingTasks: existingTasks.map(task => ({
          task_title: task.task_title,
          task_description: task.task_description || "", 
        })),
      };
      const result = await suggestTasks(aiInput);
      if (result.suggestedTasks && result.suggestedTasks.length > 0) {
        setSuggestions(result.suggestedTasks);
        toast({
          title: 'AI Ideas Generated!',
          description: `Found ${result.suggestedTasks.length} new task concepts.`,
          variant: 'success', 
          icon: <BrainCircuit className="h-5 w-5" />,
        });
      } else {
        setSuggestions([]); 
        toast({
          title: 'AI is Pondering...',
          description: "No new specific task ideas right now, try again with more tasks!",
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
  
  return (
    <Card 
      className={cn(
        "shadow-xl rounded-2xl border-none overflow-hidden",
        "bg-card/70 dark:bg-card/60 backdrop-blur-lg glassmorphism" 
      )}
    >
      <CardHeader className="pb-4 pt-5 border-b border-border/30 dark:border-border/25">
        <div className="flex items-center space-x-3">
          <motion.div initial={{ scale: 0.5, rotate: -15 }} animate={{ scale: 1, rotate: 0 }} transition={{ delay: 0.1, type: "spring", stiffness: 250, damping: 10 }}>
            <BrainCircuit className="h-8 w-8 text-accent drop-shadow-lg" />
          </motion.div>
          <div>
            <CardTitle className="text-xl font-semibold text-foreground dark:text-slate-100 tracking-tight">
              AI Task Brainstorm
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground dark:text-slate-400 mt-0.5">
              Discover your next tasks with AI-powered insights.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-5 pb-6">
        {isLoading && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="flex flex-col items-center justify-center py-8 text-center"
          >
            <Loader2 className="h-10 w-10 text-primary animate-spin mb-3" />
            <p className="text-md font-medium text-muted-foreground dark:text-slate-300">Generating smart suggestions...</p>
            <p className="text-xs text-muted-foreground/80 dark:text-slate-400">This might take a moment.</p>
          </motion.div>
        )}

        {!isLoading && suggestions.length === 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.1 }}
            className="text-center py-6"
          >
            <Image 
              src="https://picsum.photos/seed/ai_suggestions_empty/300/180" 
              alt="AI brainstorming concept" 
              width={300} 
              height={180} 
              className="mx-auto mb-5 rounded-lg shadow-md opacity-90" 
              data-ai-hint="AI idea"
            />
            <p className="text-sm text-muted-foreground dark:text-slate-300 mb-4 max-w-xs mx-auto">
              {existingTasks.length > 0 
                ? "Ready for some AI magic? Let's find your next task!" 
                : "Add tasks to your list, then let AI spark new ideas."}
            </p>
             <motion.div {...buttonMotionProps}>
                <Button 
                  onClick={handleGetSuggestions} 
                  disabled={isLoading} 
                  className={cn(
                    "bg-accent hover:bg-accent/90 text-accent-foreground rounded-lg",
                    "px-5 py-2.5 text-sm font-semibold shadow-md hover:shadow-lg transition-all"
                  )}
                  aria-label="Get smart task suggestions"
                >
                    <Lightbulb className="mr-2 h-4.5 w-4.5" /> Get Suggestions
                </Button>
            </motion.div>
          </motion.div>
        )}

        {!isLoading && suggestions.length > 0 && (
          <motion.div 
            className="space-y-3"
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
          >
            <p className="text-xs text-muted-foreground dark:text-slate-400 mb-3">
              AI has brainstormed these potential tasks for you:
            </p>
            <ul className="space-y-2.5">
              {suggestions.map((suggestion, index) => (
                <motion.li
                  key={index}
                  variants={itemVariants}
                  className={cn(
                    "p-3.5 bg-background/70 dark:bg-muted/40 rounded-lg shadow hover:shadow-md",
                    "flex items-center justify-between transition-all duration-200 group"
                  )}
                >
                  <div className="flex-1 mr-2.5">
                    <h4 className="font-medium text-sm text-foreground dark:text-slate-200 group-hover:text-primary transition-colors">{suggestion.task_title}</h4>
                    {suggestion.task_description && (
                      <p className="text-xs text-muted-foreground/90 dark:text-slate-400/90 mt-0.5 truncate" title={suggestion.task_description}>{suggestion.task_description}</p>
                    )}
                  </div>
                  <motion.div {...buttonMotionProps} whileHover={{scale:1.05, ...buttonMotionProps.whileHover}} className="shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onAddSuggestedTask({ title: suggestion.task_title, description: suggestion.task_description })}
                      className={cn(
                        "ml-3 border-primary/60 hover:border-primary hover:bg-primary/10 text-primary text-xs",
                        "rounded-md px-2.5 py-1.5"
                      )}
                      aria-label={`Add suggested task: ${suggestion.task_title}`}
                    >
                      <PlusSquare className="mr-1.5 h-3.5 w-3.5" /> Add
                    </Button>
                  </motion.div>
                </motion.li>
              ))}
            </ul>
             <div className="pt-5 text-center">
                <motion.div {...buttonMotionProps}>
                  <Button 
                    onClick={handleGetSuggestions} 
                    variant="ghost" 
                    className="text-accent hover:text-accent/90 hover:bg-accent/10 rounded-lg px-4 py-2 text-sm"
                    disabled={isLoading}
                    aria-label="Get more smart task suggestions"
                  >
                      <Lightbulb className="mr-1.5 h-4 w-4" /> {isLoading ? <Loader2 className="animate-spin h-4 w-4"/> : "More Ideas"}
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
